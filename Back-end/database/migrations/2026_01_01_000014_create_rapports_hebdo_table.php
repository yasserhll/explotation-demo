<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapports_hebdo', function (Blueprint $table) {
            $table->id();
            $table->date('semaine_debut');
            $table->date('semaine_fin');
            $table->integer('total_voyages_extrait')->default(0);
            $table->integer('total_voyages_sterile')->default(0);
            $table->integer('total_voyages_sterile2')->default(0);
            $table->decimal('total_volume_extrait', 12, 2)->default(0);
            $table->decimal('total_volume_sterile', 12, 2)->default(0);
            $table->decimal('total_volume_sterile2', 12, 2)->default(0);
            $table->integer('total_voyages')->default(0);
            $table->decimal('total_volume', 12, 2)->default(0);
            $table->integer('nb_camions_actifs')->default(0);
            $table->boolean('arret_pluie')->default(false);
            $table->boolean('dimanche_travaille')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapports_hebdo');
    }
};
