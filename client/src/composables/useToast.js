import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  const addToast = (type, title, message = '') => {
    const id = ++toastId
    toasts.value.push({ id, type, title, message })
    setTimeout(() => {
      removeToast(id)
    }, 4000)
    return id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (title, message) => addToast('success', title, message)
  const error = (title, message) => addToast('error', title, message)
  const info = (title, message) => addToast('info', title, message)
  const warning = (title, message) => addToast('warning', title, message)

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast
  }
}
