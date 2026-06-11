import request from '@/utils/request'

export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export const getCurrentUser = () => {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export const getDashboardStats = (params) => {
  return request({
    url: '/admin/dashboard',
    method: 'get',
    params
  })
}

export const getOrderTrend = (params) => {
  return request({
    url: '/admin/orders/trend',
    method: 'get',
    params
  })
}

export const getHotRoutes = (params) => {
  return request({
    url: '/admin/hot-routes',
    method: 'get',
    params
  })
}

export const getPricingSuggestions = (params) => {
  return request({
    url: '/admin/pricing-suggestions',
    method: 'get',
    params
  })
}

export const getUserList = (params) => {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

export const updateUserStatus = (id, data) => {
  return request({
    url: `/admin/users/${id}/status`,
    method: 'put',
    data
  })
}

export const getOrderList = (params) => {
  return request({
    url: '/admin/orders',
    method: 'get',
    params
  })
}

export const getComplaintList = (params) => {
  return request({
    url: '/admin/complaints',
    method: 'get',
    params
  })
}

export const handleComplaint = (id, data) => {
  return request({
    url: `/admin/complaints/${id}/handle`,
    method: 'put',
    data
  })
}

export const exportMonthlyReport = (params) => {
  return request({
    url: '/admin/report/monthly',
    method: 'get',
    params
  })
}

export const getAdminLogs = (params) => {
  return request({
    url: '/admin/logs',
    method: 'get',
    params
  })
}
