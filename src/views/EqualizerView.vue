<script>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Select from 'primevue/select';

import { useEqualizerStore } from '@/stores/equalizerStore';
import GridCanvas from '@/components/GridCanvas.vue';
import AnalyzerCanvas from '@/components/AnalyzerCanvas.vue';
import ResponseCanvas from '@/components/ResponseCanvas.vue';
import FilterHandles from '@/components/FilterHandles.vue';
import BandControls from '@/components/BandControls.vue';
import EqControls from '@/components/EqControls.vue';

export default {
    name: 'Equalizer',
    components: {
        Select,
        Card,
        Button,
        GridCanvas,
        AnalyzerCanvas,
        ResponseCanvas,
        FilterHandles,
        BandControls,
        EqControls
    },
    data() {
        const equalizerStore = useEqualizerStore();
        return {
            equalizerStore,
            preset: {
                name: 'Equalizer',
                description: '',
            },
            uploadedFile: null,
            exportedSettings: '',
            importedSettings: '',
            analyserNode: null,
            audio: null,
            audioContext: null,
            source: null,
            weq8: null,
            filters: equalizerStore.getDefaultFilters(),
            selectedPoint: null,
            devicePixelRatio: window.devicePixelRatio || 1,
            nyquist: 24000,
        }
    },
    methods: {
        // Audio initialization and setup
        async initializeAudio() {
            const audioPath = new URL('@/assets/audio/sample_audio.mp3', import.meta.url).href
            const {
                filters,
                audioContext,
                analyserNode,
                source,
                weq8,
                nyquist
            } = await this.equalizerStore.initializeAudio(audioPath)

            this.filters = filters
            this.audioContext = audioContext
            this.analyserNode = analyserNode
            this.source = source
            this.weq8 = weq8
            this.nyquist = nyquist
        },

        // Filter interaction methods
        startDragging(event, index) {
            this.equalizerStore.startDragging(event, index)
        },

        stopDragging(event) {
            this.equalizerStore.stopDragging(event, this.filters)
        },

        handleDrag(event) {
            this.equalizerStore.handleDrag(
                event,
                this.$refs.eqContainer,
                this.filters,
                this.weq8,
                this.nyquist
            )
        },

        handleFilterScroll(event, index) {
            this.equalizerStore.handleFilterScroll(event, index, this.filters, this.weq8)
        },

        updateFilter(index, property, value) {
            this.equalizerStore.updateFilter(
                index,
                property,
                value,
                this.filters,
                this.weq8
            )
        },

        // Audio control methods
        playAudio() {
            this.equalizerStore.playAudio()
        },

        pauseAudio() {
            this.equalizerStore.pauseAudio()
        },

    },

    async mounted() {
        await this.initializeAudio()
    },

    beforeUnmount() {
        this.equalizerStore.cleanup()
    }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="flex-1 pt-24 px-6 lg:px-20">
            <div class="grid grid-cols-12 gap-6 h-full">
                <!-- Left Card -->
                <div class="col-span-12 lg:col-span-2">
                    <div class="col-span-12 lg:col-span-2">
                        <EqControls :weq8="weq8" :filters="filters" :audio-context="audioContext" :source="source"
                            :analyser-node="analyserNode" @update:filters="filters = $event"
                            @update-weq8="weq8 = $event" />
                    </div>
                </div>

                <!-- Middle Card -->
                <div class="col-span-12 lg:col-span-8">
                    <Card class="shadow-xl">
                        <template #title>
                            <div class="text-2xl font-semibold mb-2">{{ preset.name }}</div>
                        </template>
                        <template #content>
                            <div class="flex flex-col items-center justify-center">
                                <div ref="eqContainer"
                                    class="border w-full h-96 shadow-xl relative mb-6 bg-gray-900 rounded-lg overflow-hidden"
                                    style="background-color: var(--eq-background)">
                                    <GridCanvas :nyquist="nyquist" :device-pixel-ratio="devicePixelRatio" />
                                    <AnalyzerCanvas v-if="analyserNode" :analyser-node="analyserNode" :nyquist="nyquist"
                                        :device-pixel-ratio="devicePixelRatio" />
                                    <ResponseCanvas :weq8="weq8" :filters="filters" :nyquist="nyquist"
                                        :device-pixel-ratio="devicePixelRatio" @pointermove="handleDrag"
                                        @pointerup="stopDragging" @pointerleave="stopDragging" />
                                    <FilterHandles :filters="filters" :selected-point="selectedPoint" :nyquist="nyquist"
                                        @update:filters="filters = $event" @pointerdown="startDragging"
                                        @pointermove="handleDrag" @pointerup="stopDragging"
                                        @pointercancel="stopDragging" @wheel="handleFilterScroll" />
                                </div>
                                <div class="flex gap-4">
                                    <Button icon="pi pi-play" severity="success" @click="playAudio" />
                                    <Button icon="pi pi-pause" severity="secondary" @click="pauseAudio" />
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>

                <!-- Right Card - Filter Controls -->
                <div class="col-span-12 lg:col-span-2">
                    <Card class="h-full shadow-xl">
                        <template #title>
                            <div class="text-xl font-semibold mb-4">Band Controls</div>
                        </template>
                        <template #content>
                            <BandControls :filters="filters" :filter-types="equalizerStore.filterTypes"
                                :nyquist="nyquist" :weq8="weq8" @update-filter="updateFilter" />
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
canvas {
    image-rendering: pixelated;
    background: transparent;
}
</style>