<template>
  <div class="preview-container">
    <!-- 笔记本轮廓 -->
    <div class="macbook-wrapper">
      <div class="macbook-screen">
        <!-- 壁纸将显示在这里 -->
        <t-image :src="url" alt="笔记本壁纸预览" class="wallpaper-img" />
      </div>
      <div class="macbook-base"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LaptopPreview',
  props: {
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {

    }
  },
  methods: {

  }
}
</script>

<style scoped>
.preview-container {
  text-align: center;
  padding: 15px;
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
}

.controls button {
  margin: 0 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 5px;
}

.controls button.active {
  background-color: #42b983;
  color: white;
}

/* --- 笔记本样式 (MacBook) --- */
.macbook-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.macbook-screen {
  position: relative;
  width: 700px;
  height: 400px;
  background-color: #000;
  border-radius: 10px 10px 0 0;
  border: 12px solid #333;
  border-bottom: none;
  overflow: hidden;
}

.wallpaper-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片覆盖整个屏幕，可能会裁剪 */
}

.macbook-base {
  width: 700px;
  background: linear-gradient(to bottom, #eee, #ccc);
  border-radius: 0 0 10px 10px;
  border: 12px solid #333;
  border-top: none;
}
</style>
