<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Engin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EnginController extends Controller
{
    /**
     * Liste de tous les engins.
     * GET /api/engins
     */
    public function index(Request $request): JsonResponse
    {
        $query = Engin::query();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderBy('type')->orderBy('code')->get());
    }

    /**
     * Créer un engin.
     * POST /api/engins
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'                  => 'required|string|max:30|unique:engins,code',
            'type'                  => 'required|in:CAMION,PELLE,NIVELEUSE,TOMBEREAU,AUTRE',
            'modele'                => 'nullable|string|max:50',
            'chauffeur_principal'   => 'nullable|string|max:100',
            'chauffeur_secondaire'  => 'nullable|string|max:100',
            'statut'                => 'nullable|in:actif,arret,maintenance',
            'notes'                 => 'nullable|string',
        ]);

        $engin = Engin::create($validated);
        return response()->json($engin, 201);
    }

    /**
     * Détails d'un engin.
     * GET /api/engins/{id}
     */
    public function show(Engin $engin): JsonResponse
    {
        return response()->json($engin);
    }

    /**
     * Modifier un engin.
     * PUT /api/engins/{id}
     */
    public function update(Request $request, Engin $engin): JsonResponse
    {
        $validated = $request->validate([
            'code'                  => 'sometimes|string|max:30|unique:engins,code,' . $engin->id,
            'type'                  => 'sometimes|in:CAMION,PELLE,NIVELEUSE,TOMBEREAU,AUTRE',
            'modele'                => 'nullable|string|max:50',
            'chauffeur_principal'   => 'nullable|string|max:100',
            'chauffeur_secondaire'  => 'nullable|string|max:100',
            'statut'                => 'nullable|in:actif,arret,maintenance',
            'notes'                 => 'nullable|string',
        ]);

        $engin->update($validated);
        return response()->json($engin);
    }

    /**
     * Supprimer un engin.
     * DELETE /api/engins/{id}
     */
    public function destroy(Engin $engin): JsonResponse
    {
        $engin->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }
}
