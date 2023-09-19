export interface Track {
    id: string
    name: string
    volume: number
    pan: number
    loopSampleTimes: number[]
    sampleId: string
}

export class XAudioNode {

    audioNode: AudioNode
    private inputs: XAudioNode[]

    constructor(audioNode: AudioNode) {
        this.audioNode = audioNode
        this.inputs = []
    }

    connectTo(destination: XAudioNode|AudioDestinationNode) {
        if (destination instanceof AudioDestinationNode) {
            this.audioNode.connect(destination)
        }
        else {
            this.audioNode.connect(destination.audioNode)
            destination.inputs.push(this)
        }
    }

    disconnectInputs() {
        this.inputs.forEach(input => input.disconnectInputs())
        this.audioNode.disconnect()
    }
}
