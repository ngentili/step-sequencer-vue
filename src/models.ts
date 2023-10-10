export interface Track {
    id: string
    name: string
    volume: number
    pan: number
    positions: number[]
    sampleUrl: string
    tripletEnabled: boolean
}

export class XAudioNode<T extends AudioNode = AudioNode> {

    audioNode: T
    private inputs: XAudioNode[]

    constructor(audioNode: T) {
        this.audioNode = audioNode
        this.inputs = []
    }

    connectTo(destination: XAudioNode | AudioDestinationNode) {
        if (destination instanceof AudioDestinationNode) {
            this.audioNode.connect(destination)
        }
        else {
            this.audioNode.connect(destination.audioNode)
            destination.inputs.push(this)
        }
    }

    disconnectAll() {
        this.inputs.forEach(input => input.disconnectAll())
        this.audioNode.disconnect()
    }
}

export class TimeWindow {

    from: number // inclusive
    to: number // exclusive

    constructor(from: number, to: number) {
        this.from = from
        this.to = to
    }

    isInside(value: number) {
        return value >= this.from && value < this.to
    }
}

export interface ScheduledSample {
    source: AudioBufferSourceNode
    time: number
}
