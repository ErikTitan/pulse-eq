<?php

namespace App\Console\Commands;

use App\Models\Preset;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillPresetRatings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'presets:backfill-ratings';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill the average rating and rating count for all existing presets.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to backfill preset ratings...');

        Preset::chunk(100, function ($presets) {
            foreach ($presets as $preset) {
                DB::transaction(function () use ($preset) {
                    $preset->ratings_count = $preset->ratings()->count();
                    $preset->ratings_avg = $preset->ratings()->avg('rating') ?? 0;
                    $preset->save();
                });
                $this->output->write('.');
            }
        });

        $this->info(PHP_EOL . 'Preset ratings backfilled successfully.');
    }
}
