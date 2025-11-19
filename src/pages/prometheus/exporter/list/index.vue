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
            <!--            <t-button @click="handleSetupContract">添加</t-button>-->
            <!--            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出配置</t-button>-->
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
        <t-empty :description="'实例没有数据或没有配置Prometheus实例，请检查！'" :title="'没有内容'"
                 :loading="dataLoading" v-show="dataLoading == false && data.length == 0"></t-empty>
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
          <template #targets="{ row }">
            <span v-for="item in row.targets.split(',')">
                <t-tag theme="primary" variant="light">{{ item }}</t-tag>
            </span>
          </template>
          <template #health="{ row }">
            <t-tag v-if="row.health === 'down'" theme="danger" variant="light">触发</t-tag>
            <t-tag v-if="row.health === CONTRACT_STATUS.AUDIT_PENDING" theme="warning" variant="light">待审核</t-tag>
            <t-tag v-if="row.health === CONTRACT_STATUS.EXEC_PENDING" theme="warning" variant="light">待履行</t-tag>
            <t-tag v-if="row.health === CONTRACT_STATUS.EXECUTING" theme="success" variant="light">履行中</t-tag>
            <t-tag v-if="row.health === 'up'" theme="success" variant="light">正常</t-tag>
          </template>
          <template #op="{row}">
            <a class="t-button-link" @click="handleClickDetail(row)">详情</a>
            <a class="t-button-link" @click="handleClickDelete(row)">删除</a>
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
      size="30%"
      @close="onCancelDrawer"
      :onConfirm="handleDrawerOk"
      @cancel="onCancelDrawer"
    >
<!--      <t-space v-show="operation === 'add'|| operation ==='edit'" direction="vertical" style="width: 100%">-->
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
<!--      <t-space v-show="operation === 'detail'" direction="vertical" style="width: 100%">-->
<!--        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">-->
<!--          <t-descriptions-item label="名称">-->
<!--            <t-space>-->
<!--              <t-image fit="cover" :style="{width:'32px',height:'32px'}" :src="formData.icon"/>-->
<!--            </t-space>-->
<!--            {{ formData.name }}-->
<!--          </t-descriptions-item>-->
<!--          <t-descriptions-item label="类型">{{ formData.type }}</t-descriptions-item>-->
<!--          <t-descriptions-item label="主页"><a :href="formData.home">{{ formData.home }}</a></t-descriptions-item>-->
<!--          <t-descriptions-item label="描述">{{ formData.description }}</t-descriptions-item>-->
<!--          <t-descriptions-item label="地址"><a :href="formData.url">{{ formData.url }}</a></t-descriptions-item>-->
<!--          <t-descriptions-item label="上架时间">{{ formData.createTime }}</t-descriptions-item>-->
<!--          <t-descriptions-item label="上架人">{{ formData.createBy }}</t-descriptions-item>-->
<!--          <t-descriptions-item label="更新时间">{{ formData.updateTime }}</t-descriptions-item>-->
<!--          <t-descriptions-item label="更新人">{{ formData.updateBy }}</t-descriptions-item>-->
<!--        </t-descriptions>-->
<!--      </t-space>-->
<!--      <t-space v-show="operation === 'install'" direction="vertical" style="width: 100%">-->
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
        status: ""
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
    handleClickDetail(row) {
      //this.$router.push('/detail/base');
      //console.log("id", row)
      const rowData = [
        {
          name: "id",
          value: row.id,
        },
        {
          name: '名称',
          value: row.name,
        }
      ]
      this.$emit('transfer', "detail", rowData)
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
    // 取消抽屉
    onCancelDrawer() {
      this.drawer.visible = false;
      this.dataLoading = false;
    },
    // drawer大小
    handleSizeDrag({size}) {
      console.log('size drag size: ', size);
    },
    handleDrawerOk() {

    },
    onCancel() {
      this.resetIdx();
    },
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      console.log(data);
    },
    onSubmit(data) {
      console.log(this.formData);
      this.page();
    },
    // 查询
    page() {
      this.dataLoading = true;
      this.$request.get('/prometheus/exporter/page', {
          params: this.formData
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
