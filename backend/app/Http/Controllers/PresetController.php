<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use App\Models\Tag;
use App\Models\PresetCategory;
use App\Rules\AsciiOnly;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Mews\Purifier\Facades\Purifier;

class PresetController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        return Preset::with('presetCategory', 'user', 'tags')
            ->withCount('uses')
            ->withAvg('ratings', 'rating')
            ->where('public', true)
            ->get()
            ->append('user_rating');
    }

    public function userPresets(Request $request)
    {
        return $request->user()->presets()->with('presetCategory', 'user', 'tags')->get()->append('user_rating');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:50', new AsciiOnly, 'blasp_check'],
            'description' => ['nullable', 'string', 'max:80', new AsciiOnly, 'blasp_check'],
            'settings' => 'required|json',
            'public' => 'boolean',
            'preset_category_id' => 'required|exists:preset_categories,id',
            'color' => 'string|max:7',
            'tags' => $this->getTagValidationRules(),
            'tags.*' => [new AsciiOnly, 'blasp_check'],
        ]);

        // Sanitize user input
        if (isset($validated['name'])) {
            $validated['name'] = Purifier::clean($validated['name'], 'strict');
        }
        if (isset($validated['description'])) {
            $validated['description'] = Purifier::clean($validated['description'], 'strict');
        }

        $preset = $request->user()->presets()->create($validated);

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                $cleanTagName = Purifier::clean($tagName, 'strict');
                return Tag::firstOrCreate(['name' => $cleanTagName])->id;
            });
            $preset->tags()->sync($tags);
        }

        return response()->json($preset->load('tags'), 201);
    }

    public function update(Request $request, Preset $preset)
    {
        $this->authorize('update', $preset);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:50', new AsciiOnly, 'blasp_check'],
            'description' => ['nullable', 'string', 'max:80', new AsciiOnly, 'blasp_check'],
            'settings' => 'json',
            'public' => 'boolean',
            'preset_category_id' => 'exists:preset_categories,id',
            'color' => 'string|max:7',
            'tags' => $this->getTagValidationRules(),
            'tags.*' => [new AsciiOnly, 'blasp_check'],
        ]);

        // Sanitize user input
        if (isset($validated['name'])) {
            $validated['name'] = Purifier::clean($validated['name'], 'strict');
        }
        if (isset($validated['description'])) {
            $validated['description'] = Purifier::clean($validated['description'], 'strict');
        }

        $preset->update($validated);

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                $cleanTagName = Purifier::clean($tagName, 'strict');
                return Tag::firstOrCreate(['name' => $cleanTagName])->id;
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
        return response()->json($preset->load([
            'presetCategory',
            'user',
            'tags',
            'ratings' => function ($query) {
                $query->where('user_id', auth()->id());
            }
        ])->append('user_rating'));
    }

    private function getTagValidationRules()
    {
        return [
            'required',
            'array',
            'min:1',
            'max:10',
            function (mixed $value, \Closure $fail) {
                // Validate each tag
                foreach ($value as $tag) {
                    if (!is_string($tag) || strlen($tag) > 20) {
                        $fail('Each tag must be a string with maximum 20 characters.');
                        return;
                    }
                }
                // Validate total character count
                $totalChars = collect($value)->sum(fn($tag) => strlen($tag));
                if ($totalChars > 100) {
                    $fail('The combined length of all tags cannot exceed 100 characters.');
                }
            }
        ];
    }
}
