<?php

namespace App\Observers;

use App\Models\Rating;
use Illuminate\Support\Facades\DB;

class RatingObserver
{
    /**
     * Handle the Rating "created" event.
     */
    public function created(Rating $rating): void
    {
        $this->updatePresetRatings($rating);
    }

    /**
     * Handle the Rating "updated" event.
     */
    public function updated(Rating $rating): void
    {
        $this->updatePresetRatings($rating);
    }

    /**
     * Handle the Rating "deleted" event.
     */
    public function deleted(Rating $rating): void
    {
        $this->updatePresetRatings($rating);
    }

    /**
     * Update the preset's average rating and rating count.
     */
    protected function updatePresetRatings(Rating $rating): void
    {
        $preset = $rating->preset;

        DB::transaction(function () use ($preset) {
            $preset->ratings_count = $preset->ratings()->count();
            $preset->ratings_avg = $preset->ratings()->avg('rating') ?? 0;

            \Log::info("Updating preset {$preset->id}: ratings_count={$preset->ratings_count}, ratings_avg={$preset->ratings_avg}");

            $preset->save();
        });
    }
}
