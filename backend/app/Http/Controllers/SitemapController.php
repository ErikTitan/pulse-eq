<?php

namespace App\Http\Controllers;

use App\Models\Preset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $presets = Preset::where('public', true)->get();
        $appUrl = config('app.url');

        return response()->view('sitemap', [
            'presets' => $presets,
            'frontendUrl' => $appUrl,
        ])->header('Content-Type', 'application/xml');
    }
}
