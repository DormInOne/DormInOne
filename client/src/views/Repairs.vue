<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <button class="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap" @click="openAddModal">
          <Plus class="w-4 h-4" />
          提交报修
        </button>
      </div>
      <div class="flex items-center gap-4">
        <select v-model="filterCategory" class="form-select w-36">
          <option value="all">全部分类</option>
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <select v-model="filterPriority" class="form-select w-28">
          <option value="all">全部优先级</option>
          <option v-for="p in priorities" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
        <select v-model="filterStatus" class="form-select w-28">
          <option value="all">全部状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="completed">已完成</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <ClipboardList class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总报修数</p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ repairs.length }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Clock class="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">待处理</p>
            <p class="text-xl font-semibold text-yellow-600">{{ pendingCount }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Wrench class="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">处理中</p>
            <p class="text-xl font-semibold text-orange-600">{{ processingCount }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle class="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">已完成</p>
            <p class="text-xl font-semibold text-green-600">{{ completedCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <div class="card p-6">
          <div class="space-y-3">
            <div
              v-for="repair in filteredRepairs"
              :key="repair.id"
              :class="[
                'p-4 rounded-lg border transition-all duration-300 cursor-pointer',
                repair.status === 'completed' ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' :
                repair.status === 'processing' ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/10' :
                'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
              ]"
              @click="openDetailModal(repair)"
            >
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getCategoryStyle(repair.category)
                  ]">
                    {{ getCategoryLabel(repair.category) }}
                  </span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getPriorityStyle(repair.priority)
                  ]">
                    {{ getPriorityLabel(repair.priority) }}
                  </span>
                </div>
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  repair.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  repair.status === 'processing' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                ]">
                  {{ statusText[repair.status] }}
                </span>
              </div>
              <h3 class="font-medium text-gray-900 dark:text-white mb-1">{{ repair.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ repair.description }}</p>
              <div class="flex items-center justify-between mt-3">
                <span class="text-xs text-gray-400">{{ repair.reporter }} · {{ formatDate(repair.createdAt) }}</span>
                <button
                  v-if="(appStore.isAdmin || appStore.isSupervisor) && repair.status !== 'completed'"
                  class="text-xs text-primary-500 hover:text-primary-600 font-medium"
                  @click.stop="updateStatus(repair, repair.status === 'pending' ? 'processing' : 'completed')"
                >
                  {{ repair.status === 'pending' ? '开始处理' : '完成维修' }}
                </button>
                <span
                  v-else
                  class="text-xs text-gray-400"
                >
                  {{ statusText[repair.status] }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="filteredRepairs.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
            <ClipboardList class="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>暂无报修记录</p>
            <button class="btn btn-primary mt-4" @click="openAddModal">提交第一个报修</button>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">分类统计</h3>
          <div class="space-y-3">
            <div v-for="cat in categories" :key="cat.value" class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ cat.label }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ getCategoryCount(cat.value) }}
              </span>
            </div>
          </div>
        </div>

        <div class="card p-4">
          <h3 class="font-medium text-gray-900 dark:text-white mb-4">优先级统计</h3>
          <div class="space-y-3">
            <div v-for="p in priorities" :key="p.value" class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">{{ p.label }}</span>
              <span :class="[
                'text-sm font-medium',
                p.value === 'high' ? 'text-red-500' : p.value === 'medium' ? 'text-yellow-500' : 'text-gray-500'
              ]">
                {{ getPriorityCount(p.value) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-lg mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingRepair ? '编辑报修' : '提交报修' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveRepair">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标题 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                placeholder="简要描述问题"
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                分类 <span class="text-red-500">*</span>
              </label>
              <select v-model="formData.category" required class="form-select">
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                优先级 <span class="text-red-500">*</span>
              </label>
              <div class="flex gap-2">
                <label
                  v-for="p in priorities"
                  :key="p.value"
                  :class="[
                    'flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all duration-200',
                    formData.priority === p.value
                      ? p.value === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/30' :
                        p.value === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  ]"
                >
                  <input
                    v-model="formData.priority"
                    type="radio"
                    :value="p.value"
                    class="sr-only"
                  />
                  <span :class="[
                    'text-xs font-medium',
                    formData.priority === p.value
                      ? p.value === 'high' ? 'text-red-600 dark:text-red-400' :
                        p.value === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  ]">
                    {{ p.label }}
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                详细描述
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="详细描述问题情况..."
                class="form-textarea"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                报修人 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.reporter"
                type="text"
                required
                placeholder="您的姓名"
                class="form-input"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingRepair ? '保存修改' : '提交报修' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-lg mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">报修详情</h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeDetailModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">标题</p>
            <p class="text-lg font-medium text-gray-900 dark:text-white">{{ currentRepair?.title }}</p>
          </div>
          <div class="flex gap-2">
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              getCategoryStyle(currentRepair?.category)
            ]">
              {{ getCategoryLabel(currentRepair?.category) }}
            </span>
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              getPriorityStyle(currentRepair?.priority)
            ]">
              {{ getPriorityLabel(currentRepair?.priority) }}
            </span>
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              currentRepair?.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              currentRepair?.status === 'processing' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
              'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            ]">
              {{ statusText[currentRepair?.status] }}
            </span>
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">详细描述</p>
            <p class="text-gray-900 dark:text-white">{{ currentRepair?.description }}</p>
          </div>
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ currentRepair?.reporter }} · {{ formatDate(currentRepair?.createdAt) }}
            </span>
            <div class="flex gap-2">
              <button v-if="currentRepair?.status !== 'completed'" class="btn btn-secondary" @click="editRepair(currentRepair)">
                编辑
              </button>
              <button class="btn btn-primary" @click="updateStatus(currentRepair, currentRepair?.status === 'pending' ? 'processing' : 'completed')">
                {{ currentRepair?.status === 'pending' ? '开始处理' : currentRepair?.status === 'processing' ? '完成维修' : '重新打开' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, X, ClipboardList, Clock, Wrench, CheckCircle } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import { useAppStore } from '../stores/appStore'
import { repairsApi } from '../services/api'

const { success, error } = useToast()
const appStore = useAppStore()

const repairs = ref([])
const filterCategory = ref('all')
const filterPriority = ref('all')
const filterStatus = ref('all')
const showModal = ref(false)
const showDetailModal = ref(false)
const editingRepair = ref(null)
const currentRepair = ref(null)

const categories = [
  { value: 'water', label: '水电故障', color: 'blue' },
  { value: 'furniture', label: '家具损坏', color: 'purple' },
  { value: 'public', label: '公共区域', color: 'green' }
]

const priorities = [
  { value: 'high', label: '紧急', color: 'red' },
  { value: 'medium', label: '一般', color: 'yellow' },
  { value: 'low', label: '低', color: 'blue' }
]

const statusText = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成'
}

const formData = ref({
  title: '',
  category: '',
  priority: 'medium',
  description: '',
  reporter: ''
})

const filteredRepairs = computed(() => {
  return repairs.value.filter(repair => {
    const matchesCategory = filterCategory.value === 'all' || repair.category === filterCategory.value
    const matchesPriority = filterPriority.value === 'all' || repair.priority === filterPriority.value
    const matchesStatus = filterStatus.value === 'all' || repair.status === filterStatus.value
    return matchesCategory && matchesPriority && matchesStatus
  })
})

const pendingCount = computed(() => repairs.value.filter(r => r.status === 'pending').length)
const processingCount = computed(() => repairs.value.filter(r => r.status === 'processing').length)
const completedCount = computed(() => repairs.value.filter(r => r.status === 'completed').length)

const getCategoryLabel = (value) => {
  return categories.find(c => c.value === value)?.label || value
}

const getCategoryStyle = (value) => {
  const cat = categories.find(c => c.value === value)
  if (cat?.color === 'blue') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  if (cat?.color === 'purple') return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
  if (cat?.color === 'green') return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700'
}

const getPriorityLabel = (value) => {
  return priorities.find(p => p.value === value)?.label || value
}

const getPriorityStyle = (value) => {
  if (value === 'high') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
  if (value === 'medium') return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
  if (value === 'low') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-700'
}

const getCategoryCount = (category) => {
  return repairs.value.filter(r => r.category === category).length
}

const getPriorityCount = (priority) => {
  return repairs.value.filter(r => r.priority === priority).length
}

const formatDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const loadData = async () => {
  try {
    const res = await repairsApi.getAll()
    repairs.value = res.data
  } catch (err) {
    error('加载失败', '无法加载报修数据')
    console.error('加载数据失败:', err)
  }
}

const openAddModal = () => {
  editingRepair.value = null
  formData.value = {
    title: '',
    category: '',
    priority: 'medium',
    description: '',
    reporter: ''
  }
  showModal.value = true
}

const openDetailModal = (repair) => {
  currentRepair.value = repair
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  currentRepair.value = null
}

const editRepair = (repair) => {
  closeDetailModal()
  editingRepair.value = repair
  formData.value = {
    title: repair.title,
    category: repair.category,
    priority: repair.priority,
    description: repair.description,
    reporter: repair.reporter
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRepair.value = null
}

const saveRepair = async () => {
  try {
    const data = {
      ...formData.value,
      status: editingRepair.value ? editingRepair.value.status : 'pending',
      createdAt: editingRepair.value ? editingRepair.value.createdAt : new Date().toISOString()
    }

    if (editingRepair.value) {
      await repairsApi.update(editingRepair.value.id, data)
      success('修改成功', '报修信息已更新')
    } else {
      await repairsApi.create(data)
      success('提交成功', '报修已提交')
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存报修信息')
    console.error('保存失败:', err)
  }
}

const updateStatus = async (repair, status) => {
  try {
    await repairsApi.update(repair.id, { status })
    if (status === 'processing') {
      success('状态更新', '已开始处理')
    } else if (status === 'completed') {
      success('维修完成', '报修已完成')
    }
    loadData()
    closeDetailModal()
  } catch (err) {
    error('更新失败', '无法更新状态')
    console.error('更新失败:', err)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-in {
  animation: modal-in 0.2s ease-out;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
