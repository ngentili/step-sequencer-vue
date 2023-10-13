<script setup lang="ts">
import { ref } from 'vue';
import { type ModalEmits, type ModalProps } from './modal-template'

const props = defineProps<ModalProps>()
const emit = defineEmits<ModalEmits>()

const overlay = ref<HTMLElement>()
const modal = ref<HTMLElement>()
const nameInput = ref<HTMLInputElement>()
const urlInput = ref<HTMLInputElement>()

function onSubmit() {
    emit('submit', {
        name: nameInput.value?.value,
        url: urlInput.value?.value,
    })
}

function onCancel() {
    emit('cancel')
}
</script>

<template>
    <div ref="overlay" class="overlay" @click="onCancel"></div>
    <div ref="modal" class="modal flexbox-col">
        <div style="flex: 20;">
            <input ref="nameInput" type="text" placeholder="name">
            <input ref="urlInput" type="text" placeholder="url">
        </div>
        <div class="actions">
            <button @click="onSubmit">submit</button>
            <button @click="onCancel">cancel</button>
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
</style>
