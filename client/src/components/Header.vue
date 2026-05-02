<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ pageTitle }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ pageSubtitle }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
          @click="toggleDarkMode"
          :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
        >
          <Moon v-if="!isDark" class="w-5 h-5 text-gray-600 dark:text-gray-400 transition-all duration-300" />
          <Sun v-else class="w-5 h-5 text-yellow-400 dark:text-yellow-400 transition-all duration-300" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { Moon, Sun } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/appStore'

const route = useRoute()
const appStore = useAppStore()

const isDark = computed(() => appStore.darkMode)

const toggleDarkMode = () => {
  appStore.toggleDarkMode()
}

const pageTitles = {
  Dashboard: { title: '首页仪表盘', subtitle: '欢迎回来，查看宿舍概览' },
  Roommates: { title: '室友管理', subtitle: '管理宿舍成员信息' },
  Beds: { title: '床位管理', subtitle: '管理宿舍床位分配' },
  Schedule: { title: '值日排班', subtitle: '安排宿舍清洁任务' },
  Bills: { title: 'AA记账', subtitle: '记录和分摊宿舍费用' },
  Electricity: { title: '用电监控', subtitle: '跟踪用电量和费用' },
  Items: { title: '物品借用', subtitle: '管理共享物品' },
  Repairs: { title: '物品报修', subtitle: '管理报修申请' },
  Settings: { title: '系统设置', subtitle: '配置应用参数' }
}

const pageTitle = computed(() => pageTitles[route.name]?.title || '宿舍全能管家')
const pageSubtitle = computed(() => pageTitles[route.name]?.subtitle || '')
</script>
