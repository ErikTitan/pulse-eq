<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PresetController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SocialAuthController;

Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// All stateful, session-based routes are defined here.
// The '/api' prefix is added to maintain compatibility with the frontend.
Route::prefix('api')->group(function () {
    // Auth routes
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');

    // Authenticated routes
    Route::middleware('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Preset management
        Route::post('/presets', [PresetController::class, 'store']);
        Route::put('/presets/{preset:slug}', [PresetController::class, 'update']);
        Route::delete('/presets/{preset:slug}', [PresetController::class, 'destroy']);
    });

    // OAuth routes
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('login.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
});

// Catch-all route to serve the Vue.js frontend
Route::get('/{any}', function () {
    return view('welcome'); // Point to the existing 'welcome.blade.php' view
})->where('any', '.*');
