<template>
  <div class="notification-settings-page space-y-6">
    <div class="card p-6">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <Bell class="w-6 h-6 text-primary-500" />
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">通知设置</h1>
          <p class="text-gray-500 dark:text-gray-400">管理您的通知偏好和提醒方式</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ToggleLeft class="w-5 h-5 text-primary-500" />
            通知开关
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              v-for="notification in notificationTypes" 
              :key="notification.key"
              class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div class="flex items-center gap-3">
                <component :is="notification.icon" class="w-5 h-5 text-primary-500" />
                <div>
                  <p class="font-medium">{{ notification.label }}</p>
                  <p class="text-xs text-gray-500">{{ notification.description }}</p>
                </div>
              </div>
              <Switch v-model="formData[notification.key]" />
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Moon class="w-5 h-5 text-primary-500" />
            免打扰时段
          </h2>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">开启免打扰</p>
                <p class="text-sm text-gray-500">在指定时段内不推送通知弹窗</p>
              </div>
              <Switch v-model="formData.doNotDisturb" />
            </div>
            
            <div v-if="formData.doNotDisturb" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">开始时间</label>
                <input
                  v-model="formData.dndStart"
                  type="time"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">结束时间</label>
                <input
                  v-model="formData.dndEnd"
                  type="time"
                  class="form-input"
                />
              </div>
            </div>

            <div v-if="formData.doNotDisturb" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div class="flex items-start gap-3">
                <Info class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-yellow-700 dark:text-yellow-400">
                  免打扰时段内，通知将被静默处理，不会弹出提示。您仍然可以在消息中心查看所有通知。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle class="w-5 h-5 text-primary-500" />
            通知方式
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">消息提示方式</label>
              <div class="space-y-2">
                <label
                  v-for="style in notificationStyles"
                  :key="style.value"
                  class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  :class="[
                    formData.notificationStyle === style.value
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <input
                    type="radio"
                    :value="style.value"
                    v-model="formData.notificationStyle"
                    class="sr-only"
                  />
                  <component :is="style.icon" class="w-5 h-5" />
                  <div>
                    <p class="font-medium text-sm">{{ style.name }}</p>
                    <p class="text-xs text-gray-500">{{ style.description }}</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Volume2 class="w-5 h-5 text-primary-500" />
            声音设置
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">通知音效</p>
                <p class="text-xs text-gray-500">接收通知时播放提示音</p>
              </div>
              <Switch v-model="formData.soundEnabled" />
            </div>
          </div>
        </div>

        <div class="card p-6">
          <button 
            class="w-full btn btn-primary" 
            @click="saveSettings"
            :disabled="isSaving"
          >
            {{ isSaving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Bell, Moon, Info, MessageCircle, Volume2, AlertCircle, ChevronDown, ToggleLeft } from 'lucide-vue-next'
import Switch from '../components/Switch.vue'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'
import { useToast } from '../composables/useToast'

const settingsStore = useSettingsStore()
const appStore = useAppStore()
const { success, error } = useToast()

const isSaving = ref(false)

const formData = ref({
  repairReminder: false,
  scheduleReminder: true,
  announcementReminder: false,
  approvalReminder: true,
  systemReminder: true,
  notificationStyle: 'popup',
  doNotDisturb: false,
  dndStart: '22:00',
  dndEnd: '07:00',
  soundEnabled: false
})

const notificationTypes = [
  { key: 'repairReminder', label: '报修提醒', description: '收到报修申请或状态更新时通知', icon: AlertCircle },
  { key: 'scheduleReminder', label: '值日提醒', description: '值日任务到期前提醒', icon: ChevronDown },
  { key: 'announcementReminder', label: '公告提醒', description: '收到新公告时通知', icon: Bell },
  { key: 'approvalReminder', label: '审批提醒', description: '申请审批状态变更时通知', icon: ToggleLeft },
  { key: 'systemReminder', label: '系统公告', description: '系统重要通知', icon: Info }
]

const notificationStyles = [
  { value: 'popup', name: '弹窗提示', description: '收到通知时弹出提示框', icon: MessageCircle },
  { value: 'badge', name: '红点提示', description: '仅在菜单显示红点标记', icon: Bell },
  { value: 'collapsed', name: '折叠列表', description: '通知折叠在消息中心', icon: ChevronDown }
]

const saveSettings = async () => {
  isSaving.value = true
  try {
    const settings = {
      ...settingsStore.userSettings,
      notifications: {
        repairReminder: formData.value.repairReminder,
        scheduleReminder: formData.value.scheduleReminder,
        announcementReminder: formData.value.announcementReminder,
        approvalReminder: formData.value.approvalReminder,
        systemReminder: formData.value.systemReminder,
        notificationStyle: formData.value.notificationStyle,
        doNotDisturb: formData.value.doNotDisturb,
        dndStart: formData.value.dndStart,
        dndEnd: formData.value.dndEnd
      },
      soundEnabled: formData.value.soundEnabled
    }
    
    await settingsStore.saveUserSettings(appStore.userId, settings)
    success('保存成功', '通知设置已更新')
  } catch (err) {
    error('保存失败', '无法保存通知设置')
    console.error('保存失败:', err)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  formData.value = {
    repairReminder: settingsStore.notifications.repairReminder ?? false,
    scheduleReminder: settingsStore.notifications.scheduleReminder ?? true,
    announcementReminder: settingsStore.notifications.announcementReminder ?? false,
    approvalReminder: settingsStore.notifications.approvalReminder ?? true,
    systemReminder: settingsStore.notifications.systemReminder ?? true,
    notificationStyle: settingsStore.notifications.notificationStyle || 'popup',
    doNotDisturb: settingsStore.notifications.doNotDisturb ?? false,
    dndStart: settingsStore.notifications.dndStart || '22:00',
    dndEnd: settingsStore.notifications.dndEnd || '07:00',
    soundEnabled: settingsStore.soundEnabled ?? false
  }
})
</script>

<style scoped>
.form-input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.dark .form-input {
  background-color: #374151;
  border-color: #4B5563;
  color: #F9FAFB;
}
</style>