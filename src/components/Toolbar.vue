<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { storeToRefs } from 'pinia';

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatUnit, swing, isPlaying, shareUrl } = storeToRefs(store)

function onTempoChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.tempoChange(value)
}
function onBeatsPerMeasureChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.beatsPerMeasureChange(value)
}
function onBeatUnitChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    let newValue: number

    let prev = beatUnit.value
    let prevPowerOf2 = Math.log2(prev)

    if (value - prev === 1) {
        // spinbox up
        newValue = Math.pow(2, prevPowerOf2 + 1)
    }
    else if (value - prev === -1) {
        // spinbox down
        newValue = Math.pow(2, prevPowerOf2 - 1)
    }
    else if (value === prev) {
        // no change
        return
    }
    else if ((value & (value - 1)) !== 0) {
        // manual input, adjust to nearest power of 2
        newValue = Math.pow(2, Math.round(Math.log2(value)))
    }
    else {
        // manual input, power of 2
        newValue = value
    }

    if (isNaN(newValue)) {
        return
    }

    store.beatUnitChange(newValue)
}
function onSwingChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.swingChange(value)
}
function onPlayingChange(e: Event) {
    store.playingChange(!isPlaying.value)
}
async function onShareClick(e: Event) {
    await navigator.clipboard.writeText(shareUrl.value)
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
        <input :style="{ width: '40px' }" type="number" placeholder="beat duration" :value="beatUnit" min="1"
            @change="onBeatUnitChange">
        <span>beatUnit</span>
    </div>
    <div>
        <input :style="{ width: '100px' }" type="range" placeholder="swing" :value="swing" min="0" max="50"
            @change="onSwingChange">
        <span>swing</span>
    </div>
    <div>
        <button @click="onPlayingChange">Play/Stop</button>
        <span>{{ isPlaying }}</span>
    </div>
    <div>
        <button @click="onShareClick">Copy URL</button>
    </div>
</template>
