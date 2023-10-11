<script setup lang="ts">
import { ref, watch } from 'vue'

// needs to be re-assigned, not mutated for watcher to pick up differences
const messages = ref<string[]>([])

watch(messages, (newMessages, oldMessages) => {
    let addedMessages = newMessages.filter(newMsg => !oldMessages.includes(newMsg))

    for (const addedMessage of addedMessages) {
        setTimeout(() => {
            // TODO filter by some id, there could be duplicate messages
            messages.value = messages.value.filter(msg => msg !== addedMessage)
        }, 5000)
    }
}, { deep: true })

// test messages
setTimeout(() => {
    messages.value = [...messages.value, 'message 1']
}, 1000)

setTimeout(() => {
    messages.value = [...messages.value, 'message 2']
}, 2000)

setTimeout(() => {
    messages.value = [...messages.value, 'message 3']
}, 3000)
</script>

<template>
    <div class="toast-container hide">
        <div v-for="msg in messages" class="toast-message">{{ msg }}</div>
    </div>
</template>

<style scoped>
.toast-container {
    position: absolute;
    top: 0;
    right: 0;
    max-width: 40%;
    max-height: 100vh;
    overflow: hidden;
    /* opacity: 1; */
    /* transition: opacity 0.25s; */
}

/* .show {
    opacity: 1;
}

.hide {
    opacity: 0;
} */

.toast-message {
    background-color: rgb(127, 127, 127);
    color: rgb(220, 220, 220);
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
}
</style>
