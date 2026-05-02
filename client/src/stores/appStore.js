import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  const darkMode = ref(false)
  const sidebarCollapsed = ref(false)
  
  const storedRole = localStorage.getItem('dorminone_role')
  const storedUsername = localStorage.getItem('dorminone_username')
  const storedName = localStorage.getItem('dorminone_name')
  const storedFloorId = localStorage.getItem('dorminone_floor_id')
  const storedDormId = localStorage.getItem('dorminone_dorm_id')
  const storedFloorName = localStorage.getItem('dorminone_floor_name')
  const storedDormName = localStorage.getItem('dorminone_dorm_name')
  const storedClassName = localStorage.getItem('dorminone_class_name')
  const storedBuildingName = localStorage.getItem('dorminone_building_name')
  
  const role = ref(storedRole || '')
  const username = ref(storedUsername || '')
  const name = ref(storedName || '')
  const floorId = ref(storedFloorId || '')
  const dormId = ref(storedDormId || '')
  const floorName = ref(storedFloorName || '')
  const dormName = ref(storedDormName || '')
  const className = ref(storedClassName || '')
  const buildingName = ref(storedBuildingName || '')
  
  const isLoggedIn = computed(() => role.value && role.value !== '')
  const hasCompletedOnboarding = computed(() => {
    if (role.value === 'system_admin') return true
    return role.value && floorId.value
  })

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
    if (darkMode.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.value)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const initDarkMode = () => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      darkMode.value = saved === 'true'
      if (darkMode.value) {
        document.documentElement.classList.add('dark')
      }
    } else {
      darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (darkMode.value) {
        document.documentElement.classList.add('dark')
      }
    }
  }

  const login = (newRole, newUsername, newName = '', newFloorId = '', newDormId = '', newFloorName = '', newDormName = '', newClassName = '', newBuildingName = '') => {
    role.value = newRole
    username.value = newUsername
    name.value = newName
    floorId.value = newFloorId
    dormId.value = newDormId
    floorName.value = newFloorName
    dormName.value = newDormName
    className.value = newClassName
    buildingName.value = newBuildingName
    
    localStorage.setItem('dorminone_role', newRole)
    localStorage.setItem('dorminone_username', newUsername)
    localStorage.setItem('dorminone_name', newName)
    localStorage.setItem('dorminone_floor_id', newFloorId)
    localStorage.setItem('dorminone_dorm_id', newDormId)
    localStorage.setItem('dorminone_floor_name', newFloorName)
    localStorage.setItem('dorminone_dorm_name', newDormName)
    localStorage.setItem('dorminone_class_name', newClassName)
    localStorage.setItem('dorminone_building_name', newBuildingName)
  }

  const logout = () => {
    role.value = ''
    username.value = ''
    name.value = ''
    floorId.value = ''
    dormId.value = ''
    floorName.value = ''
    dormName.value = ''
    className.value = ''
    buildingName.value = ''
    
    localStorage.removeItem('dorminone_role')
    localStorage.removeItem('dorminone_username')
    localStorage.removeItem('dorminone_name')
    localStorage.removeItem('dorminone_floor_id')
    localStorage.removeItem('dorminone_dorm_id')
    localStorage.removeItem('dorminone_floor_name')
    localStorage.removeItem('dorminone_dorm_name')
    localStorage.removeItem('dorminone_class_name')
    localStorage.removeItem('dorminone_building_name')
  }

  const hasPermission = (requiredRoles) => {
    return requiredRoles.includes(role.value)
  }

  const isSystemAdmin = computed(() => role.value === 'system_admin')
  const isSupervisor = computed(() => role.value === 'supervisor')
  const isDormAdmin = computed(() => role.value === 'dorm_admin')
  const isMember = computed(() => role.value === 'member')

  const getRoleText = computed(() => {
    switch (role.value) {
      case 'system_admin': return '系统管理员'
      case 'supervisor': return '楼层宿管'
      case 'dorm_admin': return '宿舍舍长'
      case 'member': return '宿舍成员'
      default: return '未登录'
    }
  })

  return {
    darkMode,
    sidebarCollapsed,
    role,
    username,
    name,
    floorId,
    dormId,
    floorName,
    dormName,
    className,
    buildingName,
    isLoggedIn,
    hasCompletedOnboarding,
    isSystemAdmin,
    isSupervisor,
    isDormAdmin,
    isMember,
    getRoleText,
    toggleDarkMode,
    toggleSidebar,
    initDarkMode,
    login,
    logout,
    hasPermission
  }
})