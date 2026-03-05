<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Production;
use App\Models\Engin;
use App\Models\Arret;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * KPIs et données du tableau de bord principal.
     * GET /api/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $today     = now()->toDateString();
        $monthStart = now()->startOfMonth()->toDateString();

        // Productions du mois
        $monthlyProds = Production::whereRaw("strftime('%Y-%m', date) = ?", [now()->format('Y-m')])->get();

        // Productions aujourd'hui
        $todayProds = Production::whereDate('date', $today)->get();

        // Phosphate vs Stérile ce mois
        $phosphateMois = $monthlyProds->where('type_materiau', 'PHOSPHATE');
        $sterileMois   = $monthlyProds->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        // Trend 15 derniers jours
        $trend = Production::where('date', '>=', now()->subDays(14)->toDateString())
            ->orderBy('date')
            ->get()
            ->groupBy(fn($p) => $p->date->format('Y-m-d'))
            ->map(function ($items, $date) {
                $phos = $items->where('type_materiau', 'PHOSPHATE');
                $ster = $items->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));
                return [
                    'date'             => $date,
                    'total_voyages'    => $items->sum('total_voyage'),
                    'total_volume'     => $items->sum('volume_m3'),
                    'volume_phosphate' => $phos->sum('volume_m3'),
                    'volume_sterile'   => $ster->sum('volume_m3'),
                    'nb_engins'        => $items->pluck('pelle_1er')->merge($items->pluck('pelle_2e'))->filter()->unique()->count(),
                ];
            })->values();

        // Top destinations du mois
        $topDestinations = $monthlyProds->groupBy('destination')
            ->map(fn($items, $dest) => [
                'destination'   => $dest,
                'total_voyages' => $items->sum('total_voyage'),
                'total_volume'  => $items->sum('volume_m3'),
            ])
            ->sortByDesc('total_volume')
            ->take(8)
            ->values();

        // Performance par tranchée (mois en cours)
        $byTranchee = $monthlyProds->whereNotNull('tranchee')
            ->groupBy('tranchee')
            ->map(fn($items, $tr) => [
                'tranchee'       => $tr,
                'total_voyages'  => $items->sum('total_voyage'),
                'total_volume'   => $items->sum('volume_m3'),
                'type_materiau'  => $items->first()->type_materiau,
                'nb_jours'       => $items->pluck('date')->map(fn($d) => $d->format('Y-m-d'))->unique()->count(),
                'volume_par_jour'=> $items->pluck('date')->map(fn($d) => $d->format('Y-m-d'))->unique()->count() > 0
                    ? round($items->sum('volume_m3') / $items->pluck('date')->map(fn($d) => $d->format('Y-m-d'))->unique()->count(), 0)
                    : 0,
            ])
            ->sortByDesc('total_volume')
            ->values();

        // Arrêts du mois - taux disponibilité global
        $engins = Engin::all();
        $joursTotal = now()->day; // jours écoulés dans le mois
        $heuresTheoriques = $joursTotal * 20 * max(1, $engins->count());
        $totalArrets = Arret::where('date', '>=', $monthStart)->sum('duree_heures');
        $tauxDispo = $heuresTheoriques > 0
            ? round((($heuresTheoriques - $totalArrets) / $heuresTheoriques) * 100, 1)
            : 100;

        // Camions actifs (affectations)
        $nbCamions = Affectation::whereNull('date')->where('statut', 'actif')->count();

        return response()->json([
            'kpis' => [
                'volume_phosphate_mois'  => round($phosphateMois->sum('volume_m3'), 0),
                'voyages_phosphate_mois' => $phosphateMois->sum('total_voyage'),
                'volume_sterile_mois'    => round($sterileMois->sum('volume_m3'), 0),
                'voyages_sterile_mois'   => $sterileMois->sum('total_voyage'),
                'total_volume_mois'      => round($monthlyProds->sum('volume_m3'), 0),
                'total_voyages_mois'     => $monthlyProds->sum('total_voyage'),
                'jours_production'       => $monthlyProds->pluck('date')->map(fn($d) => $d->format('Y-m-d'))->unique()->count(),
                'taux_disponibilite'     => $tauxDispo,
                'nb_camions_actifs'      => $nbCamions ?: 23,
                // Aujourd'hui
                'volume_today'           => round($todayProds->sum('volume_m3'), 0),
                'voyages_today'          => $todayProds->sum('total_voyage'),
            ],
            'trend_15j'       => $trend,
            'top_destinations' => $topDestinations,
            'by_tranchee'     => $byTranchee,
        ]);
    }

    /**
     * Suggestions d'optimisation automatiques.
     * GET /api/optimisations
     */
    public function optimisations(Request $request): JsonResponse
    {
        $month  = $request->get('month', now()->format('Y-m'));
        $suggestions = [];

        $productions = Production::whereRaw("strftime('%Y-%m', date) = ?", [$month])->get();

        if ($productions->isEmpty()) {
            return response()->json(['suggestions' => [], 'message' => 'Aucune donnée pour ce mois']);
        }

        // 1. Analyser les routes peu efficaces (volume/voyage < seuil)
        $parRoute = $productions->groupBy(fn($p) => $p->tranchee . '|' . $p->destination);
        foreach ($parRoute as $key => $items) {
            if ($items->sum('total_voyage') < 5) continue; // ignore si peu de voyages
            [$tr, $dest] = explode('|', $key);
            $avgVolPerVoyage = $items->sum('total_voyage') > 0
                ? $items->sum('volume_m3') / $items->sum('total_voyage')
                : 0;
            if ($avgVolPerVoyage < 14 && $avgVolPerVoyage > 0) {
                $suggestions[] = [
                    'type'      => 'efficacite',
                    'priorite'  => 'haute',
                    'titre'     => "Faible rendement : {$tr} → {$dest}",
                    'detail'    => sprintf(
                        "Volume moyen par voyage : %.1f m³ (seuil recommandé ≥ 14 m³). Total : %d voyages, %.0f m³.",
                        $avgVolPerVoyage,
                        $items->sum('total_voyage'),
                        $items->sum('volume_m3')
                    ),
                    'action'    => "Vérifier le chargement des camions sur cette route ou réaffecter les engins.",
                ];
            }
        }

        // 2. Jours de faible production phosphate
        $byDate = $productions->where('type_materiau', 'PHOSPHATE')
            ->groupBy(fn($p) => $p->date->format('Y-m-d'));
        $joursBasProd = $byDate->filter(fn($items) => $items->sum('volume_m3') < 3000);
        if ($joursBasProd->count() > 2) {
            $suggestions[] = [
                'type'     => 'production',
                'priorite' => 'haute',
                'titre'    => "{$joursBasProd->count()} jours avec production phosphate < 3000 m³",
                'detail'   => 'Jours concernés : ' . $joursBasProd->keys()->implode(', '),
                'action'   => "Analyser les causes : arrêts engins, météo, manque de main-d'œuvre.",
            ];
        }

        // 3. Tranchée la plus performante - à privilégier
        $byTranchee = $productions->where('type_materiau', 'PHOSPHATE')
            ->whereNotNull('tranchee')
            ->groupBy('tranchee')
            ->map(fn($items, $tr) => [
                'tranchee'       => $tr,
                'volume'         => $items->sum('volume_m3'),
                'voyage_avg'     => $items->sum('total_voyage') > 0 ? $items->sum('volume_m3') / $items->sum('total_voyage') : 0,
            ])
            ->sortByDesc('volume');

        if ($byTranchee->isNotEmpty()) {
            $best = $byTranchee->first();
            $suggestions[] = [
                'type'     => 'optimisation',
                'priorite' => 'info',
                'titre'    => "Tranchée la plus productive : {$best['tranchee']}",
                'detail'   => sprintf(
                    "Volume total : %.0f m³ | Rendement moyen : %.1f m³/voyage.",
                    $best['volume'],
                    $best['voyage_avg']
                ),
                'action'   => "Prioriser l'affectation des engins sur cette tranchée.",
            ];
        }

        // 4. Ratio phosphate / stérile
        $volPhos = $productions->where('type_materiau', 'PHOSPHATE')->sum('volume_m3');
        $volSter = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'))->sum('volume_m3');
        if ($volPhos > 0 && $volSter > 0) {
            $ratio = $volSter / $volPhos;
            if ($ratio > 0.6) {
                $suggestions[] = [
                    'type'     => 'ratio',
                    'priorite' => 'moyenne',
                    'titre'    => sprintf("Ratio stérile/phosphate élevé : %.2f", $ratio),
                    'detail'   => sprintf(
                        "Volume phosphate : %.0f m³ | Volume stérile : %.0f m³. Le volume stérile dépasse 60%% du phosphate.",
                        $volPhos,
                        $volSter
                    ),
                    'action'   => "Revoir le plan d'abattage pour optimiser l'accès aux couches phosphatées.",
                ];
            }
        }

        // 5. Arrêts récurrents par type
        $arretsMois = Arret::whereRaw("strftime('%Y-%m', date) = ?", [$month])->get();
        if ($arretsMois->isNotEmpty()) {
            $arretParType = $arretsMois->groupBy('type_arret')
                ->map(fn($items, $type) => [
                    'type'          => $type,
                    'nb_incidents'  => $items->count(),
                    'total_heures'  => $items->sum('duree_heures'),
                ])
                ->sortByDesc('total_heures');

            $worstArret = $arretParType->first();
            if ($worstArret && $worstArret['total_heures'] > 10) {
                $labels = [
                    'panne_mecanique'        => 'Pannes mécaniques',
                    'maintenance_preventive' => 'Maintenance préventive',
                    'pluie'                  => 'Arrêts pluie',
                    'accident'               => 'Accidents',
                    'manque_carburant'       => 'Manque carburant',
                    'absence_chauffeur'      => 'Absence chauffeur',
                    'autre'                  => 'Autres arrêts',
                ];
                $label = $labels[$worstArret['type']] ?? $worstArret['type'];
                $suggestions[] = [
                    'type'     => 'disponibilite',
                    'priorite' => 'haute',
                    'titre'    => "Cause principale d'arrêt : {$label}",
                    'detail'   => sprintf(
                        "%d incidents — %.1f heures perdues ce mois.",
                        $worstArret['nb_incidents'],
                        $worstArret['total_heures']
                    ),
                    'action'   => "Mettre en place un plan d'action pour réduire ce type d'arrêt.",
                ];
            }
        } else {
            // Pas encore d'arrêts enregistrés
            $suggestions[] = [
                'type'     => 'disponibilite',
                'priorite' => 'info',
                'titre'    => 'Aucun arrêt enregistré ce mois',
                'detail'   => 'Commencez à enregistrer les arrêts pour obtenir le taux de disponibilité réel.',
                'action'   => 'Accédez au module Disponibilité pour saisir les arrêts.',
            ];
        }

        // Trier par priorité
        $ordre = ['haute' => 0, 'moyenne' => 1, 'info' => 2];
        usort($suggestions, fn($a, $b) => ($ordre[$a['priorite']] ?? 3) <=> ($ordre[$b['priorite']] ?? 3));

        return response()->json([
            'month'       => $month,
            'nb_suggestions' => count($suggestions),
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Rapport hebdomadaire.
     * GET /api/rapports/hebdo?from=&to=
     */
    public function rapportHebdo(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->startOfWeek()->toDateString());
        $to   = $request->get('to', now()->endOfWeek()->toDateString());

        $productions = Production::whereBetween('date', [$from, $to])
            ->orderBy('date')
            ->get();

        $phosphates = $productions->where('type_materiau', 'PHOSPHATE');
        $steriles   = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        // Par jour
        $byDate = $productions->groupBy(fn($p) => $p->date->format('Y-m-d'))
            ->map(function ($items, $date) {
                $phos = $items->where('type_materiau', 'PHOSPHATE');
                $ster = $items->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));
                return [
                    'date'             => $date,
                    'voyages_phosphate' => $phos->sum('total_voyage'),
                    'volume_phosphate'  => round($phos->sum('volume_m3'), 0),
                    'voyages_sterile'   => $ster->sum('total_voyage'),
                    'volume_sterile'    => round($ster->sum('volume_m3'), 0),
                    'total_voyages'     => $items->sum('total_voyage'),
                    'total_volume'      => round($items->sum('volume_m3'), 0),
                ];
            })->values();

        return response()->json([
            'periode'            => ['from' => $from, 'to' => $to],
            'voyages_phosphate'  => $phosphates->sum('total_voyage'),
            'volume_phosphate'   => round($phosphates->sum('volume_m3'), 0),
            'voyages_sterile'    => $steriles->sum('total_voyage'),
            'volume_sterile'     => round($steriles->sum('volume_m3'), 0),
            'total_voyages'      => $productions->sum('total_voyage'),
            'total_volume'       => round($productions->sum('volume_m3'), 0),
            'nb_jours'           => $byDate->count(),
            'by_date'            => $byDate,
        ]);
    }
}
