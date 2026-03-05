<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RapportHebdo extends Model
{
    protected $table = 'rapports_hebdo';

    protected $fillable = [
        'semaine_debut',
        'semaine_fin',
        'total_voyages_extrait',
        'total_voyages_sterile',
        'total_voyages_sterile2',
        'total_volume_extrait',
        'total_volume_sterile',
        'total_volume_sterile2',
        'total_voyages',
        'total_volume',
        'nb_camions_actifs',
        'arret_pluie',
        'dimanche_travaille',
        'notes',
    ];

    protected $casts = [
        'semaine_debut'  => 'date',
        'semaine_fin'    => 'date',
        'arret_pluie'    => 'boolean',
        'dimanche_travaille' => 'boolean',
        'total_volume_extrait'  => 'float',
        'total_volume_sterile'  => 'float',
        'total_volume_sterile2' => 'float',
        'total_volume'          => 'float',
    ];
}
