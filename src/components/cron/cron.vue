<template>
  <div class="cron-generator">
<!--    <h3>Cron 表达式生成器</h3>-->
    <!-- 预设快捷选项 -->
    <div class="presets">
      <label>常用预设：</label>
      <select v-model="selectedPreset" @change="applyPreset">
        <option value="">自定义</option>
        <option value="* * * * *">每分钟</option>
        <option value="0 * * * *">每小时整点</option>
        <option value="0 0 * * *">每天午夜</option>
        <option value="0 0 * * 0">每周日午夜</option>
        <option value="0 0 1 * *">每月1号午夜</option>
        <option value="0 0 1 1 *">每年1月1日午夜</option>
      </select>
    </div>
    <!-- 手动输入 -->
    <div class="manual-input">
      <label>Cron 表达式（6位：秒 分 时 日 月 周）：</label>
      <input
        v-model="manualCron"
        type="text"
        placeholder="例如：0 0 12 * * ?"
        @input="validateManualInput"
        :class="{ 'error': cronError }"
      />
      <span v-if="cronError" class="error-text">{{ cronError }}</span>
    </div>

    <!-- 字段编辑区 -->
    <div class="cron-fields">
      <div class="field-row" v-for="(field, index) in fields" :key="field.name">
        <label>{{ field.label }}:</label>
        <div v-if="field.type === 'number'" class="input-group">
          <input
            type="number"
            :value="field.value"
            :min="field.min"
            :max="field.max"
            @input="updateNumberField(index, $event.target.value)"
          />
        </div>
        <div v-else class="input-group">
          <select :value="field.value" @change="updateSpecialField(index, $event.target.value)">
            <option value="*">*</option>
            <option value="?">?</option>
            <option v-for="n in getRange(field.min, field.max)" :key="n" :value="n">{{ n }}</option>
            <!-- 日字段特殊值 -->
            <option v-if="field.name === 'day'" value="L">L (月末)</option>
            <option v-if="field.name === 'day'" value="W">W (最近工作日)</option>
            <!-- 周字段中文映射 -->
            <option v-if="field.name === 'week'" value="1">周日</option>
            <option v-if="field.name === 'week'" value="2">周一</option>
            <option v-if="field.name === 'week'" value="3">周二</option>
            <option v-if="field.name === 'week'" value="4">周三</option>
            <option v-if="field.name === 'week'" value="5">周四</option>
            <option v-if="field.name === 'week'" value="6">周五</option>
            <option v-if="field.name === 'week'" value="7">周六</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 输出结果 -->
    <div class="output">
      <p><strong>生成的表达式：</strong> {{ cronExpression }}</p>
      <p class="hint">格式：秒 分 时 日 月 周（共6位，适用于 Quartz 等调度框架）</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CronExpressionGenerator',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedPreset: '',
      manualCron: '',
      cronError: '',
      fields: [
        { name: 'second', label: '秒', value: '0', type: 'number', min: 0, max: 59 },
        { name: 'minute', label: '分', value: '0', type: 'number', min: 0, max: 59 },
        { name: 'hour', label: '时', value: '0', type: 'number', min: 0, max: 23 },
        { name: 'day', label: '日', value: '*', type: 'special', min: 1, max: 31 },
        { name: 'month', label: '月', value: '*', type: 'special', min: 1, max: 12 },
        { name: 'week', label: '周', value: '?', type: 'special', min: 1, max: 7 }
      ]
    }
  },
  computed: {
    cronExpression() {
      return this.fields.map(f => f.value).join(' ')
    }
  },
  watch: {
    cronExpression(newVal) {
      this.$emit('input', newVal)
      this.manualCron = newVal
      this.cronError = ''
    },
    value(newVal) {
      // 支持外部 v-model 双向绑定
      if (newVal !== this.cronExpression) {
        this.parseCronString(newVal)
      }
    }
  },
  mounted() {
    this.manualCron = this.cronExpression
  },
  methods: {
    getRange(min, max) {
      const arr = []
      for (let i = min; i <= max; i++) {
        arr.push(i)
      }
      return arr
    },
    updateNumberField(index, val) {
      const num = parseInt(val)
      if (!isNaN(num) && num >= this.fields[index].min && num <= this.fields[index].max) {
        this.$set(this.fields[index], 'value', num.toString())
      }
    },
    updateSpecialField(index, val) {
      this.$set(this.fields[index], 'value', val)
    },
    applyPreset() {
      if (!this.selectedPreset) return
      let parts = this.selectedPreset.split(' ')
      // 补全为6位（预设通常是5位，前面补秒）
      if (parts.length === 5) {
        parts = ['0', ...parts]
      }
      this.fields.forEach((f, i) => {
        this.$set(f, 'value', parts[i] || '*')
      })
      this.selectedPreset = ''
    },
    validateManualInput() {
      const str = this.manualCron.trim()
      if (!str) {
        this.cronError = ''
        return
      }
      const parts = str.split(/\s+/)
      if (parts.length !== 6) {
        this.cronError = '必须包含6个字段（秒 分 时 日 月 周）'
        return
      }

      // 简单校验（可扩展）
      const valid = this.isValidPart(parts[0], 0, 59) &&
        this.isValidPart(parts[1], 0, 59) &&
        this.isValidPart(parts[2], 0, 23) &&
        this.isValidPart(parts[3], 1, 31, true) &&
        this.isValidPart(parts[4], 1, 12, true) &&
        this.isValidPart(parts[5], 1, 7, true)

      if (!valid) {
        this.cronError = '字段格式或范围错误'
        return
      }

      this.cronError = ''
      this.parseCronString(str)
    },
    isValidPart(val, min, max, allowSpecial = false) {
      if (val === '*') return true
      if (allowSpecial && ['?', 'L', 'W'].includes(val)) return true
      const num = parseInt(val)
      return !isNaN(num) && num >= min && num <= max
    },
    parseCronString(cronStr) {
      const parts = cronStr.trim().split(/\s+/)
      if (parts.length === 6) {
        this.fields.forEach((f, i) => {
          this.$set(f, 'value', parts[i])
        })
      }
    }
  }
}
</script>

<style scoped>
.cron-generator {
  max-width: 600px;
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 14px;
}

.presets,
.manual-input {
  margin-bottom: 16px;
}

.presets label,
.manual-input label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

.presets select,
.manual-input input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.manual-input input.error {
  border-color: #e74c3c;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  display: block;
  margin-top: 4px;
}

.cron-fields {
  margin: 16px 0;
}

.field-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.field-row label {
  width: 60px;
  font-weight: normal;
}

.input-group {
  flex: 1;
}

.input-group input,
.input-group select {
  width: 100%;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.output {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #ccc;
}

.hint {
  color: #777;
  font-size: 12px;
  margin-top: 4px;
}
</style>
