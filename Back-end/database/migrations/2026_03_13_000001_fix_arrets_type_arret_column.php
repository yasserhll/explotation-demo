<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Supprime la contrainte ENUM sur type_arret et remplace par string libre.
     * SQLite ne supporte pas ALTER COLUMN → on recrée la table.
     */
    public function up(): void
    {
        // 1. Renommer l'ancienne table
        Schema::rename('arrets', 'arrets_old');

        // 2. Créer la nouvelle table sans contrainte enum
        Schema::create('arrets', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('engin_code')->nullable();
            $table->string('type_arret', 150);  // ← string libre, plus d'enum
            $table->decimal('duree_heures', 6, 2);
            $table->text('description')->nullable();
            $table->boolean('arret_total')->default(false);
            $table->timestamps();

            $table->index('date');
            $table->index('engin_code');
        });

        // 3. Copier les données existantes
        DB::statement('INSERT INTO arrets SELECT * FROM arrets_old');

        // 4. Supprimer l'ancienne table
        Schema::dropIfExists('arrets_old');
    }

    public function down(): void
    {
        // Pas de rollback vers l'enum (irréversible proprement)
        Schema::dropIfExists('arrets');
    }
};
