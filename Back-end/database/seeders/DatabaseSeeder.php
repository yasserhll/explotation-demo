<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('🚛 Seeding BenGuerir Mining Database...');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        $this->call([
            EnginSeeder::class,
            AffectationSeeder::class,
            ProductionSeeder::class,
        ]);

        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('✅ Base de données prête avec données réelles!');
        $this->command->info('   Source: Excel Jan-Fév 2026 — Site BenGuerir');
        $this->command->info('');
    }
}
