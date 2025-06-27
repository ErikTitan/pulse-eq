<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
    ];

    protected $casts = [
        'settings' => 'json',
    ];

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
