<!-- src/components/ChinaMap.vue -->
<template>
  <div ref="chart" class="china-map-chart"></div>
</template>

<script>
import * as echarts from 'echarts/core';
import {MapChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';

// 注册所需模块
echarts.use([
  MapChart,
  CanvasRenderer,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent
]);

// 引入本地中国地图 GeoJSON（需提前下载）
import chinaGeoJson from '@/assets/maps/china.json';

export default {
  name: 'ChinaMap',
  props: {
    /**
     * 数据格式: [{ name: '广东省', value: 100 }, ...]
     * 支持简称（如 '广东'）或全称（如 '广东省'）
     */
    data: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '中国数据分布'
    }
  },
  mounted() {
    // 注册中国地图（仅一次）
    if (!echarts.getMap('china')) {
      echarts.registerMap('china', chinaGeoJson);
    }

    this.initChart();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.dispose();
    }
  },
  watch: {
    data: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart);
      this.updateChart();
    },
    updateChart() {
      const option = {
        title: {
          text: this.title,
          left: 'center',
          textStyle: {fontSize: 16}
        },
        tooltip: {
          trigger: 'item',
          formatter(params) {
            return`${params.name}<br/>Value: ${params.value || 0}`;
          }
        },
        visualMap: {
          min: 0,
          max: this.maxValue || Math.max(...this.data.map(d => d.value || 0), 1),
          left: 20,
          bottom: 20,
          calculable: true,
          text: ['高', '低'],
          inRange: {
            color: ['#f0f8ff', '#0047ab']
          }
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: true,
            scaleLimit: {
              min: 1,
              max: 5
            },
            label: {
              show: false
            },
            emphasis: {
              label: {show: true}
            },
            data: this.data
          }
        ]
      };
      this.chart.setOption(option, true);
    },
    handleResize() {
      this.chart?.resize();
    }
  }
};
</script>

<style scoped>
.china-map-chart {
  width: 100%;
  height: 500px;
  min-height: 400px;
}
</style>
