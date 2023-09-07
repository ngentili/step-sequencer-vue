<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { computed } from 'vue';

const props = defineProps<{
    trackId: string
}>()

const store = useSequencerStore()
const track = computed(() => store.getTrackById(props.trackId))

function onVolumeChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.volumeChange(props.trackId, value)
}

function onPanChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.panChange(props.trackId, value)
}
</script>

<template>
    <div class="flexbox-row">
        <div>
            {{ track.name }}
        </div>
        <div>
            <input type="range" min="0" max="1" step="0.01" :value="track.volume" @change="onVolumeChange">
        </div>
        <div>
            <datalist :id="`pan-datalist-${trackId}`">
                <option value="0"></option>
            </datalist>
            <input type="range" min="-1" max="1" step="0.01" :list="`pan-datalist-${trackId}`" :value="track.pan"
                @change="onPanChange">
        </div>
    </div>
</template>
