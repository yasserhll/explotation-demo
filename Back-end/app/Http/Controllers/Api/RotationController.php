<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rotation;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RotationController extends Controller
{
    /**
     * GET /api/rotations?date=2026-03-05
     * Retourne toutes les rotations d'une date + la liste des camions affectés
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());

        $rotations = Rotation::where('date', $date)
            ->orderBy('camion_id')
            ->get();

        // Camions disponibles depuis affectations (pour pré-remplir)
        $affectations = Affectation::whereNull('date')
            ->where('statut', '!=', 'arret')
            ->orderBy('camion_code')
            ->get(['camion_code', 'chauffeur_principal', 'chauffeur_secondaire', 'type_vehicule']);

        return response()->json([
            'date'        => $date,
            'rotations'   => $rotations,
            'affectations' => $affectations,
        ]);
    }

    /**
     * POST /api/rotations
     * Crée une rotation pour un camion à une date donnée
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'                  => 'required|date',
            'camion_id'             => 'required|string|max:20',
            'chauffeur_1er'         => 'nullable|string|max:100',
            'chauffeur_2e'          => 'nullable|string|max:100',
            // Stérile P1
            'sterile_p1a_panneau'   => 'nullable|string|max:200',
            'sterile_p1a_km'        => 'nullable|numeric',
            'sterile_p1a_vgs'       => 'nullable|integer|min:0',
            'sterile_p1b_panneau'   => 'nullable|string|max:200',
            'sterile_p1b_km'        => 'nullable|numeric',
            'sterile_p1b_vgs'       => 'nullable|integer|min:0',
            // Phosphate P1
            'phosphate_p1a_panneau' => 'nullable|string|max:200',
            'phosphate_p1a_km'      => 'nullable|numeric',
            'phosphate_p1a_vgs'     => 'nullable|integer|min:0',
            'phosphate_p1b_panneau' => 'nullable|string|max:200',
            'phosphate_p1b_km'      => 'nullable|numeric',
            'phosphate_p1b_vgs'     => 'nullable|integer|min:0',
            // Stérile P2
            'sterile_p2a_panneau'   => 'nullable|string|max:200',
            'sterile_p2a_km'        => 'nullable|numeric',
            'sterile_p2a_vgs'       => 'nullable|integer|min:0',
            'sterile_p2b_panneau'   => 'nullable|string|max:200',
            'sterile_p2b_km'        => 'nullable|numeric',
            'sterile_p2b_vgs'       => 'nullable|integer|min:0',
            // Phosphate P2
            'phosphate_p2a_panneau' => 'nullable|string|max:200',
            'phosphate_p2a_km'      => 'nullable|numeric',
            'phosphate_p2a_vgs'     => 'nullable|integer|min:0',
            'phosphate_p2b_panneau' => 'nullable|string|max:200',
            'phosphate_p2b_km'      => 'nullable|numeric',
            'phosphate_p2b_vgs'     => 'nullable|integer|min:0',
            'commentaires'          => 'nullable|string',
        ]);

        // Empêcher doublon date+camion
        $existing = Rotation::where('date', $validated['date'])
            ->where('camion_id', $validated['camion_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Ce camion a déjà une rotation pour cette date.'], 422);
        }

        $rotation = Rotation::create($validated);
        return response()->json($rotation, 201);
    }

    /**
     * PUT /api/rotations/{id}
     */
    public function update(Request $request, Rotation $rotation): JsonResponse
    {
        $validated = $request->validate([
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
        ]);

        $rotation->update($validated);
        return response()->json($rotation);
    }

    /**
     * DELETE /api/rotations/{id}
     */
    public function destroy(Rotation $rotation): JsonResponse
    {
        $rotation->delete();
        return response()->json(['message' => 'Supprimé']);
    }

    /**
     * GET /api/rotations/dates
     * Liste des dates ayant des rotations enregistrées
     */
    public function dates(): JsonResponse
    {
        $dates = Rotation::selectRaw('date, COUNT(*) as nb_camions')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        return response()->json($dates);
    }

    /**
     * GET /api/rotations/monthly?month=YYYY-MM
     * Rapport mensuel depuis les rotations (même format que productionAPI.getMonthly)
     */
    public function monthly(Request $request): JsonResponse
    {
        $month = $request->get('month');
        if (!$month) {
            $last = Rotation::selectRaw("strftime('%Y-%m', date) as m")
                ->groupBy('m')->orderByDesc('m')->first();
            $month = $last ? $last->m : now()->format('Y-m');
        }

        $rotations = Rotation::whereRaw("strftime('%Y-%m', date) = ?", [$month])
            ->orderBy('date')->get();

        $byDate = $rotations->groupBy(fn($r) => substr($r->date, 0, 10))
            ->map(function($rows, $date) {
                $vgsPhos = $rows->sum(fn($r) =>
                    ($r->phosphate_p1a_vgs??0)+($r->phosphate_p1b_vgs??0)+
                    ($r->phosphate_p2a_vgs??0)+($r->phosphate_p2b_vgs??0));
                $vgsSter = $rows->sum(fn($r) =>
                    ($r->sterile_p1a_vgs??0)+($r->sterile_p1b_vgs??0)+
                    ($r->sterile_p2a_vgs??0)+($r->sterile_p2b_vgs??0));
                return [
                    'date'              => $date,
                    'nb_camions'        => $rows->count(),
                    'total_voyages'     => $vgsPhos + $vgsSter,
                    'voyages_phosphate' => $vgsPhos,
                    'voyages_sterile'   => $vgsSter,
                    'volume_phosphate'  => $vgsPhos * 16,
                    'volume_sterile'    => $vgsSter * 14,
                    'total_volume'      => $vgsPhos * 16 + $vgsSter * 14,
                ];
            })->values();

        $vgsPhosTot = $rotations->sum(fn($r) =>
            ($r->phosphate_p1a_vgs??0)+($r->phosphate_p1b_vgs??0)+
            ($r->phosphate_p2a_vgs??0)+($r->phosphate_p2b_vgs??0));
        $vgsSterTot = $rotations->sum(fn($r) =>
            ($r->sterile_p1a_vgs??0)+($r->sterile_p1b_vgs??0)+
            ($r->sterile_p2a_vgs??0)+($r->sterile_p2b_vgs??0));

        return response()->json([
            'month'             => $month,
            'jours_production'  => $byDate->count(),
            'total_voyages'     => $vgsPhosTot + $vgsSterTot,
            'total_volume'      => $vgsPhosTot * 16 + $vgsSterTot * 14,
            'voyages_phosphate' => $vgsPhosTot,
            'volume_phosphate'  => $vgsPhosTot * 16,
            'voyages_sterile'   => $vgsSterTot,
            'volume_sterile'    => $vgsSterTot * 14,
            'daily_summary'     => $byDate,
            'by_tranchee'       => [],
        ]);
    }

}
