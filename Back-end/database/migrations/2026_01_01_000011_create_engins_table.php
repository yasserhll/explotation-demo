<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('engins', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // 350-E71, 480-E49, etc.
            $table->string('type'); // CAMION, PELLE, NIVELEUSE
            $table->string('modele')->nullable(); // 350, 480, 336, etc.
            $table->string('chauffeur_principal')->nullable();
            $table->string('chauffeur_secondaire')->nullable();
            $table->enum('statut', ['actif', 'arret', 'maintenance'])->default('actif');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('engins');
    }
};
