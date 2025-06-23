
export interface TOAST_OBJECT {
    id: number
    type: string
    title: string
    message: string
    duration: number | null
}

export interface TOAST_CONTAINER {
    toasts: TOAST_OBJECT[] 
    onRemoveToast: ((id: number) => void) 
}

export interface TOAST {
    toast: TOAST_OBJECT
    onClose: (id: number) => void
}