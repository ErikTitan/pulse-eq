<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('presets', function (Blueprint $table) {
            $table->foreignId('preset_category_id')->constrained()->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presets', function (Blueprint $table) {
            $table->dropForeign(['preset_category_id']);
            $table->dropColumn('preset_category_id');
        });
    }
};
