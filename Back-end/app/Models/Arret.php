<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Arret extends Model
{
    protected $fillable = [
        'date',
        'engin_code',
        'type_arret',
        'duree_heures',
        'description',
        'arret_total',
    ];

    protected $casts = [
        'date'        => 'date',
        'duree_heures' => 'float',
        'arret_total' => 'boolean',
    ];

    public function engin()
    {
        return $this->belongsTo(Engin::class, 'engin_code', 'code');
    }
}
