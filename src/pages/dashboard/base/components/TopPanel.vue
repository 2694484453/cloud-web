<template>
  <t-card>
    <t-space align="baseline" direction="vertical">
      <t-select
        v-model="selected"
        @change="clickHandler"
        placeholder="请选择范围"
        clearable>
        <t-option v-for="(item,index) in timeRange" :key="index" :label="item.name" :value="item.start">
          {{ item.name }}
        </t-option>
      </t-select>
    </t-space>
    <t-row :gutter="[16, 16]">
      <t-col :xs="3" :xl="2" v-for="(item, index) in data" :key="item.title">
        <t-card
          :bordered="true"
          :title="item.title"
          :style="{ height: '138px' }"
          :class="{ 'dashboard-item': true, 'dashboard-item--main-color': false } "
        >
          <div class="dashboard-item-top">
            <span :style="{ fontSize: `${resizeTime * 36}px` }">{{ item.count }}</span>
          </div>
          <div class="dashboard-item-left">
            <div
              v-if="index === 0"
              id="moneyContainer"
              class="dashboard-chart-container"
              :style="{ width: `${resizeTime * 120}px`, height: `${resizeTime * 66}px` }"
            ></div>
            <div
              v-else-if="index === 1"
              id="refundContainer"
              class="dashboard-chart-container"
              :style="{ width: `${resizeTime * 120}px`, height: `${resizeTime * 42}px` }"
            ></div>
            <span v-else-if="index === 2" :style="{ marginTop: `6px` }">
            <usergroup-icon/>
          </span>
            <span v-else :style="{ marginTop: '6px' }">
            <file-icon/>
          </span>
          </div>
          <template #footer>
            <div class="dashboard-item-bottom">
              <div class="dashboard-item-block">
                环比
                <trend
                  class="dashboard-item-trend"
                  :type="item.upTrend ? 'up' : 'down'"
                  :is-reverse-color="index === 0"
                  :describe="item.upTrend || item.downTrend"
                />
                {{ item.comparison }}
              </div>
              <chevron-right-icon/>
            </div>
          </template>
        </t-card>
      </t-col>
    </t-row>
  </t-card>
</template>
<script>
import {LineChart, BarChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {UsergroupIcon, FileIcon, ChevronRightIcon} from 'tdesign-icons-vue';
import {mapState} from 'vuex';

import Trend from '@/components/trend/index.vue';

import {constructInitDashboardDataset} from '../index';
import {changeChartsTheme} from '@/utils/color';
import {PANE_LIST} from '@/service/service-base';

echarts.use([LineChart, BarChart, CanvasRenderer]);
// 定义偏移函数（单位：天）
const getStartAt = (days) => (Date.now() - days * 24 * 60 * 60 * 1000);

export default {
  name: 'TopPanel',
  props: ['data'],
  components: {
    Trend,
    UsergroupIcon,
    FileIcon,
    ChevronRightIcon,
  },
  data() {
    return {
      resizeTime: 1,
      panelList: PANE_LIST,
      data: [],
      timeRange: [],
      selected: "",
      searchForm: {
        startAt: null,
        endAt: null,
      },
    };
  },
  computed: {
    ...mapState('setting', ['brandTheme', 'mode']), // 这里需要用到主题色和主题模式的全局配置
  },
  watch: {
    brandTheme() {
      changeChartsTheme([this.refundChart]);
    },
    mode() {
      [this.moneyCharts, this.refundChart].forEach((item) => {
        item.dispose();
      });
      this.renderCharts();
    },
    "searchForm.startAt"(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$emit('updateTimeRange', this.searchForm);
      }
    },
  },
  mounted() {
    this.setTimeRange();
    this.$nextTick(() => {
      this.updateContainer();
    });
    window.addEventListener('resize', this.updateContainer, false);
    this.renderCharts();
  },
  methods: {
    updateContainer() {
      if (document.documentElement.clientWidth >= 1400 && document.documentElement.clientWidth < 1920) {
        this.resizeTime = (document.documentElement.clientWidth / 2080).toFixed(2);
      } else if (document.documentElement.clientWidth < 1080) {
        this.resizeTime = (document.documentElement.clientWidth / 1080).toFixed(2);
      } else {
        this.resizeTime = 1;
      }
      this.moneyCharts.resize({
        // 根据父容器的大小设置大小
        width: `${this.resizeTime * 120}px`,
        height: `${this.resizeTime * 66}px`,
      });

      this.refundChart.resize({
        // 根据父容器的大小设置大小
        width: `${this.resizeTime * 120}px`,
        height: `${this.resizeTime * 42}px`,
      });
    },
    renderCharts() {
      const {chartColors} = this.$store.state.setting;
      // 收入汇总图
      if (!this.moneyContainer) this.moneyContainer = document.getElementById('moneyContainer');
      this.moneyCharts = echarts.init(this.moneyContainer);
      this.moneyCharts.setOption(constructInitDashboardDataset('line'));

      // 退款图
      if (!this.refundContainer) this.refundContainer = document.getElementById('refundContainer');
      this.refundChart = echarts.init(this.refundContainer);
      this.refundChart.setOption(constructInitDashboardDataset('bar', chartColors));
    },
    clickHandler(val) {
      this.searchForm.startAt = val;
      this.searchForm.endAt = getStartAt(0);
    },
    setTimeRange() {
      this.timeRange = [
        {
          name: '最近24小时',
          start: getStartAt(1)
        },
        {
          name: '最近7天',
          start: getStartAt(7)
        },
        {
          name: '最近15天',
          start: getStartAt(15)
        },
        {
          name: '最近30天',
          start: getStartAt(30)
        },
        {
          name: '最近60天',
          start: getStartAt(60)
        }]
    }
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.dashboard-item {
  padding: 8px;

  /deep/ .t-card__footer {
    padding-top: 0;
  }

  /deep/ .t-card__title {
    font-size: 16px;
    font-weight: 500;
  }

  /deep/ .t-card__body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    position: relative;
  }

  &:hover {
    cursor: pointer;
  }

  &-top {
    display: flex;
    flex-direction: row;
    align-items: flex-start;

    > span {
      display: inline-block;
      color: var(--td-text-color-primary);
      font-size: 36px;
      line-height: 24px;
    }
  }

  &-bottom {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    > .t-icon {
      cursor: pointer;
    }
  }

  &-block {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 22px;
    color: var(--td-text-color-placeholder);
  }

  &-trend {
    margin-left: 8px;
  }

  &-left {
    position: absolute;
    top: 0;
    right: 32px;

    > span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: var(--td-brand-color-1);
      border-radius: 50%;

      .t-icon {
        font-size: 24px;
        color: var(--td-brand-color);
      }
    }
  }

  // 针对第一个卡片需要反色处理
  &--main-color {
    background: var(--td-brand-color);
    color: var(--td-text-color-primary);

    /deep/ .t-card__title,
    .dashboard-item-top span,
    .dashboard-item-bottom {
      color: var(--td-text-color-anti);
    }

    .dashboard-item-block {
      color: var(--td-text-color-anti);
      opacity: 0.6;
    }

    .dashboard-item-bottom {
      color: var(--td-text-color-anti);
    }
  }
}
</style>
