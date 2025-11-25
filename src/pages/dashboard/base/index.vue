<template>
  <div>
    <t-back-top
      container=".tdesign-starter-layout"
      :visible-height="0"
      style="position: absolute"
      :offset="['24px', '80px']"
    >
      <t-icon name="backtop" size="20px"/>
    </t-back-top>
    <!-- 顶部 card  -->
    <top-panel class="row-container" :data="cardData"/>
    <!-- 中部图表  -->
    <middle-chart class="row-container"/>
    <!-- 列表排名 -->
    <rank-list class="row-container"/>
    <!-- 出入库概览 -->
    <output-overview class="row-container"/>
  </div>
</template>
<script>
import TopPanel from './components/TopPanel.vue';
import MiddleChart from './components/MiddleChart.vue';
import RankList from './components/RankList.vue';
import OutputOverview from './components/OutputOverview.vue';

export default {
  name: 'DashboardBase',
  components: {
    TopPanel,
    MiddleChart,
    RankList,
    OutputOverview,
  },
  data() {
    return {
      cardData: [],
      noticeData: []
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getCardData();
  },
  methods: {
    getCardData() {
      this.$request.get("/system/overView/card", {
        params: {}
      }).then(res => {
        this.cardData = res.data.data;
      }).catch()
        .finally()
    },
    getNotice() {
      this.$request.get("/system/overView/notice", {})
        .then(res => {
          this.noticeData = res.data.data;
        }).catch()
        .finally()
    }
  }
};
</script>
<style scoped lang="less">
.row-container {
  margin-bottom: 16px;
}

/deep/ .t-card__body {
  padding-top: 0;
}
</style>
