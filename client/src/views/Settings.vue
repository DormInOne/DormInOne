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
              'relative w-12 h-6 rounded-full transition-colors duration-300',
              isDark ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            ]"
            @click="toggleDarkMode"
          >
            <span
              :class="[
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300',
                isDark ? 'translate-x-7' : 'translate-x-1'
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
              'relative w-12 h-6 rounded-full transition-colors duration-300',
              sidebarCollapsed ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
            ]"
            @click="toggleSidebar"
          >
            <span
              :class="[
                'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300',
                sidebarCollapsed ? 'translate-x-7' : 'translate-x-1'
              ]"
            ></span>
          </button>
        </div>
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
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">数据管理</h2>
      
      <div class="space-y-4">
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

    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">关于应用</h2>
      
      <div class="space-y-4 text-sm">
        <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span class="text-gray-500 dark:text-gray-400">应用名称</span>
          <span class="text-gray-900 dark:text-white">DormInOne 宿舍全能管家</span>
        </div>
        <div class="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <span class="text-gray-500 dark:text-gray-400">版本</span>
          <span class="text-gray-900 dark:text-white">1.0.0</span>
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Download, Trash2 } from 'lucide-vue-next'
import { useAppStore } from '../stores/appStore'
import { roommatesApi, scheduleApi, billsApi, electricityApi, itemsApi } from '../services/api'
import { useToast } from '../composables/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()
const appStore = useAppStore()

const isDark = computed(() => appStore.darkMode)
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const showConfirmModal = ref(false)
const confirmMessage = ref('')

const toggleDarkMode = () => {
  appStore.toggleDarkMode()
}

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const exportData = async () => {
  try {
    const [roommatesRes, scheduleRes, billsRes, electricityRes, itemsRes] = await Promise.all([
      roommatesApi.getAll(),
      scheduleApi.getAll(),
      billsApi.getAll(),
      electricityApi.getAll(),
      itemsApi.getAll()
    ])
    
    const data = {
      roommates: roommatesRes.data,
      schedule: scheduleRes.data,
      bills: billsRes.data,
      electricity: electricityRes.data,
      items: itemsRes.data,
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
    
    await Promise.all([
      ...roommates.map(r => roommatesApi.delete(r.id)),
      ...schedule.map(s => scheduleApi.delete(s.id)),
      ...bills.map(b => billsApi.delete(b.id)),
      ...electricity.map(e => electricityApi.delete(e.id)),
      ...items.map(i => itemsApi.delete(i.id))
    ])
    
    success('清空成功', '所有数据已清空')
  } catch (err) {
    error('清空失败', '无法清空数据')
    console.error('清空失败:', err)
  } finally {
    closeConfirmModal()
  }
}
</script>
