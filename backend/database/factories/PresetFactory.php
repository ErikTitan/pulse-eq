<?php

namespace Database\Factories;

use App\Models\PresetCategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Preset>
 */
class PresetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'preset_category_id' => PresetCategory::factory(),
            'name' => $this->faker->word,
            'settings' => json_encode(['gain' => 0, 'eq' => array_fill(0, 10, 0)]),
            'public' => $this->faker->boolean,
            'color' => $this->faker->hexColor,
        ];
    }
}
