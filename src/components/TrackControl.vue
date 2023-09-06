<script setup lang="ts">
defineProps<{
    tempo: number
    beatsPerMeasure: number
    beatDuration: number
    swing: number
    isPlaying: boolean
}>()

const emit = defineEmits<{
    tempoChange: [value: number]
    beatsPerMeasureChange: [value: number]
    beatDurationChange: [value: number]
    swingChange: [value: number]
    playingChange: [value: boolean]
}>()
</script>

<template>
    <div>
        <input type="number" placeholder="tempo"
            @change="e => emit('tempoChange', (e.target as HTMLInputElement).valueAsNumber)">
        <div>{{ tempo }}</div>
    </div>
    <div>
        <input type="number" placeholder="beats per measure"
            @change="e => emit('beatsPerMeasureChange', (e.target as HTMLInputElement).valueAsNumber)">
        <div>{{ beatsPerMeasure }}</div>
    </div>
    <div>
        <input type="number" placeholder="beat duration"
            @change="e => emit('beatDurationChange', (e.target as HTMLInputElement).valueAsNumber)">
        <div>{{ beatDuration }}</div>
    </div>
    <div>
        <input type="number" placeholder="swing"
            @change="e => emit('swingChange', (e.target as HTMLInputElement).valueAsNumber)">
        <div>{{ swing }}</div>
    </div>
    <div>
        <button @click="() => emit('playingChange', !isPlaying)">Play/Stop</button>
        <div>{{ isPlaying }}</div>
    </div>
</template>
