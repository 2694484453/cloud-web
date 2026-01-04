<template>
  <div class="wallpaper-detail">
    <!-- 壁纸内容主体 -->
    <div class="content">
      <!-- 壁纸大图 -->
      <div class="image-wrapper">
        <t-image
          :src="wallpaperData.url"
          :style="{ width: '100%' }"
          fit="cover"
          lazy
        >
          <!-- 加载中和加载失败的插槽 -->
          <div slot="loading">加载中...</div>
          <div slot="error">图片加载失败</div>
        </t-image>
      </div>

      <!-- 信息卡片 -->
      <t-card :bordered="false" class="info-card">
        <!-- 操作按钮 -->
        <div class="action-bar">
<!--          <t-button theme="primary" size="large" @click="handleDownload">-->
<!--            下载壁纸 ({{ wallpaperData.resolution }})-->
<!--          </t-button>-->
        </div>
        <template>
          <t-descriptions title="壁纸详情">
            <t-descriptions-item label="名称">{{ wallpaperData.name }}</t-descriptions-item>
            <t-descriptions-item label="类型">{{ wallpaperData.type === 'static' ? '静态壁纸' : '动态壁纸' }}</t-descriptions-item>
            <t-descriptions-item label="标签">
              <t-space v-for="tag in wallpaperData.tags.split(',')">
                <t-tag theme="primary" variant="light" style="margin-left: 5px">{{tag}}</t-tag>
              </t-space>
            </t-descriptions-item>
            <t-descriptions-item label="浏览次数">{{ formatViews(wallpaperData.visitCount) }}</t-descriptions-item>
            <t-descriptions-item label="下载次数">{{ formatViews(wallpaperData.downloadCount) }}</t-descriptions-item>
            <t-descriptions-item label="分辨率"></t-descriptions-item>
            <t-descriptions-item label="文件大小">{{ wallpaperData.size }}</t-descriptions-item>
<!--            <t-descriptions-item label="url地址"><a :href="wallpaperData.url">{{ wallpaperData.url }}</a>-->
<!--            </t-descriptions-item>-->
            <t-descriptions-item label="创建时间">{{ wallpaperData.createTime }}</t-descriptions-item>
            <t-descriptions-item label="备注">{{ wallpaperData.description ? wallpaperData.description : '暂无' }}
            </t-descriptions-item>
          </t-descriptions>
        </template>
      </t-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WallpaperDetail',
  data() {
    return {
      // 模拟壁纸数据，实际项目中通常来自路由参数或API请求
      wallpaperData: {
        id: 1001,
        title: '璀璨星空延时摄影',
        visitCount: 0,
        downloadCount: 0,
        url: 'https://tdesign.gtimg.com/mobile/demos/img1.png', // 替换为实际壁纸URL
        description: '这是一张由专业摄影师在高海拔地区拍摄的星空延时摄影作品，展现了银河的壮丽与神秘。',
        views: 128400, // 模拟高热度数据
        resolution: '3840 x 2160 (4K)',
        author: '风光摄影师-Alex',
        uploadTime: '2023-10-25',
      },
    };
  },
  mounted() {
    this.wallpaperData.id = this.$route.query.id ?? "";
    this.getInfo();
  },
  methods: {
    // 返回上一页
    goBack() {
      this.$router.go(-1);
    },
    // 下载处理逻辑
    handleDownload() {
      this.$toast.success(`正在下载: ${this.wallpaperData.title}`);
      // 实际开发中这里会触发文件下载逻辑
    },
    getInfo() {
      this.$request.get("/wallpaper/info?id=" + this.wallpaperData.id, {})
        .then(res => {
          if (res.data.code === 200) {
            this.wallpaperData = res.data.data;
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
  },
};
</script>

<style lang="less" scoped>
.wallpaper-detail {
  min-height: 100vh;
  background-color: #f5f5f5;

  .content {
    padding-bottom: 20px;

    .image-wrapper {
      background-color: #000;
      text-align: center;
      padding: 16px 0;

      /deep/ .t-image__img {
        border-radius: 12px;
      }
    }

    .info-card {
      margin: 16px;
      border-radius: 12px;

      .card-title {
        font-size: 20px;
        font-weight: bold;
        color: #333;
      }

      .cell-desc {
        color: #666;
        font-size: 14px;
        line-height: 1.5;
      }

      .cell-value {
        color: #333;
        font-size: 14px;
      }
    }

    .action-bar {
      padding: 20px 16px 0;
    }
  }
}
</style>
