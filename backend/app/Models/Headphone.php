<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Headphone extends Model
{
    /** @use HasFactory<\Database\Factories\HeadphoneFactory> */
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'source',
        'preamp',
        'filters',
    ];

    protected function casts(): array
    {
        return [
            'filters' => 'json',
        ];
    }
}
