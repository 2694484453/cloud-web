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
            <t-button @click="handleSetupContract()">添加集群</t-button>
            <t-button @click="handleExporter()" variant="base" theme="default" :disabled="!selectedRowKeys.length">导出配置</t-button>
          </div>
          <t-input v-model="searchValue" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
            <template #suffix-icon>
              <search-icon size="20px"/>
            </template>
          </t-input>
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
          <template #status="{row}">
            <t-tag v-if="row.status === 'error'" theme="danger" variant="light">错误</t-tag>
            <t-tag v-if="row.status === '' || row.status === null" theme="warning" variant="light">未知</t-tag>
            <t-tag v-if="row.status === 'ok'" theme="success" variant="light">健康</t-tag>
          </template>
          <template #masterUrl="{row}">
            <a :href="row.masterUrl" target="_blank">{{row.masterUrl}}</a>
          </template>
          <template #paymentType="{row}">
            <p v-if="row.paymentType === CONTRACT_PAYMENT_TYPES.PAYMENT" class="payment-col">
              付款
              <trend class="dashboard-item-trend" type="up"/>
            </p>
            <p v-if="row.paymentType === CONTRACT_PAYMENT_TYPES.RECEIPT" class="payment-col">
              收款
              <trend class="dashboard-item-trend" type="down"/>
            </p>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickMonitor(slotProps.row)">监控</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
          </template>
        </t-table>
        <div style="margin-top: 10px">
          <t-pagination
            v-model="searchForm.pageNum"
            :total="pagination.total"
            :page-size.sync="searchForm.pageSize"
            @current-change="onCurrentChange"
            @page-size-change="onPageSizeChange"
            @change="onChange"/>
        </div>
      </div>
    </t-card>
    <t-dialog
      header="确认删除当前所选合同？"
      :body="confirmBody"
      :visible.sync="confirmVisible"
      @confirm="onConfirmDelete"
      :onCancel="onCancel"
    >
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
      :size="drawer.size"
      @close="drawer.visible = false"
      :onConfirm="handleDrawerOk"
      @cancel="drawer.visible = false"
    >
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="100"
          @reset="onReset"
        >
          <t-form-item label="集群名称" name="repoName">
            <t-input v-model="formData.clusterName" placeholder="请输入集群名称（域名格式）" :maxlength="64" with="120" clearable></t-input>
          </t-form-item>
          <t-form-item label="配置内容" name="file">
            <t-textarea v-model="formData.config" placeholder="请输入配置内容" clearable :autosize="{ minRows:10 }"></t-textarea>
          </t-form-item>
          <t-form-item label="备注" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入内容" maxlength="200" clearable :autosize="{ minRows:3 }"/>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'info'" direction="vertical" style="width: 100%">
        <t-descriptions  bordered :layout="'vertical'" :item-layout="'horizontal'" :column="3">
          <t-descriptions-item label="集群名称">{{formData.clusterName}}</t-descriptions-item>
          <t-descriptions-item label="状态">{{formData.status}}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{formData.createBy}}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{formData.createTime}}</t-descriptions-item>
          <t-descriptions-item label="更新者">{{formData.updateBy}}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>
          <t-descriptions-item label="描述">{{formData.description}}</t-descriptions-item>
          <t-descriptions-item label="配置内容"><MonacoEditor :value="formData.config" :config="{lanauage:'yaml'}"/></t-descriptions-item>
        </t-descriptions>
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
import MonacoEditor from "@/components/editor/MonacoEditor.vue";

export default Vue.extend({
  name: 'ListBase',
  components: {
    MonacoEditor,
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
        {colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left'},
        {
          title: '集群名称',
          align: 'left',
          width: 150,
          ellipsis: true,
          colKey: 'clusterName',
          fixed: 'left',
        },
        {
          title: 'context名称',
          colKey: 'contextName',
          width: 150
        },
        {
          title: '状态',
          colKey: 'status',
          width: 80,
          fixed: 'center',
          ellipsis: true
        },
        {
          title: 'master地址',
          width: 180,
          ellipsis: true,
          colKey: 'masterUrl',
        },
        {
          title: "描述",
          colKey: "description",
          width: 160,
          cell: {col: "status"}
        },
        {
          title: "创建时间",
          colKey: "createTime",
          width: 160,
          cell: {col: "status"}
        },
        {
          title: "更新时间",
          colKey: "updateTime",
          width: 160,
          cell: {col: "status"}
        },
        {
          align: 'center',
          fixed: 'right',
          width: 150,
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
        defaultPageSize: 20,
        total: 0,
        defaultCurrent: 1,
      },
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      drawer: {
        header: "",
        visible: false,
        size: "70%",
        type: "",
        operation: "add",
        row: {}
      },
      searchForm: {
        name: "",
        type: "",
        pageNum: 1,
        pageSize: 10
      },
      formData: {
        id: "",
        clusterName: "",
        status: "",
        createBy: "",
        createTime: "",
        updateBy: "",
        updateTime: "",
        description: "",
        fileUrl: "",
        config: "",
        file: File
      }
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
    this.dataLoading = true;
  },
  created() {
    this.page()
  },
  watch:{
    "searchForm.name"(newVal, oldVal) {
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
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', this.pageSize, size, pageInfo);
      // 刷新
      this.searchForm.pageSize = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      // 刷新
      this.searchForm.pageNum = current
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    // 查看详情
    handleClickDetail(row:any) {
      this.formData = row;
      this.drawer.header = "详情";
      this.drawer.operation = 'info';
      this.drawer.size="80%"
      this.drawer.visible = true;
    },
    handleClickMonitor(row:any) {
      this.formData = row;

    },
    // 添加
    handleSetupContract() {
      this.form = {};
      this.drawer.header = "新增";
      this.drawer.operation = 'add';
      this.drawer.size = '40%';
      this.drawer.visible = true;
    },
    // 导出
    handleExporter() {
      this.$request.post("/kubernetes/cluster/export",{responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data]); // 根据文件类型设置
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'config.yaml'; // 设置下载文件名
        link.click();
      })
    },
    // 删除
    handleClickDelete(row: { rowIndex: any }) {
      this.confirm.visible = true;
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
      this.$message.success('删除成功');
      this.resetIdx();
    },
    // 取消删除
    onCancel() {
      this.confirm.visible = false;
      this.dataLoading = false;
      this.$message.info("取消删除！");
    },
    // 对话框信息自定义
    handleClickConfirm(row) {
      switch(this.confirm.operation) {
        case 'add':
          break;
        case 'update':
          break;
        case 'delete':
          this.confirm.visible = true;
          this.confirm.header = "删除：" + this.formData.name;
          this.confirm.body = "确认删除吗？一旦删除数据无法恢复";
          break;
      }
      this.formData = row
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      this.searchForm = {};
    },
    onSubmit(data) {
      this.page();
    },
    // 确认抽屉
    handleDrawerOk() {
      console.log('执行:',this.drawer.operation);
      switch (this.drawer.operation) {
        case 'add':
          this.drawer.visible = false;
          this.$request.post("/kubernetes/cluster/add", this.formData).then(res => {
            if (res.data.code == 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
              this.page();
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch(e => {
            console.log(e)
          })
          break;
        case 'detail':
          this.drawer.visible = false;
          break;
      }
    },
    // 分页查询
    page() {
      this.dataLoading = true;
      this.$request.get('/kubernetes/cluster/page', {
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
    },
    handleFail({ file }) {
      console.log(this.formData.file);
      this.$message.error(`文件 ${file.name} 上传失败`);
    },
    onSuccess() {
      console.log(this.formData.file);
      this.tips = '';
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
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
