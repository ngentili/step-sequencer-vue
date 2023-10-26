<script setup lang="ts">
import { useSequencerStore } from '@/store';
import { computed, ref } from 'vue';

const props = defineProps<{
    trackId: string
}>()

const store = useSequencerStore()
const track = computed(() => store.getTrackById(props.trackId))

const optionsRef = ref<HTMLElement>()
const showOptions = ref(false)

function onOptionsClick(e: MouseEvent) {
    showOptions.value = true
    
    optionsRef.value!.style.display = ''
    optionsRef.value!.style.top = e.clientY.toString()
    optionsRef.value!.style.left = e.clientX.toString()
}

function onVolumeChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.volumeChange(props.trackId, value)
}

function onPanChange(e: Event) {
    let value = (e.target as HTMLInputElement).valueAsNumber
    store.panChange(props.trackId, value)
}
</script>

<template>
    <div>
        <div class="flexbox-row">
            <div>
                {{ track.name }}
            </div>
            <div class="material-symbols-outlined options-button" @click="onOptionsClick">more_vert</div>
            <div>
                <input class="volume-slider" type="range" min="0" max="1" step="0.01" :value="track.volume"
                    @change="onVolumeChange">
            </div>
            <div>
                <datalist :id="`pan-datalist-${trackId}`">
                    <option value="0"></option>
                </datalist>
                <input class="pan-slider" type="range" min="-1" max="1" step="0.01" :list="`pan-datalist-${trackId}`"
                    :value="track.pan" @change="onPanChange">
            </div>
        </div>
        <div class="options-dropdown" ref="optionsRef" style="display: none;">
            <div>option 1</div>
            <div>option 2</div>
            <div>option 3</div>
        </div>
    </div>
</template>

<style scoped>
.volume-slider {
    width: 70px;
}

.pan-slider {
    width: 70px;
}

.options-button {
    cursor: pointer;
}

.options-dropdown {
    position: absolute;
    cursor: pointer;
    user-select: none;
    background-color: lightgrey;
}
</style>
