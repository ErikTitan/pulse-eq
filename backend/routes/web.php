<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\SocialAuthController;

// All stateful, session-based routes are defined here.
// The '/api' prefix is added to maintain compatibility with the frontend.
Route::prefix('api')->group(function () {
    // Auth routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Authenticated routes
    Route::middleware('auth')->group(function () {
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // OAuth routes
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('login.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
});
