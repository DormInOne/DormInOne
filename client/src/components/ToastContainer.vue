<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-50 space-y-3">
      <TransitionGroup name="toast">
        <div
          v-for="(toast, index) in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl min-w-80 max-w-96 backdrop-blur-sm',
            toastTypeClasses[toast.type]
          ]"
          :style="{ transform: `translateY(${index * 8}px)` }"
        >
          <div :class="['w-8 h-8 rounded-full flex items-center justify-center shadow-md', iconBgClasses[toast.type]]">
            <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-white" />
            <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-white" />
            <Info v-else-if="toast.type === 'info'" class="w-5 h-5 text-white" />
            <AlertTriangle v-else class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-white">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-sm text-white/80">{{ toast.message }}</p>
          </div>
          <button
            class="ml-2 p-1 rounded-full hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
            @click="removeToast(toast.id)"
          >
            <X class="w-4 h-4 text-white" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const toastTypeClasses = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  warning: 'bg-yellow-500'
}

const iconBgClasses = {
  success: 'bg-green-400',
  error: 'bg-red-400',
  info: 'bg-blue-400',
  warning: 'bg-yellow-400'
}
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-leave-active {
  animation: slideOut 0.3s cubic-bezier(0.55, 0, 1, 0.45);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
  }
}
</style>
