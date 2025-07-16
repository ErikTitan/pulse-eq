/**
 * AudioFileProcessor - Utility class for handling audio file validation, processing, and metadata extraction
 * Supports MP3, WAV, FLAC, and AAC formats with comprehensive error handling
 */

// Error types for specific audio file processing errors
export const AudioFileErrorTypes = {
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  BROWSER_UNSUPPORTED: 'BROWSER_UNSUPPORTED',
  INVALID_FILE: 'INVALID_FILE',
  AUDIO_DECODE_ERROR: 'AUDIO_DECODE_ERROR',
  METADATA_EXTRACTION_FAILED: 'METADATA_EXTRACTION_FAILED',
}

// Error messages corresponding to error types
export const AudioFileErrorMessages = {
  [AudioFileErrorTypes.UNSUPPORTED_FORMAT]:
    'Please select a supported audio format (MP3, WAV, FLAC, AAC)',
  [AudioFileErrorTypes.FILE_TOO_LARGE]: 'File size must be less than 50MB',
  [AudioFileErrorTypes.PROCESSING_FAILED]:
    'Unable to process audio file. Please try a different file.',
  [AudioFileErrorTypes.BROWSER_UNSUPPORTED]: 'Your browser does not support this feature',
  [AudioFileErrorTypes.INVALID_FILE]: 'Invalid or corrupted audio file',
  [AudioFileErrorTypes.AUDIO_DECODE_ERROR]:
    'Failed to decode audio data. The file may be corrupted.',
  [AudioFileErrorTypes.METADATA_EXTRACTION_FAILED]: 'Failed to extract audio metadata',
}

// Custom error class for audio file processing
export class AudioFileError extends Error {
  constructor(type, message = null) {
    super(message || AudioFileErrorMessages[type])
    this.name = 'AudioFileError'
    this.type = type
  }
}

export class AudioFileProcessor {
  // Supported audio MIME types
  static SUPPORTED_MIME_TYPES = [
    'audio/mpeg', // MP3
    'audio/mp3', // MP3 (alternative)
    'audio/wav', // WAV
    'audio/wave', // WAV (alternative)
    'audio/x-wav', // WAV (alternative)
    'audio/flac', // FLAC
    'audio/x-flac', // FLAC (alternative)
    'audio/aac', // AAC
    'audio/mp4', // AAC in MP4 container
    'audio/x-m4a', // AAC (alternative)
  ]

  // Supported file extensions
  static SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.m4a']

  // File size limit (50MB)
  static MAX_FILE_SIZE = 50 * 1024 * 1024

  // Duration limit (10 minutes in seconds)
  static MAX_DURATION = 10 * 60

  /**
   * Check if the browser supports required APIs
   * @returns {boolean} True if browser supports File API and Web Audio API
   */
  static isBrowserSupported() {
    return !!(
      (window.File &&
        window.FileReader &&
        window.URL &&
        window.URL.createObjectURL &&
        window.AudioContext) ||
      window.webkitAudioContext
    )
  }

  /**
   * Validate file type based on MIME type and extension
   * @param {File} file - The file to validate
   * @throws {AudioFileError} If file type is not supported
   */
  static validateFileType(file) {
    if (!file || !(file instanceof File)) {
      throw new AudioFileError(AudioFileErrorTypes.INVALID_FILE)
    }

    // Check MIME type
    const mimeTypeValid = this.SUPPORTED_MIME_TYPES.includes(file.type.toLowerCase())

    // Check file extension as fallback
    const fileName = file.name.toLowerCase()
    const extensionValid = this.SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext))

    if (!mimeTypeValid && !extensionValid) {
      throw new AudioFileError(AudioFileErrorTypes.UNSUPPORTED_FORMAT)
    }
  }

  /**
   * Validate file size
   * @param {File} file - The file to validate
   * @throws {AudioFileError} If file is too large
   */
  static validateFileSize(file) {
    if (!file || !(file instanceof File)) {
      throw new AudioFileError(AudioFileErrorTypes.INVALID_FILE)
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new AudioFileError(AudioFileErrorTypes.FILE_TOO_LARGE)
    }
  }

  /**
   * Perform comprehensive file validation
   * @param {File} file - The file to validate
   * @throws {AudioFileError} If any validation fails
   */
  static async validateFile(file) {
    // Check browser support
    if (!this.isBrowserSupported()) {
      throw new AudioFileError(AudioFileErrorTypes.BROWSER_UNSUPPORTED)
    }

    // Validate file type and size
    this.validateFileType(file)
    this.validateFileSize(file)

    return true
  }

  /**
   * Extract metadata from audio file using Web Audio API
   * @param {File} file - The audio file
   * @param {AudioContext} audioContext - Web Audio API context
   * @returns {Promise<Object>} Object containing metadata and the (potentially trimmed) AudioBuffer
   * @throws {AudioFileError} If metadata extraction fails
   */
  static async extractMetadata(file, audioContext = null) {
    try {
      // Create AudioContext if not provided
      if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (!AudioContextClass) {
          throw new AudioFileError(AudioFileErrorTypes.BROWSER_UNSUPPORTED)
        }
        audioContext = new AudioContextClass()
      }

      // Read file as ArrayBuffer
      const arrayBuffer = await this.fileToArrayBuffer(file)

      // Decode audio data
      let audioBuffer
      try {
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      } catch (decodeError) {
        console.error('Audio decode error:', decodeError)
        throw new AudioFileError(AudioFileErrorTypes.AUDIO_DECODE_ERROR)
      }

      // Trim audio if it exceeds the max duration
      if (audioBuffer.duration > this.MAX_DURATION) {
        const originalDuration = audioBuffer.duration
        const sampleRate = audioBuffer.sampleRate
        const frameCount = Math.floor(this.MAX_DURATION * sampleRate)

        const trimmedBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          frameCount,
          sampleRate,
        )

        for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
          const channelData = audioBuffer.getChannelData(i)
          const trimmedChannelData = trimmedBuffer.getChannelData(i)
          trimmedChannelData.set(channelData.subarray(0, frameCount))
        }

        console.log(`Audio trimmed from ${originalDuration.toFixed(2)}s to ${this.MAX_DURATION}s`)
        audioBuffer = trimmedBuffer
      }

      // Extract metadata from the (potentially trimmed) buffer
      const metadata = {
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        numberOfChannels: audioBuffer.numberOfChannels,
        length: audioBuffer.length,
      }

      return { metadata, audioBuffer }
    } catch (error) {
      if (error instanceof AudioFileError) {
        throw error
      }
      console.error('Metadata extraction failed:', error)
      throw new AudioFileError(AudioFileErrorTypes.METADATA_EXTRACTION_FAILED)
    }
  }

  /**
   * Convert File to ArrayBuffer
   * @param {File} file - The file to convert
   * @returns {Promise<ArrayBuffer>} The file data as ArrayBuffer
   * @throws {AudioFileError} If reading fails
   */
  static fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        resolve(event.target.result)
      }

      reader.onerror = () => {
        reject(new AudioFileError(AudioFileErrorTypes.PROCESSING_FAILED))
      }

      reader.readAsArrayBuffer(file)
    })
  }

  /**
   * Create object URL for file
   * @param {File} file - The file to create URL for
   * @returns {string} Object URL
   * @throws {AudioFileError} If URL creation fails
   */
  static createObjectUrl(file) {
    try {
      if (!file || !(file instanceof File)) {
        throw new AudioFileError(AudioFileErrorTypes.INVALID_FILE)
      }

      if (!window.URL || !window.URL.createObjectURL) {
        throw new AudioFileError(AudioFileErrorTypes.BROWSER_UNSUPPORTED)
      }

      return URL.createObjectURL(file)
    } catch (error) {
      if (error instanceof AudioFileError) {
        throw error
      }
      throw new AudioFileError(AudioFileErrorTypes.PROCESSING_FAILED)
    }
  }

  /**
   * Revoke object URL to free memory
   * @param {string} url - The object URL to revoke
   */
  static revokeObjectUrl(url) {
    try {
      if (url && typeof url === 'string' && window.URL && window.URL.revokeObjectURL) {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.warn('Failed to revoke object URL:', error)
    }
  }

  /**
   * Process audio file with full validation and metadata extraction
   * @param {File} file - The audio file to process
   * @param {AudioContext} audioContext - Optional AudioContext instance
   * @returns {Promise<Object>} Processed file data with metadata, AudioBuffer, and object URL
   * @throws {AudioFileError} If processing fails
   */
  static async processFile(file, audioContext = null) {
    try {
      // Validate file (type and size)
      await this.validateFile(file)

      // Extract metadata and get the AudioBuffer (which may be trimmed)
      const { metadata, audioBuffer } = await this.extractMetadata(file, audioContext)

      // Create a Blob and Object URL from the final AudioBuffer
      const blob = this.audioBufferToWavBlob(audioBuffer)
      const objectUrl = URL.createObjectURL(blob)

      // Return processed file data
      return {
        id: this.generateFileId(),
        name: file.name,
        size: blob.size, // Use the new blob's size
        type: blob.type, // Use the new blob's type
        file: file, // Keep original file reference if needed
        audioBuffer: audioBuffer, // The processed AudioBuffer
        objectUrl: objectUrl,
        metadata: metadata,
        duration: metadata.duration,
        sampleRate: metadata.sampleRate,
        numberOfChannels: metadata.numberOfChannels,
        uploadedAt: new Date(),
        isDefault: false,
      }
    } catch (error) {
      if (error instanceof AudioFileError) {
        throw error
      }
      console.error('File processing failed:', error)
      throw new AudioFileError(AudioFileErrorTypes.PROCESSING_FAILED)
    }
  }

  /**
   * Generate unique file ID
   * @returns {string} Unique identifier
   */
  static generateFileId() {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Clean up file resources
   * @param {Object} processedFile - Processed file object with objectUrl
   */
  static cleanupFile(processedFile) {
    if (processedFile && processedFile.objectUrl) {
      this.revokeObjectUrl(processedFile.objectUrl)
    }
  }

  /**
   * Get human-readable file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Format duration in seconds to human-readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration (e.g., "3:45")
   */
  static formatDuration(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '0:00'
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  /**
   * Convert an AudioBuffer to a WAV file (Blob)
   * @param {AudioBuffer} buffer - The buffer to convert
   * @returns {Blob} A blob representing the WAV file
   */
  static audioBufferToWavBlob(buffer) {
    const numOfChan = buffer.numberOfChannels
    const length = buffer.length * numOfChan * 2 + 44
    const bufferArray = new ArrayBuffer(length)
    const view = new DataView(bufferArray)
    const channels = []
    let i
    let sample
    let offset = 0
    let pos = 0

    // Write WAV container
    // RIFF chunk descriptor
    this.writeUTFBytes(view, pos, 'RIFF')
    pos += 4
    view.setUint32(pos, length - 8, true)
    pos += 4
    this.writeUTFBytes(view, pos, 'WAVE')
    pos += 4

    // FMT sub-chunk
    this.writeUTFBytes(view, pos, 'fmt ')
    pos += 4
    view.setUint32(pos, 16, true) // Sub-chunk size
    pos += 4
    view.setUint16(pos, 1, true) // Audio format (1 is PCM)
    pos += 2
    view.setUint16(pos, numOfChan, true) // Number of channels
    pos += 2
    view.setUint32(pos, buffer.sampleRate, true) // Sample rate
    pos += 4
    view.setUint32(pos, buffer.sampleRate * 2 * numOfChan, true) // Byte rate
    pos += 4
    view.setUint16(pos, numOfChan * 2, true) // Block align
    pos += 2
    view.setUint16(pos, 16, true) // Bits per sample
    pos += 2

    // Data sub-chunk
    this.writeUTFBytes(view, pos, 'data')
    pos += 4
    view.setUint32(pos, length - pos - 4, true)
    pos += 4

    // Write the PCM samples
    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i))
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // Interleave channels
        sample = Math.max(-1, Math.min(1, channels[i][offset])) // Clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // Scale to 16-bit signed int
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  /**
   * Helper to write a string to a DataView
   * @param {DataView} view - The DataView to write to
   * @param {number} offset - The offset to start writing at
   * @param {string} string - The string to write
   */
  static writeUTFBytes(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
}

export default AudioFileProcessor
