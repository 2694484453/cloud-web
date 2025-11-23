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
        :style="{ marginBottom: '8px' }">
        <t-row justify="space-between">
          <div class="left-operation-container">
            <t-button @click="handleSetupContract">添加</t-button>
            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出配置</t-button>
          </div>
          <t-col :span="3">
            <t-form-item label="名称" name="name">
              <t-input v-model="searchForm.jobName" :style="{ width: '200px' }" placeholder="请输入内容"/>
            </t-form-item>
          </t-col>
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
          <template #targets="{row}">
            <span v-for="item in row.targets.split(',')">
                <t-tag theme="primary" variant="light">{{item}}</t-tag>
            </span>
          </template>
          <template #status="{row}">
            <t-tag v-if="row.status === 'down'" theme="danger" variant="light">异常</t-tag>
            <t-tag v-if="row.status === '' || row.status === null" theme="warning" variant="light">未知</t-tag>
            <t-tag v-if="row.status === 'up'" theme="success" variant="light">正常</t-tag>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
          </template>
        </t-table>
      </div>
    </t-card>
    <t-pagination style="margin-top: 15px"
                  v-model="searchForm.pageNum"
                  :total="pagination.total"
                  :page-size.sync="searchForm.pageSize"
                  @current-change="onCurrentChange"
                  @page-size-change="onPageSizeChange"
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
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="100"
          @reset="onReset"
        >
          <t-form-item label="名称" name="jobName">
            <t-input v-model="formData.jobName" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="类型" name="exporterType">
            <t-input v-model="formData.exporterType" placeholder="请输入仓库名称" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="地址" name="url">
            <t-input v-model="formData.description" placeholder="请输入仓库地址" :maxlength="64" with="120"></t-input>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="名称">{{ formData.jobName }}</t-descriptions-item>
          <t-descriptions-item label="类型">{{ formData.exporterType }}</t-descriptions-item>
          <t-descriptions-item label="端点">
            <t-space v-for="item in formData.targets.split(',')">
                <t-tag theme="primary">{{item}}</t-tag>
            </t-space>
          </t-descriptions-item>
          <t-descriptions-item label="地址"><a :href="formData.globalUrl">{{formData.globalUrl}}</a></t-descriptions-item>
          <t-descriptions-item label="描述">{{ formData.description }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ formData.createTime }}</t-descriptions-item>
          <t-descriptions-item label="创建人">{{ formData.createByUserName }}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{ formData.updateTime }}</t-descriptions-item>
          <t-descriptions-item label="更新人">{{ formData.updateByUserName }}</t-descriptions-item>
        </t-descriptions>
      </t-space>
      <t-space v-show="drawer.operation === 'install'" direction="vertical" style="width: 100%">
      </t-space>
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
          width: 250,
          colKey: 'jobName',
          fixed: 'left',
        },
        {
          title: '状态',
          colKey: 'status',
          fixed: 'left',
          width: 80
        },
        {
          title: '类型',
          width: 160,
          ellipsis: true,
          fixed: 'left',
          colKey: 'exporterType',
        },
        {
          title: '端点',
          width: 220,
          ellipsis: true,
          fixed: 'left',
          colKey: 'targets',
        },
        {
          title: '描述',
          align: 'left',
          width: 230,
          ellipsis: true,
          colKey: 'description',
          fixed: 'left',
        },
        {
          title: '创建时间',
          width: 160,
          ellipsis: true,
          colKey: "createTime"
        },
        {
          title: '更新时间',
          width: 160,
          ellipsis: true,
          colKey: "updateTime"
        },
        {
          align: 'left',
          fixed: 'right',
          width: 120,
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
        defaultPageSize: 10,
        total: 0,
        defaultCurrent: 1,
      },
      //
      operation: '',
      // 当前数据
      formData: {
        id: 0,
        jobName: "",
        exporterType: "",
        targets: "",
        description: "",
        createTime: "",
        updateTime: "",
        createBy: "",
        updateBy: "",
        status: "",
        globalUrl: "",
        createByUserName: "",
        updateByUserName: "",
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
      },
      // 搜索框
      searchForm: {
        jobName: "",
        exporterType: "",
        pageNum: 1,
        pageSize: 10
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      deleteType: -1,
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        type: "",
        operation: "add",
        row: {}
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
    this.page()
  },
  watch: {
    "searchForm.jobName"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.exporterType"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.pageSize"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.pageNum"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    }
  },
  methods: {
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', this.pageSize, size, pageInfo);
      this.searchForm.pageSize = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      this.searchForm.pageNum = current
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    rehandlePageChange(curr, pageInfo) {
      console.log('分页变化', curr, pageInfo);
    },
    rehandleSelectChange(selectedRowKeys: number[]) {
      this.selectedRowKeys = selectedRowKeys;
    },
    rehandleChange(changeParams, triggerAndData) {
      console.log('统一Change', changeParams, triggerAndData);
    },
    // 点击详情
    handleClickDetail(row) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.header = row.jobName;
      this.drawer.operation = 'detail';
    },
    handleSetupContract() {
      //this.$router.push('/prometheus/add');
      this.$emit('transfer', "form")
    },
    // 删除
    handleClickDelete(row: { rowIndex: any, type: any }) {
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
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    // 确定抽屉
    handleDrawerOk() {
      switch (this.drawer.operation) {
        case 'detail':
          this.drawer.visible = false;
          break;
      }
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    // 清除搜索
    onReset(data) {
      console.log(data);
    },
    // 搜索提交
    onSubmit(data) {
      console.log(this.formData);
      this.page();
    },
    // 分页查询
    page() {
      this.dataLoading = true;
      this.$request.get('/prometheus/exporter/page', {
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
