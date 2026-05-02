<template>
  <Teleport to="body">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-80 max-w-96 transform transition-all duration-500',
          toastTypeClasses[toast.type]
        ]"
      >
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center', iconBgClasses[toast.type]]">
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
          class="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
          @click="removeToast(toast.id)"
        >
          <X class="w-4 h-4 text-white" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>import { ref } from 'vue';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-vue-next';
const toasts = ref([]);
let toastId = 0;
const toastTypeClasses = {
 success: 'bg-green-500',
 error: 'bg-red-500',
 info: 'bg-blue-500',
 warning: 'bg-yellow-500'
};
const iconBgClasses = {
 success: 'bg-green-400',
 error: 'bg-red-400',
 info: 'bg-blue-400',
 warning: 'bg-yellow-400'
};
const addToast = (type, title, message = '') => {
 const id = ++toastId;
 toasts.value.push({ id, type, title, message });
 setTimeout(() => {
 removeToast(id);
 }, 4000);
};
const removeToast = (id) => {
 const index = toasts.value.findIndex(t => t.id === id);
 if (index !== -1) {
 toasts.value.splice(index, 1);
 }
};
const success = (title, message) => addToast('success', title, message);
const error = (title, message) => addToast('error', title, message);
const info = (title, message) => addToast('info', title, message);
const warning = (title, message) => addToast('warning', title, message);
defineExpose({
 success,
 error,
 info,
 warning
});
</script>

<style scoped>
.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}
</style>
