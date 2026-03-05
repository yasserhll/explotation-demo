<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Affectation;

class AffectationSeeder extends Seeder
{
    public function run(): void
    {
        // Données issues du fichier Affectation_Bg.xlsx (02/03/2026)
        // Format: chauffeur_principal, camion_code, chauffeur_secondaire
        $camions = [
            ['GUARNAOUI TARIQ',       'D183', 'ELHADI EL MANSOURI',       'camion'],
            ['OUAQA MOHAMED',          'D184', 'ALAMI YASSINE',            'camion'],
            ['NOUINI HICHAM',          'D185', 'ALLAOUI AZIZ',             'camion'],
            ['KHALID SALMI',           'D186', 'EZ-ZANZOUN NOUREDDINE',    'camion'],
            ['AANTAR ABDERAZZAK',      'D187', 'RACHID HICHAM',            'camion'],
            ['CHAFIQ SAID',            'D188', 'DEBAR MOHAMED',            'camion'],
            ['MEZOUAR ABDELFATTAH',    'D202', 'LAACHIR LARBII',           'camion'],
            ['TOUHAMI RAHAL',          'D203', 'LARHRIB ABDELATIF',        'camion'],
            ['DANI OMAR',              'D204', 'RBIB RACHID',              'camion'],
            ['RAHILI MOHAMED',         'D205', 'LAYADI ABDELILAH',         'camion'],
            ['MBIRKAT JAOUAD',         'D206', 'OUKHDAD HMAD',             'camion'],
            ['BENTALEB OMAR',          'D207', 'AIT EL JADIDA HASSAN',     'camion'],
            ['MOUHSSINE RACHID',       'D208', 'EL MALEKY NOUREDDINE',     'camion'],
            ['KHALIL BELKHALIL',       'D209', 'LAMANE MY EL HOUSSINE',    'camion'],
            ['GHOUFIRI KHALID',        'D210', 'MAMLOUK NOURDDINE',        'camion'],
            ['EL BEKKKALI ACHRAF',     'D211', 'LAHMIDI SAID',             'camion'],
            ['GHALI ABDELILAH',        'D212', 'FELLAH AZOUZ',             'camion'],
            ['LAAJIJIL ABDELAHDI',     'D213', 'ERRAJI ZOUHAIR',           'camion'],
            ['MAZOUZ YOUSSEF',         'D214', 'ESSAHEB ABDELGHANI',       'camion'],
            ['BOUATHMANE REDOUANE',    'D216', 'MASROUR HASSAN',           'camion'],
            ['CHEHAB ABDELMAJID',      'D217', 'BADDI MHAMED',             'camion'],
            ['LAHMAD MOURAD',          'D218', 'EL AMRAOUI HICHAM',        'camion'],
            ['KABAB ABDELKARIM',       'D219', 'ELFEN ABDELHAK',           'camion'],
            ['RTAIL ABDELAZIZ',        'D253', 'SAID HAZIM',               'camion'],
            ['EL ABEDY YOUSSEF',       'D254', 'ISMAYL SALMI',             'camion'],
            ['OUARGO HASSAN',          'D255', 'SALAH SALMI',              'camion'],
            ['OURAHOU EL HOUCINE',     'T01',  null,                       'tombereau'],
            ['DIGOUG REDOUANE',        'T02',  null,                       'tombereau'],
            // Véhicule en arrêt
            ['LIMOUNI ABDELGHANI',     'D69',  'OU MAGHID MOHAMED',        'camion'],
        ];

        foreach ($camions as [$principal, $code, $secondaire, $type]) {
            $statut = ($code === 'D69') ? 'arret' : 'actif';
            Affectation::updateOrCreate(
                ['camion_code' => $code, 'date' => null],
                [
                    'chauffeur_principal'  => $principal,
                    'chauffeur_secondaire' => $secondaire,
                    'type_vehicule'        => $type,
                    'statut'               => $statut,
                ]
            );
        }

        $this->command->info('✅ ' . count($camions) . ' affectations créées.');
    }
}
