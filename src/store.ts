import { defineStore } from 'pinia'
import type { Track } from './models'

let testTracks: Track[] = [
    {
        id: 'qwer',
        name: 'kick',
        pan: -0.25,
        volume: 0.7,
        loopSampleTimes: [],
    },
    {
        id: 'asdf',
        name: 'snare',
        pan: 0,
        volume: 0.3,
        loopSampleTimes: [],
    },
    {
        id: 'zxcv',
        name: 'hihat',
        pan: .4,
        volume: 1,
        loopSampleTimes: [],
    }
]

export interface SequencerState {
    tempo: number
    beatsPerMeasure: number
    beatDuration: number
    swing: number
    isPlaying: boolean
    tracks: Track[]
}

const initialState: SequencerState = {
    tempo: 100,
    beatsPerMeasure: 4,
    beatDuration: 4,
    swing: 0,
    isPlaying: false,
    tracks: testTracks,
}

export const useSequencerStore = defineStore('sequencer', {
    state: () => initialState,
    getters: {
        trackCount: (state: SequencerState) => state.tracks.length,
        trackIds: (state: SequencerState) => state.tracks.map(track => track.id),
        getTrackById: (state: SequencerState) =>
            (trackId: string) => {
                let track = state.tracks.find(track => track.id === trackId)
                if (!track) {
                    throw new Error(`trackId not found: ${trackId}`)
                }
                return track
            },
        baseStepCount: (state: SequencerState) => state.beatsPerMeasure * state.beatDuration,
    },
    actions: {
        tempoChange(value: number) {
            if (value < 1) {
                throw new Error(`invalid tempo value: ${value}`)
            }
            this.tempo = value
        },
        beatsPerMeasureChange(value: number) {
            if (value < 2) {
                throw new Error(`invalid swing beatsPerMeasure: ${value}`)
            }
            this.beatsPerMeasure = value
        },
        beatDurationChange(value: number) {
            if (value < 2 || value % 2 !== 0) {
                throw new Error(`invalid swing beatDuration: ${value}`)
            }
            this.beatDuration = value
        },
        swingChange(value: number) {
            if (value < 0 || value > 100) {
                throw new Error(`invalid swing value: ${value}`)
            }
            this.swing = value
        },
        playingChange(value: boolean) {
            this.isPlaying = value
        },
        volumeChange(trackId: string, value: number) {
            if (value < 0 || value > 1) {
                throw new Error(`invalid volume value: ${value}`)
            }
            this.getTrackById(trackId).volume = value
        },
        panChange(trackId: string, value: number) {
            if (value < -1 || value > 1) {
                throw new Error(`invalid pan value: ${value}`)
            }
            this.getTrackById(trackId).pan = value
        },
        addLoopSample(trackId: string, position: number) {
            let track = this.getTrackById(trackId)
            if (track.loopSampleTimes.find(t => t === position)) {
                throw new Error(`loop sample already exists: trackId ${trackId} position ${position}`)
            }
            track.loopSampleTimes.push(position)
        },
        removeLoopSample(trackId: string, position: number) {
            let track = this.getTrackById(trackId)
            let idx = track.loopSampleTimes.findIndex(t => t === position)
            if (idx < 0) {
                throw new Error(`loop sample does not exist: trackId ${trackId} position ${position}`)
            }
            track.loopSampleTimes.splice(idx, 1)
        },
    },
})
