<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statCards" :key="card.title">
        <el-card class="stat-card" shadow="hover">
          <div class="card-content">
            <div class="card-info">
              <p class="card-title">{{ card.title }}</p>
              <p class="card-value">{{ card.value }}</p>
              <p class="card-desc" :class="card.trend > 0 ? 'up' : 'down'">
                <el-icon v-if="card.trend > 0"><CaretTop /></el-icon>
                <el-icon v-else><CaretBottom /></el-icon>
                {{ Math.abs(card.trend) }}% 较上周
                <span style="color: #909399; margin-left: 4px;">{{ card.desc }}</span>
              </p>
            </div>
            <div class="card-icon" :style="{ backgroundColor: card.color }">
              <el-icon :size="32"><component :is="card.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>订单趋势</span>
              <el-radio-group v-model="trendType" size="small" @change="initTrendChart">
                <el-radio-button value="day">日</el-radio-button>
                <el-radio-button value="week">周</el-radio-button>
                <el-radio-button value="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <div ref="trendChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>用户信誉分布</span>
          </template>
          <div ref="reputationChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待处理投诉</span>
              <el-button type="primary" link @click="$router.push('/complaints')">查看全部</el-button>
            </div>
          </template>
          <el-table :data="pendingComplaints" v-loading="loading" stripe>
            <el-table-column prop="complaintNo" label="投诉编号" width="140" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="{ row }">
                <el-tag :type="complaintTypeMap[row.type]?.type || 'info'">
                  {{ complaintTypeMap[row.type]?.label || row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="90">
              <template #default="{ row }">
                <el-tag :type="priorityMap[row.priority]?.type || 'info'">
                  {{ priorityMap[row.priority]?.label || row.priority }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="投诉信息" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">
                <div style="font-size: 13px;">
                  <div style="font-weight: 500; color: #303133; margin-bottom: 4px;">
                    {{ row.title || '-' }}
                  </div>
                  <div style="color: #909399; font-size: 12px; line-height: 1.5;">
                    {{ (row.content || '').slice(0, 50) }}{{ (row.content || '').length > 50 ? '...' : '' }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="提交时间" width="170">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleComplaint(row)">处理</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <span>运营概览</span>
          </template>
          <div class="overview-list">
            <div class="overview-item">
              <span class="label">订单完成率</span>
              <el-progress :percentage="overview.completionRate || 0" :color="'#67c23a'" />
            </div>
            <div class="overview-item">
              <span class="label">匹配成功率</span>
              <el-progress :percentage="overview.matchSuccessRate || 0" :color="'#409eff'" />
            </div>
            <div class="overview-item">
              <span class="label">投诉解决率</span>
              <el-progress :percentage="overview.complaintResolutionRate || 0" :color="'#e6a23c'" />
            </div>
            <div class="overview-item">
              <span class="label">用户满意度</span>
              <el-progress :percentage="(overview.userSatisfaction * 20) || 0" :color="'#f56c6c'" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { CaretTop, CaretBottom, DataAnalysis, Money, User, Warning, ChatDotRound } from '@element-plus/icons-vue'
import { getDashboardStats, getOrderTrend } from '@/api'

const router = useRouter()
const loading = ref(false)
const trendType = ref('day')
const trendChartRef = ref(null)
const reputationChartRef = ref(null)
let trendChart = null
let reputationChart = null

const overview = reactive({
  totalOrders: 0,
  completedOrders: 0,
  totalRevenue: 0,
  newUsers: 0,
  totalUsers: 0,
  activeDrivers: 0,
  totalComplaints: 0,
  resolvedComplaints: 0,
  completionRate: 0,
  matchSuccessRate: 0,
  complaintResolutionRate: 0,
  userSatisfaction: 0
})

const statCards = ref([
  { title: '总订单数', value: 0, desc: '今日新增', trend: 12, icon: 'DataAnalysis', color: '#409eff' },
  { title: '营业收入', value: '¥0', desc: '平台收入', trend: 8, icon: 'Money', color: '#67c23a' },
  { title: '用户总数', value: 0, desc: '活跃司机', trend: -3, icon: 'User', color: '#e6a23c' },
  { title: '待处理投诉', value: 0, desc: '平均响应', trend: -5, icon: 'Warning', color: '#f56c6c' }
])

const pendingComplaints = ref([])

const complaintTypeMap = {
  attitude: { label: '态度问题', type: 'warning' },
  punctuality: { label: '准时问题', type: 'warning' },
  safety: { label: '安全问题', type: 'danger' },
  cleanliness: { label: '卫生问题', type: 'info' },
  overcharge: { label: '收费问题', type: 'danger' },
  cancellation: { label: '取消问题', type: 'warning' },
  other: { label: '其他问题', type: 'info' }
}

const priorityMap = {
  low: { label: '普通', type: 'info' },
  normal: { label: '正常', type: '' },
  high: { label: '高', type: 'warning' },
  urgent: { label: '紧急', type: 'danger' }
}

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const handleComplaint = (row) => {
  router.push({
    path: '/complaints',
    query: {
      complaintId: row.id,
      status: row.status
    }
  })
}

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const res = await getDashboardStats()
    const data = res.data
    Object.assign(overview, data.overview)
    pendingComplaints.value = data.pendingComplaints || []
    
    statCards.value[0].value = data.overview.totalOrders
    statCards.value[1].value = `¥${data.overview.platformFee || 0}`
    statCards.value[2].value = data.overview.totalUsers
    statCards.value[3].value = data.overview.totalComplaints - data.overview.resolvedComplaints
    statCards.value[2].desc = `活跃司机: ${data.overview.activeDrivers}`
    statCards.value[3].desc = `平均响应: ${data.overview.avgResponseTime}分钟`
    
    if (data.reputationDistribution) {
      initReputationChart(data.reputationDistribution)
    }
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const initTrendChart = async () => {
  if (!trendChartRef.value) return
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }
  try {
    const res = await getOrderTrend({ granularity: trendType.value })
    const data = res.data || []
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['订单数', '完成订单', '收入'] },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.date)
      },
      yAxis: [
        { type: 'value', name: '订单数' },
        { type: 'value', name: '收入(元)' }
      ],
      series: [
        {
          name: '订单数',
          type: 'line',
          smooth: true,
          data: data.map(d => d.totalOrders),
          itemStyle: { color: '#409eff' },
          areaStyle: { color: 'rgba(64, 158, 255, 0.1)' }
        },
        {
          name: '完成订单',
          type: 'line',
          smooth: true,
          data: data.map(d => d.completedOrders),
          itemStyle: { color: '#67c23a' }
        },
        {
          name: '收入',
          type: 'bar',
          yAxisIndex: 1,
          data: data.map(d => d.totalRevenue),
          itemStyle: { color: '#e6a23c' }
        }
      ]
    }
    trendChart.setOption(option)
  } catch (e) {}
}

const initReputationChart = (data) => {
  if (!reputationChartRef.value) return
  if (!reputationChart) {
    reputationChart = echarts.init(reputationChartRef.value)
  }
  const levelMap = {
    bronze: '铜牌',
    silver: '银牌',
    gold: '金牌',
    platinum: '铂金',
    diamond: '钻石'
  }
  const colorMap = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF'
  }
  const orderedLevels = ['bronze', 'silver', 'gold', 'platinum', 'diamond']
  const pieData = orderedLevels.map(level => {
    const item = data.find(d => d.reputationLevel === level)
    return {
      value: item?.count || 0,
      name: levelMap[level] || level,
      itemStyle: { color: colorMap[level] }
    }
  })
  const option = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: '0%', data: pieData.map(d => d.name) },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: 'bold' }
        },
        data: pieData
      }
    ]
  }
  reputationChart.setOption(option)
}

const handleResize = () => {
  trendChart?.resize()
  reputationChart?.resize()
}

onMounted(async () => {
  await fetchDashboardData()
  await nextTick()
  await initTrendChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  reputationChart?.dispose()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-info {
      .card-title {
        font-size: 14px;
        color: #909399;
        margin: 0 0 10px 0;
      }

      .card-value {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 10px 0;
      }

      .card-desc {
        font-size: 12px;
        color: #909399;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;

        &.up {
          color: #67c23a;
        }

        &.down {
          color: #f56c6c;
        }
      }
    }

    .card-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chart {
    height: 320px;
    width: 100%;
  }

  .overview-list {
    padding: 10px 0;

    .overview-item {
      margin-bottom: 24px;

      .label {
        display: block;
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
