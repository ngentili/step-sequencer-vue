<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia'
import type { Track } from '../models'

//
// state
//

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatUnit, swing, isPlaying, tracks } = storeToRefs(store)

// tempo change
watch(tempo, (newTempo, oldTempo) => {
    if (isPlaying.value) {
        throw new Error('not implemented')
    }
}, { immediate: true })

// beatsPerMeasure change
watch(beatsPerMeasure, (newBeatsPerMeasure, oldBeatsPerMeasure) => {
    if (isPlaying.value) {
        throw new Error('not implemented')
    }
}, { immediate: true })

// beatUnit change
watch(beatUnit, (newBeatUnit, oldBeatUnit) => {
    if (isPlaying.value) {
        throw new Error('not implemented')
    }
}, { immediate: true })

// swing change
watch(swing, (newSwing, oldSwing) => {
    if (isPlaying.value) {
        throw new Error('not implemented')
    }
}, { immediate: true })

// isPlaying change
watch(isPlaying, async (newIsPlaying, oldIsPlaying) => {
    if (newIsPlaying) {
        await play()
    }
    else {
        await stop()
    }
}, { immediate: true })

// tracks change
watch(tracks, (newTracks, oldTracks) => {
    let trackIds = newTracks.map(track => track.id)
    let oldtrackIds = newTracks.map(track => track.id)

    if (!arraysEqual(trackIds, oldtrackIds)) {
        // track(s) added or removed
        console.log(trackIds, oldtrackIds)
    }

}, { immediate: true })

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

function getAudioBufferById(sampleId: string) {
    let audioBuffer = audioBufferMap.get(sampleId)
    if (!audioBuffer) {
        throw new Error(`sampleId not found: ${sampleId}`)
    }
    return audioBuffer
}

function loopDuration() {
    
    return (60 / tempo.value) * 4
}

let audioContext = new AudioContext()
let masterGainNode = new GainNode(audioContext)

let audioBufferMap = new Map<string, AudioBuffer>()

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

function scheduleOneSample(trackId: string, startTime: number) {
    let audioBuffer = getAudioBufferById(trackId)
}

function unscheduleOneSample(trackId: string, startTime: number) {

}

function startScheduler() {
    for (const track of tracks.value) {
        for (const sampleTime of track.loopSampleTimes) {

            let position = 0
            scheduleOneSample(track.id, position)
        }
    }
}

function stopScheduler() {

}

async function play() {
    startScheduler()
    await audioContext.resume()
}

async function stop() {
    stopScheduler()
    await audioContext.suspend()
}

//
// testing
//

onMounted(async () => {
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
})
</script>
