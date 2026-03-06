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
     * Retourne le dernier mois ayant des données.
     */
    private function getActiveMonth(): string
    {
        $last = Production::selectRaw("strftime('%Y-%m', date) as month")
            ->groupBy('month')
            ->orderByDesc('month')
            ->first();
        return $last ? $last->month : now()->format('Y-m');
    }

    /**
     * Liste des productions.
     * GET /api/productions?date=&type=&month=
     * Retourne { data: [...] }
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
            $query->whereRaw("strftime('%Y-%m', date) = ?", [$request->month]);
        }
        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('date', [$request->from, $request->to]);
        }
        if ($request->filled('tranchee')) {
            $query->where('tranchee', 'like', '%' . $request->tranchee . '%');
        }

        // ✅ Retourne { data: [...] } pour compatibilité frontend
        return response()->json(['data' => $query->get()]);
    }

    /**
     * Créer une production.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'           => 'required|date',
            'type_materiau'  => 'required|string|max:50',
            'niveau'         => 'nullable|string|max:20',
            'tranchee'       => 'nullable|string|max:50',
            'panneau'        => 'nullable|string|max:20',
            'destination'    => 'required|string|max:100',
            'distance_km'    => 'nullable|numeric|min:0',
            'nbr_voyage_1er' => 'required|integer|min:0',
            'nbr_voyage_2e'  => 'required|integer|min:0',
            'total_voyage'   => 'nullable|integer|min:0',
            'volume_m3'      => 'nullable|numeric|min:0',
            'camion_1er'     => 'nullable',
            'camion_2e'      => 'nullable',
            'pelle_1er'      => 'nullable|string|max:50',
            'pelle_2e'       => 'nullable|string|max:50',
            'remarques'      => 'nullable|string',
        ]);

        // Calculer total_voyage si pas fourni
        if (empty($validated['total_voyage'])) {
            $validated['total_voyage'] = ($validated['nbr_voyage_1er'] ?? 0) + ($validated['nbr_voyage_2e'] ?? 0);
        }

        $production = Production::create($validated);
        return response()->json($production, 201);
    }

    public function show(Production $production): JsonResponse
    {
        return response()->json($production);
    }

    public function update(Request $request, Production $production): JsonResponse
    {
        $validated = $request->validate([
            'date'           => 'sometimes|date',
            'type_materiau'  => 'sometimes|string|max:50',
            'niveau'         => 'nullable|string|max:20',
            'tranchee'       => 'nullable|string|max:50',
            'panneau'        => 'nullable|string|max:20',
            'destination'    => 'sometimes|string|max:100',
            'distance_km'    => 'nullable|numeric|min:0',
            'nbr_voyage_1er' => 'sometimes|integer|min:0',
            'nbr_voyage_2e'  => 'sometimes|integer|min:0',
            'total_voyage'   => 'nullable|integer|min:0',
            'volume_m3'      => 'nullable|numeric|min:0',
            'camion_1er'     => 'nullable',
            'camion_2e'      => 'nullable',
            'pelle_1er'      => 'nullable|string|max:50',
            'pelle_2e'       => 'nullable|string|max:50',
            'remarques'      => 'nullable|string',
        ]);

        $production->update($validated);
        return response()->json($production);
    }

    public function destroy(Production $production): JsonResponse
    {
        $production->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }

    /**
     * Rapport mensuel.
     * GET /api/productions/monthly?month=YYYY-MM
     * Si month non fourni → utilise le dernier mois avec données
     */
    public function monthly(Request $request): JsonResponse
    {
        // ✅ Si aucun mois fourni ou mois courant vide → prendre le dernier mois actif
        $month = $request->get('month');
        if (!$month) {
            $month = $this->getActiveMonth();
        } else {
            // Vérifier si ce mois a des données, sinon prendre le dernier mois actif
            $count = Production::whereRaw("strftime('%Y-%m', date) = ?", [$month])->count();
            if ($count === 0) {
                $month = $this->getActiveMonth();
            }
        }

        $productions = Production::whereRaw("strftime('%Y-%m', date) = ?", [$month])
            ->orderBy('date')
            ->get();

        $byDate = $productions->groupBy(fn($p) => $p->date->format('Y-m-d'));

        $dailySummary = $byDate->map(function ($items, $date) {
            $phos = $items->where('type_materiau', 'PHOSPHATE');
            $ster = $items->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));
            return [
                'date'             => $date,
                'total_voyages'    => $items->sum('total_voyage'),
                'total_volume'     => $items->sum('volume_m3'),
                'voyages_phosphate'=> $phos->sum('total_voyage'),
                'volume_phosphate' => $phos->sum('volume_m3'),
                'voyages_sterile'  => $ster->sum('total_voyage'),
                'volume_sterile'   => $ster->sum('volume_m3'),
            ];
        })->values();

        $phos = $productions->where('type_materiau', 'PHOSPHATE');
        $ster = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        $byTranchee = $productions->whereNotNull('tranchee')
            ->groupBy('tranchee')
            ->map(fn($items, $t) => [
                'tranchee'      => $t,
                'total_voyages' => $items->sum('total_voyage'),
                'total_volume'  => $items->sum('volume_m3'),
                'type_materiau' => $items->first()->type_materiau,
            ])
            ->sortByDesc('total_volume')
            ->values();

        return response()->json([
            'month'             => $month,
            'jours_production'  => $byDate->count(),
            'total_voyages'     => $productions->sum('total_voyage'),
            'total_volume'      => $productions->sum('volume_m3'),
            'voyages_phosphate' => $phos->sum('total_voyage'),
            'volume_phosphate'  => $phos->sum('volume_m3'),
            'voyages_sterile'   => $ster->sum('total_voyage'),
            'volume_sterile'    => $ster->sum('volume_m3'),
            'daily_summary'     => $dailySummary,
            'by_tranchee'       => $byTranchee,
        ]);
    }

    public function daily(Request $request): JsonResponse
    {
        $date = $request->get('date', now()->toDateString());
        $productions = Production::whereDate('date', $date)->get();
        $phos = $productions->where('type_materiau', 'PHOSPHATE');
        $ster = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));
        return response()->json([
            'date'          => $date,
            'data'          => $productions->values(),
            'total_voyages' => $productions->sum('total_voyage'),
            'total_volume'  => $productions->sum('volume_m3'),
            'vol_phosphate' => $phos->sum('volume_m3'),
            'vol_sterile'   => $ster->sum('volume_m3'),
        ]);
    }

    public function export(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());
        $productions = Production::whereBetween('date', [$from, $to])->orderBy('date')->get();

        $headers = [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=productions_{$from}_{$to}.csv",
        ];
        $callback = function () use ($productions) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Date','Type','Tranchée','Panneau','Destination','Dist.km','V1','V2','Total','Volume m³','Pelle 1','Pelle 2'], ';');
            foreach ($productions as $p) {
                fputcsv($file, [$p->date->format('d/m/Y'),$p->type_materiau,$p->tranchee,$p->panneau,$p->destination,$p->distance_km,$p->nbr_voyage_1er,$p->nbr_voyage_2e,$p->total_voyage,$p->volume_m3,$p->pelle_1er,$p->pelle_2e], ';');
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }
}
