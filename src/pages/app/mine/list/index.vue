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
            <t-button @click="handleSetupContract">自定义安装</t-button>
            <!--            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length">导出应用</t-button>-->
            <!--            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>-->
          </div>
          <t-input v-model="searchForm.name" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
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
            <t-tag v-if="row.status === 'fail'" theme="warning" variant="light">安装失败</t-tag>
            <t-tag v-if="row.status === 'error'" theme="danger" variant="light">错误</t-tag>
            <t-tag v-if="row.status === null || row.status ===''" theme="default" variant="light">未知</t-tag>
            <t-tag v-if="row.status === 'ok'" theme="success" variant="light">正常</t-tag>
          </template>
          <template #contractType="{row}">
            <p v-if="row.contractType === CONTRACT_TYPES.MAIN">审核失败</p>
            <p v-if="row.contractType === CONTRACT_TYPES.SUB">待审核</p>
            <p v-if="row.contractType === CONTRACT_TYPES.SUPPLEMENT">待履行</p>
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
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">管理</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">卸载</a>
          </template>
        </t-table>
      </div>
    </t-card>
    <t-pagination
      style="margin-top: 15px"
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
      @confirm="handleConfirmOk"
      :onCancel="onCancel">
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
      @close="onCancelDrawer"
      :onConfirm="handleDrawerOk"
      @cancel="onCancelDrawer">
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical"
               style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="120"
          @reset="onReset"
        >
          <t-form-item label="应用发布名称" name="branch">
            <t-input v-model="formData.releaseName" placeholder="请输入英文字母和数字的组合名称" :maxlength="64"
                     with="200" clearable></t-input>
          </t-form-item>
          <t-form-item label="命名空间" name="localIp">
            <t-input v-model="formData.nameSpace" :maxlength="64" with="200" clearable></t-input>
          </t-form-item>
          <t-form-item label="集群" name="kubeContext">
            <t-select v-model="formData.kubeContext" placeholder="请选择" clearable>
              <t-option v-for="(item,index) in clusters" :key="index" :label="item.contextName"
                        :value="item.contextName">{{ item.contextName }}
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="安装包地址" name="chartUrl">
            <t-input v-model="formData.chartUrl" placeholder="请输入安装包的url地址" clearable></t-input>
            <!--            <t-select-->
            <!--              v-model="formData.chartUrl"-->
            <!--              placeholder="支持输入和选择"-->
            <!--              clearable-->
            <!--              :options="packages"-->
            <!--              @input-change="packageList"-->
            <!--              allow-input-->
            <!--              allow-create-->
            <!--              default-first-option-->
            <!--              filterable-->
            <!--              @blur="onBlur"-->
            <!--              :keys="{ label: 'name', value: 'url' }" >-->
            <!--            </t-select>-->
          </t-form-item>
          <t-form-item label="参数" name="description">
            <t-textarea v-model="formData.chartValues" placeholder="请输入备注内容" :maxlength="9999" with="200"
                        :autosize="{minRows:7}"></t-textarea>
          </t-form-item>
          <t-form-item label="描述" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入备注内容" :maxlength="200" with="200"
                        :autosize="{minRows:2}"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="3">
          <t-descriptions-item label="应用名称">{{ formData.appName }}</t-descriptions-item>
          <t-descriptions-item label="命名空间">{{ formData.nameSpace }}</t-descriptions-item>
          <t-descriptions-item label="版本">{{ formData.version }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ formData.status }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ formData.createTime }}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{ formData.createBy }}</t-descriptions-item>
          <t-descriptions-item label="描述">{{ formData.description }}</t-descriptions-item>
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
        {colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left'},
        {
          title: '应用发布名称',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'releaseName',
          fixed: 'left',
        },
        {
          title: '状态',
          colKey: 'status',
          width: 80,
          cell: {col: 'status'}
        },
        {
          title: 'chart名称',
          width: 120,
          ellipsis: true,
          colKey: 'chartName',
        },
        {
          title: '类型',
          width: 80,
          ellipsis: true,
          colKey: 'source',
        },
        {
          title: '命名空间',
          width: 120,
          ellipsis: true,
          colKey: 'nameSpace',
        },
        {
          title: '集群',
          width: 140,
          ellipsis: true,
          colKey: 'kubeContext',
        },
        {
          title: '描述',
          width: 160,
          ellipsis: true,
          colKey: 'description',
        },
        {
          title: '创建时间',
          width: 160,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '更新时间',
          width: 160,
          ellipsis: true,
          colKey: 'updateTime',
        },
        {
          align: 'center',
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
      searchValue: '',
      confirmVisible: false,
      deleteIdx: -1,
      formData: {
        id: '',
        appName: '',
        chartName: "",
        chartUrl: "",
        chartValues: "",
        home: "",
        icon: "",
        nameSpace: '',
        releaseName: '',
        version: '',
        type: "",
        description: "",
        kubeContext: '',
        createTime: '',
        updateTime: '',
        createBy: '',
        updateBy: '',
        status: "",
      },
      // 抽屉
      drawer: {
        header: "",
        visible: false,
        operation: "add",
        size: '40%',
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
        name: "",
        version: "",
        pageNum: 1,
        pageSize: 10
      },
      clusters: [],
      packages: []
    };
  },
  computed: {
    offsetTop() {
      return this.$store.state.setting.isUseTabsRouter ? 48 : 0;
    },
  },
  mounted() {
  },
  created() {
    this.page();
  },
  watch: {
    "searchForm.name"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page();
      }
    },
    "searchForm.pageSize"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page();
      }
    },
    "searchForm.pageNum"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page();
      }
    }
  },
  methods: {
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
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
    // 确认抽屉
    handleDrawerOk() {
      console.log('执行:', this.operation);
      switch (this.operation) {
        case 'add':
          break;
        // 执行安装
        case 'install':
          this.$request.post('/app/market/install', {
            params: this.formData
          }).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.handleSubmit("search")
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.dataLoading = false;
          });
          break;
      }
    },
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
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
    // 详情
    handleClickDetail(row: any) {
      this.formData = row;
      this.drawer.header = row.appName;
      this.drawer.operation = 'detail';
      this.drawer.size = '30%'
      this.drawer.visible = true;
    },
    // 创建应用
    handleSetupContract() {
      this.formData = {}
      this.drawer.header = '新增';
      this.drawer.size = '50%';
      this.drawer.operation = 'add';
      this.drawer.visible = true;
      this.clusterList();
      this.packageList();
    },
    // 编辑
    handleClickEdit(row: any) {
      this.formData = row;
      this.drawer.header = row.appName;
      this.drawer.operation = 'edit';
      this.drawer.size = '40%'
      this.drawer.visible = true;
    },
    handleClickDelete(row: any) {
      this.formData = row;
      this.confirm.operation = 'delete';
      this.confirm.header = "删除：" + this.formData.appName;
      this.confirm.body = "确认删除吗？一旦删除数据无法恢复";
      this.confirm.visible = true;
    },
    // 对话框信息自定义
    handleConfirmOk() {
      switch (this.confirm.operation) {
        case 'add':
          break;
        case 'update':
          break;
        case 'delete':
          this.$request.delete('/app/mine/delete?id=' + this.formData.id).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.page();
              this.confirm.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          })
          break;
      }
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
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
      this.page();
    },
    onSubmit(data) {
      this.page();
    },
    // 基本操作
    handleSubmit() {
      console.log(this.operation);
      switch (this.operation) {
        case 'add':
          this.confirm.operation = "add";
          break;
        case 'detail':
          this.drawer.visible = true;
          this.drawer.header = "详情：" + this.formData.name;
          break;
        case 'update':
          break;
        case 'delete':
          this.$request.delete('/app/mine/delete', {
            params: this.formData
          }).then((res) => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg);
              this.handleSubmit("search")
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((e: Error) => {
            console.log(e);
          }).finally(() => {
            this.dataLoading = false;
          });
          break;
      }
    },
    page() {
      this.dataLoading = true;
      this.$request.get('/app/mine/page', {
        params: this.searchForm
      }).then((res) => {
        if (res.data.code === 200) {
          this.data = res.data.rows;
          this.pagination.total = res.data.total;
        } else {
          this.$message.error(res.data.msg);
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    clusterList() {
      this.$request.get('/kubernetes/cluster/list', {
        params: {
          isPublic: true
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.clusters = res.data.data;
        }
      })
    },
    packageList() {
      this.$request.get('/app/market/list', {
        params: {
          name: this.formData.url,
        }
      }).then((res) => {
        if (res.data.code === 200) {
          this.packages = res.data.data;
        } else {
          this.$message.error(res.data.msg);
        }
      })
    },
    onBlur(value, context) {
      console.log(context.inputValue);
      this.formData.chartUrl = context.inputValue
    },
    onSChange(val) {
      this.formData.chartUrl = val
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
