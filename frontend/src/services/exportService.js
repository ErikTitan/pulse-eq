export const SUPPORTED_APPS = [
  { id: 'apo', name: 'EqualizerAPO / Peace', ext: '.txt', mime: 'text/plain' },
  { id: 'soundsource', name: 'SoundSource', ext: '.txt', mime: 'text/plain' },
  { id: 'ears', name: 'Ears (Chrome Extension)', ext: '.json', mime: 'application/json' },
  { id: 'rockbox', name: 'Rockbox', ext: '.cfg', mime: 'text/plain' },
  { id: 'voicemeeter', name: 'Voicemeeter', ext: '.xml', mime: 'application/xml' },
]

const typeMapping = {
  lowpass12: 'LP',
  lowpass24: 'LP',
  highpass12: 'HP',
  highpass24: 'HP',
  bandpass12: 'BP',
  bandpass24: 'BP',
  lowshelf12: 'LS',
  lowshelf24: 'LS',
  highshelf12: 'HS',
  highshelf24: 'HS',
  peaking12: 'PK',
  peaking24: 'PK',
  notch12: 'NO',
  notch24: 'NO',
}

export function generateEqualizerApoConfig(filters, preamp = 0) {
  let config = `Preamp: ${preamp.toFixed(1)} dB\n`

  let filterIndex = 1
  filters.forEach((filter) => {
    if (filter.type === 'noop') return

    const apoType = typeMapping[filter.type]
    if (!apoType) return

    const state = filter.bypass ? 'OFF' : 'ON'
    let line = `Filter ${filterIndex}: ${state} ${apoType} Fc ${filter.frequency.toFixed(1)} Hz`

    if (['LS', 'HS', 'PK'].includes(apoType)) {
      line += ` Gain ${filter.gain.toFixed(1)} dB`
    }

    if (['LP', 'HP', 'BP', 'PK', 'NO'].includes(apoType)) {
      line += ` Q ${filter.Q.toFixed(2)}`
    }

    config += line + '\n'
    filterIndex++
  })

  return config
}

export function generateExportConfig(appId, filters, preamp = 0, name = 'Pulse-EQ Preset') {
  if (appId === 'apo' || appId === 'soundsource') {
    return generateEqualizerApoConfig(filters, preamp)
  }

  const activeFilters = filters.filter((f) => !f.bypass && f.type !== 'noop')

  const mappedFilters = activeFilters
    .map((f) => {
      let baseType = 'PEAKING'
      if (f.type.includes('lowshelf')) baseType = 'LOW_SHELF'
      else if (f.type.includes('highshelf')) baseType = 'HIGH_SHELF'

      return {
        fc: f.frequency,
        gain: f.gain || 0,
        q: f.Q || 1,
        type: baseType,
      }
    })
    .filter((f) => ['PEAKING', 'LOW_SHELF', 'HIGH_SHELF'].includes(f.type))

  switch (appId) {
    case 'ears':
      return JSON.stringify(
        {
          [name]: {
            frequencies: mappedFilters.map((filter) => filter.fc),
            gains: mappedFilters.map((filter) => filter.gain),
            qs: mappedFilters.map((filter) => filter.q),
          },
        },
        null,
        2,
      )

    case 'rockbox': {
      const filterTypesRockbox = {
        LOW_SHELF: 'low shelf',
        PEAKING: 'peak',
        HIGH_SHELF: 'high shelf',
      }
      const linesRockbox = [
        'eq enabled: on',
        `eq precut: ${Math.max(0, Math.round(preamp * -10)).toFixed(0)}`,
      ]
      mappedFilters.forEach((filt, i) => {
        let line = `eq ${filterTypesRockbox[filt.type]} filter`
        if (filt.type === 'PEAKING') {
          line += ` ${i}`
        }
        line += `: ${Math.round(filt.fc).toFixed(0)}, `
        line += `${Math.round(filt.q * 10).toFixed(0)}, `
        line += `${Math.round(filt.gain * 10).toFixed(0)}`
        linesRockbox.push(line)
      })
      return linesRockbox.join('\n')
    }

    case 'voicemeeter': {
      const filterTypesVm = {
        LOW_SHELF: '5',
        PEAKING: '0',
        HIGH_SHELF: '6',
      }
      const linesVm = [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<VBAudioVoicemeeterBUSEQConfig>',
        '<VoiceMeeterBUSEQ>',
      ]
      for (let channel = 1; channel < 9; ++channel) {
        mappedFilters.forEach((filt, i) => {
          linesVm.push(
            `<Bus index="1" channel="${channel}" cell="${i + 1}" EQon="1" EQtype="${filterTypesVm[filt.type]}" dblevel="${filt.gain.toFixed(2)}" freq="${filt.fc.toFixed(2)}" Q="${filt.q.toFixed(2)}" />`,
          )
        })
      }
      linesVm.push('</VoiceMeeterBUSEQ>')
      linesVm.push('</VBAudioVoicemeeterBUSEQConfig>')
      return linesVm.join('\n')
    }

    default:
      return ''
  }
}

export function downloadConfig(config, filename, mimeType = 'text/plain') {
  const blob = new Blob([config], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
