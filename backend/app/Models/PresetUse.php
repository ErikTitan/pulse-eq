<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Model;

class PresetUse extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'preset_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function preset(): BelongsTo
    {
        return $this->belongsTo(Preset::class);
    }
}
