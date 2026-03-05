<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Arret;
use App\Models\Engin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ArretController extends Controller
{
    /**
     * Liste des arrêts.
     * GET /api/arrets?from=&to=&engin=
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

        return response()->json($query->get());
    }

    /**
     * Enregistrer un arrêt.
     * POST /api/arrets
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'         => 'required|date',
            'engin_code'   => 'nullable|string|max:30',
            'type_arret'   => 'required|in:panne_mecanique,maintenance_preventive,pluie,accident,manque_carburant,absence_chauffeur,autre',
            'duree_heures' => 'required|numeric|min:0.1|max:24',
            'description'  => 'nullable|string',
            'arret_total'  => 'nullable|boolean',
        ]);

        $arret = Arret::create($validated);
        return response()->json($arret, 201);
    }

    /**
     * Modifier un arrêt.
     * PUT /api/arrets/{id}
     */
    public function update(Request $request, Arret $arret): JsonResponse
    {
        $validated = $request->validate([
            'date'         => 'sometimes|date',
            'engin_code'   => 'nullable|string|max:30',
            'type_arret'   => 'sometimes|in:panne_mecanique,maintenance_preventive,pluie,accident,manque_carburant,absence_chauffeur,autre',
            'duree_heures' => 'sometimes|numeric|min:0.1|max:24',
            'description'  => 'nullable|string',
            'arret_total'  => 'nullable|boolean',
        ]);

        $arret->update($validated);
        return response()->json($arret);
    }

    /**
     * Supprimer un arrêt.
     * DELETE /api/arrets/{id}
     */
    public function destroy(Arret $arret): JsonResponse
    {
        $arret->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }

    /**
     * Calcul du taux de disponibilité par engin et par période.
     * GET /api/disponibilite?from=&to=
     */
    public function disponibilite(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        $engins = Engin::all();

        $results = $engins->map(fn($engin) => $engin->tauxDisponibilite($from, $to));

        // Calcul global toute flotte
        $debut = Carbon::parse($from);
        $fin   = Carbon::parse($to);
        $joursTotal = 0;
        $current = $debut->copy();
        while ($current->lte($fin)) {
            if ($current->dayOfWeek !== Carbon::SUNDAY) {
                $joursTotal++;
            }
            $current->addDay();
        }

        $heuresTheoriques = $joursTotal * 20 * $engins->count();
        $totalArrets = Arret::whereBetween('date', [$from, $to])->sum('duree_heures');
        $tauxGlobal = $heuresTheoriques > 0
            ? round((($heuresTheoriques - $totalArrets) / $heuresTheoriques) * 100, 2)
            : 0;

        // Répartition par type d'arrêt
        $parType = Arret::whereBetween('date', [$from, $to])
            ->selectRaw('type_arret, SUM(duree_heures) as total_heures, COUNT(*) as nb_incidents')
            ->groupBy('type_arret')
            ->get();

        return response()->json([
            'periode'          => ['from' => $from, 'to' => $to],
            'nb_engins'        => $engins->count(),
            'jours_periode'    => $joursTotal,
            'heures_theoriques_totales' => $heuresTheoriques,
            'heures_arret_totales'      => (float) $totalArrets,
            'taux_disponibilite_global' => $tauxGlobal,
            'par_engin'        => $results->values(),
            'par_type_arret'   => $parType,
        ]);
    }
}
