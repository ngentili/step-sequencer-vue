<script setup lang="ts">
import { useSequencerStore } from '@/store'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'

// TODO click and drag step enable/disable
// TODO shift/ctrl click fill/clear

const props = defineProps<{
    trackId: string
}>()

const store = useSequencerStore()

// refs
const { beatUnit, stepCount, tripletStepCount, expectedPositions, expectedTripletPositions, beatsPerMeasure } = storeToRefs(store)

// computed
const track = computed(() => store.getTrackById(props.trackId))
const tripletEnabled = computed(() => track.value.tripletEnabled)
const trackPositions = computed(() => track.value.positions)

const steps = computed(() => expectedPositions.value.map(ep =>
    trackPositions.value.find(st => ep === st) !== undefined))

const tripletSteps = computed(() => expectedTripletPositions.value.map(ep =>
    trackPositions.value.find(st => ep === st) !== undefined))

// triplet enable change
watch(tripletEnabled, () => {
    // disable any triplet-only steps when triplet is unchecked
    if (!tripletEnabled.value) {
        // remove all trackPositions that are in expectedTripletPositions but not in expectedPositions
        let toRemove = trackPositions.value.filter(p =>
            expectedTripletPositions.value.includes(p) && !expectedPositions.value.includes(p))

        toRemove.forEach(p => store.removeLoopSample(props.trackId, p))
    }
})

function onStepClick(stepIndex: number) {
    let didEnable = !steps.value[stepIndex]
    let position = stepIndex / stepCount.value

    if (didEnable) {
        store.addLoopSample(props.trackId, position)
    }
    else {
        store.removeLoopSample(props.trackId, position)
    }
}

function onTripletStepClick(tripletStepIndex: number) {
    let didEnable = !tripletSteps.value[tripletStepIndex]
    let position = tripletStepIndex / tripletStepCount.value

    if (didEnable) {
        store.addLoopSample(props.trackId, position)
    }
    else {
        store.removeLoopSample(props.trackId, position)
    }
}

function onTripletCheckboxChange(e: Event) {
    let enabled = (e.target as HTMLInputElement).checked
    store.tripletEnabledChange(props.trackId, enabled)
}

function adjustFloat(value: number) {
    for (const ep of [...expectedPositions.value, ...expectedTripletPositions.value]) {
        if (value !== ep && Math.abs(ep - value) < Number.EPSILON) {
            return ep
        }
    }
    return value
}

// beat unit change
watch(beatUnit, () => {
    // adjust positions to new expected positions
    track.value.positions = track.value.positions
        .filter(p => expectedPositions.value.includes(p) || expectedTripletPositions.value.includes(p))
})

// beats per measure change
watch(beatsPerMeasure, (oldBeatsPerMeasure, newBeatsPerMeasure) => {
    // let delta = newBeatsPerMeasure - oldBeatsPerMeasure
    let ratio = newBeatsPerMeasure / oldBeatsPerMeasure

    // adjust positions to new expected positions
    track.value.positions = track.value.positions
        .map(p => adjustFloat(p * ratio))
        .filter(p => expectedPositions.value.includes(p) || expectedTripletPositions.value.includes(p))

})
</script>

<template>
    <div class="flexbox-row">
        <div>
            triplet
            <input type="checkbox" :checked="tripletEnabled" @change="onTripletCheckboxChange">
        </div>
        <div class="flex-1">
            <div class="step-container">
                <div v-for="(_, i) in stepCount"
                    :class="{ step: true, stepEnabled: steps[i], stepPrimary: i % beatUnit == 0 }"
                    @click="() => onStepClick(i)">
                </div>
            </div>
            <div class="step-container">
                <div v-if="tripletEnabled" v-for="(_, i) in tripletStepCount"
                    :class="{ step: true, stepEnabled: tripletSteps[i], stepPrimary: i % 3 == 0 }"
                    @click="() => onTripletStepClick(i)">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.step {
    height: 35px;
    border: 1px solid black;
    border-radius: 5px;
    margin: 2px;
    background-color: white;
    flex: 1;
}

.step:hover {
    border: 1px solid orange;
}

.step:active {
    border: 1px solid red;
}

.stepEnabled {
    background-color: green !important;
}

.stepPrimary {
    background-color: lightgrey;
}

.step-container {
    display: flex;
    flex-direction: row;
    width: 100%;
}
</style>
