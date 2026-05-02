<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="btn btn-primary flex items-center gap-2" @click="openAddModal">
          <Plus class="w-4 h-4" />
          添加排班
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-secondary transition-transform hover:scale-105" @click="prevWeek">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="text-gray-700 dark:text-gray-300 font-medium">
          {{ weekRange }}
        </span>
        <button class="btn btn-secondary transition-transform hover:scale-105" @click="nextWeek">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="card p-6">
      <div class="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div
          v-for="day in weekDays"
          :key="day.date"
          class="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 transition-all duration-300"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ day.name }}
            </span>
            <span :class="[
              'w-6 h-6 rounded-full flex items-center justify-center text-xs',
              day.isToday ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-600'
            ]">
              {{ day.day }}
            </span>
          </div>
          <div class="space-y-2">
            <div
              v-for="item in getScheduleForDay(day.date)"
              :key="item.id"
              :class="[
                'p-2 rounded-md text-sm cursor-pointer transition-all duration-300',
                item.completed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:scale-105'
              ]"
              @click="toggleComplete(item)"
            >
              <p class="font-medium">{{ item.roommateName }}</p>
              <p class="text-xs opacity-75">{{ item.task }}</p>
            </div>
            <button
              v-if="getScheduleForDay(day.date).length === 0"
              class="w-full p-2 text-xs text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-primary-400 hover:text-primary-500 transition-colors"
              @click="openAddModalWithDate(day.date)"
            >
              + 添加任务
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingSchedule ? '编辑排班' : '添加排班' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveSchedule">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                日期
              </label>
              <input
                v-model="formData.date"
                type="date"
                required
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                室友
              </label>
              <select v-model="formData.roommateId" required class="form-select">
                <option value="">请选择室友</option>
                <option v-for="r in roommates" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                任务
              </label>
              <select v-model="formData.task" class="form-select">
                <option value="扫地">扫地</option>
                <option value="拖地">拖地</option>
                <option value="倒垃圾">倒垃圾</option>
                <option value="擦窗户">擦窗户</option>
                <option value="整理书桌">整理书桌</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingSchedule ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import { scheduleApi, roommatesApi } from '../services/api'
import { useToast } from '../composables/useToast'

const { success, error } = useToast()

const roommates = ref([])
const schedule = ref([])
const currentWeekStart = ref(getWeekStart())
const showModal = ref(false)
const editingSchedule = ref(null)
const formData = ref({
  date: '',
  roommateId: '',
  task: '扫地'
})

function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

const weekDays = computed(() => {
  const days = []
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const today = new Date().toDateString()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(currentWeekStart.value.getDate() + i)
    days.push({
      date: date.toISOString().split('T')[0],
      name: dayNames[i],
      day: date.getDate(),
      isToday: date.toDateString() === today
    })
  }
  return days
})

const weekRange = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
})

const getScheduleForDay = (date) => {
  return schedule.value.filter(s => s.date === date)
}

const prevWeek = () => {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(currentWeekStart.value.getDate() - 7)
  currentWeekStart.value = newStart
}

const nextWeek = () => {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(currentWeekStart.value.getDate() + 7)
  currentWeekStart.value = newStart
}

const loadData = async () => {
  try {
    const [roommatesRes, scheduleRes] = await Promise.all([
      roommatesApi.getAll(),
      scheduleApi.getAll()
    ])
    roommates.value = roommatesRes.data
    schedule.value = scheduleRes.data
  } catch (err) {
    error('加载失败', '无法加载排班数据，请检查后端服务是否正常运行')
    console.error('加载数据失败:', err)
  }
}

const openAddModal = () => {
  editingSchedule.value = null
  const today = new Date().toISOString().split('T')[0]
  formData.value = { date: today, roommateId: '', task: '扫地' }
  showModal.value = true
}

const openAddModalWithDate = (date) => {
  editingSchedule.value = null
  formData.value = { date, roommateId: '', task: '扫地' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingSchedule.value = null
}

const saveSchedule = async () => {
  try {
    const roommate = roommates.value.find(r => r.id === formData.value.roommateId)
    const data = {
      ...formData.value,
      roommateName: roommate?.name || ''
    }
    
    if (editingSchedule.value) {
      await scheduleApi.update(editingSchedule.value.id, data)
      success('修改成功', '排班已更新')
    } else {
      await scheduleApi.create(data)
      success('添加成功', `${roommate?.name} 的排班已添加`)
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存排班信息')
    console.error('保存失败:', err)
  }
}

const toggleComplete = async (item) => {
  try {
    await scheduleApi.update(item.id, { completed: !item.completed })
    success(item.completed ? '任务未完成' : '任务已完成')
    loadData()
  } catch (err) {
    error('更新失败', '无法更新任务状态')
    console.error('更新失败:', err)
  }
}

onMounted(() => {
  loadData()
})
</script>
