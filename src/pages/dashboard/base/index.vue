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
    <Map :word-map-data="worldMapData" :china-map-data="chinaMapData"/>
    <!-- 中部图表  -->
    <middle-chart :chart-title="'今日访客分布'" :chart-data="todayViewsData" class="row-container"/>
    <!-- 列表排名 -->
    <rank-list class="row-container"/>
    <!-- 出入库概览 -->
<!--    <output-overview class="row-container"/>-->
    <!-- 通知 -->
    <NoticeCard class="row-container" :data="noticeData"/>
  </div>
</template>
<script>
import TopPanel from './components/TopPanel.vue';
import MiddleChart from './components/MiddleChart.vue';
import RankList from './components/RankList.vue';
import OutputOverview from './components/OutputOverview.vue';
import NoticeCard from "@/components/notice-card/NoticeCard.vue";
import Map from "@/components/map/TwoMap.vue";
// 定义偏移函数（单位：天）
const getStartAt = (days) => (Date.now() - days * 24 * 60 * 60 * 1000);

export default {
  name: 'DashboardBase',
  components: {
    Map,
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
      worldMapData: [],
      chinaMapData: [],
      todayViewsData: []
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
    this.getChinaMapData();
    this.todayViews();
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
      this.$request.get("/dashboard/worldMapData", {
        params: this.searchForm
      }).then(res => {
        this.worldMapData = res.data;
      }).catch()
        .finally()
    },
    getChinaMapData() {
      this.$request.get("/dashboard/chinaMapData", {
        params: this.searchForm
      }).then(res => {
        this.chinaMapData = res.data;
      }).catch()
        .finally()
    },
    updateTimeRange(data) {
      console.log("updateTimeRange", data);
      this.searchForm = data;
      this.getCardData();
    },
    todayViews() {
      this.$request.get("/dashboard/todayVisitView", {params: this.searchForm}).then(res => {
        this.todayViewsData = res.data;
      }).catch(e => {

      })
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
