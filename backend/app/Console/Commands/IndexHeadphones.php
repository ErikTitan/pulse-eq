<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use App\Models\Headphone;

class IndexHeadphones extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:index-headphones';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Index headphones from AutoEq results into the database';

    protected $filterTypeMap = [
        'PK' => 'peaking12',
        'LSC' => 'lowshelf12',
        'HSC' => 'highshelf12',
        'LPQ' => 'lowpass12',
        'HPQ' => 'highpass12',
        'BP' => 'bandpass12',
        'NO' => 'notch12',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $resultsPath = storage_path('app/autoeq_results');

        if (!File::isDirectory($resultsPath)) {
            $this->error("Directory not found: {$resultsPath}");
            return;
        }

        $this->info("Scanning directory: {$resultsPath}");

        $files = File::allFiles($resultsPath);
        $count = 0;

        foreach ($files as $file) {
            if (str_ends_with($file->getFilename(), 'ParametricEQ.txt')) {
                // Determine source and headphone name from path
                // Path format: storage/app/autoeq_results/source/form_factor/Headphone Name/Headphone Name ParametricEQ.txt
                
                $path = $file->getPathname();
                $relativePath = str_replace($resultsPath . '/', '', $path);
                $parts = explode('/', $relativePath);
                
                if (count($parts) >= 3) {
                    $source = $parts[0];
                    $fullName = basename($file->getPath());
                } else {
                    $fullName = basename($file->getPath());
                    $source = 'Unknown';
                }

                // Split fullName into brand and model
                $nameParts = explode(' ', $fullName, 2);
                $brand = $nameParts[0];
                $model = $nameParts[1] ?? $fullName; // If no space, use full name for both

                $parsedData = $this->parseEqFile($path);

                if ($parsedData) {
                    Headphone::updateOrCreate(
                        [
                            'brand' => $brand,
                            'model' => $model,
                            'source' => $source,
                        ],
                        [
                            'preamp' => $parsedData['preamp'],
                            'filters' => $parsedData['filters'],
                        ]
                    );
                    $count++;

                    if ($count % 100 === 0) {
                        $this->info("Indexed {$count} headphones...");
                    }
                }
            }
        }

        $this->info("Indexing complete. Total indexed: {$count}");
    }

    protected function parseEqFile($filePath)
    {
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $preamp = 0;
        $filters = [];

        foreach ($lines as $line) {
            if (str_starts_with($line, 'Preamp:')) {
                // Preamp: -6.5 dB
                if (preg_match('/Preamp:\s*([-\d.]+)\s*dB/', $line, $matches)) {
                    $preamp = (float)$matches[1];
                }
            } elseif (str_starts_with($line, 'Filter')) {
                // Filter 1: ON PK Fc 30 Hz Gain 3.5 dB Q 1.4
                if (preg_match('/Filter \d+: ON ([A-Z]+) Fc ([\d.]+) Hz Gain ([\d.-]+) dB Q ([\d.]+)/', $line, $matches)) {
                    $type = $matches[1];
                    $fc = (float)$matches[2];
                    $gain = (float)$matches[3];
                    $q = (float)$matches[4];

                    $mappedType = $this->filterTypeMap[$type] ?? null;
                    if ($mappedType) {
                        $filters[] = [
                            'type' => $mappedType,
                            'frequency' => $fc,
                            'gain' => $gain,
                            'Q' => $q,
                            'bypass' => false,
                        ];
                    }
                }
            }
        }

        if (empty($filters)) {
            return null;
        }

        return [
            'preamp' => $preamp,
            'filters' => $filters,
        ];
    }
}