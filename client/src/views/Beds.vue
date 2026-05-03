<template>
  <div class="space-y-6">
    <div v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="card p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
      <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400">
        <Info class="w-5 h-5" />
        <span class="text-sm font-medium">请先选择楼层和宿舍，然后再进行床位管理操作</span>
      </div>
    </div>

    <div v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">楼层</label>
        <select 
          v-model="selectedFloor" 
          class="form-select w-48"
          @change="onFloorChange"
        >
          <option value="">请选择楼层</option>
          <option v-for="floor in availableFloors" :key="floor.id" :value="floor.id">
            {{ floor.name }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">宿舍</label>
        <select 
          v-model="selectedDorm" 
          class="form-select w-48"
          :disabled="!selectedFloor"
        >
          <option value="">请选择宿舍</option>
          <option v-for="dorm in filteredDorms" :key="dorm.id" :value="dorm.id">
            {{ dorm.name }} ({{ dorm.className }})
          </option>
        </select>
      </div>
    </div>

    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <button 
          v-if="(appStore.isSystemAdmin || appStore.isSupervisor) && selectedDorm" 
          class="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap" 
          @click="openAddModal"
        >
          <Plus class="w-4 h-4" />
          添加床位
        </button>
        <button 
          v-if="(appStore.isSystemAdmin || appStore.isSupervisor) && selectedDorm" 
          class="btn btn-secondary inline-flex items-center gap-2 whitespace-nowrap" 
          @click="importBeds"
        >
          <Upload class="w-4 h-4" />
          批量导入
        </button>
        <button 
          v-if="appStore.isSystemAdmin || appStore.isSupervisor" 
          class="btn btn-outline inline-flex items-center gap-2 whitespace-nowrap" 
          @click="exportBeds"
        >
          <Download class="w-4 h-4" />
          导出数据
        </button>
      </div>
      <div class="flex items-center gap-4">
        <select v-model="filterStatus" class="form-select w-32">
          <option value="all">全部状态</option>
          <option value="empty">空床位</option>
          <option value="occupied">已入住</option>
          <option value="maintenance">维修中</option>
        </select>
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索房间号..."
            class="form-input pl-10 w-48"
          />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <LayoutGrid class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">总床位数</p>
            <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ beds.length }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Users class="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">已入住</p>
            <p class="text-xl font-semibold text-green-600">{{ occupiedCount }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <LayoutGrid class="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">空床位</p>
            <p class="text-xl font-semibold text-yellow-600">{{ emptyCount }}</p>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Wrench class="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">维修中</p>
            <p class="text-xl font-semibold text-red-600">{{ maintenanceCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card p-6">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">宿舍</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">床位号</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">状态</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">入住人</th>
              <th class="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">入住时间</th>
              <th v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="bed in filteredBeds"
              :key="bed.id"
              class="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <td class="py-3 px-4">
                <span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium">{{ bed.dormName || '-' }}</span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ bed.bedNumber }}</td>
              <td class="py-3 px-4">
                <span :class="[
                  'px-2 py-1 rounded-full text-xs font-medium',
                  bed.status === 'empty' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  bed.status === 'occupied' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                ]">
                  {{ statusText[bed.status] }}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-900 dark:text-white">{{ bed.occupantName || '-' }}</td>
              <td class="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{{ bed.checkInDate || '-' }}</td>
              <td v-if="appStore.isSystemAdmin || appStore.isSupervisor" class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    v-if="bed.status === 'empty'"
                    class="btn btn-xs btn-primary"
                    @click="openAssignModal(bed)"
                  >
                    分配
                  </button>
                  <button
                    v-if="bed.status === 'occupied'"
                    class="btn btn-xs btn-danger"
                    @click="confirmCheckout(bed)"
                  >
                    退宿
                  </button>
                  <button
                    v-if="bed.status !== 'maintenance'"
                    class="btn btn-xs btn-secondary"
                    @click="setMaintenance(bed)"
                  >
                    维修
                  </button>
                  <button
                    v-if="bed.status === 'maintenance'"
                    class="btn btn-xs btn-green"
                    @click="fixBed(bed)"
                  >
                    修复
                  </button>
                  <button class="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors" @click="openEditModal(bed)">
                    <Edit class="w-4 h-4 text-gray-500" />
                  </button>
                  <button class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" @click="confirmDelete(bed)">
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredBeds.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <BedDouble class="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>暂无床位信息</p>
          <button 
            v-if="(appStore.isSystemAdmin || appStore.isSupervisor) && selectedDorm" 
            class="btn btn-primary mt-4" 
            @click="openAddModal"
          >
            添加第一个床位
          </button>
          <p v-else-if="appStore.isSystemAdmin || appStore.isSupervisor" class="mt-4 text-sm">
            请先选择要管理的宿舍
          </p>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ editingBed ? '编辑床位' : '添加床位' }}
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form @submit.prevent="saveBed">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                床位号 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.bedNumber"
                type="text"
                required
                placeholder="如：A1"
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                床位状态
              </label>
              <select v-model="formData.status" class="form-select">
                <option value="empty">空床位</option>
                <option value="occupied">已入住</option>
                <option value="maintenance">维修中</option>
              </select>
            </div>
            <div v-if="formData.status === 'occupied'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                入住人
              </label>
              <select v-model="formData.occupantName" class="form-select">
                <option value="">请选择室友</option>
                <option v-for="r in availableRoommates" :key="r.id" :value="r.name">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div v-if="formData.status === 'occupied'">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                入住日期
              </label>
              <input
                v-model="formData.checkInDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              {{ editingBed ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="card p-6 w-full max-w-md mx-4 transform transition-all duration-300 animate-modal-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            分配床位
          </h3>
          <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors" @click="closeAssignModal">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">床位信息</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ currentDormName }} - 床位 {{ assigningBed?.bedNumber }}
          </p>
        </div>
        <form @submit.prevent="assignBed">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                选择入住人 <span class="text-red-500">*</span>
              </label>
              <select v-model="assignData.occupantName" required class="form-select">
                <option value="">请选择室友</option>
                <option v-for="r in availableRoommates" :key="r.id" :value="r.name">
                  {{ r.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                入住日期 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="assignData.checkInDate"
                type="date"
                required
                class="form-input"
              />
            </div>
          </div>
          <div class="flex gap-3 mt-6">
            <button type="button" class="btn btn-secondary flex-1" @click="closeAssignModal">
              取消
            </button>
            <button type="submit" class="btn btn-primary flex-1">
              确认分配
            </button>
          </div>
        </form>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept=".json,.csv"
      class="hidden"
      @change="handleFileImport"
    />

    <ConfirmModal
      :show="showConfirmModal"
      title="确认操作"
      :message="confirmMessage"
      type="danger"
      @confirm="handleConfirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Search, Edit, Trash2, X, Upload, Download, LayoutGrid, Users, Wrench, BedDouble, Info } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import { useAppStore } from '../stores/appStore'
import ConfirmModal from '../components/ConfirmModal.vue'
import { bedsApi, roommatesApi, floorsApi, dormitoriesApi } from '../services/api'

const { success, error } = useToast()
const appStore = useAppStore()

const beds = ref([])
const roommates = ref([])
const floors = ref([])
const dorms = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const showModal = ref(false)
const showAssignModal = ref(false)
const showConfirmModal = ref(false)
const editingBed = ref(null)
const assigningBed = ref(null)
const confirmMessage = ref('')
const confirmAction = ref(null)
const fileInput = ref(null)
const selectedFloor = ref('')
const selectedDorm = ref('')

const formData = ref({
  bedNumber: '',
  status: 'empty',
  occupantName: '',
  checkInDate: ''
})

const assignData = ref({
  occupantName: '',
  checkInDate: new Date().toISOString().split('T')[0]
})

const statusText = {
  empty: '空床位',
  occupied: '已入住',
  maintenance: '维修中'
}

const availableFloors = computed(() => {
  if (appStore.isSystemAdmin) {
    return floors.value
  } else if (appStore.isSupervisor && appStore.floorId) {
    return floors.value.filter(f => f.id === appStore.floorId)
  }
  return []
})

const filteredDorms = computed(() => {
  if (!selectedFloor.value) return []
  return dorms.value.filter(d => d.floorId === selectedFloor.value)
})

const currentDormName = computed(() => {
  const dorm = dorms.value.find(d => d.id === selectedDorm.value)
  return dorm ? `${dorm.className} - ${dorm.name}` : ''
})

const filteredBeds = computed(() => {
  let result = beds.value
  
  if (selectedDorm.value) {
    result = result.filter(b => b.dormId === selectedDorm.value)
  } else if (selectedFloor.value) {
    result = result.filter(b => b.floorId === selectedFloor.value)
  } else if (appStore.isSupervisor && appStore.floorId) {
    result = result.filter(b => b.floorId === appStore.floorId)
  } else if (appStore.isDormAdmin && appStore.dormId) {
    result = result.filter(b => b.dormId === appStore.dormId)
  } else if (appStore.isMember && appStore.dormId) {
    result = result.filter(b => b.dormId === appStore.dormId)
  }
  
  const matchesSearch = bed => 
    (bed.dormName?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
     bed.bedNumber.toLowerCase().includes(searchQuery.value.toLowerCase()))
  const matchesStatus = bed => 
    filterStatus.value === 'all' || bed.status === filterStatus.value
  
  return result.filter(bed => matchesSearch(bed) && matchesStatus(bed))
})

const occupiedCount = computed(() => filteredBeds.value.filter(b => b.status === 'occupied').length)
const emptyCount = computed(() => filteredBeds.value.filter(b => b.status === 'empty').length)
const maintenanceCount = computed(() => filteredBeds.value.filter(b => b.status === 'maintenance').length)

const availableRoommates = computed(() => {
  const occupiedNames = beds.value
    .filter(b => b.status === 'occupied')
    .map(b => b.occupantName)
  return roommates.value.filter(r => !occupiedNames.includes(r.name))
})

const loadData = async () => {
  try {
    const [bedsRes, roommatesRes, floorsRes, dormsRes] = await Promise.all([
      bedsApi.getAll(),
      roommatesApi.getAll(),
      floorsApi.getAll(),
      dormitoriesApi.getAll()
    ])
    beds.value = bedsRes.data
    roommates.value = roommatesRes.data
    floors.value = floorsRes.data
    dorms.value = dormsRes.data
    
    if (appStore.isSupervisor && appStore.floorId) {
      selectedFloor.value = appStore.floorId
    }
  } catch (err) {
    error('加载失败', '无法加载数据')
    console.error('加载数据失败:', err)
  }
}

const onFloorChange = () => {
  selectedDorm.value = ''
}

const openAddModal = () => {
  editingBed.value = null
  formData.value = {
    bedNumber: '',
    status: 'empty',
    occupantName: '',
    checkInDate: ''
  }
  showModal.value = true
}

const openEditModal = (bed) => {
  editingBed.value = bed
  formData.value = {
    bedNumber: bed.bedNumber,
    status: bed.status,
    occupantName: bed.occupantName || '',
    checkInDate: bed.checkInDate || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingBed.value = null
}

const saveBed = async () => {
  try {
    const data = {
      dormId: selectedDorm.value,
      bedNumber: formData.value.bedNumber,
      status: formData.value.status,
      occupantName: formData.value.status === 'occupied' ? formData.value.occupantName : '',
      checkInDate: formData.value.status === 'occupied' ? (formData.value.checkInDate || new Date().toISOString().split('T')[0]) : ''
    }

    if (editingBed.value) {
      await bedsApi.update(editingBed.value.id, data)
      success('修改成功', '床位信息已更新')
    } else {
      await bedsApi.create(data)
      success('添加成功', '床位已添加')
    }
    closeModal()
    loadData()
  } catch (err) {
    error('保存失败', '无法保存床位信息')
    console.error('保存失败:', err)
  }
}

const openAssignModal = (bed) => {
  assigningBed.value = bed
  assignData.value = {
    occupantName: '',
    checkInDate: new Date().toISOString().split('T')[0]
  }
  showAssignModal.value = true
}

const closeAssignModal = () => {
  showAssignModal.value = false
  assigningBed.value = null
}

const assignBed = async () => {
  try {
    await bedsApi.update(assigningBed.value.id, {
      status: 'occupied',
      occupantName: assignData.value.occupantName,
      checkInDate: assignData.value.checkInDate
    })
    success('分配成功', `${assignData.value.occupantName} 已入住`)
    closeAssignModal()
    loadData()
  } catch (err) {
    error('分配失败', '无法分配床位')
    console.error('分配失败:', err)
  }
}

const confirmCheckout = (bed) => {
  confirmMessage.value = `确定要让 ${bed.occupantName} 退宿吗？`
  confirmAction.value = () => checkoutBed(bed)
  showConfirmModal.value = true
}

const checkoutBed = async (bed) => {
  try {
    await bedsApi.update(bed.id, {
      status: 'empty',
      occupantName: '',
      checkInDate: ''
    })
    success('退宿成功', `${bed.occupantName} 已退宿`)
    loadData()
  } catch (err) {
    error('退宿失败', '无法完成退宿')
    console.error('退宿失败:', err)
  }
}

const setMaintenance = (bed) => {
  confirmMessage.value = `确定要将床位 ${bed.bedNumber} 设为维修中吗？`
  confirmAction.value = () => updateMaintenance(bed, 'maintenance')
  showConfirmModal.value = true
}

const fixBed = (bed) => {
  confirmMessage.value = `确定要将床位 ${bed.bedNumber} 设为已修复吗？`
  confirmAction.value = () => updateMaintenance(bed, 'empty')
  showConfirmModal.value = true
}

const updateMaintenance = async (bed, status) => {
  try {
    await bedsApi.update(bed.id, { status })
    success('更新成功', '床位状态已更新')
    loadData()
  } catch (err) {
    error('更新失败', '无法更新床位状态')
    console.error('更新失败:', err)
  }
}

const confirmDelete = (bed) => {
  confirmMessage.value = `确定要删除床位 ${bed.bedNumber} 吗？`
  confirmAction.value = () => deleteBed(bed)
  showConfirmModal.value = true
}

const deleteBed = async (bed) => {
  try {
    await bedsApi.delete(bed.id)
    success('删除成功', '床位已删除')
    loadData()
  } catch (err) {
    error('删除失败', '无法删除床位')
    console.error('删除失败:', err)
  }
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmAction.value = null
}

const handleConfirmAction = () => {
  if (confirmAction.value) {
    confirmAction.value()
  }
  closeConfirmModal()
}

const importBeds = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    let importData
    
    if (file.name.endsWith('.csv')) {
      importData = parseCSV(text)
    } else {
      importData = JSON.parse(text)
    }

    for (const bed of importData) {
      await bedsApi.create({ ...bed, dormId: selectedDorm.value })
    }

    success('导入成功', `成功导入 ${importData.length} 条床位信息`)
    loadData()
  } catch (err) {
    error('导入失败', '无法解析文件')
    console.error('导入失败:', err)
  }

  event.target.value = ''
}

const parseCSV = (text) => {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',')
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || ''
    })
    data.push(row)
  }
  
  return data
}

const exportBeds = () => {
  const data = JSON.stringify(filteredBeds.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `beds-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  success('导出成功', '床位数据已导出')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="postcss">
.btn-xs {
  @apply px-3 py-1 text-sm;
}

.btn-green {
  @apply bg-green-500 text-white hover:bg-green-600;
}

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
  animation: modal-in 0.3s ease-out;
}
</style>
