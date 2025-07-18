/**
 * SEO Manager Utility
 * Handles dynamic meta tags, Open Graph, Twitter Cards, and JSON-LD structured data
 */

export class SEOManager {
  constructor() {
    this.originalTitle = document.title
    this.originalDescription = this.getMetaContent('description')
  }

  /**
   * Set page title
   */
  setTitle(title) {
    document.title = title
  }

  /**
   * Set meta description
   */
  setDescription(description) {
    this.setMetaContent('description', description)
  }

  /**
   * Set Open Graph meta tags
   */
  setOpenGraph(data) {
    if (!data || typeof data !== 'object') return

    if (data.title) this.setMetaProperty('og:title', data.title)
    if (data.description) this.setMetaProperty('og:description', data.description)
    this.setMetaProperty('og:url', data.url || window.location.href)
    this.setMetaProperty('og:type', data.type || 'website')
    this.setMetaProperty('og:site_name', data.siteName || 'PulseEQ')

    if (data.image) {
      this.setMetaProperty('og:image', data.image)
      this.setMetaProperty('og:image:alt', data.imageAlt || data.title || 'PulseEQ')
    }
  }

  /**
   * Set Twitter Card meta tags
   */
  setTwitterCard(data) {
    if (!data || typeof data !== 'object') return

    this.setMetaName('twitter:card', data.card || 'summary')
    if (data.title) this.setMetaName('twitter:title', data.title)
    if (data.description) this.setMetaName('twitter:description', data.description)

    if (data.image) {
      this.setMetaName('twitter:image', data.image)
      this.setMetaName('twitter:image:alt', data.imageAlt || data.title || 'PulseEQ')
    }
  }

  /**
   * Add JSON-LD structured data
   */
  setStructuredData(data) {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  /**
   * Set canonical URL
   */
  setCanonical(url) {
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    link.setAttribute('href', url || window.location.href)
  }

  /**
   * Set complete SEO data for a preset
   */
  setPresetSEO(preset) {
    if (!preset || !preset.name) return

    const title = `${preset.name} - PulseEQ`
    const description = preset.description
      ? `Download and use the '${preset.name}' preset by ${preset.creator}. ${preset.description}`
      : `Download and use the '${preset.name}' audio equalizer preset by ${preset.creator || 'Unknown'}.`

    // Basic meta tags
    this.setTitle(title)
    this.setDescription(description)
    this.setCanonical()

    // Open Graph
    this.setOpenGraph({
      title,
      description,
      type: 'website',
      siteName: 'PulseEQ',
    })

    // Twitter Card
    this.setTwitterCard({
      title,
      description,
      card: 'summary',
    })

    // JSON-LD Structured Data
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: preset.name,
      description: preset.description || `Audio equalizer preset: ${preset.name}`,
      applicationCategory: 'AudioApplication',
      operatingSystem: 'Web Browser',
      author: preset.creator
        ? {
            '@type': 'Person',
            name: preset.creator,
          }
        : undefined,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating:
        preset.rating && preset.rating > 0
          ? {
              '@type': 'AggregateRating',
              ratingValue: preset.rating,
              ratingCount: preset.usageCount || 1,
            }
          : undefined,
    })
  }

  /**
   * Reset to original SEO data
   */
  reset() {
    this.setTitle(this.originalTitle)
    this.setDescription(this.originalDescription)
    this.removeOpenGraph()
    this.removeTwitterCard()
    this.removeStructuredData()
  }

  // Helper methods
  getMetaContent(name) {
    const meta = document.querySelector(`meta[name="${name}"]`)
    return meta ? meta.getAttribute('content') : ''
  }

  setMetaContent(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  setMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  setMetaName(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', name)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  removeOpenGraph() {
    const ogTags = document.querySelectorAll('meta[property^="og:"]')
    ogTags.forEach((tag) => tag.remove())
  }

  removeTwitterCard() {
    const twitterTags = document.querySelectorAll('meta[name^="twitter:"]')
    twitterTags.forEach((tag) => tag.remove())
  }

  removeStructuredData() {
    const script = document.querySelector('script[type="application/ld+json"]')
    if (script) {
      script.remove()
    }
  }
}

// Export singleton instance
export const seoManager = new SEOManager()
