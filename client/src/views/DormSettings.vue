<template>
  <div class="dorm-settings-page space-y-6">
    <div class="card p-6">
      <div class="flex items-center gap-6">
        <div class="relative">
          <div class="w-20 h-20 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
            <img 
              v-if="settingsStore.dormSettings.avatar" 
              :src="settingsStore.dormSettings.avatar" 
              alt="宿舍头像"
              class="w-full h-full object-cover"
            />
            <Building2 v-else class="w-10 h-10 text-primary-500" />
          </div>
          <button 
            class="absolute bottom-0 right-0 w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
            @click="showAvatarModal = true"
          >
            <Camera class="w-3 h-3" />
          </button>
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ settingsStore.dormSettings.name || appStore.dormName || '我的宿舍' }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">{{ appStore.floorName }} · {{ appStore.className }}</p>
          <p v-if="settingsStore.dormSettings.slogan" class="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
            "{{ settingsStore.dormSettings.slogan }}"
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Palette class="w-5 h-5 text-primary-500" />
            宿舍门面
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">宿舍名称</label>
              <input
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="自定义宿舍名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">宿舍口号</label>
              <input
                v-model="formData.slogan"
                type="text"
                class="form-input"
                placeholder="输入宿舍口号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">宿舍公约</label>
              <textarea
                v-model="formData.rules"
                rows="4"
                class="form-input resize-none"
                placeholder="输入宿舍公约..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景图</label>
              <div class="flex gap-2">
                <input type="file" accept="image/*" class="hidden" id="bg-upload" @change="handleBgUpload" />
                <label for="bg-upload" class="btn btn-secondary flex-1 cursor-pointer">
                  <ImagePlus class="w-4 h-4 mr-2" />
                  上传背景图
                </label>
                <button 
                  v-if="formData.backgroundImage" 
                  class="btn btn-danger" 
                  @click="formData.backgroundImage = ''"
                >
                  移除
                </button>
              </div>
              <div v-if="formData.backgroundImage" class="mt-3">
                <img :src="formData.backgroundImage" alt="背景预览" class="max-h-40 w-full object-cover rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell class="w-5 h-5 text-primary-500" />
              宿舍公告
            </h2>
            <button class="btn btn-primary" @click="showAnnouncementModal = true">
              <Plus class="w-4 h-4 mr-2" />
              发布公告
            </button>
          </div>
          <div class="space-y-4">
            <div 
              v-for="announcement in settingsStore.dormSettings.announcements" 
              :key="announcement.id"
              class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div class="flex items-start justify-between">
                <div>
                  <h3 class="font-semibold">{{ announcement.title }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{{ announcement.content }}</p>
                  <p class="text-xs text-gray-500 mt-2">{{ formatDate(announcement.createdAt) }} · {{ announcement.createdBy }}</p>
                </div>
                <button 
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  @click="deleteAnnouncement(announcement.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            <div v-if="!settingsStore.dormSettings.announcements?.length" class="text-center py-8 text-gray-500">
              <Bell class="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无公告</p>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Settings class="w-5 h-5 text-primary-500" />
            宿舍设置
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">值日表显示风格</label>
              <div class="flex gap-2">
                <button
                  v-for="style in scheduleStyles"
                  :key="style.value"
                  class="flex-1 py-2 px-3 rounded-lg border-2 text-sm transition-all"
                  :class="[
                    formData.scheduleStyle === style.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-gray-200 dark:border-gray-700'
                  ]"
                  @click="formData.scheduleStyle = style.value"
                >
                  {{ style.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Users class="w-5 h-5 text-primary-500" />
            成员权限
          </h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">允许成员修改昵称</p>
                <p class="text-xs text-gray-500">成员可以自主修改个人昵称</p>
              </div>
              <Switch v-model="formData.allowNicknameChange" />
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">允许成员展示联系方式</p>
                <p class="text-xs text-gray-500">成员可以设置联系方式对他人可见</p>
              </div>
              <Switch v-model="formData.allowContactDisplay" />
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

    <div v-if="showAvatarModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAvatarModal = false">
      <div class="card p-6 w-full max-w-lg mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">选择宿舍头像</h3>
          <button @click="showAvatarModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="avatar in settingsStore.availableAvatars"
            :key="avatar"
            class="aspect-square rounded-xl overflow-hidden border-2 transition-all"
            :class="[
              formData.avatar === avatar ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="formData.avatar = avatar"
          >
            <img :src="avatar" alt="头像" class="w-full h-full object-cover" />
          </button>
        </div>
        <div class="flex gap-3 mt-6">
          <button class="btn btn-secondary flex-1" @click="showAvatarModal = false">取消</button>
          <button class="btn btn-primary flex-1" @click="showAvatarModal = false">确认</button>
        </div>
      </div>
    </div>

    <div v-if="showAnnouncementModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showAnnouncementModal = false">
      <div class="card p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">发布公告</h3>
          <button @click="showAnnouncementModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">标题</label>
            <input v-model="announcementForm.title" type="text" class="form-input" placeholder="公告标题" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">内容</label>
            <textarea v-model="announcementForm.content" rows="4" class="form-input" placeholder="公告内容..." />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">样式</label>
            <div class="flex gap-2">
              <button
                v-for="style in announcementStyles"
                :key="style.value"
                class="flex-1 py-2 px-3 rounded-lg border-2 text-sm transition-all"
                :class="[
                  announcementForm.style === style.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                ]"
                @click="announcementForm.style = style.value"
              >
                {{ style.name }}
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button class="btn btn-secondary flex-1" @click="showAnnouncementModal = false">取消</button>
          <button class="btn btn-primary flex-1" @click="addAnnouncement">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Building2, Camera, Palette, ImagePlus, Bell, Plus, Trash2, Settings, Users, X } from 'lucide-vue-next'
import Switch from '../components/Switch.vue'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'
import { useToast } from '../composables/useToast'

const settingsStore = useSettingsStore()
const appStore = useAppStore()
const { success, error } = useToast()

const showAvatarModal = ref(false)
const showAnnouncementModal = ref(false)
const isSaving = ref(false)

const formData = ref({
  name: '',
  slogan: '',
  rules: '',
  avatar: '',
  backgroundImage: '',
  scheduleStyle: 'calendar',
  allowNicknameChange: true,
  allowContactDisplay: true
})

const announcementForm = ref({
  title: '',
  content: '',
  style: 'default'
})

const scheduleStyles = [
  { name: '日历', value: 'calendar' },
  { name: '列表', value: 'list' }
]

const announcementStyles = [
  { name: '默认', value: 'default' },
  { name: '重要', value: 'important' },
  { name: '提醒', value: 'warning' }
]

const handleBgUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.backgroundImage = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const addAnnouncement = async () => {
  if (!announcementForm.value.title || !announcementForm.value.content) {
    error('错误', '请填写完整信息')
    return
  }
  
  try {
    await settingsStore.dormSettingsApi.addAnnouncement(
      appStore.dormId,
      announcementForm.value.title,
      announcementForm.value.content,
      announcementForm.value.style
    )
    await settingsStore.loadDormSettings(appStore.dormId)
    success('发布成功', '公告已发布')
    showAnnouncementModal.value = false
    announcementForm.value = { title: '', content: '', style: 'default' }
  } catch (err) {
    error('发布失败', '无法发布公告')
  }
}

const deleteAnnouncement = async (id) => {
  try {
    await settingsStore.dormSettingsApi.deleteAnnouncement(appStore.dormId, id)
    await settingsStore.loadDormSettings(appStore.dormId)
    success('删除成功', '公告已删除')
  } catch (err) {
    error('删除失败', '无法删除公告')
  }
}

const saveSettings = async () => {
  isSaving.value = true
  try {
    const settings = {
      ...settingsStore.dormSettings,
      name: formData.value.name,
      slogan: formData.value.slogan,
      rules: formData.value.rules,
      avatar: formData.value.avatar,
      backgroundImage: formData.value.backgroundImage,
      scheduleStyle: formData.value.scheduleStyle,
      permissions: {
        allowNicknameChange: formData.value.allowNicknameChange,
        allowContactDisplay: formData.value.allowContactDisplay
      }
    }
    
    await settingsStore.saveDormSettings(appStore.dormId, settings)
    success('保存成功', '宿舍设置已更新')
  } catch (err) {
    error('保存失败', '无法保存宿舍设置')
    console.error('保存失败:', err)
  } finally {
    isSaving.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  settingsStore.loadAvailableAvatars()
  
  if (appStore.dormId) {
    settingsStore.loadDormSettings(appStore.dormId)
  }
  
  formData.value = {
    name: settingsStore.dormSettings.name || '',
    slogan: settingsStore.dormSettings.slogan || '',
    rules: settingsStore.dormSettings.rules || '',
    avatar: settingsStore.dormSettings.avatar || '',
    backgroundImage: settingsStore.dormSettings.backgroundImage || '',
    scheduleStyle: settingsStore.dormSettings.scheduleStyle || 'calendar',
    allowNicknameChange: settingsStore.dormSettings.permissions?.allowNicknameChange ?? true,
    allowContactDisplay: settingsStore.dormSettings.permissions?.allowContactDisplay ?? true
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