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
    <top-panel class="row-container" :data="cardData" @updateTimeRange="updateTimeRange"/>
    <!-- 地图   -->
    <WorldMap :data="globalData" title="全球访客分布"/>
    <!-- 通知 -->
    <NoticeCard class="row-container" :data="noticeData"/>
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
import NoticeCard from "@/components/notice-card/NoticeCard.vue";
import WorldMap from "@/components/map/WordMap.vue";
// 定义偏移函数（单位：天）
const getStartAt = (days) => (Date.now() - days * 24 * 60 * 60 * 1000);

export default {
  name: 'DashboardBase',
  components: {
    WorldMap,
    NoticeCard,
    TopPanel,
    MiddleChart,
    RankList,
    OutputOverview,
  },
  data() {
    return {
      cardData: [],
      noticeData: [],
      searchForm: {
        startAt: getStartAt(7),
        endAt: getStartAt(0),
      },
      globalData: [
        {name: '中国', value: 5000},         // ✅ 支持中文
        {name: '美国', value: 3000},
        {name: 'Germany', value: 1200},     // ✅ 也支持英文全称
      ]
    }
  },
  computed: {},
  watch: {
    "searchForm.startAt"(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getCardData();
      }
    },
  },
  mounted() {
    this.getCardData();
    this.getNotice();
    this.getMapData();
  },
  methods: {
    getCardData() {
      this.$request.get("/dashboard/card", {
        params: this.searchForm
      }).then(res => {
        this.cardData = res.data.data;
      }).catch()
        .finally()
    },
    getNotice() {
      this.$request.get("/dashboard/notice", {})
        .then(res => {
        this.noticeData = res.data.rows;
      }).catch()
        .finally()
    },
    getMapData() {
      this.$request.get("/dashboard/map", {
        params: this.searchForm
      }).then(res => {
        this.globalData = res.data;
      }).catch()
        .finally()
    },
    updateTimeRange(data) {
      console.log("updateTimeRange", data);
      this.searchForm = data;
      this.getCardData();
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
