<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { storeToRefs } from 'pinia';

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatDuration, swing, isPlaying } = storeToRefs(store)

function onTempoChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.tempoChange(value)
}
function onBeatsPerMeasureChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.beatsPerMeasureChange(value)
}
function onBeatDurationChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.beatDurationChange(value)
}
function onSwingChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.swingChange(value)
}
function onPlayingChange(e: Event) {
    let value = (e.target as HTMLInputElement).checked
    store.playingChange(value)
}
</script>

<template>
    <div>
        <input :style="{ width: '40px' }" type="number" placeholder="tempo" :value="tempo" min="1" @change="onTempoChange">
        <span>tempo</span>
    </div>
    <div>
        <input :style="{ width: '40px' }" type="number" placeholder="beats per measure" :value="beatsPerMeasure" min="2"
            max="20" @change="onBeatsPerMeasureChange">
        <span>beatsPerMeasure</span>
    </div>
    <div>
        <input :style="{ width: '40px' }" type="number" placeholder="beat duration" :value="beatDuration" min="2" max="20"
            step="2" @change="onBeatDurationChange">
        <span>beatDuration</span>
    </div>
    <div>
        <input :style="{ width: '40px' }" type="number" placeholder="swing" :value="swing" min="0" max="100"
            @change="onSwingChange">
        <span>swing</span>
    </div>
    <div>
        <button @click="onPlayingChange">Play/Stop</button>
        <span>{{ isPlaying }}</span>
    </div>
</template>
