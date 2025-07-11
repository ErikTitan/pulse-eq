<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $presets = Preset::where('public', true)
            ->whereNotNull('description')
            ->has('uses')
            ->has('ratings')
            ->get();
        $appUrl = config('app.url');

        return response()->view('sitemap', [
            'presets' => $presets,
            'frontendUrl' => $appUrl,
        ])->header('Content-Type', 'application/xml');
    }
}
