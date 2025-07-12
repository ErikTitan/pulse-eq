<?php

namespace App\Policies;

use App\Models\Preset;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class RatingPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\Models\User  $user
     * @param  \App\Models\Preset  $preset
     * @return \Illuminate\Auth\Access\Response|bool
     */
    public function create(User $user, Preset $preset)
    {
        // Prevent users from rating their own presets
        if ($user->id === $preset->user_id) {
            return false;
        }

        // Prevent users from rating a preset more than once
        return !$preset->ratings()->where('user_id', $user->id)->exists();
    }
}
