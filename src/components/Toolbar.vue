<script setup lang="ts">
import { useSequencerStore, useUiStore } from '@/store';
import { storeToRefs } from 'pinia';
import NewTrackModal from './modals/NewTrackModal.vue';

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatUnit, swing, isPlaying, shareUrl } = storeToRefs(store)

const uiStore = useUiStore()

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
function onPlayingClick(e: MouseEvent) {
    store.playingChange(!isPlaying.value)
}
async function onShareClick(e: MouseEvent) {
    await navigator.clipboard.writeText(shareUrl.value)
}
function onAddTrackClick(e: MouseEvent) {
    uiStore.showModal<null, { name: string, url: string }>(
        NewTrackModal,
        null,
        ({ name, url }) => {
            uiStore.toast('not implemented')
            // store.addTrack({
            //     id: crypto.randomUUID(),
            //     name: name,
            //     pan: 0,
            //     positions: [],
            //     sampleUrl: url,
            //     tripletEnabled: false,
            //     volume: 1,
            // })
        },
        () => { },
    )
}
</script>

<template>
    <div>
        <div>
            <input :style="{ width: '40px' }" type="number" placeholder="tempo" :value="tempo" min="1"
                @change="onTempoChange">
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
            <button @click="onPlayingClick">Play/Stop</button>
            <span>{{ isPlaying }}</span>
        </div>
        <div>
            <button @click="onShareClick">Copy URL</button>
        </div>
        <div>
            <button @click="onAddTrackClick">Add Track</button>
        </div>
    </div>
</template>
