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
     * Retourne le dernier mois qui a des données de production.
     * Si le mois courant a des données → on l'utilise.
     * Sinon on remonte jusqu'à trouver un mois avec données (max 12 mois).
     */
    private function getActiveMonth(): string
    {
        // Mois courant d'abord
        $current = now()->format('Y-m');
        $count = Production::whereRaw("strftime('%Y-%m', date) = ?", [$current])->count();
        if ($count > 0) return $current;

        // Sinon chercher le dernier mois avec données
        $last = Production::selectRaw("strftime('%Y-%m', date) as month")
            ->groupBy('month')
            ->orderByDesc('month')
            ->first();

        return $last ? $last->month : $current;
    }

    /**
     * KPIs et données du tableau de bord principal.
     * GET /api/dashboard
     */
    public function index(Request $request): JsonResponse
    {
        $activeMonth = $this->getActiveMonth();
        $today = now()->toDateString();

        // Productions du mois actif
        $monthlyProds = Production::whereRaw("strftime('%Y-%m', date) = ?", [$activeMonth])->get();

        // Productions aujourd'hui (peut être vide si pas de données récentes)
        $todayProds = Production::whereDate('date', $today)->get();

        // Phosphate vs Stérile
        $phosphateMois = $monthlyProds->where('type_materiau', 'PHOSPHATE');
        $sterileMois   = $monthlyProds->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        // Trend 15 derniers jours du mois actif
        // On prend les 15 derniers jours disponibles dans ce mois
        $lastDateInMonth = Production::whereRaw("strftime('%Y-%m', date) = ?", [$activeMonth])
            ->max('date');

        $trend = collect();
        if ($lastDateInMonth) {
            $lastDate = Carbon::parse($lastDateInMonth);
            $startDate = $lastDate->copy()->subDays(14)->toDateString();

            $trend = Production::whereBetween('date', [$startDate, $lastDateInMonth])
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
                    ];
                })->values();
        }

        // Top destinations du mois actif
        $topDestinations = $monthlyProds->groupBy('destination')
            ->map(fn($items, $dest) => [
                'destination'   => $dest,
                'total_voyages' => $items->sum('total_voyage'),
                'total_volume'  => $items->sum('volume_m3'),
            ])
            ->sortByDesc('total_volume')
            ->take(8)
            ->values();

        // Performance par tranchée
        $byTranchee = $monthlyProds->whereNotNull('tranchee')
            ->groupBy('tranchee')
            ->map(fn($items, $tr) => [
                'tranchee'      => $tr,
                'total_voyages' => $items->sum('total_voyage'),
                'total_volume'  => $items->sum('volume_m3'),
                'type_materiau' => $items->first()->type_materiau,
            ])
            ->sortByDesc('total_volume')
            ->values();

        // Taux disponibilité global
        $engins = Engin::all();
        $joursTotal = max(1, Carbon::parse($activeMonth . '-01')->daysInMonth);
        $heuresTheoriques = $joursTotal * 20 * max(1, $engins->count());
        $monthStart = $activeMonth . '-01';
        $monthEnd   = Carbon::parse($activeMonth . '-01')->endOfMonth()->toDateString();
        $totalArrets = Arret::whereBetween('date', [$monthStart, $monthEnd])->sum('duree_heures');
        $tauxDispo = $heuresTheoriques > 0
            ? round((($heuresTheoriques - $totalArrets) / $heuresTheoriques) * 100, 1)
            : 100;

        // Camions actifs
        $nbCamions = Affectation::whereNull('date')->where('statut', 'actif')->count();

        return response()->json([
            'active_month' => $activeMonth, // utile pour debug
            'kpis' => [
                'volume_phosphate_mois'  => round($phosphateMois->sum('volume_m3'), 0),
                'voyages_phosphate_mois' => $phosphateMois->sum('total_voyage'),
                'volume_sterile_mois'    => round($sterileMois->sum('volume_m3'), 0),
                'voyages_sterile_mois'   => $sterileMois->sum('total_voyage'),
                'total_volume_mois'      => round($monthlyProds->sum('volume_m3'), 0),
                'total_voyages_mois'     => $monthlyProds->sum('total_voyage'),
                'jours_production'       => $monthlyProds->pluck('date')
                    ->map(fn($d) => $d->format('Y-m-d'))->unique()->count(),
                'taux_disponibilite'     => $tauxDispo,
                'nb_camions_actifs'      => $nbCamions ?: 26,
                'volume_today'           => round($todayProds->sum('volume_m3'), 0),
                'voyages_today'          => $todayProds->sum('total_voyage'),
            ],
            'trend_15j'        => $trend,
            'top_destinations' => $topDestinations,
            'by_tranchee'      => $byTranchee,
        ]);
    }

    /**
     * Suggestions d'optimisation automatiques.
     * GET /api/optimisations
     */
    public function optimisations(Request $request): JsonResponse
    {
        // Utilise le mois actif si aucun mois passé
        $month = $request->get('month', $this->getActiveMonth());
        $suggestions = [];

        $productions = Production::whereRaw("strftime('%Y-%m', date) = ?", [$month])->get();

        if ($productions->isEmpty()) {
            return response()->json([
                'suggestions' => [],
                'message'     => "Aucune donnée pour $month",
                'month'       => $month,
            ]);
        }

        // 1. Routes peu efficaces
        $parRoute = $productions->groupBy(fn($p) => $p->tranchee . '|' . $p->destination);
        foreach ($parRoute as $key => $items) {
            if ($items->sum('total_voyage') < 5) continue;
            [$tr, $dest] = explode('|', $key);
            $avgVol = $items->sum('total_voyage') > 0
                ? $items->sum('volume_m3') / $items->sum('total_voyage') : 0;
            if ($avgVol < 14 && $avgVol > 0) {
                $suggestions[] = [
                    'priorite' => 'haute',
                    'titre'    => "Faible rendement : {$tr} → {$dest}",
                    'detail'   => sprintf("Volume moyen : %.1f m³/voyage (seuil ≥ 14 m³). %d voyages au total.", $avgVol, $items->sum('total_voyage')),
                    'action'   => "Vérifier le chargement des camions ou réaffecter les engins.",
                ];
            }
        }

        // 2. Jours de faible production
        $byDate = $productions->where('type_materiau', 'PHOSPHATE')
            ->groupBy(fn($p) => $p->date->format('Y-m-d'));
        $joursBasProd = $byDate->filter(fn($items) => $items->sum('volume_m3') < 3000);
        if ($joursBasProd->count() > 2) {
            $suggestions[] = [
                'priorite' => 'haute',
                'titre'    => "{$joursBasProd->count()} jours avec phosphate < 3 000 m³",
                'detail'   => 'Jours : ' . $joursBasProd->keys()->implode(', '),
                'action'   => "Analyser les causes : arrêts engins, météo, main-d'œuvre.",
            ];
        }

        // 3. Meilleure tranchée
        $byTranchee = $productions->where('type_materiau', 'PHOSPHATE')
            ->whereNotNull('tranchee')
            ->groupBy('tranchee')
            ->map(fn($items) => [
                'tranchee'   => $items->first()->tranchee,
                'volume'     => $items->sum('volume_m3'),
                'voyage_avg' => $items->sum('total_voyage') > 0
                    ? round($items->sum('volume_m3') / $items->sum('total_voyage'), 1) : 0,
            ])
            ->sortByDesc('volume');

        if ($byTranchee->isNotEmpty()) {
            $best = $byTranchee->first();
            $suggestions[] = [
                'priorite' => 'info',
                'titre'    => "Tranchée la plus productive : {$best['tranchee']}",
                'detail'   => sprintf("Volume : %s m³ | Rendement : %.1f m³/voyage.", number_format($best['volume'], 0, ',', ' '), $best['voyage_avg']),
                'action'   => "Prioriser l'affectation des engins sur cette tranchée.",
            ];
        }

        // 4. Ratio phosphate/stérile
        $volPhos = $productions->where('type_materiau', 'PHOSPHATE')->sum('volume_m3');
        $volSter = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'))->sum('volume_m3');
        if ($volPhos > 0 && $volSter > 0) {
            $ratio = round($volSter / $volPhos, 2);
            if ($ratio > 0.6) {
                $suggestions[] = [
                    'priorite' => 'moyenne',
                    'titre'    => "Ratio stérile/phosphate élevé : {$ratio}",
                    'detail'   => sprintf("Phosphate : %s m³ | Stérile : %s m³.", number_format($volPhos, 0, ',', ' '), number_format($volSter, 0, ',', ' ')),
                    'action'   => "Revoir le plan d'abattage pour accéder aux couches phosphatées.",
                ];
            }
        }

        // 5. Arrêts récurrents
        $arretsMois = Arret::whereRaw("strftime('%Y-%m', date) = ?", [$month])->get();
        if ($arretsMois->isNotEmpty()) {
            $worst = $arretsMois->groupBy('type_arret')
                ->map(fn($items) => ['type' => $items->first()->type_arret, 'heures' => $items->sum('duree_heures'), 'nb' => $items->count()])
                ->sortByDesc('heures')->first();
            if ($worst && $worst['heures'] > 10) {
                $suggestions[] = [
                    'priorite' => 'haute',
                    'titre'    => "Cause principale d'arrêt : {$worst['type']}",
                    'detail'   => "{$worst['nb']} incidents — {$worst['heures']} heures perdues.",
                    'action'   => "Mettre en place un plan d'action correctif.",
                ];
            }
        } else {
            $suggestions[] = [
                'priorite' => 'info',
                'titre'    => 'Aucun arrêt enregistré',
                'detail'   => 'Enregistrez les arrêts pour calculer le taux de disponibilité réel.',
                'action'   => 'Accédez au module Disponibilité.',
            ];
        }

        $ordre = ['haute' => 0, 'moyenne' => 1, 'info' => 2];
        usort($suggestions, fn($a, $b) => ($ordre[$a['priorite']] ?? 3) <=> ($ordre[$b['priorite']] ?? 3));

        return response()->json([
            'month'           => $month,
            'nb_suggestions'  => count($suggestions),
            'suggestions'     => $suggestions,
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

        $productions = Production::whereBetween('date', [$from, $to])->orderBy('date')->get();
        $phos = $productions->where('type_materiau', 'PHOSPHATE');
        $ster = $productions->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'));

        $byDate = $productions->groupBy(fn($p) => $p->date->format('Y-m-d'))
            ->map(fn($items, $date) => [
                'date'             => $date,
                'volume_phosphate' => round($items->where('type_materiau', 'PHOSPHATE')->sum('volume_m3'), 0),
                'volume_sterile'   => round($items->filter(fn($p) => str_starts_with($p->type_materiau, 'STERILE'))->sum('volume_m3'), 0),
                'total_volume'     => round($items->sum('volume_m3'), 0),
                'total_voyages'    => $items->sum('total_voyage'),
            ])->values();

        return response()->json([
            'periode'          => ['from' => $from, 'to' => $to],
            'volume_phosphate' => round($phos->sum('volume_m3'), 0),
            'volume_sterile'   => round($ster->sum('volume_m3'), 0),
            'total_volume'     => round($productions->sum('volume_m3'), 0),
            'total_voyages'    => $productions->sum('total_voyage'),
            'nb_jours'         => $byDate->count(),
            'by_date'          => $byDate,
        ]);
    }
}
