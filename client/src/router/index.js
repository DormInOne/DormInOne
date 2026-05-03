import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('../views/Onboarding.vue')
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/roommates',
    name: 'Roommates',
    component: () => import('../views/Roommates.vue')
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('../views/Schedule.vue')
  },
  {
    path: '/bills',
    name: 'Bills',
    component: () => import('../views/Bills.vue')
  },
  {
    path: '/electricity',
    name: 'Electricity',
    component: () => import('../views/Electricity.vue')
  },
  {
    path: '/items',
    name: 'Items',
    component: () => import('../views/Items.vue')
  },
  {
    path: '/beds',
    name: 'Beds',
    component: () => import('../views/Beds.vue')
  },
  {
    path: '/repairs',
    name: 'Repairs',
    component: () => import('../views/Repairs.vue')
  },
  {
    path: '/clean',
    name: 'Clean',
    component: () => import('../views/Clean.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  },
  {
    path: '/admin/floors',
    name: 'FloorManagement',
    component: () => import('../views/FloorManagement.vue')
  },
  {
    path: '/admin/dormitories',
    name: 'DormitoryManagement',
    component: () => import('../views/DormitoryManagement.vue')
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/dorm-settings',
    name: 'DormSettings',
    component: () => import('../views/DormSettings.vue')
  },
  {
    path: '/notifications',
    name: 'NotificationSettings',
    component: () => import('../views/NotificationSettings.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const role = localStorage.getItem('dorminone_role')
  const floorId = localStorage.getItem('dorminone_floor_id')
  const dormId = localStorage.getItem('dorminone_dorm_id')
  
  if (to.name === 'Onboarding') {
    if (role === 'system_admin') {
      next('/')
      return
    }
    next()
    return
  }
  
  if (to.name === 'Login') {
    if (role) {
      if (role === 'system_admin') {
        next('/')
        return
      }
      if (floorId) {
        next('/')
        return
      }
      next('/onboarding')
      return
    }
    next()
    return
  }
  
  if (!role) {
    next('/login')
    return
  }
  
  if (role === 'system_admin') {
    next()
    return
  }
  
  if (!floorId) {
    next('/onboarding')
    return
  }
  
  if (role === 'dorm_admin' && !dormId) {
    next('/onboarding')
    return
  }
  
  next()
})

export default router