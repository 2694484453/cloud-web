<template>
  <div
    ref="chart"
    class="line-chart-container"
    :style="{ width: width, height: height }"
  >
    <!-- 可选：加载占位 -->
    <!-- <div v-if="loading" class="chart-loading">加载中...</div> -->
  </div>
</template>

<script>
// 按需引入 ECharts（推荐）
import * as echarts from 'echarts/core'
import {LineChart} from 'echarts/charts'
import {
  TitleComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components'
import {UniversalTransition} from 'echarts/features'
import {CanvasRenderer} from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  LineChart,
  TitleComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  UniversalTransition,
  CanvasRenderer
])

export default {
  name: 'LineChart',
  props: {
    // 图表配置（ECharts options）
    title: {
      type: String,
      default: '统计数据'
    },
    data: {
      type: Array,
      default: () => []
    },
    // 宽度（支持 px / %）
    width: {
      type: String,
      default: '100%'
    },
    // 高度
    height: {
      type: String,
      default: '305px'
    },
    // 是否显示 loading
    loading: {
      type: Boolean,
      default: false
    },
    // 自动 resize（默认开启）
    autoResize: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    data: {
      handler(newVal) {
        this.updateChart();
      },
      deep: true
    },
    loading(val) {
      if (this.chart) {
        val ? this.chart.showLoading() : this.chart.hideLoading()
      }
    }
  },
  mounted() {
    this.initChart()
    if (this.autoResize) {
      window.addEventListener('resize', this.handleResize)
    }
  },
  beforeDestroy() {
    if (this.autoResize) {
      window.removeEventListener('resize', this.handleResize)
    }
    this.destroyChart()
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      if (this.loading) {
        this.chart.showLoading()
      }
      this.updateChart();
    },
    updateChart() {
      if (!this.chart || !this.data || this.data.length === 0) return;

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: this.data.map(item => item.name),
          boundaryGap: false // 折线图建议关闭边界间隙
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '数值',
            type: 'line',
            smooth: true,
            showSymbol: false, // 数据点多时隐藏 symbol
            lineStyle: {
              width: 2
            },
            itemStyle: {
              color: '#5470C6'
            },
            data: this.data.map(item => item.value)
          }
        ]
      };

      this.chart.setOption(option, true); // true 表示 merge 而非 replace
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
    destroyChart() {
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
    },
    // 对外暴露方法：更新数据（可选）
    updateOptions(newOptions) {
      this.$emit('update:options', newOptions)
    }
  }
}
</script>

<style scoped>
.line-chart-container {
  position: relative;
  overflow: hidden;
}

/* 可选：loading 样式
.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
}
*/
</style>
