<script setup lang="ts">
import { useUiStore } from '@/store'
import { storeToRefs } from 'pinia'

const { messages } = storeToRefs(useUiStore())
</script>

<template>
    <div class="toast-container">
        <TransitionGroup name="list" tag="div">
            <div v-for="msg in messages" class="toast-message" :id="msg.id" :key="msg.id">
                {{ msg.message }}
            </div>
        </TransitionGroup>
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
}

.toast-message {
    background-color: rgb(127, 127, 127);
    color: rgb(220, 220, 220);
    padding: 5px;
    margin: 5px;
    border-radius: 5px;
}

.list-enter-active,
.list-leave-active {
    transition: all 0.1s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
}
</style>
