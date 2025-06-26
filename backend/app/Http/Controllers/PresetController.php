<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PresetController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        return Preset::where('public', true)->get();
    }

    public function userPresets(Request $request)
    {
        return $request->user()->presets;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'settings' => 'required|json',
            'public' => 'boolean',
            'category' => 'required|string|max:255',
            'color' => 'string|max:7',
        ]);

        $preset = $request->user()->presets()->create($validated);

        return response()->json($preset, 201);
    }

    public function update(Request $request, Preset $preset)
    {
        $this->authorize('update', $preset);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'settings' => 'json',
            'public' => 'boolean',
            'category' => 'string|max:255',
            'color' => 'string|max:7',
        ]);

        $preset->update($validated);

        return response()->json($preset);
    }

    public function destroy(Preset $preset)
    {
        $this->authorize('delete', $preset);

        $preset->delete();

        return response()->json(null, 204);
    }
}
