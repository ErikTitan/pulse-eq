<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use Illuminate\Http\Request;

class PresetUseController extends Controller
{
    public function store(Request $request, Preset $preset)
    {
        $request->user()->presetUses()->create([
            'preset_id' => $preset->id,
        ]);

        return response()->json(null, 204);
    }
}
