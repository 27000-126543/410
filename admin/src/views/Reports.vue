<template>
  <div class="reports-page">
    <el-card shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="月份">
          <el-date-picker
            v-model="searchForm.month"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="城市">
          <el-select v-model="searchForm.city" placeholder="全部城市" clearable style="width: 140px">
            <el-option label="北京" value="北京" />
            <el-option label="上海" value="上海" />
            <el-option label="广州" value="广州" />
            <el-option label="深圳" value="深圳" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchReport">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button type="success" :loading="exportLoading" @click="handleExport">
            <el-icon><Download /></el-icon>导出报表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px" v-if="report">
      <el-col :span="6" v-for="item in summaryCards" :key="item.title">
        <el-card class="stat-card" shadow="hover">
          <div class="card-content">
            <div class="card-info">
              <p class="card-title">{{ item.title }}</p>
              <p class="card-value">{{ item.value }}</p>
              <p class="card-desc">{{ item.desc }}</p>
            </div>
            <div class="card-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="28"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" style="margin-top: 20px" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>各城市运营数据 - {{ report?.reportMonth || searchForm.month }}</span>
          <span v-if="report" class="generated-at">
            生成时间: {{ formatDate(report.generatedAt) }}
          </span>
        </div>
      </template>

      <el-table :data="cityData" stripe>
        <el-table-column prop="city" label="城市" width="100" fixed="left" />
        <el-table-column prop="totalOrders" label="总订单数" width="110" align="right" />
        <el-table-column prop="completedOrders" label="完成订单" width="110" align="right" />
        <el-table-column prop="cancelledOrders" label="取消订单" width="110" align="right" />
        <el-table-column prop="totalRevenue" label="总收入(元)" width="130" align="right">
          <template #default="{ row }">
            <span class="money">¥{{ row.totalRevenue }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="platformFee" label="平台费(元)" width="130" align="right">
          <template #default="{ row }">
            <span class="money">¥{{ row.platformFee }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="avgOrderPrice" label="客单价(元)" width="120" align="right" />
        <el-table-column label="匹配成功率" width="130">
          <template #default="{ row }">
            <el-progress :percentage="row.matchSuccessRate" :color="'#409eff'" :stroke-width="10" />
          </template>
        </el-table-column>
        <el-table-column prop="feeEfficiencyRatio" label="费率(%)" width="110" align="right" />
        <el-table-column prop="newUsers" label="新增用户" width="100" align="right" />
        <el-table-column prop="activeUsers" label="活跃用户" width="100" align="right" />
        <el-table-column prop="complaintsCount" label="投诉数" width="100" align="right" />
        <el-table-column prop="complaintsResolved" label="已解决" width="100" align="right" />
        <el-table-column prop="avgResponseTime" label="响应(分)" width="100" align="right" />
        <el-table-column prop="avgResolutionTime" label="解决(分)" width="100" align="right" />
        <el-table-column label="用户满意度" width="140">
          <template #default="{ row }">
            <el-progress :percentage="row.userSatisfaction * 20" :color="'#f56c6c'" :stroke-width="10" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px" v-if="report">
      <template #header>
        <div class="card-header">
          <span>数据分析图表</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <div ref="revenueChartRef" class="chart"></div>
        </el-col>
        <el-col :span="12">
          <div ref="ordersChartRef" class="chart"></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, DataAnalysis, Money, User, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { exportMonthlyReport } from '@/api'

const loading = ref(false)
const exportLoading = ref(false)
const report = ref(null)
const revenueChartRef = ref(null)
const ordersChartRef = ref(null)
let revenueChart = null
let ordersChart = null

const searchForm = reactive({
  month: dayjs().format('YYYY-MM'),
  city: ''
})

const cityData = computed(() => report.value?.cities || [])

const summaryCards = computed(() => {
  if (!report.value) return []
  const cities = report.value.cities || []
  const total = {
    totalOrders: cities.reduce((s, c) => s + c.totalOrders, 0),
    completedOrders: cities.reduce((s, c) => s + c.completedOrders, 0),
    totalRevenue: cities.reduce((s, c) => s + parseFloat(c.totalRevenue || 0), 0).toFixed(2),
    platformFee: cities.reduce((s, c) => s + parseFloat(c.platformFee || 0), 0).toFixed(2),
    newUsers: cities.reduce((s, c) => s + c.newUsers, 0),
    activeUsers: Math.round(cities.reduce((s, c) => s + c.activeUsers, 0) / (cities.length || 1)),
    complaintsCount: cities.reduce((s, c) => s + c.complaintsCount, 0),
    complaintsResolved: cities.reduce((s, c) => s + c.complaintsResolved, 0)
  }
  return [
    { title: '总订单数', value: total.totalOrders, desc: `完成: ${total.completedOrders}`, icon: 'DataAnalysis', color: '#409eff' },
    { title: '平台收入', value: `¥${total.platformFee}`, desc: `总收入: ¥${total.totalRevenue}`, icon: 'Money', color: '#67c23a' },
    { title: '用户情况', value: total.newUsers, desc: `新增用户, 活跃: ${total.activeUsers}`, icon: 'User', color: '#e6a23c' },
    { title: '投诉情况', value: total.complaintsCount, desc: `已解决: ${total.complaintsResolved}`, icon: 'Warning', color: '#f56c6c' }
  ]
})

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const fetchReport = async () => {
  loading.value = true
  try {
    const res = await exportMonthlyReport(searchForm)
    report.value = res.data
    await nextTick()
    initCharts()
  } catch (e) {
  } finally {
    loading.value = false
  }
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    const res = await exportMonthlyReport(searchForm)
    const dataStr = JSON.stringify(res.data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `monthly-report-${searchForm.month}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
  } finally {
    exportLoading.value = false
  }
}

const initCharts = () => {
  if (!cityData.value.length) return

  if (revenueChartRef.value && !revenueChart) {
    revenueChart = echarts.init(revenueChartRef.value)
  }
  if (ordersChartRef.value && !ordersChart) {
    ordersChart = echarts.init(ordersChartRef.value)
  }

  const cities = cityData.value.map(c => c.city)

  if (revenueChart) {
    revenueChart.setOption({
      title: { text: '各城市收入对比', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', data: cities },
      yAxis: { type: 'value', name: '金额(元)' },
      series: [
        { name: '总收入', type: 'bar', data: cityData.value.map(c => parseFloat(c.totalRevenue)), itemStyle: { color: '#409eff' } },
        { name: '平台费', type: 'bar', data: cityData.value.map(c => parseFloat(c.platformFee)), itemStyle: { color: '#67c23a' } }
      ]
    })
  }

  if (ordersChart) {
    ordersChart.setOption({
      title: { text: '各城市订单分布', left: 'center', textStyle: { fontSize: 16 } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0 },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', data: cities },
      yAxis: { type: 'value', name: '订单数' },
      series: [
        { name: '总订单', type: 'bar', stack: 'total', data: cityData.value.map(c => c.totalOrders), itemStyle: { color: '#409eff' } },
        { name: '完成订单', type: 'bar', stack: 'total', data: cityData.value.map(c => c.completedOrders), itemStyle: { color: '#67c23a' } },
        { name: '取消订单', type: 'bar', stack: 'total', data: cityData.value.map(c => c.cancelledOrders), itemStyle: { color: '#f56c6c' } }
      ]
    })
  }
}

const handleResize = () => {
  revenueChart?.resize()
  ordersChart?.resize()
}

onMounted(() => {
  fetchReport()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  revenueChart?.dispose()
  ordersChart?.dispose()
})
</script>

<style lang="scss" scoped>
.reports-page {
  .search-form {
    margin: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .generated-at {
      font-size: 12px;
      color: #909399;
    }
  }

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
        font-size: 24px;
        font-weight: bold;
        color: #303133;
        margin: 0 0 8px 0;
      }

      .card-desc {
        font-size: 12px;
        color: #909399;
        margin: 0;
      }
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
  }

  .money {
    color: #f56c6c;
    font-weight: bold;
  }

  .chart {
    height: 300px;
    width: 100%;
  }
}
</style>
