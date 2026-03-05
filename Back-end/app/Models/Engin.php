<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Engin extends Model
{
    protected $fillable = [
        'code',
        'type',
        'modele',
        'chauffeur_principal',
        'chauffeur_secondaire',
        'statut',
        'notes',
    ];

    public function arrets()
    {
        return $this->hasMany(Arret::class, 'engin_code', 'code');
    }

    /**
     * Calcule le taux de disponibilité sur une période donnée.
     * Formule : ((Heures théoriques - Heures d'arrêt) / Heures théoriques) * 100
     * Heures théoriques = jours_travail × 20h/jour
     */
    public function tauxDisponibilite(string $from, string $to): array
    {
        $debut = \Carbon\Carbon::parse($from);
        $fin   = \Carbon\Carbon::parse($to);

        // Compter jours ouvrables (on exclut dimanche uniquement)
        $joursTotal = 0;
        $current = $debut->copy();
        while ($current->lte($fin)) {
            if ($current->dayOfWeek !== \Carbon\Carbon::SUNDAY) {
                $joursTotal++;
            }
            $current->addDay();
        }

        $heuresTheoriques = $joursTotal * 20;

        $heuresArret = Arret::where('engin_code', $this->code)
            ->whereBetween('date', [$from, $to])
            ->sum('duree_heures');

        $heuresDisponibles = max(0, $heuresTheoriques - $heuresArret);
        $taux = $heuresTheoriques > 0
            ? round(($heuresDisponibles / $heuresTheoriques) * 100, 2)
            : 0;

        return [
            'engin_code'         => $this->code,
            'periode_debut'      => $from,
            'periode_fin'        => $to,
            'jours_travail'      => $joursTotal,
            'heures_theoriques'  => $heuresTheoriques,
            'heures_arret'       => (float) $heuresArret,
            'heures_disponibles' => $heuresDisponibles,
            'taux_disponibilite' => $taux,
        ];
    }
}
