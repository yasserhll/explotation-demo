<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rotation;
use App\Models\Engin;
use App\Models\Arret;
use App\Models\Affectation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // ── Helpers calcul depuis rotations ──────────────────────────────────────

    /** Retourne le mois actif (le plus récent avec des rotations) */
    private function getActiveMonth(): string
    {
        $last = Rotation::selectRaw("strftime('%Y-%m', date) as month")
            ->groupBy('month')
            ->orderByDesc('month')
            ->first();
        return $last ? $last->month : now()->format('Y-m');
    }

    /** Calcule voyages + volumes phosphate/stérile depuis une collection de rotations */
    private function calcFromRotations($rotations): array
    {
        $vgsPhos = $rotations->sum(fn($r) =>
            ($r->phosphate_p1a_vgs ?? 0) + ($r->phosphate_p1b_vgs ?? 0) +
            ($r->phosphate_p2a_vgs ?? 0) + ($r->phosphate_p2b_vgs ?? 0)
        );
        $vgsSter = $rotations->sum(fn($r) =>
            ($r->sterile_p1a_vgs ?? 0) + ($r->sterile_p1b_vgs ?? 0) +
            ($r->sterile_p2a_vgs ?? 0) + ($r->sterile_p2b_vgs ?? 0)
        );
        return [
            'voyages_phosphate' => $vgsPhos,
            'voyages_sterile'   => $vgsSter,
            'total_voyages'     => $vgsPhos + $vgsSter,
            'volume_phosphate'  => $vgsPhos * 16,
            'volume_sterile'    => $vgsSter * 14,
            'total_volume'      => $vgsPhos * 16 + $vgsSter * 14,
        ];
    }

    // ── Dashboard principal ───────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $activeMonth = $this->getActiveMonth();
        $today       = now()->toDateString();

        // Rotations du mois actif
        $monthlyRots = Rotation::whereRaw("strftime('%Y-%m', date) = ?", [$activeMonth])->get();

        // Rotations aujourd'hui
        $todayRots = Rotation::whereDate('date', $today)->get();

        $monthly = $this->calcFromRotations($monthlyRots);
        $todayCa = $this->calcFromRotations($todayRots);

        // Jours de production (jours distincts avec au moins 1 rotation)
        $joursProd = $monthlyRots->pluck('date')
            ->map(fn($d) => substr($d, 0, 10))
            ->unique()->count();

        // Trend 15 derniers jours
        $lastDate = Rotation::whereRaw("strftime('%Y-%m', date) = ?", [$activeMonth])->max('date');
        $trend    = collect();
        if ($lastDate) {
            $start = Carbon::parse(substr($lastDate,0,10))->subDays(14)->toDateString();
            $trend = Rotation::whereBetween('date', [$start, substr($lastDate,0,10)])
                ->orderBy('date')->get()
                ->groupBy(fn($r) => substr($r->date, 0, 10))
                ->map(function ($rows, $date) {
                    $c = $this->calcFromRotations($rows);
                    return ['date' => $date] + $c;
                })->values();
        }

        // Top panneaux (destinations les plus utilisées)
        $panneaux = collect();
        foreach ($monthlyRots as $r) {
            foreach ([
                'sterile_p1a_panneau','sterile_p1b_panneau',
                'phosphate_p1a_panneau','phosphate_p1b_panneau',
                'sterile_p2a_panneau','sterile_p2b_panneau',
                'phosphate_p2a_panneau','phosphate_p2b_panneau',
            ] as $f) {
                if ($r->$f) $panneaux->push($r->$f);
            }
        }
        $topDestinations = $panneaux->countBy()->sortDesc()->take(8)
            ->map(fn($n, $d) => ['destination' => $d, 'total_voyages' => $n, 'total_volume' => $n * 15])
            ->values();

        // Taux disponibilité
        $engins = Engin::all();
        $joursTotal = max(1, Carbon::parse($activeMonth.'-01')->daysInMonth);
        $heuresTheo = $joursTotal * 20 * max(1, $engins->count());
        $mStart = $activeMonth.'-01';
        $mEnd   = Carbon::parse($activeMonth.'-01')->endOfMonth()->toDateString();
        $totalArrets = Arret::whereBetween('date', [$mStart, $mEnd])->sum('duree_heures');
        $tauxDispo = $heuresTheo > 0
            ? round((($heuresTheo - $totalArrets) / $heuresTheo) * 100, 1) : 100;

        $nbCamions = Affectation::whereNull('date')->where('statut', 'actif')->count();

        return response()->json([
            'active_month' => $activeMonth,
            'kpis' => [
                'volume_phosphate_mois'  => $monthly['volume_phosphate'],
                'voyages_phosphate_mois' => $monthly['voyages_phosphate'],
                'volume_sterile_mois'    => $monthly['volume_sterile'],
                'voyages_sterile_mois'   => $monthly['voyages_sterile'],
                'total_volume_mois'      => $monthly['total_volume'],
                'total_voyages_mois'     => $monthly['total_voyages'],
                'jours_production'       => $joursProd,
                'taux_disponibilite'     => $tauxDispo,
                'nb_camions_actifs'      => $nbCamions ?: 29,
                'volume_today'           => $todayCa['total_volume'],
                'voyages_today'          => $todayCa['total_voyages'],
            ],
            'trend_15j'        => $trend,
            'top_destinations' => $topDestinations,
            'by_tranchee'      => collect(), // plus de tranchées, remplacé par panneaux
        ]);
    }

    // ── Optimisations ─────────────────────────────────────────────────────────

    public function optimisations(Request $request): JsonResponse
    {
        $month = $request->get('month', $this->getActiveMonth());
        $rotations = Rotation::whereRaw("strftime('%Y-%m', date) = ?", [$month])->get();

        if ($rotations->isEmpty()) {
            return response()->json([
                'suggestions' => [['priorite'=>'info','titre'=>'Aucune rotation enregistrée','detail'=>"Aucune donnée pour $month",'action'=>'Saisissez les rotations journalières.']],
                'month' => $month,
            ]);
        }

        $suggestions = [];
        $c = $this->calcFromRotations($rotations);

        // 1. Ratio phosphate/stérile
        if ($c['volume_phosphate'] > 0 && $c['volume_sterile'] > 0) {
            $ratio = round($c['volume_sterile'] / $c['volume_phosphate'], 2);
            if ($ratio > 0.6) {
                $suggestions[] = ['priorite'=>'moyenne','titre'=>"Ratio stérile/phosphate élevé : {$ratio}",
                    'detail'=>"Phosphate : ".number_format($c['volume_phosphate'],0,' ')." m³ | Stérile : ".number_format($c['volume_sterile'],0,' ')." m³",
                    'action'=>"Revoir le plan d'abattage pour accéder aux couches phosphatées."];
            }
        }

        // 2. Jours sans rotation
        $joursDispo = Carbon::parse($month.'-01')->daysInMonth;
        $joursAvecRot = $rotations->pluck('date')->map(fn($d)=>substr($d,0,10))->unique()->count();
        $joursSans = $joursDispo - $joursAvecRot;
        if ($joursSans > 3) {
            $suggestions[] = ['priorite'=>'haute','titre'=>"$joursSans jours sans rotation ce mois",
                'detail'=>"$joursAvecRot jours saisis sur $joursDispo jours.",
                'action'=>'Compléter la saisie des rotations manquantes.'];
        }

        // 3. Camions sans voyages
        $sansVoyages = $rotations->filter(fn($r) =>
            ($r->sterile_p1a_vgs??0)+($r->sterile_p1b_vgs??0)+
            ($r->phosphate_p1a_vgs??0)+($r->phosphate_p1b_vgs??0)+
            ($r->sterile_p2a_vgs??0)+($r->sterile_p2b_vgs??0)+
            ($r->phosphate_p2a_vgs??0)+($r->phosphate_p2b_vgs??0) === 0
        )->pluck('camion_id')->unique()->count();
        if ($sansVoyages > 0) {
            $suggestions[] = ['priorite'=>'moyenne','titre'=>"$sansVoyages camion(s) sans voyages enregistrés",
                'detail'=>"Des rotations existent mais sans données de voyages.",
                'action'=>'Compléter les données de voyages pour ces camions.'];
        }

        // 4. Arrêts
        $mStart = $month.'-01';
        $mEnd   = Carbon::parse($month.'-01')->endOfMonth()->toDateString();
        $arrets = Arret::whereBetween('date', [$mStart, $mEnd])->get();
        if ($arrets->isNotEmpty()) {
            $worst = $arrets->groupBy('type_arret')
                ->map(fn($items) => ['type'=>$items->first()->type_arret,'heures'=>$items->sum('duree_heures'),'nb'=>$items->count()])
                ->sortByDesc('heures')->first();
            if ($worst && $worst['heures'] > 5) {
                $suggestions[] = ['priorite'=>'haute','titre'=>"Cause principale d'arrêt : {$worst['type']}",
                    'detail'=>"{$worst['nb']} incidents — {$worst['heures']} heures perdues.",
                    'action'=>"Mettre en place un plan d'action correctif."];
            }
        } else {
            $suggestions[] = ['priorite'=>'info','titre'=>'Aucun arrêt enregistré',
                'detail'=>'Enregistrez les arrêts pour calculer le taux de disponibilité réel.',
                'action'=>'Accédez au module Disponibilité.'];
        }

        // 5. Info production globale
        $suggestions[] = ['priorite'=>'info',
            'titre'=>"Production du mois : ".number_format($c['total_volume'],0,' ')." m³",
            'detail'=>"Phosphate : ".number_format($c['volume_phosphate'],0,' ')." m³ ({$c['voyages_phosphate']} vgs) | Stérile : ".number_format($c['volume_sterile'],0,' ')." m³ ({$c['voyages_sterile']} vgs)",
            'action'=>'Données calculées depuis les rotations journalières.'];

        usort($suggestions, fn($a,$b) => (['haute'=>0,'moyenne'=>1,'info'=>2][$a['priorite']]??3) <=> (['haute'=>0,'moyenne'=>1,'info'=>2][$b['priorite']]??3));

        return response()->json(['month'=>$month,'nb_suggestions'=>count($suggestions),'suggestions'=>$suggestions]);
    }

    // ── Rapport hebdomadaire ──────────────────────────────────────────────────

    public function rapportHebdo(Request $request): JsonResponse
    {
        $from = $request->get('from', now()->startOfWeek()->toDateString());
        $to   = $request->get('to',   now()->endOfWeek()->toDateString());

        $rotations = Rotation::whereBetween('date', [$from, $to])->orderBy('date')->get();

        $byDate = $rotations->groupBy(fn($r) => substr($r->date,0,10))
            ->map(function($rows, $date) {
                $c = $this->calcFromRotations($rows);
                return ['date'=>$date, 'nb_camions'=>$rows->count()] + $c;
            })->values();

        $global = $this->calcFromRotations($rotations);

        return response()->json([
            'periode'          => ['from'=>$from,'to'=>$to],
            'volume_phosphate' => $global['volume_phosphate'],
            'volume_sterile'   => $global['volume_sterile'],
            'total_volume'     => $global['total_volume'],
            'total_voyages'    => $global['total_voyages'],
            'nb_jours'         => $byDate->count(),
            'by_date'          => $byDate,
        ]);
    }
}
