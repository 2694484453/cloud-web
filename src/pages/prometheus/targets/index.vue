<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-form
        ref="form"
        :data="formData"
        :label-width="80"
        colon
        @reset="onReset"
        @submit="onSubmit"
        :style="{ marginBottom: '8px' }"
      >
        <t-row justify="space-between">
          <div class="left-operation-container">
            <!--            <t-button @click="handleSetupContract">添加端点</t-button>-->
            <!--            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出配置</t-button>-->
            <!--            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>-->
          </div>
          <t-col :span="3">
            <t-form-item label="名称" name="name">
              <t-input v-model="searchForm.job" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
                <template #suffix-icon>
                  <search-icon size="20px"/>
                </template>
              </t-input>
            </t-form-item>
          </t-col>
<!--          <t-col :span="3">-->
<!--            <t-form-item label="类型" name="type">-->
<!--              <t-select-->
<!--                v-model="formData.type"-->
<!--                :style="{ width: '200px' }"-->
<!--                placeholder="请选择类型"-->
<!--                class="demo-select-base"-->
<!--                clearable-->
<!--              >-->
<!--                <t-option v-for="(item, index) in typeList" :key="index" :value="item" :label="item">-->
<!--                  {{ item }}-->
<!--                </t-option>-->
<!--              </t-select>-->
<!--            </t-form-item>-->
<!--          </t-col>-->
          <!--        <t-input v-model="searchValue" class="search-input" placeholder="请输入你需要搜索的内容" clearable>-->
          <!--          <template #suffix-icon>-->
          <!--            <search-icon size="20px"/>-->
          <!--          </template>-->
          <!--        </t-input>-->
          <t-col :span="2" class="operation-container">
            <t-button theme="primary" type="submit" :style="{ marginLeft: '8px' }"> 查询</t-button>
            <t-button type="reset" variant="base" theme="default"> 重置</t-button>
          </t-col>
        </t-row>
      </t-form>
      <div class="table-container">
        <t-table
          :columns="columns"
          :data="data"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :selected-row-keys="selectedRowKeys"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop, container: getContainer }"
        >
          <template #health="{row}">
            <t-tag v-show="row.health==='up'" theme="success" variant="light">up</t-tag>
            <t-tag v-show="row.health==='wait'" theme="warning" variant="light">wait</t-tag>
            <t-tag v-show="row.health==='down'" theme="danger" variant="light">down</t-tag>
          </template>
          <template #globalUrl="{row}">
            <a :href="row.globalUrl" target="_blank">{{row.globalUrl}}</a>
          </template>
          <template #labels="{row}">
            <div v-for="(v,k) in row.labels">
              <t-space >
                <t-tag theme="primary" variant="light">{{k}}:{{v}}</t-tag>
              </t-space>
            </div>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
<!--            <a class="t-button-link" @click="handleClickDelete(row)">删除</a>-->
          </template>
        </t-table>
      </div>
    </t-card>
    <t-pagination style="margin-top: 15px"
                  v-model="searchForm.current"
                  :total="pagination.total"
                  :page-size.sync="searchForm.size"
                  @current-change="onCurrentChange"
                  @page-size-change="onsizeChange"
                  @change="onChange"
    />
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm=""
      :onCancel="onCancel">
    </t-dialog>
    <!--抽屉-->
    <t-drawer
      :visible.sync="drawer.visible"
      :header="drawer.header"
      :on-overlay-click="() => (drawer.visible = false)"
      :on-size-drag-end="handleSizeDrag"
      showOverlay
      :sizeDraggable="true"
      placement="right"
      destroyOnClose
      size="30%"
      @close="onCancelDrawer"
      :onConfirm="handleDrawerOk"
      @cancel="onCancelDrawer"
    >
<!--      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical" style="width: 100%">-->
<!--        <t-form-->
<!--          ref="formValidatorStatus"-->
<!--          :data="formData"-->
<!--          :label-width="100"-->
<!--          @reset="onReset"-->
<!--        >-->
<!--          <t-form-item label="id" name="id" v-show="false">-->
<!--            <t-input v-model="formData.id" :maxlength="32" with="120"></t-input>-->
<!--          </t-form-item>-->
<!--          <t-form-item label="名称" name="name">-->
<!--            <t-input v-model="formData.name" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>-->
<!--          </t-form-item>-->
<!--          <t-form-item label="类型" name="type">-->
<!--            <t-input v-model="formData.type" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>-->
<!--          </t-form-item>-->
<!--          <t-form-item label="地址" name="url">-->
<!--            <t-input v-model="formData.url" placeholder="请输入仓库地址" :maxlength="64" with="120"></t-input>-->
<!--          </t-form-item>-->
<!--        </t-form>-->
<!--      </t-space>-->
<!--      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">-->
<!--        <t-descriptions  bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">-->
<!--          <t-descriptions-item label="名称">-->
<!--            <t-space>-->
<!--              <t-image fit="cover" :style="{width:'32px',height:'32px'}" :src="formData.icon"/>-->
<!--            </t-space>-->
<!--            {{formData.name}}-->
<!--          </t-descriptions-item>-->
<!--          <t-descriptions-item label="类型">{{formData.type}}</t-descriptions-item>-->
<!--          <t-descriptions-item label="主页"><a :href="formData.home">{{formData.home}}</a></t-descriptions-item>-->
<!--          <t-descriptions-item label="描述">{{formData.description}}</t-descriptions-item>-->
<!--          <t-descriptions-item label="地址"><a :href="formData.url">{{formData.url}}</a></t-descriptions-item>-->
<!--          <t-descriptions-item label="上架时间">{{formData.createTime}}</t-descriptions-item>-->
<!--          <t-descriptions-item label="上架人">{{formData.createBy}}</t-descriptions-item>-->
<!--          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>-->
<!--          <t-descriptions-item label="更新人">{{formData.updateBy}}</t-descriptions-item>-->
<!--        </t-descriptions>-->
<!--      </t-space>-->
<!--      <t-space v-show="drawer.operation === 'install'" direction="vertical" style="width: 100%">-->
<!--        <t-form-->
<!--          ref="formValidatorStatus"-->
<!--          :data="drawer.dynamicForm"-->
<!--          :label-width="100"-->
<!--          @reset="onReset"-->
<!--        >-->
<!--          <div v-for="(v,k) in drawer.dynamicForm">-->
<!--            <t-form-item :label="k" :name="k">-->
<!--              <t-input v-model="drawer.dynamicForm[k]" :type="typeof drawer.dynamicForm[k]" placeholder="请输入仓库名称" :maxlength="64" with="120" ></t-input>-->
<!--            </t-form-item>-->
<!--          </div>-->
<!--        </t-form>-->
<!--      </t-space>-->
    </t-drawer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {SearchIcon} from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import {prefix} from '@/config/global';

import {CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES} from '@/constants';

export default Vue.extend({
  name: 'ListBase',
  components: {
    SearchIcon,
    Trend,
  },
  data() {
    return {
      CONTRACT_STATUS,
      CONTRACT_STATUS_OPTIONS,
      CONTRACT_TYPES,
      CONTRACT_PAYMENT_TYPES,
      prefix,
      dataLoading: false,
      data: [],
      selectedRowKeys: [1, 2],
      value: 'first',
      columns: [
        {
          title: '名称',
          align: 'left',
          width: 220,
          ellipsis: true,
          colKey: 'discoveredLabels.job',
          fixed: 'left',
        },
        {
          title: '类型',
          width: 120,
          ellipsis: true,
          fixed: 'left',
          colKey: 'scrapePool',
        },
        {
          title: '状态',
          colKey: 'health',
          align: 'center',
          width: 60
        },
        {
          title: '标签',
          width: 200,
          ellipsis: true,
          colKey: 'labels',
        },
        {
          title: '超时',
          width: 60,
          ellipsis: true,
          align: 'center',
          colKey: "scrapeTimeout"
        },
        {
          title: '端点地址',
          width: 200,
          ellipsis: true,
          colKey: "globalUrl"
        },
        {
          title: '描述',
          width: 180,
          ellipsis: true,
          colKey: "lastError"
        },
        {
          align: 'left',
          fixed: 'right',
          width: 80,
          colKey: 'op',
          title: '操作',
        },
      ],
      rowKey: 'index',
      tableLayout: 'auto',
      verticalAlign: 'top',
      hover: true,
      rowClassName: (rowKey: string) => `${rowKey}-class`,
      // 与pagination对齐
      pagination: {
        defaultsize: 10,
        total: 0,
        defaultCurrent: 1,
      },
      // 搜索框
      searchForm: {
        job: "",
        type: "",
        health: "",
        current: 1,
        size: 10
      },
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        type: "",
        operation: "add",
        row: {},
        dynamicForm: {}
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      deleteType: -1,
      // 当前数据
      formData: {
        id: 0,
        url: "",
        name: "",
        icon: "",
        type: "",
        home: "",
        description: "",
        createTime: "",
        updateTime: "",
        createBy: "",
        updateBy: "",
        status: "",
        values: ""
      },
      typeList: []
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const {name} = this.data?.[this.deleteIdx];
        return `删除后，${name}的所有合同信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
  },
  created() {
    this.page();
  },
  watch:{
    "searchForm.job"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.size"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.current"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    }
  },
  methods: {
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onsizeChange(size, pageInfo) {
      console.log('Page Size:', this.size, size, pageInfo);
      // 刷新
      this.searchForm.size = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      // 刷新
      this.searchForm.current = current
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    handleClickDetail(row) {
      console.log(row);
      this.formData = row;
      this.drawer.operation = 'detail';
      this.drawer.visible = true;
    },
    handleSetupContract() {
      //this.$router.push('/prometheus/add');
      this.$emit('transfer', "form")
    },
    handleClickDelete(row: { rowIndex: any, type: any }) {
      this.deleteIdx = row.rowIndex;
      this.deleteType = row.type;
      this.confirmVisible = true;
      console.log("this", this.deleteType)
    },
    onConfirmDelete() {
      // 真实业务请发起请求
      this.data.splice(this.deleteIdx, 1);
      this.pagination.total = this.data.length;
      const selectedIdx = this.selectedRowKeys.indexOf(this.deleteIdx);
      if (selectedIdx > -1) {
        this.selectedRowKeys.splice(selectedIdx, 1);
      }
      this.confirmVisible = false;
      // 请求删除
      this.$request.delete("/monitor/delete", {
        params: {
          index: this.deleteIdx,
          type: this.deleteType
        }
      }).then(res => {
        this.$message.success(res.data.msg);
      }).catch(err => {
      })
      this.resetIdx();
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
      this.searchForm = {};
    },
    onSubmit(data) {
      console.log(this.searchForm);
      this.page();
    },
    handleDrawerOk() {

    },
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    getTypeList() {
      this.$request.get("/monitor/typeList").then(res => {
        this.typeList = res.data.data
      }).catch((err) => {

      })
    },
    page() {
      this.dataLoading = true;
      this.$request.get('/prometheus/targets/page', {
          params: this.searchForm
        }).then((res) => {
        if (res.data.code === 200) {
          this.data = res.data.rows;
          this.pagination.total = res.data.total;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    }
  },
});
</script>

<style lang="less" scoped>
@import '@/style/variables';

.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }
}

.left-operation-container {
  padding: 0 0 6px 0;
  margin-bottom: 16px;

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-s);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}

.t-button + .t-button {
  margin-left: var(--td-comp-margin-s);
}
</style>
