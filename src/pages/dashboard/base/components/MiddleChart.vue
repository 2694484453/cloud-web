<script>
// 1. 按需引入核心 + 所需模块
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts'; // 折线图
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  // 如果以后加标题、图例等，再加 TitleComponent, LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 2. 注册模块（全局一次即可，可在 main.js 或此处）
echarts.use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
]);

export default {
  name: 'MiddleChart',
  props: {
    title: {
      type: String,
      default: '统计数据'
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chart: null, // 👈 显式声明 chart 实例
      resizeTime: 1,
    };
  },
  watch: {
    data: {
      handler(newVal) {
        if (newVal && newVal.length > 0) {
          this.updateChart();
        }
      },
      deep: true,
      immediate: true // 👈 立即执行一次，避免 mounted 里判断
    }
  },
  mounted() {
    this.initChart();
    window.addEventListener('resize', this.handleResize, false);
  },
  beforeDestroy() {
    // 👇 安全销毁，防止内存泄漏和 resize 报错
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initChart() {
      // 防御性编程：确保 DOM 存在
      if (!this.$refs.chart) return;

      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
    },
    updateChart() {
      if (!this.chart || !this.data || this.data.length === 0) return;

      const option = {
        tooltip: { // 👈 添加 tooltip 更友好
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
      this.$nextTick(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });
    }
  }
};
</script>
