<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('arrets', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('engin_code')->nullable(); // null = arrêt global (pluie, etc.)
            $table->enum('type_arret', [
                'panne_mecanique',
                'maintenance_preventive',
                'pluie',
                'accident',
                'manque_carburant',
                'absence_chauffeur',
                'autre'
            ])->default('autre');
            $table->decimal('duree_heures', 6, 2); // durée en heures
            $table->text('description')->nullable();
            $table->boolean('arret_total')->default(false); // si toute la flotte est arrêtée
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('arrets');
    }
};
