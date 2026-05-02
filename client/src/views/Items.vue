<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button class="btn btn-primary flex items-center gap-2" @click="openAddModal">
          <Plus class="w-4 h-4" />
          添加物品
        </button>
        <select v-model="filterStatus" class="form-select w-32">
          <option value="all">全部</option>
          <option value="available">可借用</option>
          <option value="borrowed">已借出</option>
        </select>
      </div>
      <div class="flex items-center gap-6">
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">物品总数</p>
          <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ items.length }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">可借用</p>
          <p class="text-xl font-semibold text-green-500">{{ availableCount }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">已借出</p>
          <p class="text-xl font-semibold text-yellow-500">{{ borrowedCount }}</p>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="[
            'p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-md',
            item.status === 'available'
              ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
              : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
          ]"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">{{ item.name }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                所有者: {{ item.ownerName }}
              </p>
            </div>
            <span :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              item.status === 'available'
                ? 'bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300'
                : 'bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
            ]">
              {{ item.status === 'available' ? '可借用' : '已借出' }}
            </span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">
            <MapPin class="w-4 h-4 inline mr-1" />
            {{ item.location || '未指定位置' }}
          </p>
          <p v-if="item.note" class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {{ item.note }}
          </p>
          <div v-if="item.status === 'borrowed'" class="mb-3 p-2 bg-white/50 dark:bg-gray-800/50 rounded">
            <p class="text-xs text-gray-600 dark:text-gray-300">
              <User class="w-3 h-3 inline mr-1" />
              借用人: {{ item.borrowerName }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              借用时间: {{ formatDate(item.borrowDate) }}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              v-if="item.status === 'available'"
              class="btn btn-primary btn-sm flex-1 flex items-center justify-center gap-1 transition-transform hover:scale-105"
              @click="borrowItem(item)"
            >
              <ArrowRightLeft class="w-3 h-3" />
              借用
            </button>
            <button
              v-else
              class="btn btn-sm flex-1 flex items-center justify-center gap-1 transition-transform hover:scale-105"
              style="background-color: #22c55e; color: white;"
              @click="returnItem(item)"
            >
              <RotateCcw class="w-3 h-3" />
              归还
            </button>
            <button class="btn btn-outline btn-sm flex items-center gap-1 transition-transform hover:scale-105" @click="openEditModal(item)">
              <Edit class="w-3 h-3" />
            </button>
            <button class="btn btn-danger btn-sm flex items-center gap-1 transition-transform hover:scale-105" @click="confirmDelete(item)">
              <Trash2 class="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      <div v-if="filteredItems.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        <Package class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>暂无物品</p>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingItem ? '编辑物品' : '添加物品' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveItem">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                物品名称
              </label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="form-input"
                placeholder="例如：吹风机、雨伞、充电宝"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                所有者
              </label>
              <select v-model="formData.ownerId" required class="form-select">
                <option value="">请选择所有者</option>
                <option v-for="r in roommates" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                存放位置
              </label>
              <input
                v-model="formData.location"
                type="text"
                class="form-input"
                placeholder="例如：书桌抽屉、衣柜"
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
                placeholder="其他说明..."
              ></textarea>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingItem ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showBorrowModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">借用物品</h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeBorrowModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-300">物品: {{ borrowingItem?.name }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">所有者: {{ borrowingItem?.ownerName }}</p>
        </div>
        <form @submit.prevent="confirmBorrow">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                借用人
              </label>
              <select v-model="borrowerId" required class="form-select">
                <option value="">请选择借用人</option>
                <option v-for="r in roommates" :key="r.id" :value="r.id">
                  {{ r.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeBorrowModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">确认借用</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, Package, MapPin, User, ArrowRightLeft, RotateCcw } from 'lucide-vue-next'
import { itemsApi, roommatesApi } from '../services/api'
import { useToast } from '../composables/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { success, error } = useToast()

const roommates = ref([])
const items = ref([])
const filterStatus = ref('all')
const showModal = ref(false)
const showBorrowModal = ref(false)
const showConfirmModal = ref(false)
const editingItem = ref(null)
const borrowingItem = ref(null)
const borrowerId = ref('')
const deleteItemId = ref(null)
const confirmMessage = ref('')
const formData = ref({
  name: '',
  ownerId: '',
  location: '',
  note: ''
})

const filteredItems = computed(() => {
  if (filterStatus.value === 'all') return items.value
  return items.value.filter(i => i.status === filterStatus.value)
})

const availableCount = computed(() => items.value.filter(i => i.status === 'available').length)
const borrowedCount = computed(() => items.value.filter(i => i.status === 'borrowed').length)

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const loadData = async () => {
  try {
    const [roommatesRes, itemsRes] = await Promise.all([
      roommatesApi.getAll(),
      itemsApi.getAll()
    ])
    roommates.value = roommatesRes.data
    items.value = itemsRes.data
  } catch (err) {
    error('加载失败', '无法加载物品数据，请检查后端服务是否正常运行')
    console.error('加载数据失败:', err)
  }
}

const openAddModal = () => {
  editingItem.value = null
  formData.value = { name: '', ownerId: '', location: '', note: '' }
  showModal.value = true
}

const openEditModal = (item) => {
  editingItem.value = item
  formData.value = {
    name: item.name,
    ownerId: item.ownerId,
    location: item.location,
    note: item.note || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
}

const saveItem = async () => {
  try {
    const roommate = roommates.value.find(r => r.id === formData.value.ownerId)
    const data = {
      ...formData.value,
      ownerName: roommate?.name || ''
    }
    
    if (editingItem.value) {
      await itemsApi.update(editingItem.value.id, data)
      success('修改成功', `物品「${formData.value.name}」已更新`)
    } else {
      await itemsApi.create(data)
      success('添加成功', `物品「${formData.value.name}」已添加`)
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存物品信息')
    console.error('保存失败:', err)
  }
}

const borrowItem = (item) => {
  borrowingItem.value = item
  borrowerId.value = ''
  showBorrowModal.value = true
}

const closeBorrowModal = () => {
  showBorrowModal.value = false
  borrowingItem.value = null
}

const confirmBorrow = async () => {
  try {
    const borrower = roommates.value.find(r => r.id === borrowerId.value)
    await itemsApi.borrow(borrowingItem.value.id, borrowerId.value, borrower?.name || '')
    success('借用成功', `「${borrowingItem.value.name}」已借出给 ${borrower?.name}`)
    closeBorrowModal()
    loadData()
  } catch (err) {
    error('借用失败', '无法完成借用操作')
    console.error('借用失败:', err)
  }
}

const returnItem = async (item) => {
  try {
    await itemsApi.return(item.id)
    success('归还成功', `「${item.name}」已归还`)
    loadData()
  } catch (err) {
    error('归还失败', '无法完成归还操作')
    console.error('归还失败:', err)
  }
}

const confirmDelete = (item) => {
  deleteItemId.value = item.id
  confirmMessage.value = `确定要删除物品「${item.name}」吗？此操作无法撤销。`
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  deleteItemId.value = null
  confirmMessage.value = ''
}

const handleDelete = async () => {
  if (!deleteItemId.value) return
  try {
    await itemsApi.delete(deleteItemId.value)
    success('删除成功', '物品已删除')
    loadData()
  } catch (err) {
    error('删除失败', '无法删除物品')
    console.error('删除失败:', err)
  } finally {
    closeConfirmModal()
  }
}

onMounted(() => {
  loadData()
})
</script>
