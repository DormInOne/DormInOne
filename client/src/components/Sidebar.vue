<template>
  <aside :class="[
    'fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-50',
    sidebarCollapsed ? 'w-20' : 'w-64'
  ]">
    <div class="flex flex-col h-full">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-primary-500 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
            <img 
              src="/logo.png" 
              alt="DormInOne Logo" 
              class="w-full h-full object-cover"
              onerror="this.style.display='none'; this.parentElement.innerHTML='<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;white&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;w-5 h-5&quot;><path d=&quot;m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z&quot;/><polyline points=&quot;9 22 9 12 15 12 15 22&quot;/></svg>'"
            />
          </div>
          <transition name="slide">
            <span v-if="!sidebarCollapsed" class="text-xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              DormInOne
            </span>
          </transition>
        </div>
      </div>

      <nav class="flex-1 py-4">
        <ul class="space-y-1 px-3">
          <li v-for="(item, index) in menuItems" :key="item.name">
            <router-link
              :to="item.path"
              :class="[
                'nav-item flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out',
                $route.name === item.name 
                  ? 'bg-primary-500 text-white shadow-md' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              ]"
              :style="{ animationDelay: `${index * 30}ms` }"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0 transition-transform duration-200" />
              <span v-if="!sidebarCollapsed" class="text-sm font-medium whitespace-nowrap">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <transition name="slide">
          <div v-if="!sidebarCollapsed && appStore.isLoggedIn" class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <User class="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{{ appStore.name || appStore.username }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ appStore.getRoleText }}</p>
            </div>
          </div>
        </transition>
        
        <button
          class="nav-item w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
          @click="handleAuth"
          :title="appStore.isLoggedIn ? '退出登录' : '管理员登录'"
        >
          <component :is="appStore.isLoggedIn ? LogOut : LogIn" class="w-5 h-5" />
          <transition name="slide">
            <span v-if="!sidebarCollapsed" class="text-sm font-medium whitespace-nowrap">
              {{ appStore.isLoggedIn ? '退出登录' : '管理员登录' }}
            </span>
          </transition>
        </button>
        
        <button
          class="nav-item w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
          @click="toggleSidebar"
          title="折叠侧边栏"
        >
          <component :is="sidebarCollapsed ? ChevronRight : ChevronLeft" class="w-5 h-5 transition-transform duration-300" />
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  width: 0;
  transform: translateX(-10px);
}

.nav-item:hover {
  transform: translateX(2px);
}

.nav-item:active {
  transform: scale(0.98);
}
</style>

<script setup>
import { computed } from 'vue'
import { Home, Users, LayoutGrid, Calendar, FileText, Zap, Package, Wrench, Settings, ChevronLeft, ChevronRight, LogIn, LogOut, User, Star, Building2, UserCheck, Bell } from 'lucide-vue-next'
import { useAppStore } from '../stores/appStore'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const router = useRouter()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const handleAuth = () => {
  if (appStore.isLoggedIn) {
    appStore.logout()
    router.push('/login')
  } else {
    router.push('/login')
  }
}

const menuItems = computed(() => {
  const baseMenu = [
    { name: 'Dashboard', path: '/', label: '仪表盘', icon: Home }
  ]

  if (appStore.isSystemAdmin) {
    return [
      ...baseMenu,
      { name: 'FloorManagement', path: '/admin/floors', label: '楼层管理', icon: Building2 },
      { name: 'DormitoryManagement', path: '/admin/dormitories', label: '宿舍管理', icon: Users },
      { name: 'UserManagement', path: '/admin/users', label: '用户管理', icon: UserCheck },
      { name: 'Roommates', path: '/roommates', label: '室友管理', icon: User },
      { name: 'Beds', path: '/beds', label: '床位管理', icon: LayoutGrid },
      { name: 'Schedule', path: '/schedule', label: '值日排班', icon: Calendar },
      { name: 'Bills', path: '/bills', label: 'AA记账', icon: FileText },
      { name: 'Electricity', path: '/electricity', label: '用电监控', icon: Zap },
      { name: 'Items', path: '/items', label: '物品借用', icon: Package },
      { name: 'Repairs', path: '/repairs', label: '物品报修', icon: Wrench },
      { name: 'Clean', path: '/clean', label: '卫生评分', icon: Star },
      { name: 'Settings', path: '/settings', label: '系统设置', icon: Settings },
      { name: 'Profile', path: '/profile', label: '个人中心', icon: User },
      { name: 'NotificationSettings', path: '/notifications', label: '通知设置', icon: Bell }
    ]
  }

  if (appStore.isSupervisor) {
    return [
      ...baseMenu,
      { name: 'Roommates', path: '/roommates', label: '成员管理', icon: User },
      { name: 'Beds', path: '/beds', label: '床位分配', icon: LayoutGrid },
      { name: 'Schedule', path: '/schedule', label: '值日表', icon: Calendar },
      { name: 'Bills', path: '/bills', label: '水电账单', icon: FileText },
      { name: 'Electricity', path: '/electricity', label: '水电数据', icon: Zap },
      { name: 'Items', path: '/items', label: '物品借用', icon: Package },
      { name: 'Repairs', path: '/repairs', label: '报修记录', icon: Wrench },
      { name: 'Clean', path: '/clean', label: '卫生评分', icon: Star },
      { name: 'Profile', path: '/profile', label: '个人中心', icon: User },
      { name: 'NotificationSettings', path: '/notifications', label: '通知设置', icon: Bell }
    ]
  }

  if (appStore.isDormAdmin) {
    return [
      ...baseMenu,
      { name: 'Schedule', path: '/schedule', label: '值日排班', icon: Calendar },
      { name: 'Bills', path: '/bills', label: 'AA记账', icon: FileText },
      { name: 'Electricity', path: '/electricity', label: '用电监控', icon: Zap },
      { name: 'Items', path: '/items', label: '物品借用', icon: Package },
      { name: 'Repairs', path: '/repairs', label: '物品报修', icon: Wrench },
      { name: 'Clean', path: '/clean', label: '卫生评分', icon: Star },
      { name: 'DormSettings', path: '/dorm-settings', label: '宿舍设置', icon: Settings },
      { name: 'Profile', path: '/profile', label: '个人中心', icon: User },
      { name: 'NotificationSettings', path: '/notifications', label: '通知设置', icon: Bell }
    ]
  }

  return [
    ...baseMenu,
    { name: 'Schedule', path: '/schedule', label: '值日安排', icon: Calendar },
    { name: 'Bills', path: '/bills', label: '费用明细', icon: FileText },
    { name: 'Items', path: '/items', label: '物品借用', icon: Package },
    { name: 'Repairs', path: '/repairs', label: '报修申请', icon: Wrench },
    { name: 'Profile', path: '/profile', label: '个人中心', icon: User },
    { name: 'NotificationSettings', path: '/notifications', label: '通知设置', icon: Bell }
  ]
})
</script>