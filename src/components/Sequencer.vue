<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { XAudioNode, type Track } from '../models'

//
// state
//

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatUnit, swing, isPlaying, tracks } = storeToRefs(store)
const trackIds = computed(() => tracks.value.map(track => track.id))
const measureDuration = computed(() => (60 / tempo.value) * beatsPerMeasure.value)

// measureDuration change
watch(measureDuration, (newLoopDuration, oldLoopDuration) => {
    throw new Error('not implemented')
})

// beatUnit change
watch(beatUnit, (newBeatUnit, oldBeatUnit) => {
    throw new Error('not implemented')
})

// swing change
watch(swing, (newSwing, oldSwing) => {
    throw new Error('not implemented')
})

// isPlaying change
watch(isPlaying, async (newIsPlaying, oldIsPlaying) => {
    if (newIsPlaying) {
        startScheduler()
        await audioContext.resume()
    }
    else {
        stopScheduler()
        await audioContext.suspend()
    }
})

// tracks added or removed
watch(trackIds, (newTrackIds, oldtrackIds) => {
    console.log('watch trackIds')

    // tracks added
    let tracksIdsAdded = newTrackIds.filter(id => !oldtrackIds.includes(id))

    for (const trackId of tracksIdsAdded) {
        if (trackGainNodeMap.has(trackId)) {
            throw new Error('trackId already exists')
        }

        let trackGainNode = new XAudioNode(new GainNode(audioContext))
        trackGainNode.connectTo(masterGainNode)

        trackGainNodeMap.set(trackId, trackGainNode)

        // console.log(`track added: ${trackId}`)
    }

    // tracks removed
    let tracksIdsRemoved = oldtrackIds.filter(id => !newTrackIds.includes(id))

    for (const trackId of tracksIdsRemoved) {
        let trackGainNode = trackGainNodeMap.get(trackId)
        if (!trackGainNode) {
            throw new Error('trackId does not exist')
        }
        trackGainNode.disconnectInputs()
        trackGainNodeMap.delete(trackId)

        // console.log(`track removed: ${trackId}`)
    }
})

//
// audio context
//

function arraysEqual<T>(array1: T[], array2: T[]): boolean {
    if (array1.length !== array2.length) {
        return false;
    }

    for (let i = 0; i < array1.length; i++) {
        if (array1[i] !== array2[i]) {
            return false;
        }
    }

    return true;
}

function getAudioBuffer(sampleId: string) {
    let audioBuffer = audioBufferMap.get(sampleId)
    if (!audioBuffer) {
        throw new Error(`sampleId not found: ${sampleId}`)
    }
    return audioBuffer
}

function getTrackGainNode(trackId: string) {
    let gainNode = trackGainNodeMap.get(trackId)
    if (!gainNode) {
        throw new Error(`trackId not found: ${trackId}`)
    }
    return gainNode
}

let audioContext = new AudioContext()
let masterGainNode = new XAudioNode(new GainNode(audioContext))
masterGainNode.connectTo(audioContext.destination)
let trackGainNodeMap = new Map<string, XAudioNode>()
let audioBufferMap = new Map<string, AudioBuffer>()

let measureStartTime = 0
let timerId: number | null = null

async function loadAudioBuffer(url: string) {
    let res = await fetch(url)
    let data = await res.arrayBuffer()
    let dataHash = await hashBinaryData(data)

    if (!audioBufferMap.has(dataHash)) {
        let audioBuffer = await audioContext.decodeAudioData(data)
        audioBufferMap.set(dataHash, audioBuffer)
    }

    return dataHash
}

async function hashBinaryData(data: ArrayBufferView | ArrayBuffer) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    return hashHex
}

function doSchedulingRun() {
    if (!isPlaying.value) {
        throw new Error('tried to schedule while not playing')
    }

    console.log(`doSchedulingRun time: ${audioContext.currentTime}`)

    // TODO this is broken
    if (measureStartTime < audioContext.currentTime) {
        measureStartTime += measureDuration.value
    }

    for (const track of tracks.value) {
        for (const position of track.loopSampleTimes) {
            let absoluteTime = measureStartTime + (measureDuration.value * position)

            if (absoluteTime < audioContext.currentTime) {
                throw new Error('tried to schedule in past')
            }
            if (absoluteTime >= (measureStartTime + measureDuration.value)) {
                throw new Error('tried to schedule into next loop')
            }

            scheduleOneSample(track, absoluteTime)
        }
    }

    let timeUntilNextMeasure = (measureStartTime + measureDuration.value) - audioContext.currentTime

    let offset: number
    if (timeUntilNextMeasure < measureDuration.value / 4) {
        offset = -measureDuration.value / 4
        console.log('catchup')
    }
    else {
        offset = 0
    }

    let nextRunIntervalMs = (timerId == null ? measureDuration.value / 2 : measureDuration.value + offset) * 1000
    console.log(`nextRunIntervalMs: ${nextRunIntervalMs}`)

    timerId = setTimeout(() => {
        doSchedulingRun()
    }, nextRunIntervalMs)
}

function scheduleOneSample(track: Track, absoluteTime: number) {
    let audioBuffer = getAudioBuffer(track.sampleId)
    let trackGainNode = getTrackGainNode(track.id)

    let sourceNode = new XAudioNode(new AudioBufferSourceNode(audioContext, { buffer: audioBuffer }))
    sourceNode.connectTo(trackGainNode);
    (sourceNode.audioNode as AudioBufferSourceNode).start(absoluteTime)
}

function unscheduleOneSample(trackId: string, startTime: number) {

}

function startScheduler() {
    measureStartTime = audioContext.currentTime
    doSchedulingRun()
}

function stopScheduler() {

}

async function init() {
    let kickSampleId = await loadAudioBuffer('/audio/kick.mp3')
    let snareSampleId = await loadAudioBuffer('/audio/snare.mp3')
    let hihatSampleId = await loadAudioBuffer('/audio/hihat.mp3')

    let testTracks: Track[] = [
        {
            id: 'kick_0',
            name: 'kick',
            pan: -0.25,
            volume: 0.7,
            loopSampleTimes: [],
            sampleId: kickSampleId,
        },
        {
            id: 'snare_0',
            name: 'snare',
            pan: 0,
            volume: 0.3,
            loopSampleTimes: [],
            sampleId: snareSampleId,
        },
        {
            id: 'hihat_0',
            name: 'hihat',
            pan: .4,
            volume: 1,
            loopSampleTimes: [],
            sampleId: hihatSampleId,
        }
    ]

    testTracks.forEach(track => store.addTrack(track))
}

onMounted(init)
// onUnmounted(() => { store.$state.tracks = [] })
</script>

<template>
    <button @click="init()">Add All</button>
    <button @click="store.$state.tracks = []">Remove All</button>
</template>
