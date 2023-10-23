<script setup lang="ts">
import { useSequencerStore, type SequencerState } from '@/store';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia'
import { XAudioNode, type Track, TimeWindow, type ScheduledSample } from '../models'

//
// worker
//

export interface SequencerMessageData {
    type: 'intervalStart' | 'intervalClear' | 'intervalElapsed' | 'debug'
}

export interface IntervalStartData extends SequencerMessageData {
    type: 'intervalStart',
    interval: number,
}

export interface DebugData extends SequencerMessageData {
    type: 'debug',
    log: string,
}

const worker = new Worker(
    new URL('../worker', import.meta.url),
    { type: 'module' },
)

//
// state
//

const store = useSequencerStore()
const { swing, isPlaying, tracks, trackIds, measureDuration, stepCount, stepDuration } = storeToRefs(store)

const firstRun = ref(true)

// isPlaying change
watch(isPlaying, async (newIsPlaying, oldIsPlaying) => {

    function workerListener(e: MessageEvent<SequencerMessageData>) {
        if (e.data.type == 'intervalElapsed') {
            if (firstRun.value) {
                measureStartTime = audioContext.currentTime
                schedulingWindow = new TimeWindow(audioContext.currentTime, audioContext.currentTime + lookahead)
            }
            doSchedulingRun()
            if (firstRun.value) {
                firstRun.value = false
            }
        }
    }

    if (newIsPlaying) {
        firstRun.value = true
        worker.addEventListener('message', workerListener)
        worker.postMessage({ type: 'intervalStart', interval } as IntervalStartData)
        await audioContext.resume()
    }
    else {
        worker.removeEventListener('message', workerListener)
        worker.postMessage({ type: 'intervalClear' } as SequencerMessageData)
        unscheduleAll()
        await audioContext.suspend()
    }
})

// tracks added or removed
watch(trackIds, async (newTrackIds, oldtrackIds) => {

    // tracks added
    let tracksIdsAdded = newTrackIds.filter(id => !oldtrackIds.includes(id))

    for (const trackId of tracksIdsAdded) {
        if (trackGainNodeMap.has(trackId)) {
            throw new Error('trackId already exists')
        }

        let track = tracks.value.find(t => t.id == trackId)
        if (!track) {
            throw new Error('trackId not found')
        }

        await loadAudioBuffer(track.sampleUrl)

        let trackPanNode = new XAudioNode(new PannerNode(audioContext))
        trackPanNode.connectTo(masterGainNode)

        let trackGainNode = new XAudioNode(new GainNode(audioContext))
        trackGainNode.connectTo(trackPanNode)

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
let interval = 0.025
let lookahead = 0.250
let schedulingWindow: TimeWindow

async function loadAudioBuffer(url: string) {
    if (!audioBufferMap.has(url)) {
        let res = await fetch(url)
        let data = await res.arrayBuffer()
        let audioBuffer = await audioContext.decodeAudioData(data)
        audioBufferMap.set(url, audioBuffer)
    }
}

function doSchedulingRun() {
    const now = audioContext.currentTime

    if (!isPlaying.value) {
        console.warn('tried to schedule while not playing')
        return
    }

    if (now >= measureStartTime + measureDuration.value) {
        measureStartTime += measureDuration.value
    }

    for (const track of tracks.value) {

        if (!scheduledTrackSamples.has(track.id)) {
            scheduledTrackSamples.set(track.id, [])
        }

        let trackSamples = scheduledTrackSamples.get(track.id)!

        if (track.positions.length == 0) {
            continue
        }

        // keep looping until target time is past lookahead, not stop when all positions are looped once
        let scheduleNextMeasure = true
        let loopMeasureStartTime = measureStartTime

        while (scheduleNextMeasure) {

            for (const position of track.positions) {
                let swingOffset = 0

                let stepIndex = position * stepCount.value
                let stepIndexRounded = Math.round(position * stepCount.value)
                let stepIndexDelta = Math.abs(stepIndex - stepIndexRounded)

                // non-triplet step
                if (stepIndexDelta < 0.05) {
                    // swing every other
                    if (stepIndex % 2 != 0) {
                        swingOffset = ((swing.value || 0) / 100) * stepDuration.value
                    }
                }

                let targetTime = loopMeasureStartTime + (measureDuration.value * position) + swingOffset

                if (targetTime > now + lookahead) {
                    // past lookahead, can stop looping after this loop
                    // can't break because positions may not be in order
                    scheduleNextMeasure = false
                    continue
                }

                if (schedulingWindow.isInside(targetTime)) {

                    if (trackSamples.find(ts => Math.abs(ts.time - targetTime) < (stepDuration.value / 2))) {
                        // already scheduled or too close to existing, allow greater value to account for tempo change
                        // TODO check if this breaks triplets or swung notes
                        continue
                    }

                    let scheduledSample = scheduleOneSample(track, targetTime)

                    trackSamples.unshift({
                        time: targetTime,
                        source: scheduledSample.audioNode
                    })
                }
            }

            loopMeasureStartTime += measureDuration.value
        }
    }

    schedulingWindow.from = now
    schedulingWindow.to = now + lookahead

    unscheduleOld()
}

function scheduleOneSample(track: Track, absoluteTime: number) {
    if (absoluteTime < audioContext.currentTime) {
        console.error('scheduling in past')
    }

    let audioBuffer = getAudioBuffer(track.sampleUrl)
    
    let trackGainNode = getTrackGainNode(track.id);
    (trackGainNode.audioNode as GainNode).gain.value = track.volume

    let trackPanNode = trackGainNode.outputs[0];
    ((trackPanNode as XAudioNode<AudioNode>).audioNode as PannerNode).positionX.value = track.pan

    let sourceNode = new XAudioNode(new AudioBufferSourceNode(audioContext, { buffer: audioBuffer }))
    sourceNode.connectTo(trackGainNode)
    sourceNode.audioNode.start(absoluteTime)

    return sourceNode
}

function unscheduleOld() {
    for (const track of tracks.value) {

        let trackSamples = scheduledTrackSamples.get(track.id)!

        // purge old scheduled samples
        for (let i = trackSamples.length - 1; i >= 0; i--) {
            const trackSample = trackSamples[i]

            if (trackSample.time + measureDuration.value < audioContext.currentTime) {
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

function unscheduleAll() {
    for (const track of tracks.value) {

        let trackSamples = scheduledTrackSamples.get(track.id)
        if (!trackSamples) {
            console.warn('track sample not found')
            return
        }

        // purge all scheduled samples
        for (let i = trackSamples.length - 1; i >= 0; i--) {
            const trackSample = trackSamples[i]

            trackSample.source.stop()
            trackSample.source.disconnect()
            trackSamples.pop()
        }
    }
}

function init() {
    let testTracks: Track[] = [
        {
            id: 'kick_0',
            name: 'kick',
            pan: 0,
            volume: 1,
            positions: [],
            sampleUrl: './audio/kick.mp3',
            tripletEnabled: false,
        },
        {
            id: 'snare_0',
            name: 'snare',
            pan: 0,
            volume: 1,
            positions: [],
            sampleUrl: './audio/snare.mp3',
            tripletEnabled: false,
        },
        {
            id: 'hihat_0',
            name: 'hihat',
            pan: 0,
            volume: 1,
            positions: [],
            sampleUrl: './audio/hihat.mp3',
            tripletEnabled: false,
        }
    ]

    testTracks.forEach(track => store.addTrack(track))
}

// load
onMounted(() => {
    let querystring = new URLSearchParams(window.location.search)
    let stateParam = querystring.get('state')

    if (stateParam) {
        try {
            let decoded64 = atob(stateParam)
            let qsState = JSON.parse(decoded64) as Partial<SequencerState>
            store.loadAppState(qsState)

            // remove querystring without navigating
            window.history.replaceState(null, '', '.')
        }
        catch {
            init()
        }
    }
    else {
        init()
    }
})

onUnmounted(() => {
    unscheduleAll()
    trackIds.value.forEach(trackId => store.removeTrack(trackId))
})
</script>

<template></template>
