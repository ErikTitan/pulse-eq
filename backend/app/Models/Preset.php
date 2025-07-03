<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Preset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'settings',
        'public',
        'preset_category_id',
        'color',
        'user_id',
    ];

    protected $casts = [
        'settings' => 'json',
    ];

    protected static function booted(): void
    {
        static::saving(function ($preset) {
            if ($preset->isDirty('name') || empty($preset->slug)) {
                $slug = Str::slug($preset->name, '-');
                $originalSlug = $slug;
                $count = 1;
                while (static::where('slug', $slug)->where('id', '!=', $preset->id)->exists()) {
                    $slug = "{$originalSlug}-{$count}";
                    $count++;
                }
                $preset->slug = $slug;
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function presetCategory(): BelongsTo
    {
        return $this->belongsTo(PresetCategory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function uses(): HasMany
    {
        return $this->hasMany(PresetUse::class);
    }

    public function usedBy(): HasMany
    {
        return $this->hasMany(PresetUse::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }
}
