<template><span class="status-dot" :class="`status-dot--${tone}`" aria-hidden="true"></span></template>
<script setup lang="ts">import type { AccentTone } from "../../types/dashboard"; defineProps<{ tone: AccentTone }>();</script>
<style scoped>
.status-dot{width:7px;height:7px;border-radius:50%;display:inline-block;flex:0 0 auto;box-shadow:0 0 0 2px rgba(255,255,255,.72)}
.status-dot--green{background:#269443}.status-dot--blue{background:#2687ed}.status-dot--red{background:#d93a3a}.status-dot--gold,.status-dot--orange{background:#d48a16}.status-dot--navy{background:#082b63}.status-dot--gray{background:#7e8998}
</style>

