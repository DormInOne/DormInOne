<template>
  <div class="space-y-6">
    <transition name="fade-scale">
      <div v-if="appStore.isSupervisor" class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <Building2 class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-blue-600 dark:text-blue-400">当前管理楼层</p>
            <p class="font-semibold text-blue-900 dark:text-blue-200">{{ appStore.floorName }} ({{ appStore.buildingName || '宿舍楼' }})</p>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-scale">
      <div v-if="appStore.isDormAdmin" class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <Home class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-green-600 dark:text-green-400">当前管理宿舍</p>
            <p class="font-semibold text-green-900 dark:text-green-200">{{ appStore.className }} - {{ appStore.dormName }}</p>
          </div>
        </div>
      </div>
    </transition>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">室友数量</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{{ roommatesCount }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <Users class="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      <div class="card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">本月账单</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">¥{{ monthlyBills }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <FileText class="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      <div class="card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">本月用电</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{{ monthlyElectricity }} kWh</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <Zap class="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      <div class="card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">借用物品</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{{ borrowedItems }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
            <Package class="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">本周值日安排</h2>
        <div class="space-y-3">
          <div
            v-for="item in weeklySchedule"
            :key="item.id"
            class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div class="flex items-center gap-3">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                item.completed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-200 dark:bg-gray-600 text-gray-600'
              ]">
                {{ getDayName(item.date) }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.roommateName }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.task }}</p>
              </div>
            </div>
            <div :class="[
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
            ]">
              <Check v-if="item.completed" class="w-3 h-3 text-white" />
            </div>
          </div>
          <div v-if="weeklySchedule.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无值日安排
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">最近账单</h2>
        <div class="space-y-3">
          <div
            v-for="bill in recentBills"
            :key="bill.id"
            class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ bill.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ bill.payerName }} · {{ formatDate(bill.date) }}</p>
            </div>
            <p :class="[
              'text-sm font-semibold',
              bill.type === 'expense' ? 'text-red-500' : 'text-green-500'
            ]">
              {{ bill.type === 'expense' ? '-' : '+' }}¥{{ bill.amount }}
            </p>
          </div>
          <div v-if="recentBills.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            暂无账单记录
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Users, FileText, Zap, Package, Check, Building2, Home } from 'lucide-vue-next'
import { roommatesApi, scheduleApi, billsApi, electricityApi, itemsApi } from '../services/api'
import { useAppStore } from '../stores/appStore'

const appStore = useAppStore()

const roommates = ref([])
const schedule = ref([])
const bills = ref([])
const electricity = ref([])
const items = ref([])

const roommatesCount = computed(() => roommates.value.length)

const monthlyBills = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return bills.value
    .filter(b => {
      const date = new Date(b.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, b) => sum + (b.type === 'expense' ? b.amount : -b.amount), 0)
    .toFixed(2)
})

const monthlyElectricity = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return electricity.value
    .filter(e => {
      const date = new Date(e.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, e) => sum + e.usage, 0)
    .toFixed(1)
})

const borrowedItems = computed(() => {
  return items.value.filter(i => i.status === 'borrowed').length
})

const weeklySchedule = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() + 1)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  
  return schedule.value
    .filter(s => {
      const date = new Date(s.date)
      return date >= startOfWeek && date <= endOfWeek
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)
})

const recentBills = computed(() => {
  return [...bills.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
})

const getDayName = (dateStr) => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  const date = new Date(dateStr)
  return days[date.getDay()]
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const loadData = async () => {
  try {
    const [roommatesRes, scheduleRes, billsRes, electricityRes, itemsRes] = await Promise.all([
      roommatesApi.getAll(),
      scheduleApi.getAll(),
      billsApi.getAll(),
      electricityApi.getAll(),
      itemsApi.getAll()
    ])
    roommates.value = roommatesRes.data
    schedule.value = scheduleRes.data
    bills.value = billsRes.data
    electricity.value = electricityRes.data
    items.value = itemsRes.data
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
