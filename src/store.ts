import { defineStore } from 'pinia'
import type { Track } from './models'

export interface SequencerState {
    tempo: number
    beatsPerMeasure: number
    beatUnit: number // type of note that recieves one beat
    swing: number
    isPlaying: boolean
    tracks: Track[]
    stepPrecision: number
}

const initialState: SequencerState = {
    tempo: 100,
    beatsPerMeasure: 4,
    beatUnit: 4,
    swing: 0,
    isPlaying: false,
    tracks: [],
    stepPrecision: 1,
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
        baseStepCount: (state: SequencerState) => state.beatsPerMeasure * state.beatUnit,
        measureDuration: (state: SequencerState) => (60 / state.tempo) * state.beatsPerMeasure,
        stepDuration(state: SequencerState): number { return (() => this.measureDuration / this.stepCount)() },
        stepCount(state: SequencerState): number { return (() => this.baseStepCount * state.stepPrecision)() },
        tripletStepCount: (state: SequencerState) => (() => state.beatsPerMeasure * 3 * state.stepPrecision)(),
        shareUrl: (state: SequencerState) => {
            let shareableState: Partial<SequencerState> = {
                beatsPerMeasure: state.beatsPerMeasure,
                beatUnit: state.beatUnit,
                stepPrecision: state.stepPrecision,
                swing: state.swing,
                tempo: state.tempo,
                tracks: state.tracks,
            }
            let json = JSON.stringify(shareableState)
            let b64 = btoa(json)
            let qsParams = new URLSearchParams(window.location.search)
            qsParams.set('state', b64)
            let qs = qsParams.toString()
            return `${window.location.host}${window.location.pathname}?${qs}`
        },
        expectedPositions(state: SequencerState): number[] { return (() => Array.from({ length: this.stepCount }, (_, i) => i / this.stepCount))() },
        expectedTripletPositions(state: SequencerState): number[] { return (() => Array.from({ length: this.tripletStepCount }, (_, i) => i / this.tripletStepCount))() },
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
                throw new Error(`invalid beatsPerMeasure: ${value}`)
            }
            this.beatsPerMeasure = value
        },
        beatUnitChange(value: number) {
            // check if positive power of 2
            if (value < 1 || (value & (value - 1)) !== 0) {
                throw new Error(`invalid beatUnit: ${value}`)
            }
            this.beatUnit = value
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
        tripletEnabledChange(trackId: string, enabled: boolean) {
            this.getTrackById(trackId).tripletEnabled = enabled
        },
        addLoopSample(trackId: string, position: number) {
            let track = this.getTrackById(trackId)
            if (track.positions.find(t => t === position)) {
                throw new Error(`loop sample already exists: trackId ${trackId} position ${position}`)
            }
            track.positions.push(position)
        },
        removeLoopSample(trackId: string, position: number) {
            let track = this.getTrackById(trackId)
            let idx = track.positions.findIndex(t => t === position)
            if (idx < 0) {
                throw new Error(`loop sample does not exist: trackId ${trackId} position ${position}`)
            }
            track.positions.splice(idx, 1)
        },
        addTrack(track: Track) {
            if (this.trackIds.includes(track.id)) {
                throw new Error(`trackId already exists: ${track.id}`)
            }
            this.tracks.push(track)
        },
        removeTrack(trackId: string) {
            let idx = this.tracks.findIndex(track => track.id === trackId)
            if (idx < 0) {
                throw new Error(`trackId does not exist: ${trackId}`)
            }
            this.tracks.splice(idx, 1)
        },
        loadAppState(loadedState: Partial<SequencerState>) {
            this.tempo = loadedState.tempo ?? initialState.tempo
            this.beatsPerMeasure = loadedState.beatsPerMeasure ?? initialState.beatsPerMeasure
            this.beatUnit = loadedState.beatUnit ?? initialState.beatUnit
            this.swing = loadedState.swing ?? initialState.swing
            this.tracks = loadedState.tracks ?? initialState.tracks
            this.stepPrecision = loadedState.stepPrecision ?? initialState.stepPrecision
        },
    },
})
