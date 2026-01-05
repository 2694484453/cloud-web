<template>
  <div style="padding: 15px">
    <t-space direction="horizontal">
      <!-- 壁纸内容主体 -->
      <t-space>
        <DesktopPreview v-show="deviceType === 'desktop'" :url="wallpaperData.url" :width="wallpaperData.width" :height="wallpaperData.height"/>
        <PhonePreview v-show="deviceType === 'phone'" :url="wallpaperData.url" :width="wallpaperData.width" :height="wallpaperData.height"/>
      </t-space>
      <div>
        <!-- 信息卡片 -->
        <t-card :bordered="false" class="info-card">
          <template>
            <t-descriptions title="壁纸详情">
              <t-descriptions-item label="名称">{{ wallpaperData.name }}</t-descriptions-item>
              <t-descriptions-item label="类型">静态壁纸</t-descriptions-item>
              <t-descriptions-item label="标签">
                <t-space v-for="tag in wallpaperData.tags.split(',')">
                  <t-tag max-width="80" theme="primary" variant="light" style="margin-left: 5px">{{ tag }}</t-tag>
                </t-space>
              </t-descriptions-item>
              <t-descriptions-item label="浏览次数">{{ formatViews(wallpaperData.visitCount) }}</t-descriptions-item>
              <t-descriptions-item label="下载次数">{{ formatViews(wallpaperData.downloadCount) }}</t-descriptions-item>
              <t-descriptions-item label="分辨率">{{ wallpaperData.width }}x{{ wallpaperData.height }}像素
              </t-descriptions-item>
              <t-descriptions-item label="文件大小">{{ wallpaperData.size }}</t-descriptions-item>
              <!--            <t-descriptions-item label="url地址"><a :href="wallpaperData.url">{{ wallpaperData.url }}</a>-->
              <!--            </t-descriptions-item>-->
              <t-descriptions-item label="创建时间">{{ wallpaperData.createTime }}</t-descriptions-item>
              <t-descriptions-item label="备注">{{ wallpaperData.description ? wallpaperData.description : '暂无' }}
              </t-descriptions-item>
              <t-descriptions-item label="操作">
                <!-- 操作按钮 -->
                  <t-button theme="primary"  size="medium" @click="handleDownload">
                    下载壁纸 ({{ wallpaperData.resolution }})
                  </t-button>
              </t-descriptions-item>
            </t-descriptions>
          </template>
        </t-card>
      </div>
    </t-space>
  </div>
</template>

<script>
import DesktopPreview from '@/components/device/desktop.vue'
import PhonePreview from "@/components/device/phone.vue";

export default {
  name: 'WallpaperDetail',
  components: {
    PhonePreview,
    DesktopPreview
  },
  data() {
    return {
      // 模拟壁纸数据，实际项目中通常来自路由参数或API请求
      wallpaperData: {
        id: 1001,
        name: '',
        title: '璀璨星空延时摄影',
        visitCount: 0,
        downloadCount: 0,
        url: 'https://tdesign.gtimg.com/mobile/demos/img1.png', // 替换为实际壁纸URL
        description: '这是一张由专业摄影师在高海拔地区拍摄的星空延时摄影作品，展现了银河的壮丽与神秘。',
        views: 128400, // 模拟高热度数据
        resolution: '3840 x 2160 (4K)',
        width: 0,
        height: 0,
        author: '风光摄影师-Alex',
        uploadTime: '2023-10-25',
        dirName: '',
      },
      deviceType: '',
    };
  },
  mounted() {
    this.wallpaperData.id = this.$route.query.id ?? "";
    this.getInfo();
  },
  methods: {
    // 下载处理逻辑
    handleDownload() {
      // 实际开发中这里会触发文件下载逻辑
      this.$router.push('/download?id=' + this.wallpaperData.id);
      // 1. 创建一个 a 标签
      const link = document.createElement('a');
      // 2. 设置下载地址
      link.href = this.wallpaperData.url;
      // 3. 设置下载后的文件名（可选）
      // 如果不设置，浏览器会使用 URL 中的文件名
      link.download = this.wallpaperData.name || '';
      // 4. 将标签添加到页面（为了触发点击事件
      document.body.appendChild(link);
      // 5. 模拟点击
      link.click();
      // 6. 下载完成后，移除标签（保持页面干净）
      document.body.removeChild(link);
    },
    getInfo() {
      this.$request.get("/wallpaper/info?id=" + this.wallpaperData.id, {})
        .then(res => {
          if (res.data.code === 200) {
            this.wallpaperData = res.data.data;
            this.wallpaperData.resolution = this.wallpaperData.width + "x" + this.wallpaperData.height;
            this.deviceType = this.detectDeviceByResolution(this.wallpaperData.width, this.wallpaperData.height);
          } else {
            this.$message.error(res.data.msg);
          }
        })
        .catch(err => {
        });
    },
    // 格式化浏览量/热度显示 (例如：1.2w+)
    formatViews(number) {
      if (number > 1000 && number < 1000) {
        return (number / 1000).toFixed(1) + "k+"
      }
      if (number > 10000) {
        return (number / 10000).toFixed(1) + 'w+';
      }
      return number;
    },
    detectDeviceByResolution(width, height) {
      // 取长边和短边
      const longSide = Math.max(width, height);
      const shortSide = Math.min(width, height);

      // 1. 如果长边小于 600，极可能是手机截图或小部件
      if (longSide < 600) {
        return 'mobile';
      }
      // 2. 如果长边在 600-1000 之间，可能是平板或老式手机
      else if (longSide >= 600 && longSide < 1000) {
        return 'tablet';
      }
      // 3. 如果长边在 1000-1400 之间，可能是现代高清手机横屏或小尺寸平板
      else if (longSide >= 1000 && longSide < 1400) {
        // 进一步通过比例判断：如果是细长的，可能是手机横屏
        if (longSide / shortSide > 1.8) {
          return 'phone'; // 手机横屏
        } else {
          return 'tablet'; // 平板
        }
      } else if (height > width * 2) {
        return 'phone';
      }
      // 4. 如果长边大于 1400，大概率是电脑桌面截图
      else {
        return 'desktop';
      }
    }
  },
};
</script>

<style lang="less" scoped>

</style>
