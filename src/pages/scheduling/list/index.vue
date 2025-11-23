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
          <t-button @click="handleSetupContract"> 新建 </t-button>
          <t-button @click="handleExport" variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出 </t-button>
          <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>
        </div>
        <t-input v-model="searchValue" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
          <template #suffix-icon>
            <search-icon size="20px" />
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
            <t-tag v-if="row.status === ''|| row.status == null" theme="default" variant="light">未运行</t-tag>
            <t-tag v-if="row.status === 'pause'" theme="warning" variant="light">暂停</t-tag>
            <t-tag v-if="row.status === 'running'" theme="primary" variant="light">执行中</t-tag>
          </template>
          <template #runStatus="{row}">
            <t-tag v-if="row.runStatus === 'done'" theme="success" variant="light">成功</t-tag>
            <t-tag v-if="row.runStatus === 'fail'" theme="danger" variant="light">失败</t-tag>
            <t-tag v-if="row.runStatus === ''" theme="success" variant="light">未知</t-tag>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickRun(slotProps.row)">执行</a>
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">编辑</a>
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
            @change="onChange"
          />
        </div>
      </div>
    </t-card>
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      :operate="confirm.operation"
      @confirm="onConfirm"
      :onCancel="onCancel"
    >
    </t-dialog>
    <t-drawer
      :visible.sync="drawer.visible"
      :header="drawer.header"
      :on-overlay-click="() => (drawer.visible = false)"
      placement="right"
      destroyOnClose
      showOverlay
      :sizeDraggable="true"
      :on-size-drag-end="handleSizeDrag"
      :size="drawer.size"
      @cancel="drawer.visible = false"
      @close="drawer.visible = false"
      :onConfirm="onSubmitCreate">
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'"  direction="vertical" style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="120"
          @reset="onReset"
        >
            <t-form-item label="id" name="id" v-show="false">
              <t-input v-model="formData.jobId" placeholder="请输入内容" :maxlength="32" with="200"></t-input>
            </t-form-item>
            <t-form-item label="任务名称" name="branch" >
              <t-input v-model="formData.jobName" placeholder="请输入英文字母和数字的组合名称" :maxlength="32" with="200"></t-input>
            </t-form-item>
            <t-form-item label="类型" name="type" >
              <t-select v-model="formData.jobType" placeholder="请选择">
                <t-option v-for="(item,index) in typeList" :key="index" :label="item.label" :value="item.value" >{{item.value}}({{item.label}})</t-option>
              </t-select>
            </t-form-item>
            <t-form-item label="表达式" name="cronExpression">
              <t-input v-model="formData.cronExpression"  placeholder="请输入"></t-input>
            </t-form-item>
            <t-form-item label="备注" name="remotePort" >
              <t-textarea v-model="formData.description" placeholder="请输入备注内容" :maxlength="120" with="200"></t-textarea>
            </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions  bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="任务名称">{{formData.jobName}}</t-descriptions-item>
          <t-descriptions-item label="任务类型">{{formData.jobType}}</t-descriptions-item>
          <t-descriptions-item label="任务状态">{{formData.status}}</t-descriptions-item>
          <t-descriptions-item label="调用类">{{formData.jobClass}}</t-descriptions-item>
          <t-descriptions-item label="调用方法">{{formData.jobMethod}}</t-descriptions-item>
          <t-descriptions-item label="调用参数">{{formData.jobParams}}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{formData.createByUserName}}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{formData.createTime}}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{formData.updateTime}}</t-descriptions-item>
          <t-descriptions-item label="更新者">{{formData.updateByUserName}}</t-descriptions-item>
          <t-descriptions-item label="备注">{{formData.description}}</t-descriptions-item>
        </t-descriptions>
      </t-space>
    </t-drawer>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { SearchIcon } from 'tdesign-icons-vue';
import Trend from '@/components/trend/index.vue';
import { prefix } from '@/config/global';

import { CONTRACT_STATUS, CONTRACT_STATUS_OPTIONS, CONTRACT_TYPES, CONTRACT_PAYMENT_TYPES } from '@/constants';

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
        // {
        //   colKey: 'row-select',
        //   type: 'multiple',
        //   width: 64,
        //   fixed: 'left'
        // },
        {
          title: '名称',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'jobName',
          fixed: 'left',
        },
        {
          title: '任务状态',
          align: 'center',
          colKey: 'status',
          width: 80,
          cell: {
            col: 'status'
          }
        },
        {
          title: '分组',
          width: 80,
          ellipsis: true,
          colKey: 'jobGroup',
        },
        {
          title: '表达式',
          width: 120,
          colKey: 'cronExpression',
        },
        {
          title: '创建时间',
          width: 150,
          align: 'left',
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '执行时间',
          width: 150,
          align: 'left',
          ellipsis: true,
          colKey: 'runTime',
        },
        {
          title: '执行状态',
          colKey: 'runStatus',
          align: 'center',
          width: 80,
        },
        {
          title: '描述',
          width: 120,
          align: 'left',
          ellipsis: true,
          colKey: 'remark',
        },
        {
          title: '执行结果',
          width: 120,
          align: 'left',
          ellipsis: true,
          colKey: 'runResult',
        },
        {
          align: 'left',
          fixed: 'right',
          width: 180,
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
      // 查询参数
      searchForm: {
        name: '',
        type: '',
        pageNum: 1,
        pageSize: 10,
      },
      drawer: {
        title: '新增',
        visible: false,
        header: '新增',
        operation: "",
        size: "40%"
      },
      formData: {
        jobId: '',
        jobName: '',
        status: "",
        jobType: '',
        jobClass: '',
        jobMethod: '',
        jobParams: '',
        createBy: '',
        createTime: '',
        updateTime: '',
        updateBy: '',
        createByUserName: '',
        updateByUserName: '',
        cronExpression: "",
        description: '',
      },
      serviceList: [],
      typeList: [],
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      confirm: {
        visible: false,
        header: '确认删除当前所选项目？',
        operation: 'delete',
        body: "删除后，所有信息将被清空，且无法恢复",
      }
    };
  },
  computed: {
    confirmBody() {
      if (this.deleteIdx > -1) {
        const { name } = this.data?.[this.deleteIdx];
        return `删除后，${name}的所有合同信息将被清空，且无法恢复`;
      }
      return '';
    },
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
    this.page()
  },
  watch:{
    "searchForm.jobName"(newVal, oldVal) {
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
    page() {
      this.dataLoading = true;
      this.$request.get('/scheduling/job/page', {
          params: this.searchForm,
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
    // 类型列表
    getTypeList() {
      this.$request.get('/scheduling/common/types').then((res) => {
          if (res.data.code === 200) {
            this.typeList = res.data.data;
          }
        }).catch((e: Error) => {
          console.log(e);
        }).finally(() => {
          this.dataLoading = false;
        })
    },
    // 服务列表
    getServiceList() {
      this.$request.get('/nas/frps/list').then((res) => {
          if (res.data.code === 200) {
            this.serviceList = res.data.data;
          }
        }).catch((e: Error) => {
          console.log(e);
        }).finally(() => {
          this.dataLoading = false;
        })
    },
    // 创建
    onSubmitCreate() {
      console.log(this.form);
      if (this.form.id === '') {
        this.$request.post("/nas/frpc/add", this.form).then(res => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg);
            this.getList();
            this.formConfig.visible = false;
          }
        })
      } else {
        this.$request.put("/nas/frpc/edit", this.form).then(res => {
          if (res.data.code === 200) {
            this.$message.success(res.data.msg);
            this.getList();
            this.formConfig.visible = false;
          }
        })
      }
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', this.pageSize, size, pageInfo);
      // 刷新
      this.formData.pageSize = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      // 刷新
      this.formData.pageNum = current
      this.getList()
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    handleClickDetail(row) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.size = '30%';
      this.drawer.operation = 'detail';
      this.drawer.header = '详情-' + row.jobName;
    },
    // 执行一次任务
    handleClickRun(row) {
      this.confirm.visible = true;
      this.confirm.operation = "run";
      this.confirm.header = "执行" + row.jobName;
      this.confirm.body = "确认执行一次当前项目？";
      this.formData = row
    },
    // 编辑
    handleClickEdit(row) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.header = "编辑" + row.jobName;
      this.getTypeList();
    },
    // 新建
    handleSetupContract() {
      this.form = {}
      this.drawer.visible = true;
      this.drawer.operation = 'add';
      this.drawer.header = "新增";
      this.getTypeList();
    },
    // 导出
    handleExport() {
      this.$request.post('/nas/frp/common/export', {
        serverName: 'hcs.gpg123.vip',
      },{responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'frpc.toml';
        link.click();
        URL.revokeObjectURL(link.href); // 释放内存
      })
    },
    // 点击删除
    handleClickDelete(row: { rowIndex: any }) {
      this.deleteIdx = row.rowIndex;
      this.confirm.visible = true;
      this.form.id = row.id;
    },
    // 确认操作
    onConfirm() {
      switch (this.confirm.operation) {
        // 执行删除
        case 'delete':
          this.$request.delete('/nas/frpc/delete?id=' + this.form.id).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.getList();
              this.confirm.visible = false;
            }
          })
          break;
        // 运行一次
        case 'run':
          this.$request.put('/scheduling/job/run', this.formData).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.confirm.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.page();
            this.dataLoading = false;
          })
          break;
      }
    },
    onReset(data) {
      console.log(data);
    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    // 搜索提交
    onSubmit(data) {
      this.page();
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
