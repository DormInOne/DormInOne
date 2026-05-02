import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 登录页面直接放行
  if (to.name === 'Login') {
    next()
    return
  }
  
  // 非登录页面，检查是否有角色
  // 如果没有角色（首次访问），自动设为 member 角色
  // 角色检查在 App.vue 中处理
  
  next()
})

export default router
