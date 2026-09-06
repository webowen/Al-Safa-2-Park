<template>
  <svg class="app-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'sun'"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></template>
    <template v-else-if="name === 'activity'"><path d="M3 12h4l3-7 4 14 3-7h4"/></template>
    <template v-else-if="name === 'clock'"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></template>
    <template v-else-if="name === 'temperature'"><path d="M10 14.76V5a2 2 0 0 1 4 0v9.76a4 4 0 1 1-4 0Z"/><path d="M12 8v8"/></template>
    <template v-else-if="name === 'visitors'"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></template>
    <template v-else-if="name === 'shield'"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></template>
    <template v-else-if="name === 'warning'"><path d="m21 19-9-16-9 16h18Z"/><path d="M12 9v4M12 17h.01"/></template>
    <template v-else-if="name === 'water'"><path d="M12 2s6 6.2 6 12a6 6 0 0 1-12 0c0-5.8 6-12 6-12Z"/></template>
    <template v-else-if="name === 'bulb'"><path d="M9 18h6M10 22h4M8.5 14.5A7 7 0 1 1 15.5 14.5C14.5 15.3 14 16 14 18h-4c0-2-.5-2.7-1.5-3.5Z"/></template>
    <template v-else-if="name === 'waste'"><path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/></template>
    <template v-else-if="name === 'wifi'"><path d="M5 12.55a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0M12 20h.01M2 9a16 16 0 0 1 20 0"/></template>
    <template v-else-if="name === 'tree'"><path d="M12 22v-8M7 15c-3-1-3-5 0-6-1-4 4-7 6-3 4-1 5 5 2 7 0 3-5 5-8 2Z"/><path d="m12 14-3-3M12 17l3-3"/></template>
    <template v-else-if="name === 'umbrella'"><path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8H4Z"/><path d="M12 12v7c0 1.7-1.3 3-3 3"/><path d="M12 12v7c0 1.7 1.3 3 3 3"/></template>
    <template v-else-if="name === 'clipboard'"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/></template>
    <template v-else-if="name === 'calendar'"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><circle cx="15" cy="16" r="3"/></template>
    <template v-else-if="name === 'leaf'"><path d="M20 4C12 4 5 7 5 14c0 3 2 5 5 5 7 0 10-7 10-15Z"/><path d="M4 21c3-6 7-9 12-12"/></template>
    <template v-else-if="name === 'layers'"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></template>
    <template v-else-if="name === 'building'"><path d="M4 22V6l8-4 8 4v16M9 22v-4h6v4M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/></template>
    <template v-else-if="name === 'utility'"><path d="m14 7 3-3 3 3-3 3-3-3ZM4 17l3-3 3 3-3 3-3-3ZM7 14l8-5"/><circle cx="12" cy="12" r="1"/></template>
    <template v-else-if="name === 'bell'"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></template>
    <template v-else-if="name === 'menu'"><path d="M4 6h16M4 12h16M4 18h16"/></template>
    <template v-else-if="name === 'sparkles'"><path d="m12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15ZM5 2l.7 2.3L8 5l-2.3.7L5 8l-.7-2.3L2 5l2.3-.7L5 2Z"/></template>
    <template v-else-if="name === 'chevron-right'"><path d="m9 18 6-6-6-6"/></template>
    <template v-else-if="name === 'chevron-up'"><path d="m18 15-6-6-6 6"/></template>
    <template v-else-if="name === 'arrow-right'"><path d="M5 12h14M13 6l6 6-6 6"/></template>
    <template v-else-if="name === 'play'"><path d="m8 5 11 7-11 7V5Z"/></template>
    <template v-else-if="name === 'pause'"><path d="M8 5v14M16 5v14"/></template>
    <template v-else-if="name === 'moon'"><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/></template>
    <template v-else-if="name === 'cloud-rain'"><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.3 4.5 4.5 0 0 0 7 18Z"/><path d="m8 21 1-2M12 21l1-2M16 21l1-2"/></template>
    <template v-else><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: string }>();
</script>

<style scoped>
.app-icon { width: 1em; height: 1em; display: block; }
</style>
