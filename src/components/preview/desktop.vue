<template>
  <div class="preview-container">
    <!-- 笔记本轮廓 -->
    <!-- 使用 :style 绑定动态计算的宽高比 -->
    <div class="macbook-wrapper" :style="wrapperStyle">
      <div class="macbook-screen">
        <!-- 壁纸将显示在这里 -->
        <!-- object-fit: cover 保证图片填满且不变形 -->
        <t-image :src="url" alt="笔记本壁纸预览" class="wallpaper-img" />
      </div>
      <div class="macbook-base"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DesktopPreview',
  props: {
    url: {
      type: String,
      default: ''
    },
    width: {
      type: Number,
      default: 16 // 图片原始宽度比例 (如 16:9)
    },
    height: {
      type: Number,
      default: 9 // 图片原始高度比例
    }
  },
  computed: {
    // 计算容器的样式
    wrapperStyle() {
      // 设定一个基准宽度（最大宽度），防止过大
      const maxWidth = 800;

      // 计算高度，基于传入的比例
      // 公式：高度 = (maxWidth / width比例) * height比例
      const calculatedHeight = (maxWidth / this.width) * this.height;

      // 计算宽高比，用于 padding-top/bottom 技巧，或者直接设置宽高
      return {
        width: `${maxWidth}px`,
        height: `${calculatedHeight}px`
      };
    }
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

/* --- 笔记本样式 (MacBook) --- */
.macbook-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  /* 继承父级传入的宽高 */
  position: relative;
}

.macbook-screen {
  position: relative;
  /* 宽高继承自父容器 .macbook-wrapper */
  width: 100%;
  height: 100%;
  background-color: #000;
  border-radius: 10px 10px 0 0;
  border: 12px solid #333;
  border-bottom: none;
  overflow: hidden;
}

.wallpaper-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键：覆盖模式，填满屏幕，多余裁剪 */
}

.macbook-base {
  /* 底座的宽度跟随屏幕宽度 */
  width: 100%;
  height: 20px; /* 固定底座高度，或者根据比例计算 */
  background: linear-gradient(to bottom, #eee, #ccc);
  border-radius: 0 0 10px 10px;
  border: 12px solid #333;
  border-top: none;
  box-sizing: border-box; /* 确保 border 计算在宽高内 */
}
</style>
