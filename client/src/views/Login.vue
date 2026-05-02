<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="card p-8 transform transition-all duration-300 animate-modal-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Home class="w-8 h-8 text-primary-600" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">宿舍全能管家</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">登录管理账号</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              用户名
            </label>
            <input
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              class="form-input"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              class="form-input"
              required
            />
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            {{ isLoading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <span class="font-medium">提示：</span>
            宿舍成员无需登录，直接访问即可使用
          </p>
          <div class="mt-3 text-xs text-gray-400 space-y-1">
            <p>舍长账号：leader / 123456</p>
            <p>宿管账号：guard / 654321</p>
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="goHome"
            class="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" />
            返回首页
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
        <p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle class="w-4 h-4" />
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Home, Loader2, ArrowLeft, AlertCircle } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { useAppStore } from '../stores/appStore'
import { authApi } from '../services/api'

const router = useRouter()
const appStore = useAppStore()
const { error: toastError } = useToast()

const form = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await authApi.login(form.username, form.password)
    if (response.data.success) {
      appStore.login(response.data.role, response.data.username)
      router.push('/')
    } else {
      errorMessage.value = response.data.message || '登录失败'
    }
  } catch (err) {
    errorMessage.value = '登录失败，请检查网络连接'
    toastError('登录失败', err.message)
  } finally {
    isLoading.value = false
  }
}

const goHome = () => {
  router.push('/')
}
</script>
