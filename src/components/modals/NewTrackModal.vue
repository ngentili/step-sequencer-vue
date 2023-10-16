<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { type ModalEmits, type ModalProps } from './modal-template'
import { drumSamples, type DrumId } from '@/asset-map'
import { useUiStore } from '@/store'

let audioContext: AudioContext

onMounted(() => {
    audioContext = new AudioContext()
    audioContext.resume()
})

const uiStore = useUiStore()

const props = defineProps<ModalProps>()
const emit = defineEmits<ModalEmits>()

const overlay = ref<HTMLElement>()
const modal = ref<HTMLElement>()

const selection = ref<DrumId>()
let nameInput = ''

async function drumItemClick(drumId: DrumId) {
    selection.value = drumId

    // play one-off sample
    // let url = drumSamples[drumId]
    // let res = await fetch(url)
    // let data = await res.arrayBuffer()
    // let audioBuffer = await audioContext.decodeAudioData(data)
    // let source = new AudioBufferSourceNode(audioContext, { buffer: audioBuffer })
    // source.connect(audioContext.destination)
    // source.start()
}

function onSubmit() {
    if (!selection.value) {
        uiStore.toast('Select a sample to add')
        return
    }
    if (!nameInput) {
        uiStore.toast('Enter a track name')
        return
    }

    let url = drumSamples[selection.value]

    emit('submit', {
        name: nameInput,
        url,
    })
}

function onCancel() {
    emit('cancel')
}

let drumItems: { id: DrumId, name: string }[] = [
    { id: 'DRUM_KICK_1', name: 'Kick 1' },
    { id: 'DRUM_KICK_2', name: 'Kick 2' },
    { id: 'DRUM_KICK_3', name: 'Kick 3' },
    { id: 'DRUM_SNARE_1', name: 'Snare 1' },
    { id: 'DRUM_SNARE_2', name: 'Snare 2' },
    { id: 'DRUM_SNARE_3', name: 'Snare 3' },
    { id: 'DRUM_HAT_1', name: 'Hat 1' },
    { id: 'DRUM_HAT_2', name: 'Hat 2' },
    { id: 'DRUM_HAT_3', name: 'Hat 3' },
    { id: 'DRUM_TOM_1', name: 'Tom 1' },
    { id: 'DRUM_TOM_2', name: 'Tom 2' },
    { id: 'DRUM_TOM_3', name: 'Tom 3' },
]
</script>

<template>
    <div ref="overlay" class="overlay" @click="onCancel"></div>
    <div ref="modal" class="modal flexbox-col">
        <div class="drum-grid" style="flex: 20;">
            <div v-for="drumItem in drumItems"
                :class="['drum-grid-item', { 'drum-grid-item-selected': selection === drumItem.id }]"
                @click="drumItemClick(drumItem.id)">
                <div class="drum-icon material-symbols-outlined">music_note</div>
                <div class="drum-label">{{ drumItem.name }}</div>
            </div>
        </div>
        <div style="margin: auto">
            <input v-model="nameInput" type="text" placeholder="Track name">
        </div>
        <div class="actions">
            <button @click="onSubmit">Add</button>
            <button @click="onCancel">Cancel</button>
        </div>
        <div class="flex-1"></div>
    </div>
</template>

<style scoped>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    background-color: grey;
    opacity: 50%;
}

.modal {
    position: absolute;
    top: 25%;
    left: 25%;
    width: 50%;
    height: 50%;
    margin: auto;
    background-color: white;
    border-radius: 5px;
}

.actions {
    margin: auto;
}

.actions button {
    margin: 5px;
    padding: 5px 10px;
}

.drum-grid {
    padding: 10px;
    display: grid;
    gap: 5px;
    grid-template-columns: repeat(3, 1fr);
}

.drum-grid-item {
    background-color: lightgrey;
    border-radius: 5px;
    width: 85%;
    height: 85%;
    margin: auto;
    cursor: pointer;
    user-select: none;
    border: 2px transparent solid;
}

.drum-grid-item-selected {
    border: 2px red solid;
}

.drum-icon {
    position: relative;
    margin: auto;
    left: calc(50% - 12px);
}

.drum-label {
    font-size: small;
    text-align: center;
}
</style>
