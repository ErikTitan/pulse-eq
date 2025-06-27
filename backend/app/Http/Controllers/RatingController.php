<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use Illuminate\Http\Request;

class RatingController extends Controller
{
    public function store(Request $request, Preset $preset)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $request->user()->ratings()->updateOrCreate(
            ['preset_id' => $preset->id],
            ['rating' => $validated['rating']]
        );

        return response()->json(null, 204);
    }
}
