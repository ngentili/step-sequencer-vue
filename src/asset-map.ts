export type DrumId =
    'DRUM_KICK_1' | 'DRUM_KICK_2' | 'DRUM_KICK_3' |
    'DRUM_SNARE_1' | 'DRUM_SNARE_2' | 'DRUM_SNARE_3' |
    'DRUM_HAT_1' | 'DRUM_HAT_2' | 'DRUM_HAT_3' |
    'DRUM_TOM_1' | 'DRUM_TOM_2' | 'DRUM_TOM_3'

export const drumSamples: Record<DrumId, string> = {
    DRUM_KICK_1: '/audio/kick.mp3',
    DRUM_KICK_2: '/audio/kick2mp3',
    DRUM_KICK_3: '/audio/kick3.mp3',

    DRUM_SNARE_1: '/audio/snare.mp3',
    DRUM_SNARE_2: '/audio/snare2.mp3',
    DRUM_SNARE_3: '/audio/snare3.mp3',

    DRUM_HAT_1: '/audio/hihat.mp3',
    DRUM_HAT_2: '/audio/hihat2.mp3',
    DRUM_HAT_3: '/audio/hihat3.mp3',

    DRUM_TOM_1: '/audio/tom1.mp3',
    DRUM_TOM_2: '/audio/tom2.mp3',
    DRUM_TOM_3: '/audio/tom3.mp3',
}
