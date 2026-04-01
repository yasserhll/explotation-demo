<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rotation;
use App\Models\Affectation;
use App\Models\Engin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RotationController extends Controller
{
    /* ── Validation commune ─────────────────────────────────────────────── */
    private function rotationRules(): array
    {
        $rules = [
            'chauffeur_1er'         => 'nullable|string|max:100',
            'chauffeur_2e'          => 'nullable|string|max:100',
            'sterile_p1a_panneau'   => 'nullable|string|max:200',
            'sterile_p1a_km'        => 'nullable|numeric',
            'sterile_p1a_vgs'       => 'nullable|integer|min:0',
            'sterile_p1b_panneau'   => 'nullable|string|max:200',
            'sterile_p1b_km'        => 'nullable|numeric',
            'sterile_p1b_vgs'       => 'nullable|integer|min:0',
            'phosphate_p1a_panneau' => 'nullable|string|max:200',
            'phosphate_p1a_km'      => 'nullable|numeric',
            'phosphate_p1a_vgs'     => 'nullable|integer|min:0',
            'phosphate_p1b_panneau' => 'nullable|string|max:200',
            'phosphate_p1b_km'      => 'nullable|numeric',
            'phosphate_p1b_vgs'     => 'nullable|integer|min:0',
            'sterile_p2a_panneau'   => 'nullable|string|max:200',
            'sterile_p2a_km'        => 'nullable|numeric',
            'sterile_p2a_vgs'       => 'nullable|integer|min:0',
            'sterile_p2b_panneau'   => 'nullable|string|max:200',
            'sterile_p2b_km'        => 'nullable|numeric',
            'sterile_p2b_vgs'       => 'nullable|integer|min:0',
            'phosphate_p2a_panneau' => 'nullable|string|max:200',
            'phosphate_p2a_km'      => 'nullable|numeric',
            'phosphate_p2a_vgs'     => 'nullable|integer|min:0',
            'phosphate_p2b_panneau' => 'nullable|string|max:200',
            'phosphate_p2b_km'      => 'nullable|numeric',
            'phosphate_p2b_vgs'     => 'nullable|integer|min:0',
            'commentaires'          => 'nullable|string',
            'pelle_codes'           => 'nullable|string|max:500',
            'lignes_json'           => 'nullable|string',
        ];
        return $rules;
    }

    /* ── Index ───────────────────────────────────────────────────────────── */
    public function index(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());

        $rotations = Rotation::where('date', $date)->orderBy('camion_id')->get();

        $affectations = Affectation::whereNull('date')
            ->where('statut', '!=', 'arret')
            ->orderBy('camion_code')
            ->get(['camion_code', 'chauffeur_principal', 'chauffeur_secondaire', 'type_vehicule']);

        return response()->json([
            'date'         => $date,
            'rotations'    => $rotations,
            'affectations' => $affectations,
        ]);
    }

    /* ── Store ───────────────────────────────────────────────────────────── */
    public function store(Request $request): JsonResponse
    {
        $rules = array_merge(['date' => 'required|date', 'camion_id' => 'required|string|max:20'], $this->rotationRules());
        $validated = $request->validate($rules);

        $existing = Rotation::where('date', $validated['date'])->where('camion_id', $validated['camion_id'])->first();
        if ($existing) {
            return response()->json(['message' => 'Ce camion a déjà une rotation pour cette date.'], 422);
        }

        $rotation = Rotation::create($validated);
        return response()->json($rotation, 201);
    }

    /* ── Update ──────────────────────────────────────────────────────────── */
    public function update(Request $request, Rotation $rotation): JsonResponse
    {
        $validated = $request->validate($this->rotationRules());
        $rotation->update($validated);
        return response()->json($rotation);
    }

    /* ── Destroy ─────────────────────────────────────────────────────────── */
    public function destroy(Rotation $rotation): JsonResponse
    {
        $rotation->delete();
        return response()->json(['message' => 'Supprimé']);
    }

    /* ── Dates avec rotations ────────────────────────────────────────────── */
    public function dates(): JsonResponse
    {
        $dates = Rotation::selectRaw('date, COUNT(*) as nb_camions')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();
        return response()->json($dates);
    }

    /* ── Rapport mensuel ─────────────────────────────────────────────────── */
    public function monthly(Request $request): JsonResponse
    {
        $month = $request->get('month');
        if (!$month) {
            $last = Rotation::selectRaw("strftime('%Y-%m', date) as m")->groupBy('m')->orderByDesc('m')->first();
            $month = $last ? $last->m : now()->format('Y-m');
        }

        $rotations = Rotation::whereRaw("strftime('%Y-%m', date) = ?", [$month])->orderBy('date')->get();

        $byDate = $rotations->groupBy(fn($r) => substr($r->date, 0, 10))->map(function ($rows, $date) {
            $c = $this->calcVgsFromRotations($rows->all());
            return array_merge(['date' => $date, 'nb_camions' => $rows->count()], $c,
                ['volume_phosphate' => $c['voyages_phosphate'] * 16, 'volume_sterile' => $c['voyages_sterile'] * 14, 'total_volume' => $c['voyages_phosphate'] * 16 + $c['voyages_sterile'] * 14]);
        })->values();

        $c = $this->calcVgsFromRotations($rotations->all());
        return response()->json([
            'month' => $month,
            'jours_production' => $byDate->count(),
            'total_voyages' => $c['voyages_phosphate'] + $c['voyages_sterile'],
            'total_volume' => $c['voyages_phosphate'] * 16 + $c['voyages_sterile'] * 14,
            'voyages_phosphate' => $c['voyages_phosphate'], 'volume_phosphate' => $c['voyages_phosphate'] * 16,
            'voyages_sterile'   => $c['voyages_sterile'],   'volume_sterile'   => $c['voyages_sterile'] * 14,
            'daily_summary' => $byDate, 'by_tranchee' => [],
        ]);
    }

    /* ── Rapport Journalier ──────────────────────────────────────────────── */
    public function rapportJournalier(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());
        $rotations = Rotation::where('date', $date)->orderBy('camion_id')->get();

        $affectations = Affectation::whereNull('date')->where('statut', '!=', 'arret')->get();
        $engins = Engin::all();

        $phosphate = [];
        $sterile   = [];
        $remarques = [];
        $allPelles1er = [];
        $allPelles2e  = [];

        foreach ($rotations as $rot) {
            if ($rot->commentaires) $remarques[] = $rot->commentaires;

            $pellesArr = $rot->pelle_codes ? array_map('trim', explode(',', $rot->pelle_codes)) : [];
            foreach ($pellesArr as $p) { if ($p) $allPelles1er[] = $p; }

            $lignes = null;
            if ($rot->lignes_json) {
                $lignes = is_string($rot->lignes_json) ? json_decode($rot->lignes_json, true) : $rot->lignes_json;
            }

            if ($lignes && is_array($lignes)) {
                $this->aggregateLignes($lignes['phosphate_p1'] ?? [], $lignes['phosphate_p2'] ?? [], $phosphate, $rot->camion_id, $pellesArr);
                $this->aggregateLignes($lignes['sterile_p1']   ?? [], $lignes['sterile_p2']   ?? [], $sterile,   $rot->camion_id, $pellesArr);
            } else {
                // Rétrocompatibilité colonnes a/b
                $p1 = $this->oldColsToLignes($rot, 'phosphate_p1');
                $p2 = $this->oldColsToLignes($rot, 'phosphate_p2');
                $s1 = $this->oldColsToLignes($rot, 'sterile_p1');
                $s2 = $this->oldColsToLignes($rot, 'sterile_p2');
                $this->aggregateLignes($p1, $p2, $phosphate, $rot->camion_id, $pellesArr);
                $this->aggregateLignes($s1, $s2, $sterile,   $rot->camion_id, $pellesArr);
            }
        }

        // Finaliser les lignes (calculer totaux)
        $phosphate = array_values(array_map(fn($r) => array_merge($r, [
            'total'  => $r['vgs_1er'] + $r['vgs_2e'],
            'volume' => ($r['vgs_1er'] + $r['vgs_2e']) * 16,
        ]), $phosphate));

        $sterile = array_values(array_map(fn($r) => array_merge($r, [
            'total'  => $r['vgs_1er'] + $r['vgs_2e'],
            'volume' => ($r['vgs_1er'] + $r['vgs_2e']) * 14,
        ]), $sterile));

        // Fleet
        $nbCamions50  = $affectations->where('type_vehicule', 'camion')->count();
        $nbTombereau  = $affectations->where('type_vehicule', 'tombereau')->count();
        $nbPelles     = $engins->where('type', 'PELLE')->count();
        $nbChargeuses = $engins->where('type', 'CHARGEUSE')->count();
        $nbNiveleuses = $engins->where('type', 'NIVELEUSE')->count();
        $activeCamions = $rotations->count();

        return response()->json([
            'date'      => $date,
            'phosphate' => $phosphate,
            'sterile'   => $sterile,
            'fleet' => [
                ['label' => 'Camion 90T SITRAK', 'total' => $nbTombereau ?: 4,  'dispo_1er' => 0,              'dispo_2e' => 0             ],
                ['label' => 'Camion 50T MAN',    'total' => $nbCamions50 ?: 26, 'dispo_1er' => $activeCamions, 'dispo_2e' => $activeCamions],
                ['label' => 'Pelle',              'total' => $nbPelles    ?: 4,  'dispo_1er' => $nbPelles ?: 4, 'dispo_2e' => $nbPelles ?: 4],
                ['label' => 'Chargeuse',          'total' => $nbChargeuses ?: 2, 'dispo_1er' => $nbChargeuses ?: 2, 'dispo_2e' => $nbChargeuses ?: 2],
                ['label' => 'Niveleuse',          'total' => $nbNiveleuses ?: 2, 'dispo_1er' => $nbNiveleuses ?: 2, 'dispo_2e' => $nbNiveleuses ?: 2],
                ['label' => 'Arroseur',           'total' => 2,                  'dispo_1er' => 0,              'dispo_2e' => 0             ],
            ],
            'nb_camions' => $activeCamions,
            'pelles'     => array_values(array_unique($allPelles1er)),
            'remarques'  => array_values(array_unique($remarques)),
        ]);
    }

    /* ── Helpers privés ─────────────────────────────────────────────────── */
    private function calcVgsFromRotations(array $rotations): array
    {
        $vgsPhos = 0; $vgsSter = 0;
        foreach ($rotations as $r) {
            if ($r->lignes_json) {
                $l = is_string($r->lignes_json) ? json_decode($r->lignes_json, true) : $r->lignes_json;
                if (is_array($l)) {
                    foreach (['phosphate_p1','phosphate_p2'] as $k) foreach ($l[$k] ?? [] as $row) $vgsPhos += (int)($row['vgs'] ?? 0);
                    foreach (['sterile_p1','sterile_p2']     as $k) foreach ($l[$k] ?? [] as $row) $vgsSter += (int)($row['vgs'] ?? 0);
                    continue;
                }
            }
            $vgsPhos += ($r->phosphate_p1a_vgs??0)+($r->phosphate_p1b_vgs??0)+($r->phosphate_p2a_vgs??0)+($r->phosphate_p2b_vgs??0);
            $vgsSter += ($r->sterile_p1a_vgs??0)+($r->sterile_p1b_vgs??0)+($r->sterile_p2a_vgs??0)+($r->sterile_p2b_vgs??0);
        }
        return ['voyages_phosphate' => $vgsPhos, 'voyages_sterile' => $vgsSter, 'total_voyages' => $vgsPhos + $vgsSter];
    }

    private function oldColsToLignes(Rotation $r, string $section): array
    {
        [$type, $p] = explode('_', $section, 2);
        $rows = [];
        foreach (['a','b'] as $l) {
            $pan = $r->{"{$type}_{$p}{$l}_panneau"};
            if ($pan) $rows[] = [
                'niveau'  => '',
                'panneau' => $pan,
                'km'      => $r->{"{$type}_{$p}{$l}_km"}   ?? '',
                'vgs'     => $r->{"{$type}_{$p}{$l}_vgs"}  ?? 0,
            ];
        }
        return $rows;
    }

    private function aggregateLignes(array $p1Rows, array $p2Rows, array &$result, string $camionId, array $pelles): void
    {
        $allRows = array_merge(
            array_map(fn($r) => array_merge($r, ['poste' => 1]), $p1Rows),
            array_map(fn($r) => array_merge($r, ['poste' => 2]), $p2Rows)
        );

        foreach ($allRows as $row) {
            $pan = trim($row['panneau'] ?? '');
            $niv = trim($row['niveau']  ?? '');
            if (!$pan) continue;
            $vgs = (int)($row['vgs'] ?? 0);
            $km  = (float)($row['km'] ?? 0);
            $key = $niv . '||' . $pan;

            if (!isset($result[$key])) {
                $result[$key] = [
                    'niveau'      => $niv,
                    'panneau'     => $pan,
                    'km'          => $km,
                    'vgs_1er'     => 0,
                    'vgs_2e'      => 0,
                    'camions_1er' => 0,
                    'camions_2e'  => 0,
                    'pelles_1er'  => [],
                    'pelles_2e'   => [],
                ];
            }

            if ($row['poste'] === 1) {
                $result[$key]['vgs_1er']     += $vgs;
                if ($vgs > 0) {
                    $result[$key]['camions_1er']++;
                    foreach ($pelles as $p) { if (!in_array($p, $result[$key]['pelles_1er'])) $result[$key]['pelles_1er'][] = $p; }
                }
            } else {
                $result[$key]['vgs_2e']     += $vgs;
                if ($vgs > 0) {
                    $result[$key]['camions_2e']++;
                    foreach ($pelles as $p) { if (!in_array($p, $result[$key]['pelles_2e'])) $result[$key]['pelles_2e'][] = $p; }
                }
            }
        }
    }
}
