<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('presets', function (Blueprint $table) {
            $table->decimal('ratings_avg', 2, 1)->default(0);
            $table->unsignedInteger('ratings_count')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('presets', function (Blueprint $table) {
            $table->dropColumn(['ratings_avg', 'ratings_count']);
        });
    }
};
