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
    this.frameSrc = this.grafana.domain + "/d/af7a0l6fiwr9ca/k8s-dashboard?orgId=1&from=now-15m&to=now&timezone=browser&var-origin_prometheus=" + this.grafana.jobName + "&var-Node=$__all&var-NameSpace=$__all&var-Container=cloud-server&var-Pod=$__all&refresh=auto"
  },
  methods: {},
};
</script>
<style lang="less" scoped>
</style>
