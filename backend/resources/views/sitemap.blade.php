<?= '<?xml version="1.0" encoding="UTF-8"?>' ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Main application pages -->
    <url>
        <loc>{{ $frontendUrl }}</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ $frontendUrl }}/equalizer</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>{{ $frontendUrl }}/features</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>{{ $frontendUrl }}/contact</loc>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>

    <!-- Individual preset pages -->
    @foreach ($presets as $preset)
        <url>
            <loc>{{ $frontendUrl }}/preset/{{ $preset->slug }}</loc>
            <lastmod>{{ $preset->updated_at->toAtomString() }}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.8</priority>
        </url>
    @endforeach
</urlset>
