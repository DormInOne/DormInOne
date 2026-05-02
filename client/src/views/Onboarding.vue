<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div class="w-full max-w-md mx-4">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 class="w-8 h-8 text-white" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">欢迎使用宿舍管理系统</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-2">请输入邀请码完成身份绑定</p>
        </div>

        <div v-if="!inviteInfo" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">邀请码</label>
            <div class="relative">
              <input
                v-model="inviteCode"
                type="text"
                placeholder="请输入8位邀请码"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                @keyup.enter="validateInvite"
              />
              <button
                @click="validateInvite"
                :disabled="!inviteCode.trim() || loading"
                class="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Check v-if="!loading" class="w-5 h-5" />
                <Loader2 v-else class="w-5 h-5 animate-spin" />
              </button>
            </div>
            <p v-if="inviteError" class="text-red-500 text-sm mt-2">{{ inviteError }}</p>
          </div>

          <button
            @click="goToLogin"
            class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            已有账号？直接登录
          </button>
        </div>

        <div v-else class="space-y-6">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="flex items-center gap-3 mb-3">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                inviteInfo.type === 'floor' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
              ]">
                <Users v-if="inviteInfo.type === 'floor'" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <Home v-else class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ inviteInfo.type === 'floor' ? '楼层邀请码' : '宿舍邀请码' }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ inviteInfo.type === 'floor' ? inviteInfo.buildingName + ' - ' + inviteInfo.floorName : inviteInfo.className + ' - ' + inviteInfo.dormName }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">用户名</label>
              <input
                v-model="form.username"
                type="text"
                placeholder="设置登录用户名"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">密码</label>
              <input
                v-model="form.password"
                type="password"
                placeholder="设置登录密码"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">姓名</label>
              <input
                v-model="form.name"
                type="text"
                placeholder="请输入真实姓名"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          <div class="flex gap-3">
            <button
              @click="resetInvite"
              class="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              重新输入邀请码
            </button>
            <button
              @click="bindRole"
              :disabled="!form.username.trim() || !form.password.trim() || !form.name.trim() || loading"
              class="flex-1 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              确认绑定
            </button>
          </div>

          <p v-if="bindError" class="text-red-500 text-sm text-center">{{ bindError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Building2, Check, Loader2, Users, Home } from 'lucide-vue-next'
import { authApi } from '../services/api'
import { useAppStore } from '../stores/appStore'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()

const inviteCode = ref('')
const inviteInfo = ref(null)
const inviteError = ref('')
const bindError = ref('')
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  name: ''
})

const validateInvite = async () => {
  if (!inviteCode.value.trim()) {
    inviteError.value = '请输入邀请码'
    return
  }

  loading.value = true
  inviteError.value = ''

  try {
    const { data } = await authApi.validateInvite(inviteCode.value.trim())
    if (data.success) {
      inviteInfo.value = data
    } else {
      inviteError.value = data.message || '验证失败'
    }
  } catch (error) {
    inviteError.value = error.response?.data?.message || '邀请码验证失败'
  } finally {
    loading.value = false
  }
}

const bindRole = async () => {
  if (!form.username.trim()) {
    bindError.value = '请输入用户名'
    return
  }
  if (!form.password.trim()) {
    bindError.value = '请输入密码'
    return
  }
  if (!form.name.trim()) {
    bindError.value = '请输入姓名'
    return
  }

  loading.value = true
  bindError.value = ''

  const role = inviteInfo.value.type === 'floor' ? 'supervisor' : 'dorm_admin'

  try {
    const { data } = await authApi.bindRole(
      inviteCode.value.trim(),
      form.username.trim(),
      form.password.trim(),
      form.name.trim(),
      role
    )

    if (data.success) {
      appStore.login(
        data.role,
        data.username,
        data.name,
        data.floorId || '',
        data.dormId || '',
        inviteInfo.value.floorName || '',
        inviteInfo.value.dormName || '',
        inviteInfo.value.className || '',
        inviteInfo.value.buildingName || ''
      )
      router.push('/')
    } else {
      bindError.value = data.message || '绑定失败'
    }
  } catch (error) {
    bindError.value = error.response?.data?.message || '绑定失败'
  } finally {
    loading.value = false
  }
}

const resetInvite = () => {
  inviteInfo.value = null
  inviteCode.value = ''
  inviteError.value = ''
  form.username = ''
  form.password = ''
  form.name = ''
}

const goToLogin = () => {
  router.push('/login')
}
</script>