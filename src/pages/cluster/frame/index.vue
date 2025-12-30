<template>
  <Dashboard :frame-src="frameSrc" :loading="true"/>
</template>
<script lang="ts">
import Dashboard from "@/components/dashboard/index.vue";
import {datasource, grafanaDomain} from "@/config/global";

export default {
  name: 'kubernetesDashboard',
  components: {Dashboard},
  data() {
    return {
      grafana: {
        domain: grafanaDomain,
        datasource: datasource,
        clusterName: this.$route.query.clusterName ?? '',
        jobName: this.$route.query.jobName ?? '',
      },
      frameSrc: '',
    };
  },
  mounted() {
    this.frameSrc = this.grafana.domain + "/d/af7a0l6fiwr9ca/k8s-dashboard?orgId=1&from=now-15m&to=now&timezone=browser&var-origin_prometheus=" + this.grafana.jobName + "&var-Node=$__all&var-NameSpace=$__all&var-Container=$__all&var-Pod=$__all&refresh=auto";
    console.log("xx" ,this.grafana);
  },
  created() {
  },
  methods: {},
};
</script>
<style lang="less" scoped>
</style>
