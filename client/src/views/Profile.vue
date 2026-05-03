<template>
  <div class="profile-page space-y-6">
    <div class="card p-6">
      <div class="flex items-center gap-6">
        <div class="relative">
          <div class="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg">
            <img 
              v-if="settingsStore.profile.avatar" 
              :src="settingsStore.profile.avatar" 
              alt="头像"
              class="w-full h-full object-cover"
            />
            <User v-else class="w-12 h-12 text-primary-500" />
          </div>
          <button 
            class="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-600 transition-colors"
            @click="showAvatarModal = true"
          >
            <Camera class="w-4 h-4" />
          </button>
        </div>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ settingsStore.profile.nickname || appStore.name || appStore.username }}
          </h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">{{ appStore.getRoleText }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">{{ settingsStore.profile.bio }}</p>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 rounded-full" :class="statusClass">
          <span class="w-2 h-2 rounded-full bg-current" />
          <span class="text-sm font-medium">{{ statusText }}</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <UserPen class="w-5 h-5 text-primary-500" />
            个人资料
          </h2>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">昵称</label>
                <input
                  v-model="formData.nickname"
                  type="text"
                  class="form-input"
                  placeholder="请输入昵称"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">性别</label>
                <select v-model="formData.gender" class="form-select">
                  <option value="">请选择</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">生日</label>
                <input
                  v-model="formData.birthday"
                  type="date"
                  class="form-input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个性签名</label>
                <input
                  v-model="formData.bio"
                  type="text"
                  class="form-input"
                  placeholder="一句话介绍自己"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">个人简介</label>
              <textarea
                v-model="formData.intro"
                rows="3"
                class="form-input resize-none"
                placeholder="介绍一下自己..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">爱好标签</label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(hobby, index) in formData.hobbies"
                  :key="index"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                >
                  {{ hobby }}
                  <button @click="removeHobby(index)" class="hover:text-red-500">
                    <X class="w-3 h-3" />
                  </button>
                </span>
                <div class="flex items-center gap-2">
                  <input
                    v-model="newHobby"
                    type="text"
                    class="form-input w-32"
                    placeholder="添加爱好"
                    @keyup.enter="addHobby"
                  />
                  <button class="btn btn-primary btn-sm" @click="addHobby">添加</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Link class="w-5 h-5 text-primary-500" />
            联系方式
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="form-input"
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QQ</label>
              <input
                v-model="formData.qq"
                type="text"
                class="form-input"
                placeholder="请输入QQ号"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">微信</label>
              <input
                v-model="formData.wechat"
                type="text"
                class="form-input"
                placeholder="请输入微信号"
              />
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Heart class="w-5 h-5 text-primary-500" />
            今日状态
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">在线状态</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="status in settingsStore.ONLINE_STATUSES"
                  :key="status.value"
                  class="px-3 py-1.5 rounded-full text-sm transition-all"
                  :class="[
                    formData.onlineStatus === status.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  ]"
                  @click="formData.onlineStatus = status.value"
                >
                  {{ status.name }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">今日心情</label>
              <div class="flex items-center gap-2">
                <input
                  v-model="formData.mood"
                  type="text"
                  class="form-input flex-1"
                  placeholder="今天心情如何？"
                />
              </div>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">今日状态文字</label>
            <input
              v-model="formData.todayStatus"
              type="text"
              class="form-input"
              placeholder="设置今日状态..."
            />
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock class="w-5 h-5 text-primary-500" />
            账号安全
          </h2>
          <div class="space-y-4">
            <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors" @click="showPasswordModal = true">
              <span class="text-left">
                <p class="font-medium">修改密码</p>
                <p class="text-xs text-gray-500">定期更换密码保障安全</p>
              </span>
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </button>
            <button class="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <span class="text-left">
                <p class="font-medium">登录设备管理</p>
                <p class="text-xs text-gray-500">查看并管理登录设备</p>
              </span>
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Eye class="w-5 h-5 text-primary-500" />
            隐私设置
          </h2>
          <div class="space-y-4">
            <div v-for="item in privacyItems" :key="item.key" class="flex items-center justify-between">
              <div>
                <p class="font-medium text-sm">{{ item.label }}</p>
                <p class="text-xs text-gray-500">{{ item.description }}</p>
              </div>
              <select 
                v-model="formData[item.key]" 
                class="form-select w-32 text-sm"
              >
                <option v-for="opt in settingsStore.PRIVACY_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <button 
            class="w-full btn btn-primary" 
            @click="saveProfile"
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
          <h3 class="text-lg font-semibold">选择头像</h3>
          <button @click="showAvatarModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="avatar in settingsStore.availableAvatars"
            :key="avatar"
            class="aspect-square rounded-full overflow-hidden border-2 transition-all"
            :class="[
              formData.avatar === avatar ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-gray-300'
            ]"
            @click="formData.avatar = avatar"
          >
            <img :src="avatar" alt="头像" class="w-full h-full object-cover" />
          </button>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium mb-2">或上传自定义头像</label>
          <div class="flex gap-2">
            <input type="file" accept="image/*" class="hidden" id="avatar-upload" @change="handleAvatarUpload" />
            <label for="avatar-upload" class="btn btn-secondary flex-1 cursor-pointer">
              <Upload class="w-4 h-4 mr-2" />
              选择图片
            </label>
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button class="btn btn-secondary flex-1" @click="showAvatarModal = false">取消</button>
          <button class="btn btn-primary flex-1" @click="confirmAvatar">确认</button>
        </div>
      </div>
    </div>

    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showPasswordModal = false">
      <div class="card p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">修改密码</h3>
          <button @click="showPasswordModal = false">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">旧密码</label>
            <input v-model="passwordForm.oldPassword" type="password" class="form-input" placeholder="请输入旧密码" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">新密码</label>
            <input v-model="passwordForm.newPassword" type="password" class="form-input" placeholder="请输入新密码" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" class="form-input" placeholder="请再次输入新密码" />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button class="btn btn-secondary flex-1" @click="showPasswordModal = false">取消</button>
          <button class="btn btn-primary flex-1" @click="changePassword">确认修改</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { User, Camera, UserPen, Link, Heart, Lock, Eye, X, ChevronRight, Upload } from 'lucide-vue-next'
import { useSettingsStore } from '../stores/settingsStore'
import { useAppStore } from '../stores/appStore'
import { useToast } from '../composables/useToast'

const settingsStore = useSettingsStore()
const appStore = useAppStore()
const { success, error } = useToast()

const showAvatarModal = ref(false)
const showPasswordModal = ref(false)
const isSaving = ref(false)
const newHobby = ref('')

const formData = ref({
  nickname: '',
  gender: '',
  birthday: '',
  bio: '',
  intro: '',
  hobbies: [],
  phone: '',
  qq: '',
  wechat: '',
  avatar: '',
  onlineStatus: 'online',
  mood: '',
  todayStatus: '',
  phoneVisible: 'self',
  socialVisible: 'self',
  birthdayVisible: 'self',
  realNameVisible: 'self',
  statusVisible: 'self'
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const privacyItems = [
  { key: 'phoneVisible', label: '手机号', description: '控制手机号的可见范围' },
  { key: 'socialVisible', label: '社交账号', description: '控制QQ、微信的可见范围' },
  { key: 'birthdayVisible', label: '生日', description: '控制生日的可见范围' },
  { key: 'realNameVisible', label: '真实姓名', description: '控制真实姓名的可见范围' },
  { key: 'statusVisible', label: '状态', description: '控制在线状态和心情的可见范围' }
]

const statusText = computed(() => {
  const status = settingsStore.ONLINE_STATUSES.find(s => s.value === formData.value.onlineStatus)
  return status?.name || '在线'
})

const statusClass = computed(() => {
  switch (formData.value.onlineStatus) {
    case 'online': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
    case 'busy': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
    case 'studying': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    case 'resting': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  }
})

const addHobby = () => {
  if (newHobby.value.trim() && !formData.value.hobbies.includes(newHobby.value.trim())) {
    formData.value.hobbies.push(newHobby.value.trim())
    newHobby.value = ''
  }
}

const removeHobby = (index) => {
  formData.value.hobbies.splice(index, 1)
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      formData.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const confirmAvatar = () => {
  showAvatarModal.value = false
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    const settings = {
      ...settingsStore.userSettings,
      profile: {
        ...settingsStore.profile,
        nickname: formData.value.nickname,
        gender: formData.value.gender,
        birthday: formData.value.birthday,
        bio: formData.value.bio,
        hobbies: formData.value.hobbies,
        phone: formData.value.phone,
        qq: formData.value.qq,
        wechat: formData.value.wechat,
        avatar: formData.value.avatar,
        phoneVisible: formData.value.phoneVisible,
        socialVisible: formData.value.socialVisible,
        birthdayVisible: formData.value.birthdayVisible,
        realNameVisible: formData.value.realNameVisible,
        statusVisible: formData.value.statusVisible
      },
      status: {
        onlineStatus: formData.value.onlineStatus,
        mood: formData.value.mood,
        todayStatus: formData.value.todayStatus
      }
    }
    
    await settingsStore.saveUserSettings(appStore.userId, settings)
    success('保存成功', '个人资料已更新')
  } catch (err) {
    error('保存失败', '无法保存个人资料')
    console.error('保存失败:', err)
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    error('错误', '请填写完整信息')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error('错误', '两次输入的密码不一致')
    return
  }
  
  try {
    await settingsStore.userSettingsApi.changePassword(appStore.userId, passwordForm.value.oldPassword, passwordForm.value.newPassword)
    success('修改成功', '密码已更新')
    showPasswordModal.value = false
    passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  } catch (err) {
    error('修改失败', err.response?.data?.error || '无法修改密码')
  }
}

onMounted(() => {
  settingsStore.loadAvailableAvatars()
  
  formData.value = {
    nickname: settingsStore.profile.nickname || '',
    gender: settingsStore.profile.gender || '',
    birthday: settingsStore.profile.birthday || '',
    bio: settingsStore.profile.bio || '',
    intro: '',
    hobbies: [...(settingsStore.profile.hobbies || [])],
    phone: settingsStore.profile.phone || '',
    qq: settingsStore.profile.qq || '',
    wechat: settingsStore.profile.wechat || '',
    avatar: settingsStore.profile.avatar || '',
    onlineStatus: settingsStore.status.onlineStatus || 'online',
    mood: settingsStore.status.mood || '',
    todayStatus: settingsStore.status.todayStatus || '',
    phoneVisible: settingsStore.profile.phoneVisible || 'self',
    socialVisible: settingsStore.profile.socialVisible || 'self',
    birthdayVisible: settingsStore.profile.birthdayVisible || 'self',
    realNameVisible: settingsStore.profile.realNameVisible || 'self',
    statusVisible: settingsStore.profile.statusVisible || 'self'
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

.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #111827;
}

.dark .form-input,
.dark .form-select {
  background-color: #374151;
  border-color: #4B5563;
  color: #F9FAFB;
}
</style>