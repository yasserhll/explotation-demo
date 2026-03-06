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
     * GET /api/arrets?from=&to=
     * Retourne tableau direct (pas de pagination)
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

        // ✅ Retourne {data: [...]} pour compatibilité frontend
        return response()->json(['data' => $query->get()]);
    }

    /**
     * Enregistrer un arrêt.
     * ✅ type_arret accepte valeurs libres (texte quelconque)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'         => 'required|date',
            'engin_code'   => 'nullable|string|max:30',
            'type_arret'   => 'required|string|max:100',   // ✅ pas de validation enum restrictive
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
            'type_arret'   => 'sometimes|string|max:100',
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
     * ✅ Si période courante vide → cherche dans les données disponibles
     */
    public function disponibilite(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        // ✅ Si aucun engin/arret dans cette période → calculer quand même avec 0 arrêts
        $engins = Engin::all();
        $nbEngins = max(1, $engins->count());

        $debut = Carbon::parse($from);
        $fin   = Carbon::parse($to);

        // Compter les jours ouvrables (hors dimanche)
        $joursTotal = 0;
        $current = $debut->copy();
        while ($current->lte($fin)) {
            if ($current->dayOfWeek !== Carbon::SUNDAY) {
                $joursTotal++;
            }
            $current->addDay();
        }
        $joursTotal = max(1, $joursTotal);

        $heuresTheoriques = $joursTotal * 20 * $nbEngins;
        $totalArrets = (float) Arret::whereBetween('date', [$from, $to])->sum('duree_heures');

        $tauxGlobal = $heuresTheoriques > 0
            ? round((($heuresTheoriques - $totalArrets) / $heuresTheoriques) * 100, 2)
            : 100.0;

        // Répartition par type d'arrêt
        $parType = Arret::whereBetween('date', [$from, $to])
            ->selectRaw('type_arret, SUM(duree_heures) as total_heures, COUNT(*) as nb_incidents')
            ->groupBy('type_arret')
            ->get();

        // Par engin
        $parEngin = $engins->map(function ($engin) use ($from, $to, $joursTotal) {
            $heuresArret = (float) Arret::whereBetween('date', [$from, $to])
                ->where('engin_code', $engin->code)
                ->sum('duree_heures');
            $heuresTheo = $joursTotal * 20;
            return [
                'engin_code' => $engin->code,
                'type'       => $engin->type,
                'heures_arret'     => $heuresArret,
                'heures_theoriques'=> $heuresTheo,
                'taux_disponibilite' => $heuresTheo > 0
                    ? round((($heuresTheo - $heuresArret) / $heuresTheo) * 100, 1) : 100,
            ];
        })->values();

        return response()->json([
            'periode'                   => ['from' => $from, 'to' => $to],
            'nb_engins'                 => $nbEngins,
            'jours_periode'             => $joursTotal,
            'heures_theoriques_totales' => $heuresTheoriques,
            'heures_arret_totales'      => $totalArrets,
            'taux_disponibilite_global' => $tauxGlobal,
            'par_engin'                 => $parEngin,
            'par_type_arret'            => $parType,
        ]);
    }
}
