<template>
  <aside :class="[
    'fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-50',
    sidebarCollapsed ? 'w-20' : 'w-64'
  ]">
    <div class="flex flex-col h-full">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
            <Home class="w-5 h-5 text-white" />
          </div>
          <span v-if="!sidebarCollapsed" class="text-xl font-semibold text-gray-900 dark:text-white">
            DormInOne
          </span>
        </div>
      </div>

      <nav class="flex-1 py-4">
        <ul class="space-y-1 px-3">
          <li v-for="item in menuItems" :key="item.name">
            <router-link
              :to="item.path"
              :class="[
                'nav-item flex items-center gap-3 w-full',
                $route.name === item.name ? 'active' : ''
              ]"
            >
              <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
              <span v-if="!sidebarCollapsed" class="text-sm font-medium">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          class="nav-item w-full justify-center"
          @click="toggleSidebar"
        >
          <ChevronLeft v-if="!sidebarCollapsed" class="w-5 h-5" />
          <ChevronRight v-else class="w-5 h-5" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { Home, Users, Calendar, FileText, Zap, Package, Settings, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()
const sidebarCollapsed = appStore.sidebarCollapsed

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const menuItems = [
  { name: 'Dashboard', path: '/', label: '仪表盘', icon: Home },
  { name: 'Roommates', path: '/roommates', label: '室友管理', icon: Users },
  { name: 'Schedule', path: '/schedule', label: '值日排班', icon: Calendar },
  { name: 'Bills', path: '/bills', label: 'AA记账', icon: FileText },
  { name: 'Electricity', path: '/electricity', label: '用电监控', icon: Zap },
  { name: 'Items', path: '/items', label: '物品借用', icon: Package },
  { name: 'Settings', path: '/settings', label: '系统设置', icon: Settings }
]
</script>
