// Presets service for managing preset data
// This will later be replaced with actual API calls to the server

// Base templates for generating varied presets
const presetTemplates = [
  {
    namePrefix: 'Gaming',
    creators: ['ProGamer', 'GameMaster', 'AudioWizard', 'FPSExpert'],
    category: 'gaming',
    tagOptions: [
      ['Gaming', 'FPS', 'HD600'],
      ['Competitive', 'Bass Boost', 'HD650'],
      ['RPG', 'Immersive', 'DT990'],
      ['Racing', 'Clear', 'AirPods Pro'],
    ],
    eqCurves: [
      [-2, -1, 0, 3, 2],
      [1, 2, -1, 4, 1],
      [0, 1, 2, 0, -1],
      [-1, 0, 1, 2, 1],
    ],
    colors: ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b'],
  },
  {
    namePrefix: 'Music',
    creators: ['AudioMaster', 'MusicLover', 'SoundEngineer', 'AudioPhile'],
    category: 'music',
    tagOptions: [
      ['Music', 'Reference', 'HD650'],
      ['Vocals', 'Warm', 'Sony WH-1000XM4'],
      ['Bass', 'EDM', 'HD600'],
      ['Classical', 'Clear', 'DT990'],
    ],
    eqCurves: [
      [0, -1, 1, 2, -1],
      [0, 1, 2, 1, -1],
      [3, 2, 0, -1, 0],
      [-1, 0, 1, 3, 2],
    ],
    colors: ['#f59e0b', '#ef4444', '#10b981', '#f97316'],
  },
  {
    namePrefix: 'Studio',
    creators: ['StudioPro', 'MixMaster', 'Producer', 'AudioTech'],
    category: 'correction',
    tagOptions: [
      ['Studio', 'Flat', 'HD600'],
      ['Monitor', 'Reference', 'DT990'],
      ['Correction', 'Neutral', 'HD650'],
      ['Professional', 'Accurate', 'AirPods Pro'],
    ],
    eqCurves: [
      [-1, 0, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [-0.5, 0.5, 0, -0.5, 0.5],
      [0, -1, 0, 1, -1],
    ],
    colors: ['#8b5cf6', '#6366f1', '#14b8a6', '#84cc16'],
  },
]

const nameSuffixes = [
  'Pro',
  'Master',
  'Elite',
  'Special',
  'Perfect',
  'Beast Mode',
  'Ultimate',
  'Premium',
  'Enhanced',
  'Crystal',
  'Boost',
  'Clarity',
  'Perfection',
  'Excellence',
  'Supreme',
]

// Generate a single preset based on template and index
function generatePreset(template, index, isDummy = false) {
  const randomIndex = index % template.creators.length
  const nameIndex = index % nameSuffixes.length
  const curveIndex = index % template.eqCurves.length
  const tagIndex = index % template.tagOptions.length

  const baseUsage = isDummy
    ? Math.floor(Math.random() * 15000) + 5000
    : Math.floor(Math.random() * 25000) + 10000
  const rating = (Math.random() * 1.0 + 4.0).toFixed(1) // 4.0 to 5.0

  return {
    id: isDummy ? `dummy_${template.category}_${index}` : `${template.category}_${index}`,
    name: `${template.namePrefix} ${nameSuffixes[nameIndex]}`,
    creator: template.creators[randomIndex],
    category: template.category,
    tags: template.tagOptions[tagIndex],
    usageCount: baseUsage,
    rating: parseFloat(rating),
    isStaffPick: Math.random() > 0.7, // 30% chance of being staff pick
    chartData: {
      labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
      datasets: [
        {
          label: 'EQ Curve',
          data: template.eqCurves[curveIndex],
          borderColor: template.colors[curveIndex],
          tension: 0.4,
        },
      ],
    },
  }
}

// Generate multiple presets from all templates
export function generatePresets(count = 6, isDummy = false) {
  const presets = []
  let presetId = 0

  // Cycle through templates to ensure variety
  for (let i = 0; i < count; i++) {
    const templateIndex = i % presetTemplates.length
    const template = presetTemplates[templateIndex]
    const presetIndexInTemplate = Math.floor(i / presetTemplates.length)

    presets.push(generatePreset(template, presetIndexInTemplate, isDummy))
    presetId++
  }

  return presets
}

// Generate real presets (for authenticated users)
export function getRealPresets() {
  return generatePresets(1, false) // Start with 1 real preset, will be expanded later
}

// Generate dummy presets (for non-authenticated users)
export function getDummyPresets() {
  return generatePresets(9, true)
}

// Future: This will be replaced with actual API calls
export async function fetchPresetsFromServer() {
  // TODO: Implement actual API call
  // return await apiClient.get('/api/presets');
  return getRealPresets()
}

export async function savePresetToServer(presetData) {
  // TODO: Implement actual API call
  // return await apiClient.post('/api/presets', presetData);
  console.log('Saving preset to server:', presetData)
}
