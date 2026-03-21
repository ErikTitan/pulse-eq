<?php

use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\VerificationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\HeadphoneController;
use App\Http\Controllers\PresetCategoryController;
use App\Http\Controllers\PresetController;
use App\Http\Controllers\PresetUseController;
use App\Http\Controllers\RatingController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [SitemapController::class, 'index']);

// The '/api' prefix is added to maintain compatibility with the frontend.
Route::prefix('api')->group(function () {
    // Public routes
    Route::get('/headphones', [HeadphoneController::class, 'index'])->middleware('throttle:api');
    Route::get('/headphones/{headphone}', [HeadphoneController::class, 'show'])->middleware('throttle:api');
    Route::get('/presets/slug/{preset:slug}', [PresetController::class, 'showBySlug'])->middleware('throttle:api');
    Route::get('/presets', [PresetController::class, 'index'])->middleware('throttle:api');
    Route::apiResource('preset-categories', PresetCategoryController::class)->middleware('throttle:api');

    // Auth routes
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLinkEmail'])->middleware('throttle:6,1');
    Route::post('/reset-password', [PasswordResetController::class, 'reset'])->middleware('throttle:6,1');

    // Verification routes
    Route::post('/email/resend', [VerificationController::class, 'resend'])->middleware('throttle:6,1');
    Route::get('/email/verify/{id}/{hash}', [VerificationController::class, 'verify'])->name('verification.verify')->middleware('signed');

    // Authenticated routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::post('/contact', [ContactController::class, 'submit'])->middleware('throttle:3,1');
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/user/profile', [AuthController::class, 'updateProfile']);
        Route::get('/user/presets', [PresetController::class, 'userPresets']);
        Route::post('/presets/{preset:slug}/use', [PresetUseController::class, 'store']);
        Route::post('/presets/{preset:slug}/rate', [RatingController::class, 'store'])->middleware('throttle:rating');
        Route::apiResource('presets', PresetController::class)->except(['index', 'show']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // OAuth routes
    Route::get('/auth/google', [SocialAuthController::class, 'redirectToGoogle'])->name('login.google');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
});

// Catch-all route to serve the Vue.js frontend
Route::get('/{any}', function () {
    return view('welcome'); // Point to the existing 'welcome.blade.php' view
})->where('any', '.*');
