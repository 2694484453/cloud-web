<template>
  <div class="dashboard-detail">
    <TopCard :data="overViewData"/>
    <div style="margin-top: 15px">
      <NoticeCard :data="sysNoticeData"/>
    </div>
  </div>
</template>
<script lang="ts">
import TopCard from "@/components/top-card/TopCard.vue";
import NoticeCard from "@/components/notice-card/NoticeCard.vue";
export default {
  name: 'DashboardDetail',
  components: {NoticeCard, TopCard},
  data() {
    return {
      overViewData: [],
      sysNoticeData: [],
    };
  },
  computed: {
  },
  watch: {

  },
  mounted() {
    this.$nextTick(() => {
      this.updateContainer();
    });
    this.renderCharts();
  },
  created() {
    this.overView();
    this.getNotice();
  },
  methods: {
    overView() {
      this.$request.get("/tracing/traces/overView", {}).then((res) => {
        this.overViewData = res.data.data;
      }).catch((err) => {
        console.log(err);
      }).finally(() => {

      })
    },
    getNotice() {
      this.$request.get('/sysNotice/page', {
        params: {
          type: 'tracing',
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.sysNoticeData = res.data.rows;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    }
  },
};
</script>
<style lang="less" scoped>
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
