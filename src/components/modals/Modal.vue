<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
    input?: any
}>()

const emit = defineEmits<{
    (emit: 'submit', output: any): void
    (emit: 'cancel'): void
}>()

const overlay = ref<HTMLElement>()
const modal = ref<HTMLElement>()

function submit() {
    let data = { ayy: 'lmao', haha: 123 }
    emit('submit', data)
}

function cancel() {
    emit('cancel')
}
</script>

<template>
    <div ref="overlay" class="overlay" @click="cancel"></div>
    <div ref="modal" class="modal flexbox-col">
        <div style="flex: 20;">
            this is Modal.vue
            input: {{ props.input }}
        </div>
        <div class="actions">
            <button @click="submit">submit</button>
            <button @click="cancel">cancel</button>
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
