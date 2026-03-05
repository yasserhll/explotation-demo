<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    protected $fillable = [
        'date',
        'chauffeur_principal',
        'camion_code',
        'chauffeur_secondaire',
        'type_vehicule',
        'statut',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
