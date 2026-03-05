<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AffectationController extends Controller
{
    /**
     * Liste des affectations.
     * GET /api/affectations?date=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Affectation::query()->orderBy('camion_code');

        if ($request->filled('date')) {
            // Affectations pour une date spécifique OU affectations permanentes (date = null)
            $query->where(function ($q) use ($request) {
                $q->whereDate('date', $request->date)->orWhereNull('date');
            });
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->get());
    }

    /**
     * Créer une affectation.
     * POST /api/affectations
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'                  => 'nullable|date',
            'chauffeur_principal'   => 'required|string|max:100',
            'camion_code'           => 'required|string|max:20',
            'chauffeur_secondaire'  => 'nullable|string|max:100',
            'type_vehicule'         => 'nullable|in:camion,tombereau,autre',
            'statut'                => 'nullable|string|max:20',
            'notes'                 => 'nullable|string',
        ]);

        $affectation = Affectation::create($validated);
        return response()->json($affectation, 201);
    }

    /**
     * Import groupé d'affectations (bulk import).
     * POST /api/affectations/bulk
     */
    public function bulk(Request $request): JsonResponse
    {
        $request->validate([
            'affectations'   => 'required|array|min:1',
            'affectations.*.chauffeur_principal' => 'required|string',
            'affectations.*.camion_code'         => 'required|string',
        ]);

        $created = [];
        foreach ($request->affectations as $data) {
            $created[] = Affectation::create([
                'date'                 => $data['date'] ?? null,
                'chauffeur_principal'  => $data['chauffeur_principal'],
                'camion_code'          => $data['camion_code'],
                'chauffeur_secondaire' => $data['chauffeur_secondaire'] ?? null,
                'type_vehicule'        => $data['type_vehicule'] ?? 'camion',
                'statut'               => $data['statut'] ?? 'actif',
                'notes'                => $data['notes'] ?? null,
            ]);
        }

        return response()->json(['created' => count($created), 'data' => $created], 201);
    }

    /**
     * Détails d'une affectation.
     * GET /api/affectations/{id}
     */
    public function show(Affectation $affectation): JsonResponse
    {
        return response()->json($affectation);
    }

    /**
     * Modifier une affectation.
     * PUT /api/affectations/{id}
     */
    public function update(Request $request, Affectation $affectation): JsonResponse
    {
        $validated = $request->validate([
            'date'                  => 'nullable|date',
            'chauffeur_principal'   => 'sometimes|string|max:100',
            'camion_code'           => 'sometimes|string|max:20',
            'chauffeur_secondaire'  => 'nullable|string|max:100',
            'type_vehicule'         => 'nullable|in:camion,tombereau,autre',
            'statut'                => 'nullable|string|max:20',
            'notes'                 => 'nullable|string',
        ]);

        $affectation->update($validated);
        return response()->json($affectation);
    }

    /**
     * Supprimer une affectation.
     * DELETE /api/affectations/{id}
     */
    public function destroy(Affectation $affectation): JsonResponse
    {
        $affectation->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }
}
