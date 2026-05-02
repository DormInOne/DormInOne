<template>
  <div class="space-y-6">
    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">系统设置</h2>
      
      <div class="space-y-6">
        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">深色模式</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">切换界面颜色主题</p>
          </div>
          <button
            :class="[
              'relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
              isDark ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            ]"
            @click="toggleDarkMode"
          >
            <span
              :class="[
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out',
                isDark ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>

        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <p class="font-medium text-gray-900 dark:text-white">折叠侧边栏</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">隐藏侧边栏文字标签</p>
          </div>
          <button
            :class="[
              'relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
              sidebarCollapsed ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            ]"
            @click="toggleSidebar"
          >
            <span
              :class="[
                'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ease-in-out',
                sidebarCollapsed ? 'translate-x-6' : 'translate-x-0'
              ]"
            ></span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="appStore.isSupervisor" class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">数据管理</h2>
      
      <div class="space-y-4">
        <button
          class="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 flex items-center justify-between"
          @click="backupData"
        >
          <div>
            <p class="font-medium text-gray-900 dark:text-white">一键备份</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">将所有数据备份为 ZIP 文件</p>
          </div>
          <div class="flex items-center gap-2">
            <Archive class="w-5 h-5 text-gray-500" />
            <Loader2 v-if="isBackingUp" class="w-4 h-4 animate-spin" />
          </div>
        </button>

        <button
          class="w-full p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors duration-300 flex items-center justify-between"
          @click="triggerRestore"
        >
          <div>
            <p class="font-medium text-blue-600 dark:text-blue-400">恢复数据</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">从备份文件恢复数据</p>
          </div>
          <Upload class="w-5 h-5 text-blue-500" />
        </button>

        <button
          class="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
          @click="exportData"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">导出数据</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">将所有数据导出为 JSON 文件</p>
            </div>
            <Download class="w-5 h-5 text-gray-500" />
          </div>
        </button>

        <button
          class="w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors duration-300"
          @click="confirmClearData"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-red-600 dark:text-red-400">清空所有数据</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">删除所有记录，此操作不可恢复</p>
            </div>
            <Trash2 class="w-5 h-5 text-red-500" />
          </div>
        </button>
      </div>
    </div>

    <ConfirmModal
      :show="showConfirmModal"
      title="确认清空数据"
      :message="confirmMessage"
      type="danger"
      @confirm="handleClearData"
      @cancel="closeConfirmModal"
    />

    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">当前角色</h2>
      
      <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div class="flex items-center gap-4">
          <div :class="[
            'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
            appStore.role === 'admin' ? 'bg-green-500' : appStore.role === 'supervisor' ? 'bg-blue-500' : 'bg-gray-500'
          ]">
            {{ appStore.role === 'admin' ? '舍' : appStore.role === 'supervisor' ? '宿' : '成' }}
          </div>
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ appStore.role === 'admin' ? '舍长' : appStore.role === 'supervisor' ? '宿管' : '宿舍成员' }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ appStore.role === 'admin' ? '拥有所有管理权限' : appStore.role === 'supervisor' ? '可管理报修和查看报表' : '可查看信息并提交申请' }}
            </p>
          </div>
        </div>
        <button
          v-if="appStore.isLoggedIn"
          class="mt-4 btn btn-outline"
          @click="handleLogout"
        >
          退出登录
        </button>
      </div>
    </div>

    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">关于应用</h2>
      
      <div class="space-y-4 text-sm">
        <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span class="text-gray-500 dark:text-gray-400">应用名称</span>
          <span class="text-gray-900 dark:text-white">DormInOne</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span class="text-gray-500 dark:text-gray-400">GitHub 开源地址</span>
          <span class="text-gray-900 dark:text-white">https://github.com/DormInOne/DormInOne</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span class="text-gray-500 dark:text-gray-400">技术栈</span>
          <span class="text-gray-900 dark:text-white">Vue 3 + Node.js + Express</span>
        </div>
        <div class="flex items-center justify-between py-2">
          <span class="text-gray-500 dark:text-gray-400">后端地址</span>
          <span class="text-gray-900 dark:text-white">http://localhost:3000</span>
        </div>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".zip,.json"
      class="hidden"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Download, Trash2, Archive, Upload, Loader2 } from 'lucide-vue-next'
import { useAppStore } from '../stores/appStore'
import { useRouter } from 'vue-router'
import { roommatesApi, scheduleApi, billsApi, electricityApi, itemsApi, bedsApi, repairsApi, backupApi } from '../services/api'
import { useToast } from '../composables/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()
const appStore = useAppStore()
const router = useRouter()

const isDark = computed(() => appStore.darkMode)
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const showConfirmModal = ref(false)
const confirmMessage = ref('')
const isBackingUp = ref(false)
const fileInput = ref(null)

const toggleDarkMode = () => {
  appStore.toggleDarkMode()
}

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const backupData = async () => {
  if (!appStore.isAdmin) return
  
  isBackingUp.value = true
  try {
    const response = await backupApi.download()
    const blob = new Blob([response.data], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dorminone-backup-${Date.now()}.zip`
    a.click()
    URL.revokeObjectURL(url)
    success('备份成功', '数据已备份为 ZIP 文件')
  } catch (err) {
    error('备份失败', '无法备份数据')
    console.error('备份失败:', err)
  } finally {
    isBackingUp.value = false
  }
}

const triggerRestore = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await backupApi.restore(formData)
    if (response.data.success) {
      success('恢复成功', response.data.message)
    } else {
      error('恢复失败', response.data.message)
    }
  } catch (err) {
    error('恢复失败', '无法恢复数据')
    console.error('恢复失败:', err)
  } finally {
    event.target.value = ''
  }
}

const exportData = async () => {
  try {
    const [roommatesRes, scheduleRes, billsRes, electricityRes, itemsRes, bedsRes, repairsRes] = await Promise.all([
      roommatesApi.getAll(),
      scheduleApi.getAll(),
      billsApi.getAll(),
      electricityApi.getAll(),
      itemsApi.getAll(),
      bedsApi.getAll(),
      repairsApi.getAll()
    ])
    
    const data = {
      roommates: roommatesRes.data,
      schedule: scheduleRes.data,
      bills: billsRes.data,
      electricity: electricityRes.data,
      items: itemsRes.data,
      beds: bedsRes.data,
      repairs: repairsRes.data,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dorminone-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    success('导出成功', '数据已导出')
  } catch (err) {
    error('导出失败', '无法导出数据')
    console.error('导出失败:', err)
  }
}

const confirmClearData = () => {
  confirmMessage.value = '确定要清空所有数据吗？此操作不可恢复！'
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmMessage.value = ''
}

const handleClearData = async () => {
  try {
    const roommates = (await roommatesApi.getAll()).data
    const schedule = (await scheduleApi.getAll()).data
    const bills = (await billsApi.getAll()).data
    const electricity = (await electricityApi.getAll()).data
    const items = (await itemsApi.getAll()).data
    const beds = (await bedsApi.getAll()).data
    const repairs = (await repairsApi.getAll()).data
    
    await Promise.all([
      ...roommates.map(r => roommatesApi.delete(r.id)),
      ...schedule.map(s => scheduleApi.delete(s.id)),
      ...bills.map(b => billsApi.delete(b.id)),
      ...electricity.map(e => electricityApi.delete(e.id)),
      ...items.map(i => itemsApi.delete(i.id)),
      ...beds.map(b => bedsApi.delete(b.id)),
      ...repairs.map(r => repairsApi.delete(r.id))
    ])
    
    success('清空成功', '所有数据已清空')
  } catch (err) {
    error('清空失败', '无法清空数据')
    console.error('清空失败:', err)
  } finally {
    closeConfirmModal()
  }
}

const handleLogout = () => {
  appStore.logout()
  router.push('/')
}
</script>
