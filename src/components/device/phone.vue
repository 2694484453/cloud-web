<template>
  <!-- 手机轮廓 -->
  <div class="phone-wrapper">
    <div class="phone">
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
  props: ['url'],
  data() {
    return {
    }
  }
}
</script>
<style scoped lang="less">
/* --- 手机样式 (iPhone) --- */
.phone-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.phone {
  position: relative;
  width: 300px;
  height: 600px;
  border: 10px solid #000;
  border-radius: 40px;
  background-color: #000;
  overflow: hidden;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 25px;
  background-color: #000;
  border-radius: 0 0 20px 20px;
  z-index: 1;
}

.phone-screen {
  position: absolute;
  top: 25px;
  left: 0;
  width: 100%;
  height: calc(100% - 25px);
  background-color: #111;
  overflow: hidden;
}

.phone .wallpaper-img {
  object-fit: cover;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .macbook-screen, .phone {
    transform: scale(0.8);
  }
}/* --- 手机样式 (iPhone) --- */
.phone-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.phone {
  position: relative;
  width: 300px;
  height: 600px;
  border: 15px solid #000;
  border-radius: 40px;
  background-color: #000;
  overflow: hidden;
}

.phone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 25px;
  background-color: #000;
  border-radius: 0 0 20px 20px;
  z-index: 1;
}

.phone-screen {
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: calc(100% - 25px);
  background-color: #111;
  overflow: hidden;
}

.phone .wallpaper-img {
  object-fit: cover;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .macbook-screen, .phone {
    transform: scale(0.8);
  }
}
</style>
