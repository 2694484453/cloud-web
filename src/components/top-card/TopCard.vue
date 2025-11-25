<template>
  <div>
    <t-card :title="title" class="dashboard-detail-card" :bordered="false">
      <t-row :gutter="[16, 16]">
        <t-col v-for="(item, index) in data" :key="index" :xs="6" :xl="3">
          <t-card :class="['dashboard-list-card']" :description="item.title">
            <div class="dashboard-list-card__number">{{ item.count }}</div>
            <div class="dashboard-list-card__text">
              <div class="dashboard-list-card__text-left">
                环比
                <trend class="icon" :type="item.upTrend ? 'up' : 'down'" :describe="item.upTrend || item.downTrend"/>
              </div>
              <chevron-right-icon/>
            </div>
          </t-card>
        </t-col>
      </t-row>
    </t-card>
  </div>
</template>

<script lang="ts">
import * as echarts from "echarts/core";
import {GridComponent, LegendComponent, TooltipComponent} from "echarts/components";
import {LineChart, ScatterChart} from "echarts/charts";
import {CanvasRenderer} from "echarts/renderers";

echarts.use([GridComponent, LegendComponent, TooltipComponent, LineChart, ScatterChart, CanvasRenderer]);
export default {
  name: 'TopCard',
  props: ['data'],
  data() {
    return {
      dataLoading: false,
      data: [],
      title: "概览",
    }
  },
  computed: {},
  mounted() {

  },
  created() {
  },
  watch: {},
  methods: {},
}
</script>

<style scoped lang="less">
@import '@/style/variables.less';

.row-margin {
  margin-top: 16px;
}

// 统一增加8px;
.dashboard-detail-card {
  padding: 8px;

  /deep/ .t-card__title {
    font-size: 20px;
    font-weight: 500;
  }

  /deep/ .t-card__actions {
    display: flex;
    align-items: center;
  }
}

.dashboard-list-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 170px;
  padding: 8px;

  /deep/ .t-card__header {
    padding-bottom: 8px;
  }

  /deep/ .t-card__body {
    flex: 1;
    display: flex;
    padding-top: 0;
    flex-direction: column;
    justify-content: space-between;
  }

  &.dark {
    &:hover {
      background: var(--td-gray-color-14);
      cursor: pointer;
    }
  }

  &.light {
    &:hover {
      background: var(--td-gray-color-14);
      cursor: pointer;
    }
  }

  &__number {
    font-size: 36px;
    line-height: 44px;
    color: var(--td-text-color-primary);
  }

  &__text {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: var(--td-text-color-placeholder);
    text-align: left;
    line-height: 18px;

    &-left {
      display: flex;

      .icon {
        margin: 0 8px;
      }
    }
  }
}
</style>
