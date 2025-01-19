<script>
import Button from 'primevue/button';

export default {
    name: 'Footer',
    components: {
        Button
    },
    data() {
        return {
            links: {
                product: [
                    { label: 'Features', url: '#' },
                    { label: 'Presets', url: '#' },
                    { label: 'Pricing', url: '#' }
                ],
                company: [
                    { label: 'About Us', url: '#' },
                    { label: 'Careers', url: '#' },
                    { label: 'Contact', url: '#' }
                ],
                resources: [
                    { label: 'Blog', url: '#' },
                    { label: 'Documentation', url: '#' },
                    { label: 'Community', url: '#' }
                ]
            },
            socialIcons: [
                { icon: 'pi pi-facebook', url: '#' },
                { icon: 'pi pi-twitter', url: '#' },
                { icon: 'pi pi-instagram', url: '#' },
                { icon: 'pi pi-github', url: '#' }
            ]
        }
    }
}
</script>

<template>
    <footer class="mt-auto py-8 px-6 lg:px-20">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="col-span-1">
                <div class="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 26 26" fill="none">
                        <path
                            d="M18,1.25H6A4.756,4.756,0,0,0,1.25,6V18A4.756,4.756,0,0,0,6,22.75H18A4.756,4.756,0,0,0,22.75,18V6A4.756,4.756,0,0,0,18,1.25ZM21.25,18A3.254,3.254,0,0,1,18,21.25H6A3.254,3.254,0,0,1,2.75,18V6A3.254,3.254,0,0,1,6,2.75H18A3.254,3.254,0,0,1,21.25,6ZM15,8.75a.75.75,0,0,0-.75.75v5a.75.75,0,0,0,1.5,0v-5A.75.75,0,0,0,15,8.75ZM18,6.75a.75.75,0,0,0-.75.75v9a.75.75,0,0,0,1.5,0v-9A.75.75,0,0,0,18,6.75ZM6,9.25a.75.75,0,0,0-.75.75v4a.75.75,0,0,0,1.5,0V10A.75.75,0,0,0,6,9.25ZM9,7.25A.75.75,0,0,0,8.25,8v8a.75.75,0,0,0,1.5,0V8A.75.75,0,0,0,9,7.25ZM12,4.25a.75.75,0,0,0-.75.75V19a.75.75,0,0,0,1.5,0V5A.75.75,0,0,0,12,4.25Z"
                            fill="var(--p-primary-400)" />
                    </svg>
                    <span class="text-xl font-semibold">Pulse-EQ</span>
                </div>
                <p class="text-sm leading-relaxed">
                    Transform your audio experience with professional-grade equalization tools right in your browser.
                </p>
            </div>
            <div class="col-span-1">
                <h3 class="text-lg font-semibold mb-4">Product</h3>
                <ul class="space-y-2">
                    <li v-for="link in links.product" :key="link.label">
                        <a :href="link.url" class="text-sm hover:text-primary">{{ link.label }}</a>
                    </li>
                </ul>
            </div>
            <div class="col-span-1">
                <h3 class="text-lg font-semibold mb-4">Company</h3>
                <ul class="space-y-2">
                    <li v-for="link in links.company" :key="link.label">
                        <a :href="link.url" class="text-sm hover:text-primary">{{ link.label }}</a>
                    </li>
                </ul>
            </div>
            <div class="col-span-1">
                <h3 class="text-lg font-semibold mb-4">Resources</h3>
                <ul class="space-y-2">
                    <li v-for="link in links.resources" :key="link.label">
                        <a :href="link.url" class="text-sm hover:text-primary">{{ link.label }}</a>
                    </li>
                </ul>
            </div>
        </div>

        <div class="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <div class="text-sm mb-4 md:mb-0">
                © 2025 Pulse-EQ. All rights reserved.
            </div>
            <div class="flex gap-4">
                <Button v-for="social in socialIcons" :key="social.icon" :icon="social.icon" text rounded
                    class="p-button-text" />
            </div>
        </div>
    </footer>
</template>

<style scoped>
.hover\:text-primary:hover {
    color: var(--primary-color);
}
</style>
