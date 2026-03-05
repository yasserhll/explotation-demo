<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productions', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('type_materiau'); // PHOSPHATE, STERILE 50T
            $table->string('niveau')->nullable();
            $table->string('tranchee')->nullable();
            $table->string('panneau')->nullable();
            $table->string('destination');
            $table->decimal('distance_km', 6, 2)->nullable();
            $table->integer('nbr_voyage_1er')->default(0);
            $table->integer('nbr_voyage_2e')->default(0);
            $table->integer('total_voyage')->default(0);
            $table->decimal('volume_m3', 10, 2)->default(0);
            $table->string('camion_1er')->nullable();
            $table->string('camion_2e')->nullable();
            $table->string('pelle_1er')->nullable();
            $table->string('pelle_2e')->nullable();
            $table->text('remarques')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productions');
    }
};
