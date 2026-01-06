<template>
  <div>
    <video width="100%" height="auto" controls muted loop>
      <source :src="url" type="video/mp4">
    </video>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: "videoPreview",
  components: {},
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      wallpaperData: {}
    }
  }
})
</script>

<style scoped lang="less">

</style>
