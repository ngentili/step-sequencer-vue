export interface ModalProps {
    input?: any
}

export interface ModalEmits {
    (emit: 'submit', output: any): void
    (emit: 'cancel'): void
}
