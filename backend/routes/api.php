<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\PresetController;

use App\Http\Controllers\PresetCategoryController;

use App\Http\Controllers\PresetUseController;

use App\Http\Controllers\RatingController;

// This file is for stateless, token-based API routes.

Route::get('/presets/slug/{preset:slug}', [PresetController::class, 'showBySlug'])->middleware('throttle:api');
Route::get('/presets', [PresetController::class, 'index'])->middleware('throttle:api');
Route::apiResource('preset-categories', PresetCategoryController::class)->middleware('throttle:api');

Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::get('/user/presets', [PresetController::class, 'userPresets']);
    Route::post('/presets/{preset:slug}/use', [PresetUseController::class, 'store']);
    Route::post('/presets/{preset:slug}/rate', [RatingController::class, 'store'])->middleware('throttle:rating');
    Route::apiResource('presets', PresetController::class)->except(['index', 'show']);
});
