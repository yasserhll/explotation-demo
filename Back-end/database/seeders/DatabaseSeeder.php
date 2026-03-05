<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            EnginSeeder::class,
            AffectationSeeder::class,
            ProductionSeeder::class,
        ]);

        $this->command->info('✅ Base de données BenGuerir initialisée avec succès !');
        $this->command->table(
            ['Table', 'Enregistrements'],
            [
                ['engins',      \App\Models\Engin::count()],
                ['affectations', \App\Models\Affectation::count()],
                ['productions', \App\Models\Production::count()],
                ['arrets',      \App\Models\Arret::count()],
            ]
        );
    }
}
