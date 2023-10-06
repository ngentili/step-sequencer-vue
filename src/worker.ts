import type { SequencerMessageData, IntervalStartData, DebugData } from './components/Sequencer.vue'

let timer: number | undefined

self.addEventListener('message', (e: MessageEvent<SequencerMessageData>) => {
    switch (e.data.type) {

        case 'intervalStart':
            timer = setInterval(() => {
                self.postMessage({ type: 'debug', log: 'timer' } as DebugData)
                self.postMessage({ type: 'intervalElapsed' } as SequencerMessageData)
            }, (e.data as IntervalStartData).interval * 1000)
            break

        case 'intervalClear':
            clearInterval(timer)
            break
    }
})
