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

export const ISO_TO_ECHARTS_NAME = {
  "CN-BJ": "北京市",
  "CN-TJ": "天津市",
  "CN-HE": "河北省",
  "CN-SX": "山西省",
  "CN-NM": "内蒙古自治区",
  "CN-LN": "辽宁省",
  "CN-JL": "吉林省",
  "CN-HL": "黑龙江省",
  "CN-SH": "上海市",
  "CN-JS": "江苏省",
  "CN-ZJ": "浙江省",
  "CN-AH": "安徽省",
  "CN-FJ": "福建省",
  "CN-JX": "江西省",
  "CN-SD": "山东省",
  "CN-HA": "河南",
  "CN-HB": "湖北省",
  "CN-HN": "湖南省",
  "CN-GD": "广东省",
  "CN-GX": "广西壮族自治区",
  "CN-HI": "海南省",
  "CN-CQ": "重庆市",
  "CN-SC": "四川省",
  "CN-GZ": "贵州省",
  "CN-YN": "云南省",
  "CN-XZ": "西藏自治区",
  "CN-SN": "陕西省",
  "CN-GS": "甘肃省",
  "CN-QH": "青海省",
  "CN-NX": "宁夏回族自治区",
  "CN-XJ": "新疆维吾尔自治区",
  "CN-TW": "台湾省",
  "CN-HK": "香港特别行政区",
  "CN-MO": "澳门特别行政区"
};
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
      // 将 Umami 格式 [{ x: 'HK', y: 2 }] 转为 ECharts 格式 [{ name, value }]
      const normalizedData = this.data.map(item => {
        const isoCode = item.x;
        const echartsName = ISO_TO_ECHARTS_NAME[isoCode] || isoCode; // 未匹配则保留原值（可能不显示）
        return {
          name: echartsName,
          value: item.y || 0
        };
      });
      const maxValue = Math.max(1, ...normalizedData.map(d => d.value));

      const option = {
        title: {
          text: this.title,
          left: 'center',
          textStyle: {fontSize: 16}
        },
        tooltip: {
          trigger: 'item',
          formatter(params) {
            if (params.value > 0) {
              return `${params.name}<br/>访问量: ${params.value}`;
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
