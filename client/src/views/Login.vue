<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-md mx-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">系统登录</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">请输入账号密码登录系统</p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名</label>
            <input
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              @keyup.enter="handleLogin"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              @keyup.enter="handleLogin"
            />
          </div>

          <button
            @click="handleLogin"
            :disabled="!username.trim() || !password.trim() || loading"
            class="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
            <template v-else>
              <LogIn class="w-5 h-5" />
              登录
            </template>
          </button>

          <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
        </div>

        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="goToOnboarding('floor')"
              class="py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-2"
            >
              <Users class="w-4 h-4" />
              宿管绑定
            </button>
            <button
              @click="goToOnboarding('dorm')"
              class="py-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center justify-center gap-2"
            >
              <Home class="w-4 h-4" />
              舍长绑定
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Lock, LogIn, Loader2, Users, Home } from 'lucide-vue-next'
import { authApi } from '../services/api'
import { useAppStore } from '../stores/appStore'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!username.value.trim()) {
    error.value = '请输入用户名'
    return
  }
  if (!password.value.trim()) {
    error.value = '请输入密码'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data } = await authApi.login(username.value.trim(), password.value.trim())
    
    if (data.success) {
      appStore.login(
        data.role,
        data.username,
        data.name || '',
        data.floorId || '',
        data.dormId || '',
        data.floorName || '',
        data.dormName || '',
        data.className || '',
        data.buildingName || ''
      )
      router.push('/')
    } else {
      error.value = data.message || '登录失败'
    }
  } catch (errorResponse) {
    error.value = errorResponse.response?.data?.message || '登录失败'
  } finally {
    loading.value = false
  }
}

const goToOnboarding = () => {
  router.push('/onboarding')
}
</script>