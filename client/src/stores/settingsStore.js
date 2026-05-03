import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userSettingsApi, dormSettingsApi, avatarsApi } from '../services/api'

export const useSettingsStore = defineStore('settings', () => {
  const userSettings = ref({})
  const dormSettings = ref({})
  const availableAvatars = ref([])
  const isLoading = ref(false)

  const theme = computed(() => userSettings.value.theme || 'light')
  const primaryColor = computed(() => userSettings.value.primaryColor || '#3B82F6')
  const layout = computed(() => userSettings.value.layout || 'normal')
  const fontSize = computed(() => userSettings.value.fontSize || 'normal')
  const animationsEnabled = computed(() => userSettings.value.animationsEnabled !== false)
  const soundEnabled = computed(() => userSettings.value.soundEnabled === true)
  const dateFormat = computed(() => userSettings.value.dateFormat || 'YYYY-MM-DD')
  const timeFormat = computed(() => userSettings.value.timeFormat || 'HH:mm')
  const defaultPage = computed(() => userSettings.value.defaultPage || 'dashboard')

  const profile = computed(() => userSettings.value.profile || {})
  const status = computed(() => userSettings.value.status || {})
  const notifications = computed(() => userSettings.value.notifications || {})
  const homeLayout = computed(() => userSettings.value.homeLayout || {})

  const PRIMARY_COLORS = [
    { name: '蓝色', value: '#3B82F6' },
    { name: '绿色', value: '#10B981' },
    { name: '紫色', value: '#8B5CF6' },
    { name: '橙色', value: '#F59E0B' },
    { name: '红色', value: '#EF4444' },
    { name: '青色', value: '#06B6D4' },
    { name: '粉色', value: '#EC4899' },
    { name: '靛蓝', value: '#6366F1' }
  ]

  const FONT_SIZES = [
    { name: '小', value: 'small' },
    { name: '标准', value: 'normal' },
    { name: '大', value: 'large' }
  ]

  const LAYOUTS = [
    { name: '紧凑版', value: 'compact' },
    { name: '宽松版', value: 'normal' }
  ]

  const THEMES = [
    { name: '亮色模式', value: 'light' },
    { name: '暗色模式', value: 'dark' },
    { name: '护眼柔和模式', value: 'warm' }
  ]

  const ONLINE_STATUSES = [
    { name: '在线', value: 'online' },
    { name: '离线', value: 'offline' },
    { name: '忙碌', value: 'busy' },
    { name: '学习中', value: 'studying' },
    { name: '休息中', value: 'resting' }
  ]

  const PRIVACY_OPTIONS = [
    { name: '仅自己可见', value: 'self' },
    { name: '舍长宿管可见', value: 'admin' },
    { name: '全宿舍可见', value: 'dorm' }
  ]

  async function loadUserSettings(userId) {
    isLoading.value = true
    try {
      const res = await userSettingsApi.get(userId)
      userSettings.value = res.data
      applyTheme()
      applyFontSize()
      applyLayout()
    } catch (error) {
      console.error('加载用户设置失败:', error)
      userSettings.value = getDefaultUserSettings()
    } finally {
      isLoading.value = false
    }
  }

  async function saveUserSettings(userId, settings) {
    isLoading.value = true
    try {
      const res = await userSettingsApi.update(userId, settings)
      userSettings.value = res.data.settings
      applyTheme()
      applyFontSize()
      applyLayout()
      return true
    } catch (error) {
      console.error('保存用户设置失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loadDormSettings(dormId) {
    isLoading.value = true
    try {
      const res = await dormSettingsApi.get(dormId)
      dormSettings.value = res.data
    } catch (error) {
      console.error('加载宿舍设置失败:', error)
      dormSettings.value = getDefaultDormSettings()
    } finally {
      isLoading.value = false
    }
  }

  async function saveDormSettings(dormId, settings) {
    isLoading.value = true
    try {
      const res = await dormSettingsApi.update(dormId, settings)
      dormSettings.value = res.data.settings
      return true
    } catch (error) {
      console.error('保存宿舍设置失败:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function loadAvailableAvatars() {
    try {
      const res = await avatarsApi.getAll()
      availableAvatars.value = res.data
    } catch (error) {
      console.error('加载头像列表失败:', error)
    }
  }

  function applyTheme() {
    const theme = userSettings.value.theme || 'light'
    document.documentElement.setAttribute('data-theme', theme)
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    const animationsEnabled = userSettings.value.animationsEnabled !== false
    document.documentElement.setAttribute('data-animations', animationsEnabled ? 'true' : 'false')
  }

  function applyFontSize() {
    const size = userSettings.value.fontSize || 'normal'
    const sizes = {
      small: '0.9rem',
      normal: '1rem',
      large: '1.1rem'
    }
    document.documentElement.style.fontSize = sizes[size]
  }

  function applyLayout() {
    const layout = userSettings.value.layout || 'normal'
    document.documentElement.setAttribute('data-layout', layout)
  }

  function applyPrimaryColor(color) {
    document.documentElement.style.setProperty('--primary-color', color)
    document.documentElement.style.setProperty('--primary-500', color)
  }

  function getDefaultUserSettings() {
    return {
      theme: 'light',
      primaryColor: '#3B82F6',
      layout: 'normal',
      fontSize: 'normal',
      animationsEnabled: true,
      soundEnabled: false,
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm',
      defaultPage: 'dashboard',
      profile: {
        avatar: '',
        nickname: '',
        bio: '',
        gender: '',
        birthday: '',
        hobbies: [],
        phone: '',
        qq: '',
        wechat: '',
        phoneVisible: 'self',
        socialVisible: 'self',
        birthdayVisible: 'self',
        realNameVisible: 'self',
        statusVisible: 'self'
      },
      status: {
        onlineStatus: 'online',
        mood: '',
        todayStatus: ''
      },
      notifications: {
        repairReminder: false,
        scheduleReminder: true,
        announcementReminder: false,
        approvalReminder: true,
        systemReminder: true,
        notificationStyle: 'popup',
        doNotDisturb: false,
        dndStart: '22:00',
        dndEnd: '07:00'
      },
      homeLayout: {
        cards: ['bills', 'schedule', 'repairs', 'electricity', 'items'],
        hiddenCards: [],
        cardOrder: []
      },
      createdAt: new Date().toISOString()
    }
  }

  function getDefaultDormSettings() {
    return {
      name: '',
      avatar: '',
      backgroundImage: '',
      slogan: '',
      rules: '',
      scheduleStyle: 'calendar',
      announcements: [],
      homeLayout: {
        modules: ['overview', 'schedule', 'bills', 'repairs'],
        hiddenModules: [],
        moduleOrder: []
      },
      permissions: {
        allowNicknameChange: true,
        allowContactDisplay: true
      },
      createdAt: new Date().toISOString()
    }
  }

  function toggleTheme() {
    const themes = ['light', 'dark', 'warm']
    const currentIndex = themes.indexOf(userSettings.value.theme || 'light')
    const nextIndex = (currentIndex + 1) % themes.length
    userSettings.value.theme = themes[nextIndex]
    applyTheme()
  }

  return {
    userSettings,
    dormSettings,
    availableAvatars,
    isLoading,
    theme,
    primaryColor,
    layout,
    fontSize,
    animationsEnabled,
    soundEnabled,
    dateFormat,
    timeFormat,
    defaultPage,
    profile,
    status,
    notifications,
    homeLayout,
    PRIMARY_COLORS,
    FONT_SIZES,
    LAYOUTS,
    THEMES,
    ONLINE_STATUSES,
    PRIVACY_OPTIONS,
    loadUserSettings,
    saveUserSettings,
    loadDormSettings,
    saveDormSettings,
    loadAvailableAvatars,
    applyTheme,
    applyFontSize,
    applyLayout,
    applyPrimaryColor,
    toggleTheme,
    getDefaultUserSettings,
    getDefaultDormSettings
  }
})