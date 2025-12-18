<!-- src/components/WorldMap.vue -->
<template>
    <div ref="chart" class="world-map-chart"></div>
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

// 引入本地世界地图 GeoJSON（需提前下载）
import worldGeoJson from '@/assets/maps/world.json';

// 国家简称 → ECharts 官方名称映射（解决常见数据不匹配问题）
const COUNTRY_NAME_MAP = {
  // 中文常用名 → 英文全称（必须与 world.json 中的 properties.name 一致）
  中国: 'China',
  美国: 'United States of America',
  英国: 'United Kingdom',
  日本: 'Japan',
  韩国: 'Korea',
  德国: 'Germany',
  法国: 'France',
  俄罗斯: 'Russia',
  印度: 'India',
  巴西: 'Brazil',
  加拿大: 'Canada',
  澳大利亚: 'Australia',
  新加坡: 'Singapore',
  马来西亚: 'Malaysia',
  越南: 'Vietnam',
  泰国: 'Thailand',
  印度尼西亚: 'Indonesia',
  菲律宾: 'Philippines',
  意大利: 'Italy',
  西班牙: 'Spain',
  荷兰: 'Netherlands',
  瑞士: 'Switzerland',
  瑞典: 'Sweden',
  挪威: 'Norway',
  芬兰: 'Finland',
  丹麦: 'Denmark',
  墨西哥: 'Mexico',
  阿根廷: 'Argentina',
  南非: 'South Africa',
  埃及: 'Egypt',
  土耳其: 'Turkey',
  沙特阿拉伯: 'Saudi Arabia',
  伊朗: 'Iran',
  伊拉克: 'Iraq',
  以色列: 'Israel'
  // 可根据业务需求继续扩展
};

export default {
  name: 'WorldMap',
  props: {
    /**
     * 数据格式: [{ name: 'China', value: 100 }, ...]
     * 支持中文（如 '中国'）或英文全称（如 'China'）
     */
    data: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: '全球数据分布'
    }
  },
  mounted() {
    // 注册世界地图（仅一次）
    if (!echarts.getMap('world')) {
      echarts.registerMap('world', worldGeoJson);
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
        const isoCode = item.x; // 如 'HK'
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
          textStyle: { fontSize: 16 }
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
            map: 'world',
            roam: true,
            scaleLimit: {
              min: 1,
              max: 5
            },
            label: {
              show: false
            },
            emphasis: {
              label: { show: true }
            },
            data: normalizedData // ✅ 使用转换后的数据
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
export const ISO_TO_ECHARTS_NAME = {
  // 常见国家/地区（按需扩展）
  CN: 'China',
  US: 'United States',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  MO: 'Macao',
  JP: 'Japan',
  KR: 'Korea',
  GB: 'United Kingdom',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  RU: 'Russia',
  IN: 'India',
  BR: 'Brazil',
  CA: 'Canada',
  AU: 'Australia',
  SG: 'Singapore',
  MY: 'Malaysia',
  TH: 'Thailand',
  VN: 'Vietnam',
  ID: 'Indonesia',
  PH: 'Philippines',
  MX: 'Mexico',
  AR: 'Argentina',
  ZA: 'South Africa',
  EG: 'Egypt',
  TR: 'Turkey',
  SA: 'Saudi Arabia',
  IR: 'Iran',
  IL: 'Israel'
  // 可根据实际数据补充更多
};
</script>

<style scoped>
.world-map-chart {
  width: 100%;
  height: 500px;
  min-height: 400px;
}
</style>
