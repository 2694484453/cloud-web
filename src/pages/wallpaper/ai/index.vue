<template>
  <div class="container">
    <!-- 提示词区域 -->
    <t-space>
      <t-button theme="primary" tag="a" href="/" variant="text">返回首页</t-button>
    </t-space>
    <div class="section">
      <h3>提示词</h3>
      <div class="input-group">
        <t-textarea
          v-model="formData.prompt"
          placeholder="输入提示词..."
          :autosize="{minRows: 5, maxRows:10}"
          :maxlength="200"
        />
        <t-button @click="importRandom" theme="primary" size="large" class="btn">从随机词库导入</t-button>
      </div>
    </div>

    <!-- 反向提示词区域 -->
    <div class="section">
      <h3>反向提示词</h3>
      <t-textarea
        v-model="formData.negative_prompt"
        placeholder="输入负面提示词..."
        :autosize="{minRows: 5, maxRows:10}"
        :maxlength="200"
      />
    </div>

    <!-- 参数设置区域 -->
    <div class="section">
      <h3>参数设置</h3>
      <div class="grid">
        <div>
          <label>宽度:</label>
          <t-input v-model.number="formData.width" type="number" class="input"/>
        </div>
        <div>
          <label>高度:</label>
          <t-input v-model.number="formData.height" type="number" class="input"/>
        </div>
        <div>
          <label>步数:</label>
          <t-input v-model.number="formData.steps" type="number" class="input"/>
        </div>
        <div>
          <label>CFG:</label>
          <t-input v-model.number="formData.cfg" type="number" class="input"/>
        </div>
        <div>
          <label>模型:</label>
          <t-select v-model="model" class="select">
            <t-option
              v-for="item in models"
              :key="item"
              :value="item"
            >
              {{ item }}
            </t-option>
          </t-select>
        </div>
      </div>

      <!-- 复选框行 -->
      <div class="checkbox-row">
        <label>
          <t-input v-model="formData.prompt" type="checkbox"/>
          附加推荐质量提示词
        </label>
        <label>
          <t-input v-model="formData.negative_prompt" type="checkbox"/>
          使用负面词条
        </label>
        <label>
          <t-input v-model="formData.seed" type="checkbox"/>
          随机种子
        </label>
      </div>

      <div>
        <label>种子:</label>
        <t-input
          v-model.number="formData.seed"
          type="number"
          class="input"
        />
      </div>
    </div>

    <!-- 图片预览区域 -->
    <div class="section">
      <h3>图片预览</h3>
      <div class="preview">
        <template v-if="generatedImage">
          <t-image :src="generatedImage" alt="生成内容预览" class="preview-img"/>
        </template>
        <template v-else>
          <p>生成内容后将在此显示</p>
        </template>
      </div>
      <t-button @click="viewInBrowser" class="btn">
        在浏览器中查看原文件
      </t-button>
    </div>

    <!-- 日志区域 -->
    <div class="section">
      <h3>日志</h3>
      <div class="log">
        <p>{{ logMessage }}</p>
        <ul>
          <li v-for="(item, index) in logTips" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>
    </div>

    <!-- 生成按钮 -->
    <t-button @click="generateImage" theme="primary" size="large" :disabled="dataLoading">生成图像</t-button>
  </div>
</template>

<script>
import {zImageJson, acgJson} from "@/config/json";

export default {
  name: 'ImageGenerator',
  data() {
    return {
      models: [
        'Miaomiao Harem vPred Dogma 1.1',
        'Another Model v1.0',
      ],
      model: 'Miaomiao Harem vPred Dogma 1.1',
      qualityPrompt: true,
      negativeTerms: true,
      randomSeed: true,
      // 图片预览
      generatedImage: '',
      // 日志
      logMessage: '您对测试生成的内容负全部责任。',
      logTips: [
        'xxx',
        'xxx'
      ],
      formData: {
        prompt: "a beautiful anime girl, detailed face, high quality",
        negative_prompt: "blurry, low quality, distorted",
        width: 512,
        height: 512,
        steps: 20,
        cfg: 7.0,
        model_index: 0,
        seed: -1
      },
      dataLoading: false,
      logs: ""
    }
  },
  watch: {
    "formData.prompt"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.generate.prompt', newVal);
      }
    },
    "formData.width"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.generate.width', newVal);
      }
    },
    "formData.height"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.generate.height', newVal);
      }
    },
    "formData.cfg"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.generate.cfg', newVal);
      }
    },
    "formData.seed"(newVal, oldVal) {
      if (oldVal !== newVal) {
        // 存储
        localStorage.setItem('wallpaper.generate.seed', newVal);
      }
    }
  },
  mounted() {
    this.formData.prompt = localStorage.getItem('wallpaper.generate.prompt') ?? '';
    this.formData.cfg = localStorage.getItem('wallpaper.generate.cfg') ?? 7.0;
    this.formData.width = localStorage.getItem('wallpaper.generate.width') ?? 512;
    this.formData.height = localStorage.getItem('wallpaper.generate.height') ?? 512;
    this.formData.seed = localStorage.getItem('wallpaper.generate.seed') ?? -1;
    this.formData.negative_prompt = localStorage.getItem('wallpaper.generate.negative_prompt') ?? '';
    this.formData.steps = localStorage.getItem('wallpaper.generate.steps') ?? 20;
  },
  methods: {
    // 从随机词库导入提示词
    importRandom() {
      // 示例：模拟导入逻辑（可替换为实际接口调用）
      this.formData.prompt += '1girl, solo, barefoot, feet, halo, purple eyes, toes, looking at viewer, white hair, sitting, side ponytail, foreshortening, long hair, gloves, hair ornament, foot focus, blush, bare legs, soles, white gloves, indoors, frills, bangs, couch';
      this.$message?.info('已从随机词库导入提示词'); // 若使用 Element UI
    },
    // 生成图像逻辑（需对接后端接口）
    generateImage() {
      this.dataLoading = true;
      // 示例：模拟生成图像（实际需上传参数到后端，获取图片 URL/Base64）
      this.generatedImage = 'https://via.placeholder.com/300'; // 占位图
      this.acgRequest();
    },
    aiYunZImageRequest() {
      this.formData.extend = false;
      this.$request.post('/wallpaper/ai/z-image', zImageJson(this.formData)).then((res) => {
        this.generatedImage = res.data.output.choices[0].message.content[0].image;
      }).catch((err) => {
      }).finally(() => {
        this.dataLoading = false;
      })
    },
    acgRequest() {
      this.$request.post('/wallpaper/ai/generate_image', acgJson(this.formData)).then((res) => {
        this.logs = res.data;
        if (res.data.success) {
          this.$message?.success(res.data.message);
          this.generatedImage = res.data.data.image_url;
        } else {
          this.$message?.error(res.data.message);
        }
      }).catch((err) => {
      }).finally(() => {
        this.dataLoading = false;
      })
    },
    // 在浏览器中查看原文件
    viewInBrowser() {
      if (this.generatedImage) {
        window.open(this.generatedImage, '_blank');
      } else {
        this.$message?.warning('请先生成图像');
      }
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: "Microsoft YaHei", sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  background: #f9f9f9;
}

.section {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h3 {
  color: #333;
  margin-top: 0;
  font-size: 16px;
  font-weight: bold;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.btn {
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  background: #e0e0e0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}

.grid div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-size: 14px;
  color: #666;
}

.input,
.select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.select {
  height: 34px;
}

.checkbox-row {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.checkbox-row label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.preview {
  height: 250px;
  border: 1px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  margin-bottom: 10px;
}

.preview-img {
  max-width: 100%;
  max-height: 280px;
  object-fit: contain;
}

.log {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.log ul {
  padding-left: 20px;
  margin: 8px 0;
}

.log li {
  margin: 4px 0;
}
</style>
