<template>
  <t-row :gutter="[16, 16]" style="margin-top: 15px">
    <t-col :xs="12" :xl="9">
      <t-card :title="chartTitle" subtitle="(次)" class="dashboard-chart-card" :bordered="false">
        <LineChart :data="chartData" :width="'100%'" :height="'305px'" :auto-resize="true" :title="chartTitle"/>
      </t-card>
    </t-col>
    <t-col :xs="12" :xl="3">
      <t-card title="xx" :subtitle="currentMonth" class="dashboard-chart-card" :bordered="false">
        <div
          id="countContainer"
          ref="countContainer"
          :style="{ width: `${resizeTime * 326}px`, height: `${resizeTime * 326}px`, margin: '0 auto' }"
        ></div>
      </t-card>
    </t-col>
  </t-row>
</template>
<script>
import {mapState} from 'vuex';

import LineChart from "@/components/chart/LineChart.vue";

export default {
  name: 'MiddleChart',
  props: {
    chartData: {
      type: Array,
      default: () => []
    },
    chartTitle: {
      type: String,
    }
  },
  components: {LineChart},
  data() {
    return {
      resizeTime: 1,
      currentMonth: "",
    };
  },
  computed: {
    ...mapState('setting', ['brandTheme', 'mode']), // 这里需要用到主题色和主题模式的全局配置
  },
  watch: {
  },
  mounted() {

  },
  methods: {

  },
};
</script>
<style lang="less" scoped>
.dashboard-chart-card {
  padding: 8px;

  /deep/ .t-card__header {
    padding-bottom: 24px;
  }

  /deep/ .t-card__title {
    font-size: 20px;
    font-weight: 500;
  }
}
</style>
