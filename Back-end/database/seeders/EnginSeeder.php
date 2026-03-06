<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Engin;

class EnginSeeder extends Seeder
{
    public function run(): void
    {
        // Données réelles de Affectation_Bg.xlsx
        $engins = [
            ['code' => '350-E71',      'type' => 'PELLE',      'modele' => 'CAT 350',          'chauffeur_principal' => 'CHERKI YOUSSEF',          'chauffeur_secondaire' => 'DAHA ELBOUKHARI',     'statut' => 'actif'],
            ['code' => '480-E49',      'type' => 'PELLE',      'modele' => 'CAT 480',          'chauffeur_principal' => 'RADOUANI MUSTAPHA',       'chauffeur_secondaire' => 'OUSMYNE ABDELKBIR',   'statut' => 'actif'],
            ['code' => '350-E64',      'type' => 'PELLE',      'modele' => 'CAT 350',          'chauffeur_principal' => 'EL GHAZZAL ADIL',         'chauffeur_secondaire' => 'ALLALI IBRAHIM',      'statut' => 'actif'],
            ['code' => '336-E18',      'type' => 'PELLE',      'modele' => 'CAT 336',          'chauffeur_principal' => 'JABBAR SAID',             'chauffeur_secondaire' => 'EL HNIOUI MILOUD',    'statut' => 'actif'],
            ['code' => 'CH-966-E48',   'type' => 'PELLE',      'modele' => 'CAT 966H',         'chauffeur_principal' => 'RAFYK MUSTAPHA',          'chauffeur_secondaire' => 'BACHRA ABDELLAH',     'statut' => 'actif'],
            ['code' => 'CH-760-E22',   'type' => 'PELLE',      'modele' => 'CAT 760',          'chauffeur_principal' => 'EL MANSSOUM HASSANE',     'chauffeur_secondaire' => 'FARSSI ADIL',         'statut' => 'actif'],
            ['code' => 'NIV-E50',      'type' => 'NIVELEUSE',  'modele' => 'KOMATSU GD825',    'chauffeur_principal' => 'STITI MOHAMED',           'chauffeur_secondaire' => null,                  'statut' => 'actif'],
            ['code' => 'NIV-E12',      'type' => 'NIVELEUSE',  'modele' => 'KOMATSU GD825',    'chauffeur_principal' => 'TOUAHEMA ABDELJALIL',     'chauffeur_secondaire' => 'SAID EL-ALLAAOUI',    'statut' => 'actif'],
        ];

        foreach ($engins as $e) {
            Engin::create($e);
        }

        $this->command->info('  ✓ Engins: ' . count($engins) . ' engins créés (pelles + niveleuses)');
    }
}
