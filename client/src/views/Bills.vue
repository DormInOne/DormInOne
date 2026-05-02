<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap" @click="openAddModal">
          <Plus class="w-4 h-4" />
          添加账单
        </button>
        <select v-model="filterType" class="form-select w-32">
          <option value="all">全部</option>
          <option value="expense">支出</option>
          <option value="income">收入</option>
        </select>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-right">
          <p class="text-sm text-gray-500 dark:text-gray-400">本月支出</p>
          <p class="text-xl font-semibold text-red-500">¥{{ monthlyExpense }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500 dark:text-gray-400">本月收入</p>
          <p class="text-xl font-semibold text-green-500">¥{{ monthlyIncome }}</p>
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
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">日期</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">项目</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">付款人</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">参与人数</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">金额</th>
              <th class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bill in filteredBills"
              :key="bill.id"
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
            >
              <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">
                {{ formatDate(bill.date) }}
              </td>
              <td class="py-3 px-4">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ bill.title }}</span>
                <p v-if="bill.note" class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ bill.note }}</p>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ bill.payerName }}</td>
              <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                {{ bill.participants?.length || 1 }} 人
              </td>
              <td class="py-3 px-4 text-right">
                <span :class="[
                  'text-sm font-semibold',
                  bill.type === 'expense' ? 'text-red-500' : 'text-green-500'
                ]">
                  {{ bill.type === 'expense' ? '-' : '+' }}¥{{ bill.amount.toFixed(2) }}
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" @click="openEditModal(bill)">
                    <Edit class="w-4 h-4 text-gray-500" />
                  </button>
                  <button class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" @click="confirmDelete(bill)">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredBills.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <FileText class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无账单记录</p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card p-6 w-full max-w-lg mx-4 transform transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingBill ? '编辑账单' : '添加账单' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveBill">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  类型
                </label>
                <select v-model="formData.type" class="form-select">
                  <option value="expense">支出</option>
                  <option value="income">收入</option>
                </select>
              </div>
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
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                项目名称
              </label>
              <input
                v-model="formData.title"
                type="text"
                required
                class="form-input"
                placeholder="例如：外卖、水电费、日用品"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                金额
              </label>
              <input
                v-model.number="formData.amount"
                type="number"
                step="0.01"
                required
                class="form-input"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                付款人
              </label>
              <select v-model="formData.payerId" required class="form-select">
                <option value="">请选择付款人</option>
                <option v-for="r in roommates" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                备注
              </label>
              <textarea
                v-model="formData.note"
                rows="2"
                class="form-textarea"
                placeholder="其他说明..."
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingBill ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, FileText } from 'lucide-vue-next'
import { billsApi, roommatesApi } from '../services/api'
import { useToast } from '../composables/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()

const roommates = ref([])
const bills = ref([])
const filterType = ref('all')
const showModal = ref(false)
const showConfirmModal = ref(false)
const editingBill = ref(null)
const deleteBillId = ref(null)
const confirmMessage = ref('')
const formData = ref({
  type: 'expense',
  date: '',
  title: '',
  amount: 0,
  payerId: '',
  note: ''
})

const filteredBills = computed(() => {
  let result = [...bills.value]
  if (filterType.value !== 'all') {
    result = result.filter(b => b.type === filterType.value)
  }
  return result.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const monthlyExpense = computed(() => {
  const now = new Date()
  return bills.value
    .filter(b => {
      const date = new Date(b.date)
      return b.type === 'expense' && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + b.amount, 0)
    .toFixed(2)
})

const monthlyIncome = computed(() => {
  const now = new Date()
  return bills.value
    .filter(b => {
      const date = new Date(b.date)
      return b.type === 'income' && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, b) => sum + b.amount, 0)
    .toFixed(2)
})

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

const loadData = async () => {
  try {
    const [roommatesRes, billsRes] = await Promise.all([
      roommatesApi.getAll(),
      billsApi.getAll()
    ])
    roommates.value = roommatesRes.data
    bills.value = billsRes.data
  } catch (err) {
    error('加载失败', '无法加载账单数据，请检查后端服务是否正常运行')
    console.error('加载数据失败:', err)
  }
}

const openAddModal = () => {
  editingBill.value = null
  const today = new Date().toISOString().split('T')[0]
  formData.value = { type: 'expense', date: today, title: '', amount: 0, payerId: '', note: '' }
  showModal.value = true
}

const openEditModal = (bill) => {
  editingBill.value = bill
  formData.value = {
    type: bill.type,
    date: bill.date,
    title: bill.title,
    amount: bill.amount,
    payerId: bill.payerId,
    note: bill.note || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingBill.value = null
}

const saveBill = async () => {
  try {
    const roommate = roommates.value.find(r => r.id === formData.value.payerId)
    const data = {
      ...formData.value,
      payerName: roommate?.name || ''
    }
    
    if (editingBill.value) {
      await billsApi.update(editingBill.value.id, data)
      success('修改成功', `账单「${formData.value.title}」已更新`)
    } else {
      await billsApi.create(data)
      success('添加成功', `账单「${formData.value.title}」已添加`)
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存账单信息')
    console.error('保存失败:', err)
  }
}

const confirmDelete = (bill) => {
  deleteBillId.value = bill.id
  confirmMessage.value = `确定要删除账单「${bill.title}」吗？此操作无法撤销。`
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  deleteBillId.value = null
  confirmMessage.value = ''
}

const handleDelete = async () => {
  if (!deleteBillId.value) return
  try {
    await billsApi.delete(deleteBillId.value)
    success('删除成功', '账单已删除')
    loadData()
  } catch (err) {
    error('删除失败', '无法删除账单')
    console.error('删除失败:', err)
  } finally {
    closeConfirmModal()
  }
}

onMounted(() => {
  loadData()
})
</script>
