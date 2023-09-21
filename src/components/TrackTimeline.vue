<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { storeToRefs } from 'pinia';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
    trackId: string
}>()

const store = useSequencerStore()
const { beatUnit, stepCount, tripletStepCount } = storeToRefs(store)

const steps = ref(Array.from({ length: stepCount.value }, () => false))
const tripletEnabled = ref(false)
const tripletSteps = ref(Array.from({ length: tripletStepCount.value }, () => false))

function onStepClick(stepIndex: number) {
    steps.value[stepIndex] = !steps.value[stepIndex]

    if (stepIndex % beatUnit.value == 0) {
        let tripletStepIndex = stepIndex * (3 / beatUnit.value)
        tripletSteps.value[tripletStepIndex] = steps.value[stepIndex]
    }

    let didEnable = steps.value[stepIndex]
    let position = stepIndex / stepCount.value

    if (didEnable) {
        store.addLoopSample(props.trackId, position)
    }
    else {
        store.removeLoopSample(props.trackId, position)
    }
}

function onTripletStepClick(tripletStepIndex: number) {
    tripletSteps.value[tripletStepIndex] = !tripletSteps.value[tripletStepIndex]

    if (tripletStepIndex % 3 == 0) {
        let stepIndex = tripletStepIndex * (beatUnit.value / 3)
        steps.value[stepIndex] = tripletSteps.value[tripletStepIndex]
    }

    let didEnable = tripletSteps.value[tripletStepIndex]
    let position = tripletStepIndex / tripletStepCount.value

    if (didEnable) {
        store.addLoopSample(props.trackId, position)
    }
    else {
        store.removeLoopSample(props.trackId, position)
    }
}

watch(stepCount, (newStepCount, oldStepCount) => {
    let stepCountChange = newStepCount - oldStepCount

    if (stepCountChange > 0) {
        // add
        for (let i = 0; i < stepCountChange; i++) {
            steps.value.push(false)
        }
    }
    else if (stepCountChange < 0) {
        // remove
        steps.value.pop()
        for (let i = 0; i < -stepCountChange; i++) {
            steps.value.pop()
        }
    }
})
</script>

<template>
    <div class="flexbox-row">
        <div>
            triplet
            <input type="checkbox" v-model="tripletEnabled">
        </div>
        <div class="flex-1">
            <div class="step-container">
                <div v-for="(_, i) in stepCount" :class="{ step: true, stepEnabled: steps[i], stepPrimary: i % 4 == 0 }"
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
