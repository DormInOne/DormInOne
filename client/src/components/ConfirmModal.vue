<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="cancel">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300 shadow-xl">
          <div class="text-center mb-4">
            <div :class="[
              'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4',
              type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
            ]">
              <AlertTriangle v-if="type === 'danger'" :class="['w-7 h-7', type === 'danger' ? 'text-red-500' : 'text-blue-500']" />
              <Info v-else :class="['w-7 h-7', type === 'danger' ? 'text-red-500' : 'text-blue-500']" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">{{ message }}</p>
          </div>
          <div class="flex gap-3">
            <button
              class="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 font-medium transform hover:scale-102 active:scale-98"
              @click="cancel"
            >
              取消
            </button>
            <button
              :class="[
                'flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 active:scale-98',
                type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg' : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg'
              ]"
              @click="confirm"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { AlertTriangle, Info } from 'lucide-vue-next'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'danger'].includes(value)
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.modal-enter-active {
  animation: modalFadeIn 0.2s ease-out;
}

.modal-leave-active {
  animation: modalFadeOut 0.2s ease-in;
}

.modal-enter-active > div {
  animation: modalSlideIn 0.3s ease-out;
}

.modal-leave-active > div {
  animation: modalSlideOut 0.2s ease-in;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalFadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modalSlideOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
}
</style>