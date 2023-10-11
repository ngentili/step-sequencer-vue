<script setup lang="ts">
import Toolbar from './components/Toolbar.vue'
import TrackControl from './components/TrackControl.vue'
import TrackTimeline from './components/TrackTimeline.vue'
import Sequencer from './components/Sequencer.vue';
import { useSequencerStore } from './store';
import { storeToRefs } from 'pinia';

const { trackIds } = storeToRefs(useSequencerStore())
</script>

<template>
    <div>
        <Toolbar />
    </div>

    <div class="track-container" v-for="trackId in trackIds">
        <TrackControl class="flex-1" :trackId="trackId" />
        <TrackTimeline class="flex-3" :trackId="trackId" />
    </div>

    <Sequencer />
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
