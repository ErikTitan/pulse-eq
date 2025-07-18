<?php

namespace App\Policies;

use App\Models\Preset;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PresetPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     *
     * Note: This policy is intentionally NOT applied to the showBySlug route
     * to allow public access for SEO purposes and link sharing. The showBySlug
     * route should remain publicly accessible even for private presets when
     * accessed via direct link.
     */
    public function view(User $user, Preset $preset): bool
    {
        return $preset->public || $user->id === $preset->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Preset $preset): bool
    {
        return $user->id === $preset->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Preset $preset): bool
    {
        return $user->id === $preset->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Preset $preset): bool
    {
        return $user->id === $preset->user_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Preset $preset): bool
    {
        return $user->id === $preset->user_id;
    }
}
