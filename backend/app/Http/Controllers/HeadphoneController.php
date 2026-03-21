<?php

namespace App\Http\Controllers;

use App\Models\Headphone;
use Illuminate\Http\Request;

class HeadphoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->input('query');

        $headphones = Headphone::when($query, function ($q) use ($query) {
            $searchTerms = explode(' ', $query);
            foreach ($searchTerms as $term) {
                if (trim($term) !== '') {
                    $q->where(function ($subQ) use ($term) {
                        $subQ->where('brand', 'like', "%{$term}%")
                            ->orWhere('model', 'like', "%{$term}%");
                    });
                }
            }
        })->select('id', 'brand', 'model', 'source', 'preamp') // Exclude filters for index to keep it light
            ->orderBy('brand')
            ->orderBy('model')
            ->paginate(15);

        return response()->json($headphones);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $headphone = Headphone::findOrFail($id);

        return response()->json($headphone);
    }
}
