<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Production extends Model
{
    protected $fillable = [
        'date',
        'type_materiau',
        'niveau',
        'tranchee',
        'panneau',
        'destination',
        'distance_km',
        'nbr_voyage_1er',
        'nbr_voyage_2e',
        'total_voyage',
        'volume_m3',
        'camion_1er',
        'camion_2e',
        'pelle_1er',
        'pelle_2e',
        'remarques',
    ];

    protected $casts = [
        'date' => 'date',
        'distance_km' => 'float',
        'volume_m3' => 'float',
        'nbr_voyage_1er' => 'integer',
        'nbr_voyage_2e' => 'integer',
        'total_voyage' => 'integer',
    ];

    // Calcul automatique du total_voyage et volume si non fournis
    protected static function booted(): void
    {
        static::saving(function (Production $production) {
            // Auto-calc total voyage
            if ($production->nbr_voyage_1er !== null && $production->nbr_voyage_2e !== null) {
                $production->total_voyage = $production->nbr_voyage_1er + $production->nbr_voyage_2e;
            }
            // Auto-calc volume si non fourni (16 m³/voyage en moyenne)
            if ((!$production->volume_m3 || $production->volume_m3 == 0) && $production->total_voyage > 0) {
                $production->volume_m3 = $production->total_voyage * 16;
            }
        });
    }

    // Scopes
    public function scopePhosphate($query)
    {
        return $query->where('type_materiau', 'PHOSPHATE');
    }

    public function scopeSterile($query)
    {
        return $query->where('type_materiau', 'like', 'STERILE%');
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeByMonth($query, $month)
    {
        return $query->whereRaw("strftime('%Y-%m', date) = ?", [$month]);
    }

    public function scopeByPeriod($query, $from, $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}
