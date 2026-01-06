<template>
  <!-- 手机轮廓 -->
  <div class="phone-wrapper">
    <!-- 使用 :style 绑定动态计算的宽高 -->
    <div class="phone" :style="phoneStyle">
      <div class="phone-notch"></div> <!-- 模拟刘海屏 -->
      <div class="phone-screen">
        <img :src="url" alt="手机壁纸预览" class="wallpaper-img" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "PhonePreview",
  props: {
    url: {
      type: String,
      default: ''
    },
    // 接收图片的宽高比例
    width: {
      type: Number,
      default: 9
    },
    height: {
      type: Number,
      default: 16
    }
  },
  computed: {
    // 计算手机容器的样式
    phoneStyle() {
      // 设定一个基准高度（竖屏通常高度为主导）
      const maxHeight = 600;
      // 也可以设定基准宽度，根据需求调整
      // const maxWidth = 300;

      // 根据传入的比例计算宽度
      // 公式：宽度 = (maxHeight / height比例) * width比例
      const calculatedWidth = (maxHeight / this.height) * this.width;

      return {
        width: `${calculatedWidth}px`,
        height: `${maxHeight}px`
      };
    }
  }
}
</script>

<style scoped lang="less">
/* --- 手机样式 (iPhone) --- */
.phone-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.phone {
  position: relative;
  /* 宽高由 JS 动态注入 */
  background-color: #000;
  border-radius: 40px; /* 保持圆角比例，如果需要随大小变化可改为百分比 */
  overflow: hidden;
  box-sizing: border-box;
}

/* 边框宽度使用伪元素或绝对定位模拟，以保持内容区比例 */
.phone::before {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  border: 15px solid #000; /* 边框宽度 */
  border-radius: inherit;
  pointer-events: none;
  box-sizing: border-box;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 25%; /* 相对宽度 */
  height: 4%; /* 相对高度 */
  background-color: #000;
  border-radius: 0 0 20px 20px;
  z-index: 1;
}

.phone-screen {
  position: absolute;
  /* 覆盖整个手机区域，减去边框和刘海占用的空间 */
  top: 15px;
  left: 15px;
  right: 15px;
  bottom: 15px;
  background-color: #111;
  border-radius: 20px; /* 屏幕内圆角 */
  overflow: hidden;
}

.phone .wallpaper-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 图片覆盖，裁剪多余部分 */
}

/* 响应式调整 (可选) */
@media (max-width: 768px) {
  .phone {
    transform: scale(0.8);
    transform-origin: center top;
  }
}
</style>
