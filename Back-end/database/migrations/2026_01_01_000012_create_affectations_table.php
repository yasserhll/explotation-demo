<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affectations', function (Blueprint $table) {
            $table->id();
            $table->date('date')->nullable(); // null = affectation permanente
            $table->string('chauffeur_principal');
            $table->string('camion_code');   // D183, D184, etc.
            $table->string('chauffeur_secondaire')->nullable();
            $table->enum('type_vehicule', ['camion', 'tombereau', 'autre'])->default('camion');
            $table->string('statut')->default('actif'); // actif, arret
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};
