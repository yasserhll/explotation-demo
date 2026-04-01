<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rotation extends Model
{
    protected $fillable = [
        'date', 'camion_id',
        'chauffeur_1er', 'chauffeur_2e',
        // Stérile P1
        'sterile_p1a_panneau', 'sterile_p1a_km', 'sterile_p1a_vgs',
        'sterile_p1b_panneau', 'sterile_p1b_km', 'sterile_p1b_vgs',
        // Phosphate P1
        'phosphate_p1a_panneau', 'phosphate_p1a_km', 'phosphate_p1a_vgs',
        'phosphate_p1b_panneau', 'phosphate_p1b_km', 'phosphate_p1b_vgs',
        // Stérile P2
        'sterile_p2a_panneau', 'sterile_p2a_km', 'sterile_p2a_vgs',
        'sterile_p2b_panneau', 'sterile_p2b_km', 'sterile_p2b_vgs',
        // Phosphate P2
        'phosphate_p2a_panneau', 'phosphate_p2a_km', 'phosphate_p2a_vgs',
        'phosphate_p2b_panneau', 'phosphate_p2b_km', 'phosphate_p2b_vgs',
        'commentaires',
        'pelle_codes',
        'lignes_json',
    ];

    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    protected static function booted(): void
    {
        static::saving(function (Rotation $r) {
            $intFields = [
                'sterile_p1a_vgs','sterile_p1b_vgs',
                'phosphate_p1a_vgs','phosphate_p1b_vgs',
                'sterile_p2a_vgs','sterile_p2b_vgs',
                'phosphate_p2a_vgs','phosphate_p2b_vgs',
            ];
            $decFields = [
                'sterile_p1a_km','sterile_p1b_km',
                'phosphate_p1a_km','phosphate_p1b_km',
                'sterile_p2a_km','sterile_p2b_km',
                'phosphate_p2a_km','phosphate_p2b_km',
            ];
            foreach ($intFields as $f) {
                $r->$f = ($r->$f !== null && $r->$f !== '') ? (int)$r->$f : null;
            }
            foreach ($decFields as $f) {
                $r->$f = ($r->$f !== null && $r->$f !== '') ? (float)$r->$f : null;
            }
        });
    }
}
