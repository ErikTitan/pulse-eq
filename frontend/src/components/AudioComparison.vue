<script>
import Button from 'primevue/button';
import { useAudioUploadStore } from '@/stores/audioUploadStore';

export default {
    name: 'AudioComparison',
    components: {
        Button,
    },
    data() {
        return {
            audioUploadStore: useAudioUploadStore(),
        };
    },
    computed: {
        // Get current audio mode from store
        isOriginal() {
            return this.audioUploadStore.isOriginalAudio;
        },

        // Check if user has uploaded a file (needed to enable comparison)
        hasUploadedFile() {
            return this.audioUploadStore.selectedAudioSource !== 'default';
        },

        // Get button label based on current mode
        buttonLabel() {
            return this.isOriginal ? 'Original' : 'With Preset';
        },

        // Get button icon based on current mode
        buttonIcon() {
            return this.isOriginal ? 'pi pi-volume-up' : 'pi pi-sliders-h';
        },

        // Get button severity (styling) based on current mode
        buttonSeverity() {
            return this.isOriginal ? 'secondary' : 'success';
        },

        // Get current audio source name for display
        currentAudioSourceName() {
            if (this.audioUploadStore.selectedAudioSource === 'default') {
                return 'Default Sample';
            }
            const selectedFile = this.audioUploadStore.selectedFile;
            return selectedFile ? selectedFile.name : 'Unknown';
        },
    },
    methods: {
        // Toggle between original and processed audio
        toggleComparison() {
            if (this.hasUploadedFile) {
                this.audioUploadStore.toggleOriginalAudio();
                // Emit event to parent components when audio mode changes
                this.$emit('audio-mode-changed', {
                    isOriginal: this.audioUploadStore.isOriginalAudio,
                    audioSource: this.audioUploadStore.selectedAudioSource,
                });
            }
        },
    },
    emits: ['audio-mode-changed'],
};
</script>

<template>
    <div class="audio-comparison">
        <!-- Main comparison toggle section -->
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
                <span class="text-sm font-medium text-surface-700">Audio Mode:</span>
                <Button :label="buttonLabel" :icon="buttonIcon" @click="toggleComparison" :severity="buttonSeverity"
                    :disabled="!hasUploadedFile" size="small" class="transition-all duration-200" :class="{
                        'opacity-50 cursor-not-allowed': !hasUploadedFile,
                        'hover:scale-105': hasUploadedFile,
                    }" />
            </div>

            <!-- Visual indicator showing current mode -->
            <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full transition-colors duration-200" :class="{
                    'bg-surface-400': !hasUploadedFile,
                    'bg-secondary-500': hasUploadedFile && isOriginal,
                    'bg-success-500': hasUploadedFile && !isOriginal,
                }"></div>
                <span class="text-xs text-surface-500">
                    {{ hasUploadedFile ? (isOriginal ? 'Original' : 'Processed') : 'Disabled' }}
                </span>
            </div>
        </div>

        <!-- Information section -->
        <div class="bg-surface-50 rounded-lg p-3 border border-surface-200">
            <div class="flex items-start space-x-2">
                <i class="pi text-sm mt-0.5" :class="{
                    'pi pi-info-circle text-surface-400': !hasUploadedFile,
                    'pi pi-check-circle text-success-500': hasUploadedFile,
                }"></i>
                <div class="flex-1">
                    <p class="text-sm text-surface-600 mb-1">
                        <span v-if="!hasUploadedFile" class="font-medium">
                            Upload a file to compare original vs processed audio
                        </span>
                        <span v-else class="font-medium">
                            Comparing: {{ currentAudioSourceName }}
                        </span>
                    </p>
                    <p v-if="hasUploadedFile" class="text-xs text-surface-500">
                        Toggle between the original audio and the version with your current preset applied.
                        This helps you hear exactly what changes the equalizer is making.
                    </p>
                    <p v-else class="text-xs text-surface-500">
                        Once you upload an audio file, you'll be able to toggle between the original
                        and processed versions to hear the difference your presets make.
                    </p>
                </div>
            </div>
        </div>

        <!-- Additional controls when comparison is active -->
        <div v-if="hasUploadedFile" class="mt-3 flex items-center justify-between text-xs text-surface-500">
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-1">
                    <i class="pi pi-volume-up"></i>
                    <span>Original</span>
                </div>
                <div class="flex items-center space-x-1">
                    <i class="pi pi-sliders-h"></i>
                    <span>With Preset</span>
                </div>
            </div>
            <div class="text-right">
                <span class="font-medium">
                    Current: {{ isOriginal ? 'Original' : 'Processed' }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Component-specific styling using PrimeVue tokens and Tailwind CSS */
.audio-comparison {
    /* Use PrimeVue design tokens for consistent styling */
    --comparison-border-radius: var(--p-border-radius-md);
    --comparison-transition: var(--p-transition-duration);
}

/* Enhanced button hover effects */
.audio-comparison :deep(.p-button:not(:disabled):hover) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Smooth transitions for all interactive elements */
.audio-comparison :deep(.p-button) {
    transition: all var(--comparison-transition) ease-in-out;
}

/* Custom styling for the status indicator */
.audio-comparison .w-2.h-2 {
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.8);
    transition: all var(--comparison-transition) ease-in-out;
}

/* Enhanced focus states for accessibility */
.audio-comparison :deep(.p-button:focus) {
    outline: 2px solid var(--p-primary-500);
    outline-offset: 2px;
}

/* Subtle animation for the info section */
.audio-comparison .bg-surface-50 {
    transition: background-color var(--comparison-transition) ease-in-out;
}

.audio-comparison .bg-surface-50:hover {
    background-color: var(--p-surface-100);
}

/* Responsive adjustments */
@media (max-width: 640px) {
    .audio-comparison .flex.items-center.justify-between {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .audio-comparison .flex.items-center.space-x-3 {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
