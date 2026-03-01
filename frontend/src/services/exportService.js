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

export function downloadEqualizerApoConfig(config, filename = 'pulse-eq-export.txt') {
  const blob = new Blob([config], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()

  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
