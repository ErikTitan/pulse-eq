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
    isOriginalAudio: false,

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
    async initStore() {
      try {
        const files = await getAudioFiles()
        const now = Date.now()
        const twentyFourHours = 24 * 60 * 60 * 1000

        this.uploadedFiles = []

        for (const file of files) {
          const uploadedAtTime = new Date(file.uploadedAt).getTime()

          if (now - uploadedAtTime > twentyFourHours) {
            await deleteAudioFile(file.id)
            continue
          }

          const objectUrl = URL.createObjectURL(file.blob)

          this.uploadedFiles.push({
            ...file,
            objectUrl,
            audioBuffer: null,
            isDefault: false,
          })
        }

        const initialSelection = this.selectedAudioSource

        if (initialSelection !== 'default' && !this.getFileById(initialSelection)) {
          this.selectedAudioSource = 'default'
        }

        if (this.selectedAudioSource !== 'default') {
          this.setSelectedAudioSource('default')
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

    async processFile(file) {
      this.isProcessing = true
      this.processingProgress = 0
      this.lastError = null
      let progressInterval = null

      try {
        this.initializeAudioContext()

        progressInterval = setInterval(() => {
          if (this.processingProgress < 90) {
            this.processingProgress += 1
          }
        }, 15)

        const processedFile = await AudioFileProcessor.processFile(file, this.audioContext)

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

        this.uploadedFiles.push(processedFile)
        console.log('[audioUploadStore] Processed file:', processedFile)

        this.currentAudioFile = processedFile

        const fileInState = this.uploadedFiles.find((f) => f.id === processedFile.id)
        if (fileInState && processedFile.audioBuffer) {
          fileInState.audioBuffer = markRaw(processedFile.audioBuffer)
          console.log(
            '[audioUploadStore] AudioBuffer attached to file in state:',
            fileInState.audioBuffer,
          )
        }

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

    removeFile(fileId) {
      const fileIndex = this.uploadedFiles.findIndex((file) => file.id === fileId)

      if (fileIndex !== -1) {
        const file = this.uploadedFiles[fileIndex]

        AudioFileProcessor.revokeObjectUrl(file.objectUrl)

        deleteAudioFile(fileId).catch(console.error)

        this.uploadedFiles.splice(fileIndex, 1)

        if (this.selectedAudioSource === fileId) {
          this.selectedAudioSource = 'default'
          this.currentAudioFile = null
        }

        return true
      }

      return false
    },

    clearAllFiles() {
      this.uploadedFiles.forEach((file) => {
        AudioFileProcessor.cleanupFile(file)
      })

      clearAudioFiles().catch(console.error)

      this.uploadedFiles = []
      this.selectedAudioSource = 'default'
      this.currentAudioFile = null
      this.isOriginalAudio = false
    },

    setSelectedAudioSource(sourceId) {
      this.selectedAudioSource = sourceId
      console.log(`[audioUploadStore] setSelectedAudioSource: ${sourceId}`)

      if (sourceId === 'default') {
        this.currentAudioFile = null
      } else {
        this.currentAudioFile = this.uploadedFiles.find((file) => file.id === sourceId) || null
        console.log('[audioUploadStore] Found file in store:', this.currentAudioFile)
      }

      this.isOriginalAudio = false
    },

    // Toggle between original and processed audio for comparison
    toggleOriginalAudio() {
      this.isOriginalAudio = !this.isOriginalAudio
    },

    // Set original/processed audio mode
    setOriginalAudio(isOriginal) {
      this.isOriginalAudio = isOriginal
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

    cleanup() {
      this.uploadedFiles.forEach((file) => {
        AudioFileProcessor.cleanupFile(file)
      })

      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close()
      }
    },

    // Session cleanup (called on app unmount or page unload)
    sessionCleanup() {
      this.cleanup()
      this.$reset()
    },

    cleanupExpiredFiles() {
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      const expiredFileIds = this.uploadedFiles
        .filter((file) => {
          if (!file.uploadedAt) {
            return true
          }
          const uploadedAtTime = new Date(file.uploadedAt).getTime()
          return now - uploadedAtTime > twentyFourHours
        })
        .map((file) => file.id)

      if (expiredFileIds.length > 0) {
        console.log(`Cleaning up ${expiredFileIds.length} expired temporary files.`)
        expiredFileIds.forEach((fileId) => {
          this.removeFile(fileId)
        })
      }
    },
  },
})
