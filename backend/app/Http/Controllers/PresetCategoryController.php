<?php

namespace App\Http\Controllers;

use App\Models\PresetCategory;
use Illuminate\Http\Request;

class PresetCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return PresetCategory::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $presetCategory = PresetCategory::create($request->all());

        return response()->json($presetCategory, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PresetCategory $presetCategory)
    {
        return $presetCategory;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PresetCategory $presetCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $presetCategory->update($request->all());

        return response()->json($presetCategory, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PresetCategory $presetCategory)
    {
        $presetCategory->delete();

        return response()->json(null, 204);
    }
}
