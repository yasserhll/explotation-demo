<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotations', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('camion_id', 20);
            $table->string('chauffeur_1er')->nullable();
            $table->string('chauffeur_2e')->nullable();

            // Stérile Poste 1 — Panneau A
            $table->string('sterile_p1a_panneau')->nullable();
            $table->decimal('sterile_p1a_km', 6, 2)->nullable();
            $table->integer('sterile_p1a_vgs')->nullable();
            // Stérile Poste 1 — Panneau B
            $table->string('sterile_p1b_panneau')->nullable();
            $table->decimal('sterile_p1b_km', 6, 2)->nullable();
            $table->integer('sterile_p1b_vgs')->nullable();

            // Phosphate Poste 1 — Panneau A
            $table->string('phosphate_p1a_panneau')->nullable();
            $table->decimal('phosphate_p1a_km', 6, 2)->nullable();
            $table->integer('phosphate_p1a_vgs')->nullable();
            // Phosphate Poste 1 — Panneau B
            $table->string('phosphate_p1b_panneau')->nullable();
            $table->decimal('phosphate_p1b_km', 6, 2)->nullable();
            $table->integer('phosphate_p1b_vgs')->nullable();

            // Stérile Poste 2 — Panneau A
            $table->string('sterile_p2a_panneau')->nullable();
            $table->decimal('sterile_p2a_km', 6, 2)->nullable();
            $table->integer('sterile_p2a_vgs')->nullable();
            // Stérile Poste 2 — Panneau B
            $table->string('sterile_p2b_panneau')->nullable();
            $table->decimal('sterile_p2b_km', 6, 2)->nullable();
            $table->integer('sterile_p2b_vgs')->nullable();

            // Phosphate Poste 2 — Panneau A
            $table->string('phosphate_p2a_panneau')->nullable();
            $table->decimal('phosphate_p2a_km', 6, 2)->nullable();
            $table->integer('phosphate_p2a_vgs')->nullable();
            // Phosphate Poste 2 — Panneau B
            $table->string('phosphate_p2b_panneau')->nullable();
            $table->decimal('phosphate_p2b_km', 6, 2)->nullable();
            $table->integer('phosphate_p2b_vgs')->nullable();

            $table->text('commentaires')->nullable();
            $table->timestamps();

            $table->index('date');
            $table->index('camion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rotations');
    }
};
