<!-- src/components/ChinaMap.vue -->
<template>
  <div ref="chart" class="china-map-chart"></div>
</template>

<script>
import * as echarts from 'echarts/core';
import { MapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
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

// 省份简称 → 全称映射（解决常见数据简写问题）
const PROVINCE_MAP = {
  北京: '北京市',
  天津: '天津市',
  河北: '河北省',
  山西: '山西省',
  内蒙古: '内蒙古自治区',
  辽宁: '辽宁省',
  吉林: '吉林省',
  黑龙江: '黑龙江省',
  上海: '上海市',
  江苏: '江苏省',
  浙江: '浙江省',
  安徽: '安徽省',
  福建: '福建省',
  江西: '江西省',
  山东: '山东省',
  河南: '河南省',
  湖北: '湖北省',
  湖南: '湖南省',
  广东: '广东省',
  广西: '广西壮族自治区',
  海南: '海南省',
  重庆: '重庆市',
  四川: '四川省',
  贵州: '贵州省',
  云南: '云南省',
  西藏: '西藏自治区',
  陕西: '陕西省',
  甘肃: '甘肃省',
  青海: '青海省',
  宁夏: '宁夏回族自治区',
  新疆: '新疆维吾尔自治区',
  台湾: '台湾省',
  香港: '香港特别行政区',
  澳门: '澳门特别行政区'
};

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
      // 自动转换简称 → 全称
      const normalizedData = this.data.map(item => {
        let name = item.name;
        if (PROVINCE_MAP[name]) {
          name = PROVINCE_MAP[name];
        }
        return {
          name,
          value: item.value || 0
        };
      });

      const maxValue = Math.max(1, ...normalizedData.map(d => d.value));

      const option = {
        title: {
          text: this.title,
          left: 'center',
          textStyle: { fontSize: 16 }
        },
        tooltip: {
          trigger: 'item',
          formatter(params) {
            if (params.value > 0) {
              return `${params.name}<br/>数值: ${params.value}`;
            }
            return `${params.name}<br/>暂无数据`;
          }
        },
        visualMap: {
          min: 0,
          max: maxValue,
          left: 20,
          bottom: 20,
          calculable: true,
          text: ['高', '低'],
          inRange: {
            color: ['#e0ffff', '#006edd']
          }
        },
        series: [
          {
            type: 'map',
            map: 'china',
            roam: false,
            label: {
              show: false
            },
            emphasis: {
              label: { show: true }
            },
            data: normalizedData
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
