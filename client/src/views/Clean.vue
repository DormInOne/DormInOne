<template>
  <div class="space-y-6">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">卫生评分</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">宿舍卫生检查评分记录</p>
      </div>
      <button
        v-if="appStore.isSupervisor"
        class="btn btn-primary inline-flex items-center gap-2"
        @click="openAddModal"
      >
        <Plus class="w-4 h-4" />
        添加评分
      </button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <TrendingUp class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">本周平均分</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ weeklyAverage }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Award class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">本月最高分</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ monthlyMax }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Calendar class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总评分次数</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ cleanList.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势图 -->
    <div class="card p-6">
      <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">评分趋势</h3>
      <div class="h-48 flex items-end gap-2">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="flex-1 flex flex-col items-center gap-1"
        >
          <div
            class="w-full rounded-t bg-primary-500 dark:bg-primary-400 transition-all duration-300 hover:opacity-80"
            :style="{ height: (item.score / 10) * 100 + '%', minHeight: '8px' }"
          ></div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 评分列表 -->
    <div class="card">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">评分记录</h3>
      </div>
      <div v-if="cleanList.length === 0" class="p-8 text-center">
        <Star class="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p class="text-gray-500 dark:text-gray-400">暂无评分记录</p>
      </div>
      <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="item in cleanList"
          :key="item.id"
          class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                :class="[
                  'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold',
                  getScoreColor(item.score)
                ]"
              >
                {{ item.score }}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ formatDate(item.date) }}</p>
                <p v-if="item.note" class="text-xs text-gray-500 dark:text-gray-400">{{ item.note }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">{{ item.createdBy }}</span>
              <div v-if="appStore.isSupervisor" class="flex items-center gap-1">
                <button
                  class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                  @click="openEditModal(item)"
                >
                  <Edit class="w-4 h-4 text-gray-500" />
                </button>
                <button
                  class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors duration-200"
                  @click="confirmDelete(item)"
                >
                  <Trash2 class="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑模态框 -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingClean ? '编辑评分' : '添加评分' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors duration-200" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveClean">
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
                评分 (1-10分)
              </label>
              <div class="flex items-center gap-4">
                <input
                  v-model.number="formData.score"
                  type="range"
                  min="1"
                  max="10"
                  class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span class="w-12 text-center text-lg font-bold text-gray-900 dark:text-white">{{ formData.score }}</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备注
              </label>
              <textarea
                v-model="formData.note"
                rows="3"
                placeholder="输入备注信息..."
                class="form-input"
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingClean ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="showConfirmModal"
      title="确认删除"
      :message="confirmMessage"
      type="danger"
      @confirm="handleDelete"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { Plus, X, Edit, Trash2, TrendingUp, Award, Calendar, Star } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import { cleanApi } from '../services/api'
import { useAppStore } from '../stores/appStore'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()
const appStore = useAppStore()

const cleanList = ref([])
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingClean = ref(null)
const deleteItem = ref(null)
const confirmMessage = ref('')

const formData = reactive({
  date: new Date().toISOString().split('T')[0],
  score: 8,
  note: ''
})

const weeklyAverage = computed(() => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weeklyItems = cleanList.value.filter(item => new Date(item.date) >= weekAgo)
  if (weeklyItems.length === 0) return '0'
  const avg = weeklyItems.reduce((sum, item) => sum + item.score, 0) / weeklyItems.length
  return avg.toFixed(1)
})

const monthlyMax = computed(() => {
  const now = new Date()
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  const monthlyItems = cleanList.value.filter(item => new Date(item.date) >= monthAgo)
  if (monthlyItems.length === 0) return '0'
  return Math.max(...monthlyItems.map(item => item.score))
})

const chartData = computed(() => {
  const data = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split('T')[0]
    const item = cleanList.value.find(c => c.date === dateStr)
    data.push({
      label: date.getDate() + '日',
      score: item?.score || 0
    })
  }
  return data
})

const getScoreColor = (score) => {
  if (score >= 9) return 'bg-green-500'
  if (score >= 7) return 'bg-blue-500'
  if (score >= 5) return 'bg-yellow-500'
  return 'bg-red-500'
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const loadData = async () => {
  try {
    const response = await cleanApi.getAll()
    cleanList.value = response.data.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (err) {
    error('加载失败', '无法加载评分记录')
  }
}

const openAddModal = () => {
  editingClean.value = null
  formData.date = new Date().toISOString().split('T')[0]
  formData.score = 8
  formData.note = ''
  showModal.value = true
}

const openEditModal = (item) => {
  editingClean.value = item
  formData.date = item.date
  formData.score = item.score
  formData.note = item.note || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingClean.value = null
}

const saveClean = async () => {
  try {
    if (editingClean.value) {
      await cleanApi.update(editingClean.value.id, formData)
      success('修改成功', '评分已更新')
    } else {
      await cleanApi.create(formData)
      success('添加成功', '评分已添加')
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存评分')
  }
}

const confirmDelete = (item) => {
  deleteItem.value = item
  confirmMessage.value = `确定要删除 ${formatDate(item.date)} 的评分记录吗？`
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  deleteItem.value = null
}

const handleDelete = async () => {
  if (!deleteItem.value) return
  try {
    await cleanApi.delete(deleteItem.value.id)
    success('删除成功', '评分已删除')
    loadData()
  } catch (err) {
    error('删除失败', '无法删除评分')
  }
  closeConfirmModal()
}

onMounted(() => {
  loadData()
})
</script>
