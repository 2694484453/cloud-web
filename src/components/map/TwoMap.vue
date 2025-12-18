<template>
  <t-row :gutter="[16, 16]" style="margin-top: 5px">
    <t-col :xs="12" :xl="6">
      <t-card title="" class="dashboard-rank-card" :bordered="false">
        <WorldMap :data="wordMapData" title="全球访客分布"/>
      </t-card>
    </t-col>
    <t-col :xs="12" :xl="6">
      <t-card title="" class="dashboard-rank-card" :bordered="false">
        <ChinaMap :data="chinaMapData" title="国内访客分布"/>
      </t-card>
    </t-col>
  </t-row>
</template>
<script>
import Trend from '@/components/trend/index.vue';
import { SALE_TEND_LIST, BUY_TEND_LIST, SALE_COLUMNS, BUY_COLUMNS } from '@/service/service-base';
import WorldMap from "@/components/map/WordMap.vue";
import ChinaMap from "@/components/map/ChinaMap.vue";

export default {
  name: 'TwoMap',
  props: ['chinaMapData', 'wordMapData'],
  components: {
    ChinaMap,
    WorldMap,
    Trend,
  },
  data() {
    return {
      buyTendList: BUY_TEND_LIST,
      saleTendList: SALE_TEND_LIST,
      saleColumns: SALE_COLUMNS,
      buyColumns: BUY_COLUMNS,
    };
  },
  methods: {
    rehandleClickOp(val) {
      console.log(val);
    },
    getRankClass(index) {
      return ['dashboard-rank__cell', { 'dashboard-rank__cell--top': index < 3 }];
    },
  },
};
</script>

<style lang="less" scoped>
@import '@/style/variables.less';

.dashboard-rank-card {
  padding: 8px;

  /deep/ .t-card__header {
    padding-bottom: 24px;
  }

  /deep/ .t-card__title {
    font-size: 20px;
    font-weight: 500;
  }
}

.dashboard-rank__cell {
  display: inline-flex;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  background-color: var(--td-gray-color-5);
  align-items: center;
  justify-content: center;
  font-weight: 700;

  &--top {
    background: var(--td-brand-color);
  }
}
</style>
