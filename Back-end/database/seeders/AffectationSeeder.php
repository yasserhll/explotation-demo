<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Affectation;

class AffectationSeeder extends Seeder
{
    public function run(): void
    {
        // Données réelles de Affectation_Bg.xlsx - Liste du 02/03/2026
        $affectations = [
            // Camions D (Tombereau)
            ['chauffeur_principal' => 'GUARNAOUI TARIQ',      'camion_code' => 'D183', 'chauffeur_secondaire' => 'ELHADI EL MANSOURI',       'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'OUAQA MOHAMED',         'camion_code' => 'D184', 'chauffeur_secondaire' => 'ALAMI YASSINE',             'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'NOUINI HICHAM',         'camion_code' => 'D185', 'chauffeur_secondaire' => 'ALLAOUI AZIZ',              'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'KHALID SALMI',          'camion_code' => 'D186', 'chauffeur_secondaire' => 'EZ-ZANZOUN NOUREDDINE',     'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'AANTAR ABDERAZZAK',     'camion_code' => 'D187', 'chauffeur_secondaire' => 'RACHID HICHAM',             'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'CHAFIQ SAID',           'camion_code' => 'D188', 'chauffeur_secondaire' => 'DEBAR MOHAMED',             'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'MEZOUAR ABDELFATTAH',   'camion_code' => 'D202', 'chauffeur_secondaire' => 'LAACHIR LARBII',            'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'TOUHAMI RAHAL',         'camion_code' => 'D203', 'chauffeur_secondaire' => 'LARHRIB ABDELATIF',         'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'DANI OMAR',             'camion_code' => 'D204', 'chauffeur_secondaire' => 'RBIB RACHID',               'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'RAHILI MOHAMED',        'camion_code' => 'D205', 'chauffeur_secondaire' => 'LAYADI ABDELILAH',          'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'MBIRKAT JAOUAD',        'camion_code' => 'D206', 'chauffeur_secondaire' => 'OUKHDAD HMAD',              'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'BENTALEB OMAR',         'camion_code' => 'D207', 'chauffeur_secondaire' => 'AIT EL JADIDA HASSAN',      'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'MOUHSSINE RACHID',      'camion_code' => 'D208', 'chauffeur_secondaire' => 'EL MALEKY NOUREDDINE',      'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'KHALIL BELKHALIL',      'camion_code' => 'D209', 'chauffeur_secondaire' => 'LAMANE MY EL HOUSSINE',     'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'GHOUFIRI KHALID',       'camion_code' => 'D210', 'chauffeur_secondaire' => 'MAMLOUK NOURDDINE',         'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'EL BEKKALI ACHRAF',     'camion_code' => 'D211', 'chauffeur_secondaire' => 'LAHMIDI SAID',              'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'GHALI ABDELILAH',       'camion_code' => 'D212', 'chauffeur_secondaire' => 'FELLAH AZOUZ',              'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'LAAJIJIL ABDELAHDI',    'camion_code' => 'D213', 'chauffeur_secondaire' => 'ERRAJI ZOUHAIR',            'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'MAZOUZ YOUSSEF',        'camion_code' => 'D214', 'chauffeur_secondaire' => 'ESSAHEB ABDELGHANI',        'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'BOUATHMANE REDOUANE',   'camion_code' => 'D216', 'chauffeur_secondaire' => 'MASROUR HASSAN',            'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'CHEHAB ABDELMAJID',     'camion_code' => 'D217', 'chauffeur_secondaire' => 'BADDI MHAMED',              'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'LAHMAD MOURAD',         'camion_code' => 'D218', 'chauffeur_secondaire' => 'EL AMRAOUI HICHAM',         'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'KABAB ABDELKARIM',      'camion_code' => 'D219', 'chauffeur_secondaire' => 'ELFEN ABDELHAK',            'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'RTAIL ABDELAZIZ',       'camion_code' => 'D253', 'chauffeur_secondaire' => 'SAID HAZIM',                'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'EL ABEDY YOUSSEF',      'camion_code' => 'D254', 'chauffeur_secondaire' => 'ISMAYL SALMI',              'type_vehicule' => 'camion', 'statut' => 'actif'],
            ['chauffeur_principal' => 'OUARGO HASSAN',         'camion_code' => 'D255', 'chauffeur_secondaire' => 'SALAH SALMI',               'type_vehicule' => 'camion', 'statut' => 'actif'],
            // Tombereaux T
            ['chauffeur_principal' => 'OURAHOU EL HOUCINE',   'camion_code' => 'T01',  'chauffeur_secondaire' => null,                         'type_vehicule' => 'tombereau', 'statut' => 'actif'],
            ['chauffeur_principal' => 'DIGOUG REDOUANE',       'camion_code' => 'T02',  'chauffeur_secondaire' => null,                         'type_vehicule' => 'tombereau', 'statut' => 'actif'],
            // Camion en arrêt
            ['chauffeur_principal' => 'LIMOUNI ABDELGHANI',   'camion_code' => 'D69',  'chauffeur_secondaire' => 'OU MAGHID MOHAMED',          'type_vehicule' => 'camion', 'statut' => 'arret'],
        ];

        foreach ($affectations as $a) {
            Affectation::create(array_merge($a, ['date' => null])); // null = affectation permanente
        }

        $this->command->info('  ✓ Affectations: ' . count($affectations) . ' véhicules (26 camions D + 2 tombereaux + 1 en arrêt)');
    }
}
