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

Route::get('/presets', [PresetController::class, 'index']);
Route::apiResource('preset-categories', PresetCategoryController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/presets', [PresetController::class, 'userPresets']);
    Route::post('/presets', [PresetController::class, 'store']);
    Route::put('/presets/{preset}', [PresetController::class, 'update']);
    Route::delete('/presets/{preset}', [PresetController::class, 'destroy']);
    Route::post('/presets/{preset}/use', [PresetUseController::class, 'store']);
    Route::post('/presets/{preset}/rate', [RatingController::class, 'store']);
});
