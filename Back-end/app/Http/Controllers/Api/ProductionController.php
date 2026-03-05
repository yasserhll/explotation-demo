<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Production;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ProductionController extends Controller
{
    /**
     * Liste des productions avec filtres optionnels.
     * GET /api/productions?date=&type=&month=&from=&to=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Production::query()->orderBy('date', 'desc')->orderBy('id', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('type')) {
            $query->where('type_materiau', $request->type);
        }

        if ($request->filled('month')) {
            // Format: YYYY-MM
            $query->whereRaw("strftime('%Y-%m', date) = ?", [$request->month]);
        }

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('date', [$request->from, $request->to]);
        }

        if ($request->filled('tranchee')) {
            $query->where('tranchee', 'like', '%' . $request->tranchee . '%');
        }

        return response()->json($query->get());
    }

    /**
     * Créer une production.
     * POST /api/productions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'          => 'required|date',
            'type_materiau' => 'required|string|max:50',
            'niveau'        => 'nullable|string|max:20',
            'tranchee'      => 'nullable|string|max:50',
            'panneau'       => 'nullable|string|max:20',
            'destination'   => 'required|string|max:100',
            'distance_km'   => 'nullable|numeric|min:0',
            'nbr_voyage_1er'=> 'required|integer|min:0',
            'nbr_voyage_2e' => 'required|integer|min:0',
            'volume_m3'     => 'nullable|numeric|min:0',
            'camion_1er'    => 'nullable|string|max:20',
            'camion_2e'     => 'nullable|string|max:20',
            'pelle_1er'     => 'nullable|string|max:20',
            'pelle_2e'      => 'nullable|string|max:20',
            'remarques'     => 'nullable|string',
        ]);

        $production = Production::create($validated);

        return response()->json($production, 201);
    }

    /**
     * Détails d'une production.
     * GET /api/productions/{id}
     */
    public function show(Production $production): JsonResponse
    {
        return response()->json($production);
    }

    /**
     * Modifier une production.
     * PUT /api/productions/{id}
     */
    public function update(Request $request, Production $production): JsonResponse
    {
        $validated = $request->validate([
            'date'          => 'sometimes|date',
            'type_materiau' => 'sometimes|string|max:50',
            'niveau'        => 'nullable|string|max:20',
            'tranchee'      => 'nullable|string|max:50',
            'panneau'       => 'nullable|string|max:20',
            'destination'   => 'sometimes|string|max:100',
            'distance_km'   => 'nullable|numeric|min:0',
            'nbr_voyage_1er'=> 'sometimes|integer|min:0',
            'nbr_voyage_2e' => 'sometimes|integer|min:0',
            'volume_m3'     => 'nullable|numeric|min:0',
            'camion_1er'    => 'nullable|string|max:20',
            'camion_2e'     => 'nullable|string|max:20',
            'pelle_1er'     => 'nullable|string|max:20',
            'pelle_2e'      => 'nullable|string|max:20',
            'remarques'     => 'nullable|string',
        ]);

        $production->update($validated);

        return response()->json($production);
    }

    /**
     * Supprimer une production.
     * DELETE /api/productions/{id}
     */
    public function destroy(Production $production): JsonResponse
    {
        $production->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }

    /**
     * Rapport journalier - synthèse par date.
     * GET /api/productions/daily?date=YYYY-MM-DD
     */
    public function daily(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());

        $productions = Production::whereDate('date', $date)->get();

        $phosphates = $productions->where('type_materiau', 'PHOSPHATE');
        $steriles   = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        return response()->json([
            'date'    => $date,
            'phosphate' => [
                'total_voyages' => $phosphates->sum('total_voyage'),
                'total_volume'  => $phosphates->sum('volume_m3'),
                'lignes'        => $phosphates->values(),
            ],
            'sterile' => [
                'total_voyages' => $steriles->sum('total_voyage'),
                'total_volume'  => $steriles->sum('volume_m3'),
                'lignes'        => $steriles->values(),
            ],
            'total_voyages' => $productions->sum('total_voyage'),
            'total_volume'  => $productions->sum('volume_m3'),
        ]);
    }

    /**
     * Rapport mensuel groupé par tranchée/panneau.
     * GET /api/productions/monthly?month=YYYY-MM
     */
    public function monthly(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->format('Y-m'));

        $productions = Production::whereRaw("strftime('%Y-%m', date) = ?", [$month])
            ->orderBy('date')
            ->get();

        // Grouper par date
        $byDate = $productions->groupBy(fn($p) => $p->date->format('Y-m-d'));

        $dailySummary = $byDate->map(function ($items, $date) {
            $phosphates = $items->where('type_materiau', 'PHOSPHATE');
            $steriles   = $items->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));
            return [
                'date'                 => $date,
                'total_voyages'        => $items->sum('total_voyage'),
                'total_volume'         => $items->sum('volume_m3'),
                'voyages_phosphate'    => $phosphates->sum('total_voyage'),
                'volume_phosphate'     => $phosphates->sum('volume_m3'),
                'voyages_sterile'      => $steriles->sum('total_voyage'),
                'volume_sterile'       => $steriles->sum('volume_m3'),
            ];
        });

        // Totaux mensuels
        $phosphates = $productions->where('type_materiau', 'PHOSPHATE');
        $steriles   = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        // Par tranchée
        $byTranchee = $productions->groupBy('tranchee')->map(function ($items, $tranchee) {
            return [
                'tranchee'      => $tranchee,
                'total_voyages' => $items->sum('total_voyage'),
                'total_volume'  => $items->sum('volume_m3'),
            ];
        })->sortByDesc('total_volume')->values();

        return response()->json([
            'month'              => $month,
            'jours_production'   => $byDate->count(),
            'total_voyages'      => $productions->sum('total_voyage'),
            'total_volume'       => $productions->sum('volume_m3'),
            'voyages_phosphate'  => $phosphates->sum('total_voyage'),
            'volume_phosphate'   => $phosphates->sum('volume_m3'),
            'voyages_sterile'    => $steriles->sum('total_voyage'),
            'volume_sterile'     => $steriles->sum('volume_m3'),
            'daily_summary'      => $dailySummary->values(),
            'by_tranchee'        => $byTranchee,
        ]);
    }

    /**
     * Export CSV des productions.
     * GET /api/productions/export?from=&to=
     */
    public function export(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        $productions = Production::whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=productions_{$from}_{$to}.csv",
        ];

        $callback = function () use ($productions) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM UTF-8

            fputcsv($file, [
                'Date', 'Type Matériau', 'Niveau', 'Tranchée', 'Panneau',
                'Destination', 'Distance (km)', 'Voyage 1er', 'Voyage 2e',
                'Total Voyage', 'Volume (m³)', 'Camion 1er', 'Camion 2e',
                'Pelle 1er', 'Pelle 2e',
            ], ';');

            foreach ($productions as $p) {
                fputcsv($file, [
                    $p->date->format('d/m/Y'),
                    $p->type_materiau,
                    $p->niveau,
                    $p->tranchee,
                    $p->panneau,
                    $p->destination,
                    $p->distance_km,
                    $p->nbr_voyage_1er,
                    $p->nbr_voyage_2e,
                    $p->total_voyage,
                    $p->volume_m3,
                    $p->camion_1er,
                    $p->camion_2e,
                    $p->pelle_1er,
                    $p->pelle_2e,
                ], ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
