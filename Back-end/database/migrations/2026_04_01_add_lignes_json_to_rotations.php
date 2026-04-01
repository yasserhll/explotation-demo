<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('rotations', function (Blueprint $table) {
            $table->text('lignes_json')->nullable()->after('pelle_codes');
        });
    }
    public function down(): void {
        Schema::table('rotations', function (Blueprint $table) {
            $table->dropColumn('lignes_json');
        });
    }
};
