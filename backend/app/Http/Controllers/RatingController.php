<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use App\Models\Rating;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Preset $preset)
    {
        $this->authorize('create', [Rating::class, $preset]);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $request->user()->ratings()->create([
            'preset_id' => $preset->id,
            'rating' => $validated['rating'],
        ]);

        return response()->json($preset->fresh()->load(['user', 'presetCategory', 'tags'])->append('user_rating'));
    }
}
