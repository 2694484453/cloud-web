<template>
  <Dashboard :frame-src="frameSrc" :loading="true"/>
</template>
<script lang="ts">
import Dashboard from "@/components/dashboard/index.vue";
import {datasource, grafanaDomain} from "@/constants";

export default {
  name: 'kubernetesDashboard',
  components: {Dashboard},
  data() {
    return {
      loading: true,
      grafana: {
        domain: grafanaDomain,
        datasource: datasource,
        clusterName: "",
        jobName: "",
      },
      frameSrc: '',
    };
  },
  mounted() {
    // 取参数
    if (this.$route.query.clusterName != null) {
      this.grafana.clusterName = this.$route.query.clusterName;
    }
    if (this.$route.query.jobName != null) {
      this.grafana.jobName = this.$route.query.jobName;
    }
    let str = '&var-datasource=' + datasource + '&var-cluster=' + this.grafana.clusterName + '&var-resolution=30s&var-job=' + this.grafana.jobName + '&refresh=5s'
    this.frameSrc = this.grafana.domain + '/d/k8s_views_global/kubernetes-views-global?orgId=1&from=now-1h&to=now&timezone=browser' + str;
  },
  methods: {},
};
</script>
<style lang="less" scoped>
</style>
