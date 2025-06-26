<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Preset extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'settings',
        'public',
        'preset_category_id',
        'color',
    ];

    protected $casts = [
        'settings' => 'json',
    ];

    public function presetCategory(): BelongsTo
    {
        return $this->belongsTo(PresetCategory::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
