<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">楼层管理</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">管理学校各楼层及对应的宿舍</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="btn btn-primary flex items-center gap-2"
      >
        <Plus class="w-5 h-5" />
        创建楼层
      </button>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">楼层名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">所属楼宇</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">宿舍数量</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">邀请码</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="floor in floors" :key="floor.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ floor.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ floor.buildingName }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ getDormCount(floor.id) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <code class="font-mono text-sm text-gray-700 dark:text-gray-300">{{ getInviteCode(floor.id)?.code || '-' }}</code>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getInviteStatusClass(floor.id)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getInviteStatusText(floor.id) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <button
                  @click="viewFloor(floor)"
                  class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  title="查看详情"
                >
                  <Eye class="w-5 h-5" />
                </button>
                <button
                  @click="regenerateInvite(floor.id)"
                  class="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                  title="重新生成邀请码"
                >
                  <RefreshCw class="w-5 h-5" />
                </button>
                <button
                  @click="deleteFloor(floor.id)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="删除"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ editingFloor ? '编辑楼层' : '创建楼层' }}</h3>
          <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">楼层名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="如：3楼"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">所属楼宇</label>
            <input
              v-model="form.buildingName"
              type="text"
              placeholder="如：男生宿舍楼A"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700"
            />
          </div>
          <div class="flex gap-3 mt-6">
            <button @click="closeCreateModal" class="flex-1 btn btn-outline">取消</button>
            <button @click="saveFloor" class="flex-1 btn btn-primary">{{ editingFloor ? '保存' : '创建' }}</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ selectedFloor?.name }} - {{ selectedFloor?.buildingName }}</h3>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">楼层邀请码</p>
            <p class="text-lg font-mono font-medium">{{ getInviteCode(selectedFloor?.id)?.code || '-' }}</p>
            <p class="text-xs text-gray-400 mt-1">
              有效期至: {{ formatExpireTime(getInviteCode(selectedFloor?.id)?.expireTime) }}
            </p>
          </div>
          <div>
            <h4 class="font-medium text-gray-900 dark:text-white mb-3">所属宿舍</h4>
            <div class="space-y-2">
              <div
                v-for="dorm in getFloorDorms(selectedFloor?.id)"
                :key="dorm.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p class="font-medium">{{ dorm.name }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ dorm.className }}</p>
                </div>
                <div class="text-right">
                  <p class="text-xs font-mono">{{ getDormInvite(dorm.id)?.code || '-' }}</p>
                  <span :class="getDormInviteStatusClass(dorm.id)" class="text-xs">
                    {{ getDormInviteStatusText(dorm.id) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Eye, RefreshCw, Trash2, X } from 'lucide-vue-next'
import { floorsApi, dormitoriesApi, authApi } from '../services/api'

const floors = ref([])
const dorms = ref([])
const invites = ref([])

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const editingFloor = ref(null)
const selectedFloor = ref(null)

const form = reactive({
  name: '',
  buildingName: ''
})

const loadData = async () => {
  try {
    const [floorRes, dormRes, inviteRes] = await Promise.all([
      floorsApi.getAll(),
      dormitoriesApi.getAll(),
      authApi.getUserInfo()
    ])
    floors.value = floorRes.data
    dorms.value = dormRes.data
    
    const inviteData = await fetch('http://localhost:3000/api/invites', {
      headers: {
        'x-role': localStorage.getItem('dorminone_role') || '',
        'x-username': localStorage.getItem('dorminone_username') || ''
      }
    }).then(res => res.json())
    invites.value = inviteData
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const getDormCount = (floorId) => {
  return dorms.value.filter(d => d.floorId === floorId).length
}

const getInviteCode = (floorId) => {
  return invites.value.find(i => i.floorId === floorId && i.type === 'floor')
}

const getInviteStatusClass = (floorId) => {
  const invite = getInviteCode(floorId)
  if (!invite) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  if (invite.used) return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
  if (Date.now() > invite.expireTime) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
  return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
}

const getInviteStatusText = (floorId) => {
  const invite = getInviteCode(floorId)
  if (!invite) return '未生成'
  if (invite.used) return '已使用'
  if (Date.now() > invite.expireTime) return '已过期'
  return '未使用'
}

const getDormInvite = (dormId) => {
  return invites.value.find(i => i.dormId === dormId && i.type === 'dorm')
}

const getDormInviteStatusClass = (dormId) => {
  const invite = getDormInvite(dormId)
  if (!invite) return 'text-gray-500'
  if (invite.used) return 'text-red-500'
  if (Date.now() > invite.expireTime) return 'text-gray-500'
  return 'text-green-500'
}

const getDormInviteStatusText = (dormId) => {
  const invite = getDormInvite(dormId)
  if (!invite) return '未生成'
  if (invite.used) return '已使用'
  if (Date.now() > invite.expireTime) return '已过期'
  return '未使用'
}

const getFloorDorms = (floorId) => {
  return dorms.value.filter(d => d.floorId === floorId)
}

const formatExpireTime = (timestamp) => {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

const closeCreateModal = () => {
  showCreateModal.value = false
  editingFloor.value = null
  form.name = ''
  form.buildingName = ''
}

const saveFloor = async () => {
  try {
    if (editingFloor.value) {
      await floorsApi.update(editingFloor.value.id, form)
    } else {
      await floorsApi.create(form.name, form.buildingName)
    }
    closeCreateModal()
    await loadData()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const viewFloor = (floor) => {
  selectedFloor.value = floor
  showDetailModal.value = true
}

const regenerateInvite = async (floorId) => {
  try {
    await floorsApi.regenerateInvite(floorId)
    await loadData()
  } catch (error) {
    console.error('重新生成邀请码失败:', error)
  }
}

const deleteFloor = async (floorId) => {
  if (!confirm('确定要删除这个楼层吗？')) return
  try {
    await floorsApi.delete(floorId)
    await loadData()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>