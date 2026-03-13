<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Arret;
use App\Models\Engin;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ArretController extends Controller
{
    /**
     * Liste des arrêts.
     * GET /api/arrets?from=&to=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Arret::query()->orderBy('date', 'desc');

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('date', [$request->from, $request->to]);
        } elseif ($request->filled('from')) {
            $query->where('date', '>=', $request->from);
        }
        if ($request->filled('engin')) {
            $query->where('engin_code', $request->engin);
        }
        if ($request->filled('type')) {
            $query->where('type_arret', $request->type);
        }

        return response()->json(['data' => $query->get()]);
    }

    /**
     * Enregistrer un arrêt.
     * type_arret accepte valeurs libres (string)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'         => 'required|date',
            'engin_code'   => 'nullable|string|max:30',
            'type_arret'   => 'required|string|max:150',
            'duree_heures' => 'required|numeric|min:0.1|max:24',
            'description'  => 'nullable|string',
            'arret_total'  => 'nullable|boolean',
        ]);

        $arret = Arret::create($validated);
        return response()->json($arret, 201);
    }

    public function update(Request $request, Arret $arret): JsonResponse
    {
        $validated = $request->validate([
            'date'         => 'sometimes|date',
            'engin_code'   => 'nullable|string|max:30',
            'type_arret'   => 'sometimes|string|max:150',
            'duree_heures' => 'sometimes|numeric|min:0.1|max:24',
            'description'  => 'nullable|string',
            'arret_total'  => 'nullable|boolean',
        ]);

        $arret->update($validated);
        return response()->json($arret);
    }

    public function destroy(Arret $arret): JsonResponse
    {
        $arret->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }

    /**
     * Taux de disponibilité.
     * GET /api/disponibilite?from=&to=
     *
     * Calcule le taux pour TOUTES les machines :
     *  - Camions/Tombereaux  → table affectations (camion_code)
     *  - Engins de chantier  → table engins (code)
     */
    public function disponibilite(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to',   now()->toDateString());

        $debut = Carbon::parse($from);
        $fin   = Carbon::parse($to);

        // Jours ouvrables (hors dimanche)
        $joursTotal = 0;
        $current = $debut->copy();
        while ($current->lte($fin)) {
            if ($current->dayOfWeek !== Carbon::SUNDAY) {
                $joursTotal++;
            }
            $current->addDay();
        }
        $joursTotal = max(1, $joursTotal);

        // ── Liste unifiée de toutes les machines ────────────────────────────
        // 1. Camions depuis affectations permanentes (date = null)
        $affectations = Affectation::whereNull('date')->get();
        $camions = $affectations->map(fn($a) => [
            'code' => $a->camion_code,
            'type' => strtoupper($a->type_vehicule ?? 'CAMION'),
        ])->filter(fn($c) => !empty($c['code']));

        // 2. Engins de chantier
        $engins = Engin::all()->map(fn($e) => [
            'code' => $e->code,
            'type' => $e->type,
        ]);

        // 3. Fusionner sans doublons par code
        $allMachines = collect();
        $seen = [];
        foreach ($camions->concat($engins) as $m) {
            if (!isset($seen[$m['code']])) {
                $seen[$m['code']] = true;
                $allMachines->push($m);
            }
        }

        $nbMachines = max(1, $allMachines->count());

        // ── Heures théoriques & arrêts globaux ──────────────────────────────
        $heuresTheoriques = $joursTotal * 20 * $nbMachines;
        $totalArrets = (float) Arret::whereBetween('date', [$from, $to])->sum('duree_heures');

        $tauxGlobal = $heuresTheoriques > 0
            ? round((($heuresTheoriques - $totalArrets) / $heuresTheoriques) * 100, 2)
            : 100.0;

        // ── Répartition par type d'arrêt ────────────────────────────────────
        $parType = Arret::whereBetween('date', [$from, $to])
            ->selectRaw('type_arret, SUM(duree_heures) as total_heures, COUNT(*) as nb_incidents')
            ->groupBy('type_arret')
            ->get();

        // ── Taux par machine ─────────────────────────────────────────────────
        $heuresTheoParMachine = $joursTotal * 20;

        $parEngin = $allMachines->map(function ($machine) use ($from, $to, $heuresTheoParMachine) {
            $heuresArret = (float) Arret::whereBetween('date', [$from, $to])
                ->where('engin_code', $machine['code'])
                ->sum('duree_heures');

            $taux = $heuresTheoParMachine > 0
                ? round((($heuresTheoParMachine - $heuresArret) / $heuresTheoParMachine) * 100, 1)
                : 100.0;

            return [
                'engin_code'        => $machine['code'],
                'type'              => $machine['type'],
                'heures_arret'      => $heuresArret,
                'heures_theoriques' => $heuresTheoParMachine,
                'taux_disponibilite'=> $taux,
            ];
        })->values();

        return response()->json([
            'periode'                   => ['from' => $from, 'to' => $to],
            'nb_engins'                 => $nbMachines,
            'jours_periode'             => $joursTotal,
            'heures_theoriques_totales' => $heuresTheoriques,
            'heures_arret_totales'      => $totalArrets,
            'taux_disponibilite_global' => $tauxGlobal,
            'par_engin'                 => $parEngin,
            'par_type_arret'            => $parType,
        ]);
    }
}
