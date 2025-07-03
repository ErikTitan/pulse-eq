<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use App\Models\Tag;
use App\Rules\AsciiOnly;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PresetController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        return Preset::with('presetCategory', 'user', 'tags')
            ->withCount('uses')
            ->withAvg('ratings', 'rating')
            ->where('public', true)
            ->get();
    }

    public function userPresets(Request $request)
    {
        return $request->user()->presets()->with('presetCategory', 'user', 'tags')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', new AsciiOnly, 'blasp_check'],
            'description' => ['nullable', 'string', 'max:100', new AsciiOnly, 'blasp_check'],
            'settings' => 'required|json',
            'public' => 'boolean',
            'preset_category_id' => 'required|exists:preset_categories,id',
            'color' => 'string|max:7',
            'tags' => 'array',
            'tags.*' => ['string', 'max:255', new AsciiOnly, 'blasp_check'],
        ]);

        $preset = $request->user()->presets()->create($validated);

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => $tagName])->id;
            });
            $preset->tags()->sync($tags);
        }

        return response()->json($preset->load('tags'), 201);
    }

    public function update(Request $request, Preset $preset)
    {
        $this->authorize('update', $preset);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', new AsciiOnly, 'blasp_check'],
            'description' => ['nullable', 'string', 'max:100', new AsciiOnly, 'blasp_check'],
            'settings' => 'json',
            'public' => 'boolean',
            'preset_category_id' => 'exists:preset_categories,id',
            'color' => 'string|max:7',
            'tags' => 'array',
            'tags.*' => ['string', 'max:255', new AsciiOnly, 'blasp_check'],
        ]);

        $preset->update($validated);

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => $tagName])->id;
            });
            $preset->tags()->sync($tags);
        }

        return response()->json($preset->load('tags'));
    }

    public function destroy(Preset $preset)
    {
        $this->authorize('delete', $preset);

        $preset->delete();

        return response()->json(null, 204);
    }

    public function showBySlug(Preset $preset)
    {
        // The preset is already fetched by route model binding
        return response()->json($preset->load('presetCategory', 'user', 'tags'));
    }
}
