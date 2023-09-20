<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { XAudioNode, type Track, TimeWindow, type ScheduledSample } from '../models'

//
// state
//

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatUnit, swing, isPlaying, tracks } = storeToRefs(store)
const trackIds = computed(() => tracks.value.map(track => track.id))
const measureDuration = computed(() => (60 / tempo.value) * beatsPerMeasure.value)

// TODO tempo change ok, beats added/removed broken
// // measureDuration change
// watch(measureDuration, (newLoopDuration, oldLoopDuration) => {
//     throw new Error('not implemented')
// })

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
        let firstRun = true
        timer = setInterval(() => {
            if (firstRun) {
                measureStartTime = audioContext.currentTime
                schedulingWindow = new TimeWindow(audioContext.currentTime, audioContext.currentTime + lookahead)
            }
            doSchedulingRun()
            if (firstRun) {
                firstRun = false
            }
        }, interval * 1000)
        await audioContext.resume()
    }
    else {
        clearInterval(timer)

        for (const track of tracks.value) {

            let trackSamples = scheduledTrackSamples.get(track.id)!

            // purge all scheduled samples
            for (let i = trackSamples.length - 1; i >= 0; i--) {
                const trackSample = trackSamples[i]

                trackSample.source.stop()
                trackSample.source.disconnect()
                trackSamples.pop()
            }
        }

        await audioContext.suspend()
    }
})

// tracks added or removed
watch(trackIds, (newTrackIds, oldtrackIds) => {

    // tracks added
    let tracksIdsAdded = newTrackIds.filter(id => !oldtrackIds.includes(id))

    for (const trackId of tracksIdsAdded) {
        if (trackGainNodeMap.has(trackId)) {
            throw new Error('trackId already exists')
        }

        let trackGainNode = new XAudioNode(new GainNode(audioContext))
        trackGainNode.connectTo(masterGainNode)

        trackGainNodeMap.set(trackId, trackGainNode)
    }

    // tracks removed
    let tracksIdsRemoved = oldtrackIds.filter(id => !newTrackIds.includes(id))

    for (const trackId of tracksIdsRemoved) {
        let trackGainNode = getTrackGainNode(trackId)
        trackGainNode.disconnectAll()
        trackGainNodeMap.delete(trackId)
    }
})

//
// audio context
//

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
let scheduledTrackSamples = new Map<string, ScheduledSample[]>()
let audioBufferMap = new Map<string, AudioBuffer>()

let measureStartTime = 0
let timer: number | undefined = undefined
let interval = 0.025
let lookahead = 0.250
let schedulingWindow: TimeWindow

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
    const now = audioContext.currentTime

    if (!isPlaying.value) {
        throw new Error('tried to schedule while not playing')
    }

    if (now >= measureStartTime + measureDuration.value) {
        measureStartTime += measureDuration.value
    }

    for (const track of tracks.value) {

        if (!scheduledTrackSamples.has(track.id)) {
            scheduledTrackSamples.set(track.id, [])
        }

        let trackSamples = scheduledTrackSamples.get(track.id)!

        for (const position of track.loopSampleTimes) {
            let targetTime = measureStartTime + (measureDuration.value * position)

            if (schedulingWindow.isInside(targetTime)) {

                if (trackSamples.find(ts => ts.time === targetTime)) {
                    continue
                }

                let scheduledSample = scheduleOneSample(track, targetTime)

                trackSamples.unshift({
                    time: targetTime,
                    source: scheduledSample.audioNode
                })
            }
        }
    }

    schedulingWindow.from = now
    schedulingWindow.to = now + lookahead

    // purge old scheduled samples
    for (const track of tracks.value) {

        let trackSamples = scheduledTrackSamples.get(track.id)!

        for (let i = trackSamples.length - 1; i >= 0; i--) {
            const trackSample = trackSamples[i]

            if (trackSample.time + measureDuration.value < now) {
                trackSample.source.stop()
                trackSample.source.disconnect()
                trackSamples.pop()
            }
            else {
                break
            }
        }
    }
}

function scheduleOneSample(track: Track, absoluteTime: number) {
    let audioBuffer = getAudioBuffer(track.sampleId)
    let trackGainNode = getTrackGainNode(track.id)

    let sourceNode = new XAudioNode(new AudioBufferSourceNode(audioContext, { buffer: audioBuffer }))
    sourceNode.connectTo(trackGainNode)
    sourceNode.audioNode.start(absoluteTime)

    return sourceNode
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

onMounted(() => {
    init()
})
</script>

<template>
    <!-- <button @click="init()">Add All</button> -->
    <!-- <button @click="store.$state.tracks = []">Remove All</button> -->
</template>
