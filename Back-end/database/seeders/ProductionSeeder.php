<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Production;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // Données réelles extraites des fichiers Excel
        // RAPPORT_JOURNALIER_DE_PRODUCTION_FEVRIER_2026
        $productions = [
            // 27/01/2026
            ['2026-01-27', 'PHOSPHATE', null,    'STOCK PSF',  'REPRISE', 'CRIBLAGE MOBILE',  1.1,  117, 116, 233, 3728,  '5',  '6',  '350-E64', '350-E64'],
            ['2026-01-27', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'STOCK PSF',         5.0,   75,  83, 158, 2528, '10',  '8',  '350-E71', null],
            ['2026-01-27', 'STERILE 50T','INT 4/5','TG3',      'P7',      'DECHARGE',          1.5,   60,  85, 145, 2030,  '6',  '5',  '480-E49', '480-E49'],
            ['2026-01-27', 'STERILE II', null,   '1ER SORTIE', 'P7',      'DECHARGE',          1.3,   86,  86, 172, 3784,  null, null, null,      null],
            // 28/01/2026
            ['2026-01-28', 'PHOSPHATE', 'C3',    'STOCK PSF',  'REPRISE', 'CRIBLAGE MOBILE',   1.1,   90, 110, 200, 3200,  '5',  '5',  '350-E64', '350-E64'],
            ['2026-01-28', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'STOCK PSF',         5.5,   88,  88, 176, 2816, '10',  '9',  '350-E71', '350-E71'],
            ['2026-01-28', 'STERILE 50T','INT 4/5','TG3',      'P7',      'DECHARGE',          1.5,   30,  21,  51,  714,  '6',  '6',  '480-E49', '480-E49'],
            ['2026-01-28', 'STERILE II', null,   '1ER SORTIE', 'P7',      'DECHARGE',          1.3,   87,  84, 171, 3762, null, null, null,      null],
            // 29/01/2026
            ['2026-01-29', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'STOCK PSF',         5.5,    9,   0,   9,  144,  '9',  '0',  '350-E71', '-'],
            ['2026-01-29', 'PHOSPHATE', 'C3',    'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.1,  102, 117, 219, 3504,  '5',  '5',  '350-E64', '350-E64'],
            ['2026-01-29', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 1',          4.7,    0,  34,  34,  544,  '0',  '8',  '-',       '350-E71'],
            ['2026-01-29', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK BASCULE',     4.7,    0,  51,  51,  816, null, null, null,      null],
            ['2026-01-29', 'STERILE 50T','INT 4/5','TG3',      'P7',      'DECHARGE',          1.2,   59,  58, 117, 1638,  '6',  '5',  '480-E49', '480-E49'],
            ['2026-01-29', 'STERILE II', null,   '1ER SORTIE', 'P7',      'DECHARGE',          1.4,   95,  94, 189, 4158, null, null, null,      null],
            // 30/01/2026
            ['2026-01-30', 'PHOSPHATE', 'C3',    'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.1,   62, 104, 166, 2656,  '5',  '5',  '350-E64', '350-E64'],
            ['2026-01-30', 'PHOSPHATE', null,    null,         null,      'TREMIE MOBILE',     2.0,   33,   0,  33,  528, null, null, null,      null],
            ['2026-01-30', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'STOCK BASCULE',     4.7,    0,  50,  50,  800,  '0',  '8',  '-',       '350-E71'],
            ['2026-01-30', 'PHOSPHATE', null,    'TG4',        'P7',      'TREMIE 2',          4.7,   90,  61, 151, 2416, null, null, '350-E71', null],
            ['2026-01-30', 'STERILE 50T','INT 4/5','TG3',      'P7',      'DECHARGE',          1.2,   78,  76, 154, 2156,  '6',  '6',  '480-E49', '480-E49'],
            ['2026-01-30', 'STERILE II', null,   '1ER SORTIE', 'P7',      'DECHARGE',          1.3,   82,  82, 164, 3608, null, null, null,      null],
            // 31/01/2026
            ['2026-01-31', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'STOCK BASCULE',     4.7,  108,  36, 144, 2304,  '9',  '9',  '350-E71', '350-E71'],
            ['2026-01-31', 'PHOSPHATE', null,    'TG4',        'P7',      'TREMIE 2/1',        4.7,    6,  85,  91, 1456, null, null, null,      null],
            ['2026-01-31', 'PHOSPHATE', '-',     'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.2,   91,  99, 190, 3040,  '5',  '5',  '350-E64', '350-E64'],
            ['2026-01-31', 'STERILE 50T','2EME SORTIE','TG3',  'P7',      'DECHARGE',          1.3,   90,  94, 184, 2576,  '6',  '6',  '480-E49', '480-E49'],
            ['2026-01-31', 'STERILE II', null,   '1ER SORTIE', 'P7',      'DECHARGE',          1.4,   84,  84, 168, 3696, null, null, null,      null],
            // 02/02/2026
            ['2026-02-02', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 2',          4.7,    7,   7,   7,  112,  '9', null, '350-E71', null],
            ['2026-02-02', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK BASCULE',     4.7,   16,  16,  16,  256, null, null, null,      null],
            ['2026-02-02', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK STOTE N2',    5.0,   44,  44,  44,  704, null, null, null,      null],
            ['2026-02-02', 'PHOSPHATE', '-',     'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.4,   82,  82,  82, 1312,  '5', null, '350-E64', null],
            // 04/02/2026
            ['2026-02-04', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 1',          4.8,   10,   0,  10,  160,  '9',  '-',  '350-E71', '-'],
            ['2026-02-04', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK STOTE N2',    4.0,   32,   0,  32,  512, null, null, null,      null],
            ['2026-02-04', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK GOUDRON',     5.8,   34,  87, 121, 1936, null,  '9',  null,     '350-E71'],
            ['2026-02-04', 'PHOSPHATE', '-',     'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.4,  114, 112, 226, 3616,  '6',  '5',  '350-E64', '350-E64'],
            ['2026-02-04', 'PHOSPHATE', 'C1',    'TF8',        'P5',      'CRIBLAGE MOBILE',   4.5,    0,  23,  23,  368, null,  '5',  null,     'CH-E48'],
            // 05/02/2026
            ['2026-02-05', 'PHOSPHATE', 'C4',    'TC',         'P4',      'STOCK X',           1.0,   29,  15,  44,  704,  '3',  '3',  'CH-E48', 'CH-E48'],
            ['2026-02-05', 'PHOSPHATE', 'C0',    'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.4,  130, 118, 248, 3968,  '6',  '5',  '350-E64', '350-E64'],
            ['2026-02-05', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 1',          5.4,    3,  24,  27,  432,  '9',  '9',  '350-E71', '350-E71'],
            ['2026-02-05', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK GOUDRON',     4.5,  102,  94, 196, 3136, null, null, null,      null],
            ['2026-02-05', 'PHOSPHATE', 'C1',    'TF8',        'P5',      'CRIBLAGE MOBILE',   4.5,    0,  14,  14,  224,  '0',  '3',  '-',      'CH-E48'],
            // 06/02/2026
            ['2026-02-06', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'STOCK GOUDRON',     4.5,   86, 101, 187, 2992,  '9',  '9',  '350-E71', '350-E71'],
            ['2026-02-06', 'PHOSPHATE', '-',     'STOCK PSF',  'REPRISE', 'CRIBLAGE MOBILE',   1.4,  113, 119, 232, 3712,  '5',  '5',  '350-E64', '350-E64'],
            ['2026-02-06', 'PHOSPHATE', 'C1',    'TF8',        'P5',      'CRIBLAGE MOBILE',   4.6,    6,   0,   6,   96,  '3',  '0',  'CH-E48', '-'],
            ['2026-02-06', 'PHOSPHATE', null,    'TF8',        'P5',      'STOCK PSF',         4.6,   29,  34,  63, 1008, null,  '3',  null,     'CH-E48'],
            // 07/02/2026
            ['2026-02-07', 'PHOSPHATE', 'C1',    'TF8',        'P5',      'STOCK PSF',         4.6,   39,   5,  44,  704,  '5',  '3',  'CH-E48', 'CH-E48'],
            ['2026-02-07', 'PHOSPHATE', 'C0',    'REPRISE',    'STOCK PSF','CRIBLAGE MOBILE',  1.2,  122,   0, 122, 1952,  '7',  '0',  '350-E71', '-'],
            ['2026-02-07', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'STOCK GOUDRON',     4.5,  105, 103, 208, 3328,  '9', '10',  '350-E71', '350-E71'],
            ['2026-02-07', 'PHOSPHATE', '-',     'REPRISE',    'STOCK TM','CRIBLAGE MOBILE',   1.4,    0,  64,  64, 1024,  '0',  '4',  '-',      '336-E18'],
            // 09/02/2026
            ['2026-02-09', 'PHOSPHATE', 'C0',    'REPRISE',    'STOCK TM','CRIBLAGE MOBILE',   1.4,   15,   0,  15,  240,  '4',  '0',  '336-E18', '-'],
            ['2026-02-09', 'PHOSPHATE', 'C5',    'TE9',        'P5',      'CRIBLAGE MOBILE',   2.6,    0,  48,  48,  768,  '0',  '4',  '-',      '336-E18'],
            ['2026-02-09', 'PHOSPHATE', 'C4',    'REPRISE',    'STOCK TM','TREMIE MOBILE',     0.5,   35,   0,  35,  560,  '5',  '0',  '336-E18', '-'],
            ['2026-02-09', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'STOCK GOUDRON',     6.0,   35,  48,  83, 1328, '10', '10',  '350-E71', '350-E71'],
            ['2026-02-09', 'PHOSPHATE', null,    'TG4',        'P7',      'TREMIE MOBILE',     5.0,   58,  58, 116, 1856, null, null, null,      null],
            // 10/02/2026
            ['2026-02-10', 'PHOSPHATE', 'C5',    'TE9',        'P5',      'CRIBLAGE MOBILE',   2.6,   51,   0,  51,  816,  '5',  '0',  '336-E18', '-'],
            ['2026-02-10', 'PHOSPHATE', null,    'TE9',        'P5',      'TREMIE MOBILE',     2.2,    0,  27,  27,  432,  '0',  '5',  '-',      '336-E18'],
            ['2026-02-10', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'STOCK GOUDRON',     5.0,   20,   2,  22,  352,  '9', '10',  '350-E71', '350-E71'],
            ['2026-02-10', 'PHOSPHATE', null,    'TG4',        'P7',      'TREMIE 1',          6.0,   47,  96, 143, 2288, null, null, null,      null],
            // 11/02/2026
            ['2026-02-11', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 1',          6.0,   60,  56, 116, 1856, '10', '10', '350-E71', '350-E71'],
            ['2026-02-11', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK GOUDRON',     5.0,   15,  12,  27,  432, null, null, null,      null],
            ['2026-02-11', 'PHOSPHATE', null,    'TG4',        'P7',      'TREMIE MOBILE',     6.4,    0,  10,  10,  160, null, null, null,      null],
            ['2026-02-11', 'STERILE 50T','LA BERME','TG3',     'P7',      'DECHARGE',          0.8,  109,  80, 189, 2646,  '5',  '4',  '480-E49', '480-E49'],
            // 12/02/2026
            ['2026-02-12', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 2/1',        6.0,   25,  16,  41,  656,  '9',  '5',  '350-E71', 'CH-E48'],
            ['2026-02-12', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK GOUDRON',     5.0,    0,  16,  16,  256, null, null, null,      null],
            ['2026-02-12', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'TREMIE MOBILE',     5.6,    0,  39,  39,  624,  '0',  '6',  '-',      '350-E71'],
            ['2026-02-12', 'PHOSPHATE', null,    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.5,    0,  13,  13,  208, null, null, null,      null],
            // 13/02/2026
            ['2026-02-13', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 1',          6.0,    5,   0,   5,   80,  '4',  '0',  'CH-E48', '-'],
            ['2026-02-13', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK GOUDRON',     5.0,    7,   0,   7,  112, null, null, null,      null],
            ['2026-02-13', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.0,    7,   0,   7,  112, '11',  '0',  '350-E71', '-'],
            ['2026-02-13', 'PHOSPHATE', null,    'TJ9',        'P6',      'TREMIE MOBILE',     4.6,    7,   0,   7,  112, null, null, null,      null],
            ['2026-02-13', 'PHOSPHATE', null,    'TJ9',        'P6',      'TREMIE 2',          9.6,   32,   0,  32,  512, null, null, null,      null],
            ['2026-02-13', 'PHOSPHATE', null,    'TJ9',        'P6',      'STOCK GOUDRON',     8.6,   17,  65,  82, 1312, null, '10', null,     '350-E71'],
            // 14/02/2026
            ['2026-02-14', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'STOCK GOUDRON',     8.6,    0,  57,  57,  912,  '0',  '7',  '-',     '350-E71'],
            ['2026-02-14', 'PHOSPHATE', null,    'TJ9',        'P6',      'TREMIE 2',          8.6,   43,   0,  43,  688,  '9',  '0',  '350-E71', '-'],
            ['2026-02-14', 'PHOSPHATE', null,    'TJ9',        'P6',      'STOCK GOUDRON',     9.6,   18,   0,  18,  288, null, null, null,      null],
            ['2026-02-14', 'STERILE 50T','1ER SORTIE 1/2','TF8','P5',     'DECHARGE',          2.3,   90,  97, 187, 2618,  '6',  '6',  '350-E64', '350-E64'],
            // 16/02/2026
            ['2026-02-16', 'PHOSPHATE', 'C5',    'TE9',        'P5',      'STOCK GOUDRON',     9.0,    4,   0,   4,   64,  '4',  '0',  '336-E18', '-'],
            ['2026-02-16', 'PHOSPHATE', null,    'TE9',        'P5',      'CRIBLAGE MOBILE',   2.8,   45,  25,  70, 1120, null,  '5',  null,     '336-E18'],
            ['2026-02-16', 'PHOSPHATE', null,    'TE9',        'P5',      'STOCK PSF SAFI',    4.1,    0,  27,  27,  432, null, null, null,      null],
            ['2026-02-16', 'PHOSPHATE', 'C5',    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.5,   13,  48,  61,  976,  '5',  '8',  '350-E71', '350-E71'],
            ['2026-02-16', 'PHOSPHATE', null,    'TJ9',        'P6',      'STOCK PSF SAFI',    6.1,    0,  47,  47,  752, null, null, null,      null],
            ['2026-02-16', 'PHOSPHATE', 'C4',    'TJ9',        'P6',      'STOCK PSF SAFI',    5.6,   48,   0,  48,  768,  '7',  '0',  '350-E71', '-'],
            // 17/02/2026
            ['2026-02-17', 'PHOSPHATE', 'C5',    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.5,  102, 119, 221, 3536,  '8',  '8',  '350-E71', '350-E71'],
            ['2026-02-17', 'PHOSPHATE', null,    'TJ9',        'P6',      'STOCK PSF',         6.1,   10,   0,  10,  160, null, null, null,      null],
            ['2026-02-17', 'PHOSPHATE', 'C5',    'TE9',        'P5',      'STOCK PSF',         4.8,    4,   0,   4,   64,  '5',  '0',  '336-E18', '-'],
            ['2026-02-17', 'PHOSPHATE', null,    'TE9',        'P5',      'CRIBLAGE MOBILE',   2.8,   50,  55, 105, 1680, null,  '5',  null,     '336-E18'],
            ['2026-02-17', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE 2',          6.0,    3,   0,   3,   48,  '3',  '0',  'CH-E48', '-'],
            ['2026-02-17', 'PHOSPHATE', null,    'TG4',        'P7',      'STOCK STOTE N2',    1.0,    2,   0,   2,   32, null, null, null,      null],
            // 18/02/2026
            ['2026-02-18', 'PHOSPHATE', 'C5',    'TE9',        'P5',      'CRIBLAGE MOBILE',   2.8,   41,  26,  67, 1072,  '4',  '5',  '336-E18', '336-E18'],
            ['2026-02-18', 'PHOSPHATE', null,    'TE9',        'P5',      'TREMIE MOBILE',     2.1,    0,   4,   4,   64, null, null, null,      null],
            ['2026-02-18', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'TREMIE MOBILE',     6.4,   19,   0,  19,  304,  '5',  '0',  'CH-E48', '-'],
            ['2026-02-18', 'PHOSPHATE', null,    'TG4',        'P7',      'CRIBLAGE MOBILE',   null,  32,   0,  32,  512, null, null, null,      null],
            ['2026-02-18', 'PHOSPHATE', 'C5',    'TJ9',        'P6',      'TREMIE MOBILE',     5.5,   25,   0,  25,  400,  '8',  '0',  '350-E71', '-'],
            ['2026-02-18', 'PHOSPHATE', null,    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.5,   78,  12,  90, 1440, null, '10',  null,     '350-E71'],
            // 19/02/2026
            ['2026-02-19', 'PHOSPHATE', 'C5',    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.5,   66,   4,  70, 1120,  '8', '11',  '350-E71', '350-E71'],
            ['2026-02-19', 'PHOSPHATE', null,    'TJ9',        'P6',      'TREMIE 2',         10.6,    0,  52,  52,  832, null, null, null,      null],
            ['2026-02-19', 'PHOSPHATE', null,    'TJ9',        'P6',      'STOCK PONT BASCULE',10.6,  0,  25,  25,  400, null, null, null,      null],
            ['2026-02-19', 'PHOSPHATE', 'C2',    'TF8',        'P5',      'CRIBLAGE MOBILE',   4.6,    0,  53,  53,  848,  '0',  '6',  '-',      '336-E18'],
            ['2026-02-19', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'CRIBLAGE MOBILE',   6.6,   18,   0,  18,  288,  '4',  '0',  'CH-E48', '-'],
            // 20/02/2026
            ['2026-02-20', 'PHOSPHATE', 'C5',    'TJ9',        'P6',      'CRIBLAGE MOBILE',   4.5,    5,   0,   5,   80, '10',  '0',  '350-E71', '-'],
            ['2026-02-20', 'PHOSPHATE', null,    'TJ9',        'P6',      'STOCK PSF SAFI',    6.2,   31,   0,  31,  496, null, null, null,      null],
            ['2026-02-20', 'PHOSPHATE', 'C5',    'TH15',       'P7',      'STOCK GOUDRON',     6.8,   14,  95, 109, 1744,  '8', '11',  '350-E71', '350-E71'],
            ['2026-02-20', 'PHOSPHATE', 'C0',    'TG4',        'P7',      'CRIBLAGE MOBILE',   6.6,   12,   0,  12,  192,  '4',  '0',  'CH-E48', '-'],
            ['2026-02-20', 'PHOSPHATE', 'C2',    'TF8',        'P5',      'CRIBLAGE MOBILE',   4.6,   55,  61, 116, 1856,  '7',  '6',  '336-E18', '336-E18'],
            // 21/02/2026
            ['2026-02-21', 'PHOSPHATE', 'C2',    'TF8',        'P5',      'CRIBLAGE MOBILE',   4.6,   64,  18,  82, 1312,  '8',  '6',  '336-E18', '336-E18'],
            ['2026-02-21', 'PHOSPHATE', null,    'TF8',        'P5',      'STOCK PSF',         6.4,    0,  38,  38,  608, null, null, null,      null],
            ['2026-02-21', 'PHOSPHATE', 'SA1',   'TE10',       'P5',      'STOCK ZAGORA',      5.8,   26,  96, 122, 1952, '11', '10',  '350-E71', '350-E71'],
            ['2026-02-21', 'PHOSPHATE', 'C5',    'TH15',       'P7',      'STOCK GOUDRON',     6.8,   52,   0,  52,  832, '10',  '0',  '350-E71', '-'],
            // 22/02/2026
            ['2026-02-22', 'STERILE 50T','INT 5/6','T43',      'P2',      'DECHARGE',          1.0,  254,   0, 254, 3556, '11', null,  '480-E49+350-E64', null],
        ];

        $count = 0;
        foreach ($productions as $row) {
            Production::create([
                'date'           => $row[0],
                'type_materiau'  => $row[1],
                'niveau'         => $row[2],
                'tranchee'       => $row[3],
                'panneau'        => $row[4],
                'destination'    => $row[5],
                'distance_km'    => $row[6],
                'nbr_voyage_1er' => $row[7],
                'nbr_voyage_2e'  => $row[8],
                'total_voyage'   => $row[9],
                'volume_m3'      => $row[10],
                'camion_1er'     => $row[11],
                'camion_2e'      => $row[12],
                'pelle_1er'      => $row[13],
                'pelle_2e'       => $row[14],
            ]);
            $count++;
        }

        $this->command->info("✅ {$count} lignes de production créées.");
    }
}
