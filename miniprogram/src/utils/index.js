export const formatMoney = (amount) => {
  return Number(amount || 0).toFixed(2)
}

export const formatTime = (date) => {
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  const diffDays = Math.floor(diff / (24 * 60 * 60 * 1000))

  if (diffDays === 0) {
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `今天 ${hours}:${minutes}`
  } else if (diffDays === 1) {
    return '明天'
  } else if (diffDays < 7) {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return weekDays[d.getDay()]
  } else {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
}

export const formatDateTime = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

export const getReputationLevel = (level) => {
  const map = {
    bronze: '铜牌',
    silver: '银牌',
    gold: '金牌',
    platinum: '铂金',
    diamond: '钻石'
  }
  return map[level] || '铜牌'
}

export const getStatusText = (status) => {
  const map = {
    pending: '待匹配',
    matching: '匹配中',
    confirmed: '已确认',
    in_progress: '行程中',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期',
    requested: '待确认',
    accepted: '已接受',
    rejected: '已拒绝',
    boarding: '已上车',
    in_trip: '行程中',
    no_show: '未乘车'
  }
  return map[status] || status
}

export const getOrderStatusText = (status) => {
  const map = {
    pending: '待支付',
    confirmed: '已确认',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消',
    disputed: '有争议'
  }
  return map[status] || status
}

export const getPaymentStatusText = (status) => {
  const map = {
    unpaid: '未支付',
    pending: '支付中',
    paid: '已支付',
    failed: '支付失败',
    refunded: '已退款',
    partial_refunded: '部分退款'
  }
  return map[status] || status
}

export const getComplaintStatusText = (status) => {
  const map = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    rejected: '已驳回',
    closed: '已关闭'
  }
  return map[status] || status
}

export const getComplaintTypeText = (type) => {
  const map = {
    attitude: '态度问题',
    punctuality: '准时问题',
    safety: '安全问题',
    cleanliness: '卫生问题',
    overcharge: '收费问题',
    cancellation: '取消问题',
    other: '其他问题'
  }
  return map[type] || '其他'
}

export const maskPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

export const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

export const throttle = (fn, delay = 300) => {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last >= delay) {
      last = now
      fn.apply(this, args)
    }
  }
}
