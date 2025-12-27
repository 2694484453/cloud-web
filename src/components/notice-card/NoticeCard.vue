<template>
  <div class="dashboard-detail" style="margin-top: 5px">
    <t-card :class="{ 'dashboard-detail-card': true }" class="row-margin" :bordered="false" :title="title">
      <t-timeline mode="same" :reverse="reverse" theme="default">
        <t-space>
          <span v-for="(item) in data">
            <t-timeline-item :label="item.createTime">{{ item.noticeTitle }}</t-timeline-item>
          </span>
        </t-space>
      </t-timeline>
    </t-card>
  </div>
</template>

<script lang="ts">
export default {
  name: 'NoticeCard',
  props: ['data'],
  data() {
    return {
      dataLoading: false,
      data: [],
      title: "系统公告",
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

</style>
