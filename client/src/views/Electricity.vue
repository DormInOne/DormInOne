<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button v-if="appStore.isSupervisor" class="btn btn-primary flex items-center gap-2" @click="openAddModal">
          <Plus class="w-4 h-4" />
          添加记录
        </button>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">本月用电</p>
          <p class="text-xl font-semibold text-yellow-500">{{ monthlyUsage }} kWh</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">本月电费</p>
          <p class="text-xl font-semibold text-red-500">¥{{ monthlyCost }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">平均电价</p>
          <p class="text-xl font-semibold text-gray-600 dark:text-gray-300">¥{{ averagePrice }}/kWh</p>
        </div>
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

    <div class="card p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">用电趋势</h2>
      <div class="h-48 flex items-end gap-2">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="flex-1 flex flex-col items-center gap-2"
        >
          <div
            class="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-md transition-all duration-500 hover:opacity-80"
            :style="{ height: `${(item.usage / maxUsage) * 150}px` }"
          ></div>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">用电量</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">费用</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">备注</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in electricity"
              :key="record.id"
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">
                {{ formatDate(record.date) }}
              </td>
              <td class="py-3 px-4 text-right text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                {{ record.usage }} kWh
              </td>
              <td class="py-3 px-4 text-right text-sm text-red-500 font-medium">
                ¥{{ record.cost.toFixed(2) }}
              </td>
              <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                {{ record.note || '-' }}
              </td>
              <td class="py-3 px-4 text-right">
                <div v-if="appStore.isSupervisor" class="flex items-center justify-end gap-2">
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" @click="openEditModal(record)">
                    <Edit class="w-4 h-4 text-gray-500" />
                  </button>
                  <button class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" @click="confirmDelete(record)">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="electricity.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <Zap class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无用电记录</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingRecord ? '编辑记录' : '添加用电记录' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveRecord">
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
                用电量 (kWh)
              </label>
              <input
                v-model.number="formData.usage"
                type="number"
                step="0.1"
                required
                class="form-input"
                placeholder="0.0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                费用 (元)
              </label>
              <input
                v-model.number="formData.cost"
                type="number"
                step="0.01"
                required
                class="form-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备注
              </label>
              <textarea
                v-model="formData.note"
                rows="2"
                class="form-textarea"
                placeholder="例如：空调使用较多"
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingRecord ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Zap } from 'lucide-vue-next'
import { electricityApi } from '../services/api'
import { useToast } from '../composables/useToast'
import { useAppStore } from '../stores/appStore'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()
const appStore = useAppStore()

const electricity = ref([])
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingRecord = ref(null)
const deleteRecordId = ref(null)
const confirmMessage = ref('')
const formData = ref({
  date: '',
  usage: 0,
  cost: 0,
  note: ''
})

const monthlyUsage = computed(() => {
  const now = new Date()
  return electricity.value
    .filter(e => {
      const date = new Date(e.date)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + e.usage, 0)
    .toFixed(1)
})

const monthlyCost = computed(() => {
  const now = new Date()
  return electricity.value
    .filter(e => {
      const date = new Date(e.date)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, e) => sum + e.cost, 0)
    .toFixed(2)
})

const averagePrice = computed(() => {
  const totalUsage = electricity.value.reduce((sum, e) => sum + e.usage, 0)
  const totalCost = electricity.value.reduce((sum, e) => sum + e.cost, 0)
  if (totalUsage === 0) return '0.00'
  return (totalCost / totalUsage).toFixed(2)
})

const maxUsage = computed(() => {
  const max = Math.max(...electricity.value.map(e => e.usage))
  return max || 1
})

const chartData = computed(() => {
  const now = new Date()
  const data = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(now.getDate() - i)
    const record = electricity.value.find(e => e.date === date.toISOString().split('T')[0])
    data.push({
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      usage: record?.usage || 0
    })
  }
  return data
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const loadElectricity = async () => {
  try {
    const res = await electricityApi.getAll()
    electricity.value = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
  } catch (err) {
    error('加载失败', '无法加载用电数据，请检查后端服务是否正常运行')
    console.error('加载用电记录失败:', err)
  }
}

const openAddModal = () => {
  editingRecord.value = null
  const today = new Date().toISOString().split('T')[0]
  formData.value = { date: today, usage: 0, cost: 0, note: '' }
  showModal.value = true
}

const openEditModal = (record) => {
  editingRecord.value = record
  formData.value = {
    date: record.date,
    usage: record.usage,
    cost: record.cost,
    note: record.note || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingRecord.value = null
}

const saveRecord = async () => {
  try {
    if (editingRecord.value) {
      await electricityApi.update(editingRecord.value.id, formData.value)
      success('修改成功', '用电记录已更新')
    } else {
      await electricityApi.create(formData.value)
      success('添加成功', '用电记录已添加')
    }
    closeModal()
    loadElectricity()
  } catch (err) {
    error('保存失败', '无法保存用电记录')
    console.error('保存失败:', err)
  }
}

const confirmDelete = (record) => {
  deleteRecordId.value = record.id
  confirmMessage.value = `确定要删除 ${record.date} 的用电记录吗？此操作无法撤销。`
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  deleteRecordId.value = null
  confirmMessage.value = ''
}

const handleDelete = async () => {
  if (!deleteRecordId.value) return
  try {
    await electricityApi.delete(deleteRecordId.value)
    success('删除成功', '用电记录已删除')
    loadElectricity()
  } catch (err) {
    error('删除失败', '无法删除用电记录')
    console.error('删除失败:', err)
  } finally {
    closeConfirmModal()
  }
}

onMounted(() => {
  loadElectricity()
})
</script>
