<template>
  <Dashboard :frame-src="frameSrc" :loading="true"/>
</template>
<script lang="ts">
import { prefix } from '@/config/global';
import Dashboard from '@/components/dashboard/index.vue';
import {alertManagerDomain} from "@/constants";

export default {
  name: 'alertManagerDashboard',
  components: {
    Dashboard
  },
  data() {
    return {
      prefix,
      loading: true,
      frameSrc: alertManagerDomain,
    };
  },
  mounted() {

  },
  methods: {
  },
};
</script>
<style lang="less" scoped>

</style>
