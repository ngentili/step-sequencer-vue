<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { watch } from 'vue';
import { storeToRefs } from 'pinia'

//
// audio context
//

let audioContext = new AudioContext()
let masterGainNode = new GainNode(audioContext)

//
// store
//

const store = useSequencerStore()
const { tempo, beatsPerMeasure, beatDuration, swing, isPlaying, tracks } = storeToRefs(store)

watch(tempo, (newTempo, oldTempo) => {
    // tempo change
})

watch(beatsPerMeasure, (newBeatsPerMeasure, oldBeatsPerMeasure) => {
    // beatsPerMeasure change
})

watch(beatDuration, (newBeatDuration, oldBeatDuration) => {
    // beatDuration change
})

watch(swing, (newSwing, oldSwing) => {
    // swing change
})

watch(isPlaying, (newIsPlaying, oldIsPlaying) => {
    // isPlaying change
})

watch(tracks, (newTracks, oldTracks) => {
    // tracks change
})
</script>
