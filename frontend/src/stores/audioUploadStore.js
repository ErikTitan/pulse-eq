import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import AudioFileProcessor, {
  AudioFileError,
  AudioFileErrorTypes,
} from '../utils/AudioFileProcessor.js'
import { useToast } from '@/utils/toast'
import { saveAudioFile, getAudioFiles, deleteAudioFile, clearAudioFiles } from '@/utils/indexedDB'

export const useAudioUploadStore = defineStore('audioUpload', {
  state: () => ({
    // Uploaded files array
    uploadedFiles: [],

    // Selected audio source (default or file ID)
    selectedAudioSource: 'default',

    // Processing status
    isProcessing: false,
    processingProgress: 0,

    // Current audio file reference
    currentAudioFile: null,

    // Original/processed audio toggle for preset comparison
    isOriginalAudio: true,

    // Error handling
    lastError: null,

    // Audio context for processing
    audioContext: null,
  }),

  getters: {
    // Get currently selected audio file
    selectedFile: (state) => {
      if (state.selectedAudioSource === 'default') {
        return null
      }
      return state.uploadedFiles.find((file) => file.id === state.selectedAudioSource) || null
    },

    // Check if any files are uploaded
    hasUploadedFiles: (state) => state.uploadedFiles.length > 0,

    // Get file count
    fileCount: (state) => state.uploadedFiles.length,

    // Check if a non-default source is selected
    hasCustomAudioSelected: (state) => state.selectedAudioSource !== 'default',

    // Get audio sources for dropdown
    audioSources: (state) => {
      const sources = [{ id: 'default', name: 'Default Sample', isDefault: true }]

      state.uploadedFiles.forEach((file) => {
        sources.push({
          id: file.id,
          name: file.name,
          isDefault: false,
          duration: file.duration,
          size: file.size,
        })
      })

      return sources
    },

    // Get current audio URL (for playback)
    currentAudioUrl: (state) => {
      const selectedFile = state.uploadedFiles.find((file) => file.id === state.selectedAudioSource)
      return selectedFile ? selectedFile.objectUrl : null
    },
  },

  persist: {
    key: 'audio-upload-state',
    paths: ['selectedAudioSource', 'isOriginalAudio'],
  },

  actions: {
    // Initialize store from IndexedDB
    async initStore() {
      try {
        const files = await getAudioFiles()
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        // Clear existing files before pushing new ones to prevent duplication on HMR
        this.uploadedFiles = []

        for (const file of files) {
          const uploadedAtTime = new Date(file.uploadedAt).getTime()

          if (now - uploadedAtTime > twentyFourHours) {
            // Delete expired file from DB
            await deleteAudioFile(file.id)
            continue
          }

          // Restore file
          const objectUrl = URL.createObjectURL(file.blob)

          this.uploadedFiles.push({
            ...file,
            objectUrl,
            audioBuffer: null, // Rely on standard <audio> tag playback for restored files to avoid browser decode blocks
            isDefault: false,
          })
        }

        // Keep track of what we loaded with
        const initialSelection = this.selectedAudioSource

        // Validate selectedAudioSource
        if (initialSelection !== 'default' && !this.getFileById(initialSelection)) {
          this.selectedAudioSource = 'default'
        }

        // Trigger EqualizerView watcher by temporarily clearing selection
        if (this.selectedAudioSource !== 'default') {
          this.setSelectedAudioSource('default')
          // Yield to Vue reactivity system briefly
          setTimeout(() => {
            this.setSelectedAudioSource(initialSelection)
          }, 10)
        } else {
          this.setSelectedAudioSource('default')
        }

        console.log(`[audioUploadStore] Restored ${this.uploadedFiles.length} files from DB.`)
      } catch (error) {
        console.error('[audioUploadStore] Failed to initialize from DB:', error)
      }
    },

    // Initialize audio context
    initializeAudioContext() {
      if (!this.audioContext || typeof this.audioContext.decodeAudioData !== 'function') {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (AudioContextClass) {
          this.audioContext = markRaw(new AudioContextClass())
        }
      }
      return this.audioContext
    },

    // Process and add uploaded file
    async processFile(file) {
      this.isProcessing = true
      this.processingProgress = 0
      this.lastError = null
      let progressInterval = null

      try {
        // Initialize audio context if needed
        this.initializeAudioContext()

        // Simulate progress updates
        progressInterval = setInterval(() => {
          if (this.processingProgress < 90) {
            this.processingProgress += 1
          }
        }, 15)

        // Process file using AudioFileProcessor
        const processedFile = await AudioFileProcessor.processFile(file, this.audioContext)

        // Save to IndexedDB (excluding the large audioBuffer, storing just the blob)
        const fileToSave = {
          id: processedFile.id,
          name: processedFile.name,
          size: processedFile.size,
          type: processedFile.type,
          duration: processedFile.duration,
          sampleRate: processedFile.sampleRate,
          numberOfChannels: processedFile.numberOfChannels,
          uploadedAt: processedFile.uploadedAt,
          blob: processedFile.blob,
          isDefault: processedFile.isDefault,
        }
        await saveAudioFile(fileToSave)

        // Add to uploaded files
        this.uploadedFiles.push(processedFile)
        console.log('[audioUploadStore] Processed file:', processedFile)

        // Set as current audio file and buffer
        this.currentAudioFile = processedFile

        // Find the file in the state and attach the buffer
        const fileInState = this.uploadedFiles.find((f) => f.id === processedFile.id)
        if (fileInState && processedFile.audioBuffer) {
          fileInState.audioBuffer = markRaw(processedFile.audioBuffer)
          console.log(
            '[audioUploadStore] AudioBuffer attached to file in state:',
            fileInState.audioBuffer,
          )
        }

        // Auto-select the uploaded file
        this.selectedAudioSource = processedFile.id

        this.processingProgress = 100

        const toast = useToast()
        if (toast) {
          toast.add({
            severity: 'success',
            summary: 'File Uploaded',
            detail: `Successfully processed "${processedFile.name}".`,
            life: 3000,
          })
        }

        return processedFile
      } catch (error) {
        console.error('File processing failed:', error)
        this.lastError =
          error instanceof AudioFileError
            ? error
            : new AudioFileError(AudioFileErrorTypes.PROCESSING_FAILED)

        const toast = useToast()
        if (toast) {
          toast.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: this.lastError.message,
            life: 5000,
          })
        }

        throw this.lastError
      } finally {
        clearInterval(progressInterval)
        this.isProcessing = false
        // Reset progress after a short delay
        setTimeout(() => {
          this.processingProgress = 0
        }, 1000)
      }
    },

    // Add multiple files (for future batch upload support)
    async processFiles(files) {
      const results = []
      for (const file of files) {
        try {
          const result = await this.processFile(file)
          results.push({ success: true, file: result })
        } catch (error) {
          results.push({ success: false, error, fileName: file.name })
        }
      }
      return results
    },

    // Remove uploaded file
    removeFile(fileId) {
      const fileIndex = this.uploadedFiles.findIndex((file) => file.id === fileId)

      if (fileIndex !== -1) {
        const file = this.uploadedFiles[fileIndex]

        // Clean up object URL to prevent memory leaks
        AudioFileProcessor.revokeObjectUrl(file.objectUrl)

        // Remove from DB
        deleteAudioFile(fileId).catch(console.error)

        // Remove from array
        this.uploadedFiles.splice(fileIndex, 1)

        // If this was the selected file, switch to default
        if (this.selectedAudioSource === fileId) {
          this.selectedAudioSource = 'default'
          this.currentAudioFile = null
        }

        return true
      }

      return false
    },

    // Clear all uploaded files
    clearAllFiles() {
      // Clean up all object URLs
      this.uploadedFiles.forEach((file) => {
        AudioFileProcessor.cleanupFile(file)
      })

      // Clear IndexedDB
      clearAudioFiles().catch(console.error)

      // Reset state
      this.uploadedFiles = []
      this.selectedAudioSource = 'default'
      this.currentAudioFile = null
      this.isOriginalAudio = true
    },

    // Set selected audio source
    setSelectedAudioSource(sourceId) {
      this.selectedAudioSource = sourceId
      console.log(`[audioUploadStore] setSelectedAudioSource: ${sourceId}`)

      if (sourceId === 'default') {
        this.currentAudioFile = null
      } else {
        this.currentAudioFile = this.uploadedFiles.find((file) => file.id === sourceId) || null
        console.log('[audioUploadStore] Found file in store:', this.currentAudioFile)
      }

      // Reset to original audio when switching sources
      this.isOriginalAudio = true
    },

    // Toggle between original and processed audio for comparison
    toggleOriginalAudio() {
      // Only allow toggle if a custom file is selected
      if (this.selectedAudioSource !== 'default') {
        this.isOriginalAudio = !this.isOriginalAudio
      }
    },

    // Set original/processed audio mode
    setOriginalAudio(isOriginal) {
      if (this.selectedAudioSource !== 'default') {
        this.isOriginalAudio = isOriginal
      }
    },

    // Get file by ID
    getFileById(fileId) {
      return this.uploadedFiles.find((file) => file.id === fileId) || null
    },

    // Check if file exists
    hasFile(fileId) {
      return this.uploadedFiles.some((file) => file.id === fileId)
    },

    // Update file metadata (for future use)
    updateFileMetadata(fileId, metadata) {
      const file = this.uploadedFiles.find((file) => file.id === fileId)
      if (file) {
        Object.assign(file, metadata)
        return true
      }
      return false
    },

    // Clear error state
    clearError() {
      this.lastError = null
    },

    // Cleanup resources when store is destroyed
    cleanup() {
      // Clean up all object URLs
      this.uploadedFiles.forEach((file) => {
        AudioFileProcessor.cleanupFile(file)
      })

      // Close audio context if it exists
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close()
      }
    },

    // Session cleanup (called on app unmount or page unload)
    sessionCleanup() {
      this.cleanup()
      this.$reset()
    },

    // Cleanup expired files on startup
    cleanupExpiredFiles() {
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

      // Get a list of file IDs to remove
      const expiredFileIds = this.uploadedFiles
        .filter((file) => {
          if (!file.uploadedAt) {
            // If uploadedAt is missing, treat it as expired to be safe
            return true
          }
          const uploadedAtTime = new Date(file.uploadedAt).getTime()
          return now - uploadedAtTime > twentyFourHours
        })
        .map((file) => file.id)

      // Remove the files
      if (expiredFileIds.length > 0) {
        console.log(`Cleaning up ${expiredFileIds.length} expired temporary files.`)
        expiredFileIds.forEach((fileId) => {
          this.removeFile(fileId)
        })
      }
    },
  },
})
