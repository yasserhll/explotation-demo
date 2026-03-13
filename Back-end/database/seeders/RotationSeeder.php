<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rotation;

class RotationSeeder extends Seeder
{
    public function run(): void
    {
        // ════════════════════════════════════════════════════════════════════
        // Données RÉELLES — Source: RAPPORT_DE_PRODUCTION_JOURNALIERE_MARS_2026
        // Format: [date, camion_id, chauffeur_1er, chauffeur_2e,
        //          sterile_p1_panneau, sterile_p1_km, sterile_p1_vgs,
        //          phosphate_p1_panneau, phosphate_p1_km, phosphate_p1_vgs,
        //          sterile_p2_panneau, sterile_p2_km, sterile_p2_vgs,
        //          phosphate_p2_panneau, phosphate_p2_km, phosphate_p2_vgs,
        //          commentaires]
        // ════════════════════════════════════════════════════════════════════

        $rotations = [

            // ════════════════════════════════════════════════════════════════
            // 25/02/2026 — Journée sans voyages enregistrés (données absentes)
            // ════════════════════════════════════════════════════════════════
            ['2026-02-25','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D204','DANI OMAR',            'RBIB RACHID',            null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D215',null,                   'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D253',null,                   'RTAIL ABDELAZIZ',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D254',null,                   'RAHILI',                 null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','TO1', null,                   'KHALID ABDELBAR',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','T02', null,                   'DIGOUG REDOUANE',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-25','D255',null,                   'EL ABEDY YOUSSEF',       null,null,0, null,null,0, null,null,0, null,null,0, null],

            // ════════════════════════════════════════════════════════════════
            // 26/02/2026 — Journée sans voyages enregistrés (données absentes)
            // ════════════════════════════════════════════════════════════════
            ['2026-02-26','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D204','DANI OMAR',            'RBIB RACHID',            null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D215',null,                   'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D253',null,                   'RTAIL ABDELAZIZ',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D254',null,                   'RAHILI',                 null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','TO1', null,                   'KHALID ABDELBAR',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','T02', null,                   'DIGOUG REDOUANE',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-26','D255',null,                   'EL ABEDY YOUSSEF',       null,null,0, null,null,0, null,null,0, null,null,0, null],

            // ════════════════════════════════════════════════════════════════
            // 27/02/2026 — STERILE uniquement (col: ster_p1, ster_p2)
            // ════════════════════════════════════════════════════════════════
            ['2026-02-27','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, null],
            ['2026-02-27','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, null],
            ['2026-02-27','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           'TG3 2EME SORTIE P7 / DECHARGE',1.6, 5, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,10, null,null,0, 'Déplacé vers dépôt pour se déplacer à la visite technique'],
            ['2026-02-27','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  'TF8 INT 3/4 P5 / DECHARGE',3.0,11, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,13, null,null,0, null],
            ['2026-02-27','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,13, null,null,0, null],
            ['2026-02-27','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,12, null,null,0, null],
            ['2026-02-27','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-27','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          'TG3 2EME SORTIE P7 / DECHARGE',1.6,10, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,18, null,null,0, 'Déplacé vers dépôt pour se déplacer à la visite technique'],
            ['2026-02-27','D204','DANI OMAR',            'RBIB RACHID',            'TF8 INT 3/4 P5 / DECHARGE',3.0, 2, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,12, null,null,0, "S'est déplacé vers dépôt en raison du faible puissance"],
            ['2026-02-27','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       'TF8 INT 3/4 P5 / DECHARGE',3.0,12, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, 'Remplacé D204'],
            ['2026-02-27','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           'TF8 INT 3/4 P5 / DECHARGE',3.0,12, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, null],
            ['2026-02-27','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   'TG3 2EME SORTIE P7 / DECHARGE',1.6,20, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,12, null,null,0, null],
            ['2026-02-27','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,11, null,null,0, null],
            ['2026-02-27','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  'TF8 INT 3/4 P5 / DECHARGE',3.0,13, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,10, null,null,0, null],
            ['2026-02-27','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      'TF8 INT 3/4 P5 / DECHARGE',3.0,13, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,12, null,null,0, null],
            ['2026-02-27','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           'TF8 INT 3/4 P5 / DECHARGE',3.0,11, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,10, null,null,0, null],
            ['2026-02-27','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,18, null,null,0, null],
            ['2026-02-27','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         'TF8 INT 3/4 P5 / DECHARGE',3.0,13, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, null],
            ['2026-02-27','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, null],
            ['2026-02-27','D215',null,                   'LAACHIR LARBII',         'TG3 2EME SORTIE P7 / DECHARGE',1.6,20, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,10, null,null,0, null],
            ['2026-02-27','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         'TG3 2EME SORTIE P7 / DECHARGE',1.6,19, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,13, null,null,0, null],
            ['2026-02-27','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           'TG3 2EME SORTIE P7 / DECHARGE',1.6,14, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,18, null,null,0, "En arrêt crevé / en service à 9h12"],
            ['2026-02-27','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      'TF8 INT 3/4 P5 / DECHARGE',3.0,13, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,17, null,null,0, null],
            ['2026-02-27','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     'TF8 INT 3/4 P5 / DECHARGE',3.0,11, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,16, null,null,0, 'Déplacé pour transporter les gardiens'],
            ['2026-02-27','D253',null,                   'RTAIL ABDELAZIZ',        'TF8 INT 3/4 P5 / DECHARGE',3.0,14, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,18, null,null,0, null],
            ['2026-02-27','D254',null,                   'RAHILI',                 'TF8 INT 3/4 P5 / DECHARGE',3.0,13, null,null,0, 'TG3 P7 2EME SORTIE / DECHARGE',2.0,18, null,null,0, null],
            ['2026-02-27','TO1', null,                   'KHALID ABDELBAR',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-27','T02', null,                   'DIGOUG REDOUANE',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-02-27','D255',null,                   'EL ABEDY YOUSSEF',       'TF8 INT 3/4 P5 / DECHARGE',3.0,11, null,null,0, 'TF8 P5 3/4 / DECHARGE',3.0,10, null,null,0, null],

            // ════════════════════════════════════════════════════════════════
            // 02/03/2026 — Mélange STERILE P1 + PHOSPHATE P1 + STERILE P2
            // Note: colonnes Poste 2 lues depuis cols 10-15 du fichier Excel
            // ════════════════════════════════════════════════════════════════
            ['2026-03-02','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 8, null,null,0, null,null,0, null],
            ['2026-03-02','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  null,null,0, 'TF8 P5 C4 / CRIBLAGE MOBILE',5.2, 9, null,null,0, null,null,0, null],
            ['2026-03-02','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 8, null,null,0, null,null,0, null],
            ['2026-03-02','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 9, null,null,0, null,null,0, null],
            ['2026-03-02','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-02','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D204','DANI OMAR',            'RBIB RACHID',            null,null,0, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-02','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       null,null,0, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-02','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 6, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-02','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   'TG3 2EME SORTIE P7 / DECHARGE',2.0,16, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 8, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-02','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 1, null,null,0, null],
            ['2026-03-02','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      null,null,0, 'TF8 P5 C4 / CRIBLAGE MOBILE',5.2, 8, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-02','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           null,null,0, 'TF8 P5 C4 / CRIBLAGE MOBILE',5.2, 8, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-02','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           'TG3 2EME SORTIE P7 / DECHARGE',2.0,16, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D215',null,                   'LAACHIR LARBII',         null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 8, null,null,0, null,null,0, null],
            ['2026-03-02','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',5.2, 8, null,null,0, null,null,0, null],
            ['2026-03-02','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     'TG3 2EME SORTIE P7 / DECHARGE',2.0,13, null,null,0, 'TG3 1ER SORTIE P7 / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D253',null,                   'RTAIL ABDELAZIZ',        'TG3 2EME SORTIE P7 / DECHARGE',2.0,15, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','D254',null,                   'RAHILI',                 'TG3 2EME SORTIE P7 / DECHARGE',2.0,16, null,null,0, 'TG3 P7 1ER SORTIE / DECHARGE',1.5, 2, null,null,0, null],
            ['2026-03-02','TO1', null,                   'KHALID ABDELBAR',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-02','T02', null,                   'DIGOUG REDOUANE',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-02','D255',null,                   'EL ABEDY YOUSSEF',       null,null,0, 'TF8 P5 C4 / CRIBLAGE MOBILE',5.2, 8, null,null,0, null,null,0, null],

            // ════════════════════════════════════════════════════════════════
            // 03/03/2026 — PHOSPHATE P2 uniquement (1er poste arrêté risque glissement)
            // ════════════════════════════════════════════════════════════════
            ['2026-03-03','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 3, null],
            ['2026-03-03','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D204','DANI OMAR',            'RBIB RACHID',            null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D215',null,                   'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 3, null],
            ['2026-03-03','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 3, null],
            ['2026-03-03','D253',null,                   'RTAIL ABDELAZIZ',        null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','D254',null,                   'RAHILI',                 null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],
            ['2026-03-03','TO1', null,                   'KHALID ABDELBAR',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','T02', null,                   'DIGOUG REDOUANE',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-03','D255',null,                   'EL ABEDY YOUSSEF',       null,null,0, null,null,0, null,null,0, 'TF8 C4 P5 / CRIBLAGE MOBILE',6.2, 4, null],

            // ════════════════════════════════════════════════════════════════
            // 04/03/2026 — Poste 2 arrêté (risque glissement) — 0 voyages
            // ════════════════════════════════════════════════════════════════
            ['2026-03-04','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D204','DANI OMAR',            'RBIB RACHID',            null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D215',null,                   'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D253',null,                   'RTAIL ABDELAZIZ',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D254',null,                   'RAHILI',                 null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','TO1', null,                   'KHALID ABDELBAR',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','T02', null,                   'DIGOUG REDOUANE',        null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-04','D255',null,                   'EL ABEDY YOUSSEF',       null,null,0, null,null,0, null,null,0, null,null,0, null],

            // ════════════════════════════════════════════════════════════════
            // 05/03/2026 — Mélange STERILE P1 + PHOSPHATE P1 + STERILE P2
            // ════════════════════════════════════════════════════════════════
            ['2026-03-05','D183','GUARNAOUI TARIQ',     'CHAROUITE YASSINE',      null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 5, null,null,0, null,null,0, null],
            ['2026-03-05','D184','OUAQA MOHAMED',        'ABDELLAOUI ABDELHAQ',    'TG3 P7 / DECHARGE',1.5, 9, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-05','D185','NOUINI HICHAM',        'ALLAOUI AZIZ',           null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-05','D186','KHALID SALMI',         'EZ-ZANZOUN NOUREDDINE',  null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, null,null,0, null,null,0, null],
            ['2026-03-05','D187','HICHAM RACHID',        'LAHMAD ABDELILAH',       null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 5, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D188','CHAFIQ SAID',          'DEBAR MOHAMED',          null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, null,null,0, null,null,0, null],
            ['2026-03-05','D202','MEZOUAR ABDELFATTAH',  'LAACHIR LARBII',         null,null,0, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-05','D203','LARHRIB ABDELATIF',    'TOUHAMI RAHAL',          null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, null,null,0, null,null,0, null],
            ['2026-03-05','D204','DANI OMAR',            'RBIB RACHID',            null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, null,null,0, null,null,0, null],
            ['2026-03-05','D205','RAHILI MOHAMED',       'LAYADI ABDELILAH',       'TG3 P7 / DECHARGE',1.5, 8, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D206','MBIRKAT JAOUAD',       'OUKHDAD HMAD',           'TG3 P7 / DECHARGE',1.5, 9, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D207','BENTALEB OMAR',        'AIT EL JADIDA HASSAN',   'TG3 P7 / DECHARGE',1.5, 9, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D208','BENTALEB OMAR',        'EL MALEKY NOUREDDINE',   null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 5, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D209','KHALIL BELKHALIL',     'LAMANE MY EL HOUSSINE',  'TG3 P7 / DECHARGE',1.5, 9, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D210','GHOUFIRI KHALID',      'MAMLOUK NOURDDINE',      'TG3 P7 / DECHARGE',1.5, 9, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D211','EL BEKKKALI ACHRAF',   'LAHMIDI SAID',           null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D212','GHALI ABDELILAH',      'FELLAH AZOUZ',           'TG3 P7 / DECHARGE',1.5, 7, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D213','LAAJIJIL ABDELAHDI',   'ERRAJI ZOUHAIR',         'TG3 P7 / DECHARGE',1.5,10, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D214','MAZOUZ YOUSSEF',       'ESSAHEB ABDELGHANI',     'TG3 P7 / DECHARGE',1.5, 9, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-05','D215',null,                   'LAACHIR LARBII',         null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 5, null,null,0, null,null,0, null],
            ['2026-03-05','D216','BOUATHMANE REDOUANE',  'MASROUR HASSAN',         null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D217','CHEHAB ABDELMAJID',    'BADDI MHAMED',           'TG3 P7 / DECHARGE',1.5, 9, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D218','LAHMAD MOURAD',        'EL AMRAOUI HICHAM',      'TG3 P7 / DECHARGE',1.5,10, null,null,0, null,null,0, null,null,0, null],
            ['2026-03-05','D219','KABAB ABDELKARIM',     'KHALOUQ ABDELOUAFI',     'TG3 P7 / DECHARGE',1.5,11, null,null,0, 'TG3 P7 / DECHARGE',1.5, 0, null,null,0, null],
            ['2026-03-05','D253',null,                   'RTAIL ABDELAZIZ',        null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 5, null,null,0, null,null,0, null],
            ['2026-03-05','D254',null,                   'RAHILI',                 null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 5, null,null,0, null,null,0, null],
            ['2026-03-05','TO1', null,                   'KHALID ABDELBAR',        'TG3 P7 / DECHARGE',1.5, 1, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 1, null,null,0, null,null,0, null],
            ['2026-03-05','T02', null,                   'DIGOUG REDOUANE',        'TG3 P7 / DECHARGE',1.5, 1, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 1, null,null,0, null,null,0, null],
            ['2026-03-05','D255',null,                   'EL ABEDY YOUSSEF',       null,null,0, 'TF8 P5 / CRIBLAGE MOBILE',6.4, 4, null,null,0, null,null,0, null],
        ];

        $count = 0;
        foreach ($rotations as $r) {
            Rotation::create([
                'date'                => $r[0],
                'camion_id'           => $r[1],
                'chauffeur_1er'       => $r[2] ?: null,
                'chauffeur_2e'        => $r[3] ?: null,
                // Stérile P1
                'sterile_p1_panneau'  => $r[4] ?: null,
                'sterile_p1_km'       => $r[5],
                'sterile_p1_vgs'      => $r[6],
                // Phosphate P1
                'phosphate_p1_panneau'=> $r[7] ?: null,
                'phosphate_p1_km'     => $r[8],
                'phosphate_p1_vgs'    => $r[9],
                // Stérile P2
                'sterile_p2_panneau'  => $r[10] ?: null,
                'sterile_p2_km'       => $r[11],
                'sterile_p2_vgs'      => $r[12],
                // Phosphate P2
                'phosphate_p2_panneau'=> $r[13] ?: null,
                'phosphate_p2_km'     => $r[14],
                'phosphate_p2_vgs'    => $r[15],
                'commentaires'        => $r[16] ?: null,
            ]);
            $count++;
        }

        $this->command->info("  ✓ Rotations: {$count} lignes insérées (25 fév → 05 mars 2026 · 6 journées · 29 camions/jour)");
    }
}
