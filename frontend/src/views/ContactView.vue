<script>
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Divider from 'primevue/divider'
import Timeline from 'primevue/timeline'
import Badge from 'primevue/badge'
import ToggleButton from 'primevue/togglebutton'

export default {
    name: 'ContactPage',
    components: {
        InputText,
        Textarea,
        Button,
        Card,
        Divider,
        Timeline,
        Badge,
        ToggleButton
    },
    data() {
        return {
            form: {
                name: '',
                email: '',
                subject: '',
                message: '',
                presetId: '',
                deviceType: ''
            },
            timelineEvents: [
                { status: 'Real-time', description: 'Preset Preview & Testing', icon: 'pi pi-play' },
                { status: 'Universal', description: 'Cross-Platform Support', icon: 'pi pi-desktop' },
                { status: 'Community', description: 'Active Preset Sharing', icon: 'pi pi-users' }
            ],
            supportCategories: [
                { icon: 'pi pi-cog', label: 'Preset Creation Help' },
                { icon: 'pi pi-sync', label: 'Import/Export Issues' },
                { icon: 'pi pi-volume-up', label: 'Audio Device Support' },
                { icon: 'pi pi-share-alt', label: 'Preset Sharing' }
            ]
        }
    },
    computed: {
        isDarkMode() {
            return document.documentElement.classList.contains('my-app-dark')
        }
    },
    methods: {
        submitForm() {
            console.log('Support request submitted:', this.form)
        }
    }
}
</script>

<template>
    <div class="min-h-screen transition-colors duration-300 flex-1 pt-24 px-6 lg:px-20">
        <div class="container mx-auto px-4 py-8">
            <div class="grid lg:grid-cols-2 gap-8">
                <!-- Left Column -->
                <div class="space-y-8">
                    <Card class="bg-glass backdrop-blur-lg shadow-xl">
                        <template #title>
                            <h2 class="text-3xl font-bold mb-4">
                                Contact WEB-EQ Support
                            </h2>
                        </template>
                        <template #content>
                            <form @submit.prevent="submitForm" class="space-y-6">
                                <div class="space-y-2">
                                    <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name</label>
                                    <InputText v-model="form.name" class="w-full" />
                                </div>
                                <div class="space-y-2">
                                    <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Email</label>
                                    <InputText v-model="form.email" type="email" class="w-full" />
                                </div>
                                <div class="space-y-2">
                                    <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Device Type</label>
                                    <InputText v-model="form.deviceType" placeholder="Headphone/Speaker Model"
                                        class="w-full" />
                                </div>
                                <div class="space-y-2">
                                    <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Preset ID (if
                                        applicable)</label>
                                    <InputText v-model="form.presetId"
                                        placeholder="Enter preset ID if related to specific preset" class="w-full" />
                                </div>
                                <div class="space-y-2">
                                    <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Message</label>
                                    <Textarea v-model="form.message" rows="4" class="w-full"
                                        placeholder="Describe your query or issue. For preset-related questions, please include your use case (gaming, music genre, etc.)" />
                                </div>
                                <Button label="Send Message" icon="pi pi-send" class="w-full p-button-success" />
                            </form>
                        </template>
                    </Card>

                    <!-- Features Timeline -->
                    <Card class="bg-glass backdrop-blur-lg shadow-xl">
                        <template #title>
                            <h3 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
                                WEB-EQ Features
                            </h3>
                        </template>
                        <template #content>
                            <Timeline :value="timelineEvents" class="mt-4">
                                <template #content="slotProps">
                                    <div class="flex items-center">
                                        <i :class="[slotProps.item.icon, 'text-2xl text-primary mr-4']"></i>
                                        <div>
                                            <span class="font-bold block"
                                                :class="isDarkMode ? 'text-white' : 'text-gray-800'">
                                                {{ slotProps.item.status }}
                                            </span>
                                            <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
                                                {{ slotProps.item.description }}
                                            </span>
                                        </div>
                                    </div>
                                </template>
                            </Timeline>
                        </template>
                    </Card>
                </div>

                <!-- Right Column -->
                <div class="space-y-8">
                    <!-- Support Categories -->
                    <Card class="bg-glass backdrop-blur-lg shadow-xl">
                        <template #title>
                            <h2 class="text-3xl font-bold mb-4">
                                Support Categories
                            </h2>
                        </template>
                        <template #content>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-for="category in supportCategories" :key="category.label"
                                    class="flex items-center p-4 bg-primary/10 rounded-lg">
                                    <i :class="[category.icon, 'text-2xl text-primary mr-3']"></i>
                                    <span :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">{{ category.label
                                        }}</span>
                                </div>
                            </div>

                            <!-- Quick Links -->
                            <div class="mt-8">
                                <h3 class="text-xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
                                    Quick Links
                                </h3>
                                <div class="space-y-4">
                                    <Button icon="pi pi-file-pdf" label="User Guide" class="p-button-outlined w-full" />
                                    <Button icon="pi pi-list" label="Preset Directory"
                                        class="p-button-outlined w-full" />
                                    <Button icon="pi pi-compass" label="Tuning Guidelines"
                                        class="p-button-outlined w-full" />
                                </div>
                            </div>
                        </template>
                    </Card>

                    <!-- Stats Card -->
                    <Card class="bg-glass backdrop-blur-lg shadow-xl">
                        <template #title>
                            <h3 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-gray-800'">
                                WEB-EQ Community
                            </h3>
                        </template>
                        <template #content>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="text-center p-4 rounded-lg bg-primary/10">
                                    <h4 class="text-3xl font-bold text-primary">10K+</h4>
                                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Active Users</p>
                                </div>
                                <div class="text-center p-4 rounded-lg bg-primary/10">
                                    <h4 class="text-3xl font-bold text-primary">5K+</h4>
                                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Shared Presets</p>
                                </div>
                                <div class="text-center p-4 rounded-lg bg-primary/10">
                                    <h4 class="text-3xl font-bold text-primary">100+</h4>
                                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">Device Profiles</p>
                                </div>
                                <div class="text-center p-4 rounded-lg bg-primary/10">
                                    <h4 class="text-3xl font-bold text-primary">4.9★</h4>
                                    <p :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">User Rating</p>
                                </div>
                            </div>
                        </template>
                    </Card>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bg-glass {

    border: 1px solid v-bind("isDarkMode ? 'rgba(255, 255, 255, 0.125)' : 'rgba(0, 0, 0, 0.125)'");
}

:deep(.p-inputtext),


:deep(.p-card) {
    background: transparent;
}

:deep(.p-timeline-event-content),
:deep(.p-timeline-event-opposite) {
    @apply text-sm;
}

:deep(.p-button) {
    @apply transition-all duration-300;
}

:deep(.p-divider) {
    @apply my-4;
}

:deep(.p-togglebutton.p-highlight) {
    background: #22c55e;
}
</style>