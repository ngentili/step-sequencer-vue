<script setup lang="ts">
import Sequencer from './components/Sequencer.vue';
import Toast from './components/Toast.vue';
import Toolbar from './components/Toolbar.vue';
import TrackControl from './components/TrackControl.vue';
import TrackTimeline from './components/TrackTimeline.vue';
import { useSequencerStore, useUiStore } from './store'
import { storeToRefs } from 'pinia'

const { trackIds } = storeToRefs(useSequencerStore())
const { modal } = storeToRefs(useUiStore())

function onModalSubmit(output: any) {
    if (modal.value?.onSubmit) {
        modal.value.onSubmit(output)
    }
    modal.value = null
}

function onModalCancel() {
    if (modal.value?.onCancel) {
        modal.value.onCancel()
    }
    modal.value = null
}

</script>

<template>
    <Toolbar />

    <div class="track-container" v-for="trackId in trackIds">
        <TrackControl class="flex-1" :trackId="trackId" />
        <TrackTimeline class="flex-3" :trackId="trackId" />
    </div>

    <Sequencer />
    <Toast />

    <component v-if="modal" :is="modal.view" :input="modal.input" @submit="onModalSubmit" @cancel="onModalCancel">
    </component>
</template>

<style scoped>
.track-container {
    display: flex;
    flex-direction: column;
    margin: 2%;

    @media screen and (min-width: 600px) {
        flex-direction: row;
    }
}
</style>
