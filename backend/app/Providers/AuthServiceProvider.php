<?php

namespace App\Providers;

use App\Models\Preset;
use App\Models\Rating;
use App\Policies\PresetPolicy;
use App\Policies\RatingPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Preset::class => PresetPolicy::class,
        Rating::class => RatingPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
