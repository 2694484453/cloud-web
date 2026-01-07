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
            <t-button @click="handleExport" variant="base" theme="default" :disabled="!selectedRowKeys.length">
              导出配置
            </t-button>
          </div>
          <t-col :span="3">
            <t-form-item label="名称" name="name">
              <t-input v-model="searchForm.jobName" class="search-input" placeholder="请输入你需要搜索的内容" clearable>
                <template #suffix-icon>
                  <search-icon size="20px"/>
                </template>
              </t-input>
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
          @sort-change="sortChange"
          :rowKey="rowKey"
          :verticalAlign="verticalAlign"
          :hover="hover"
          :selected-row-keys="selectedRowKeys"
          :loading="dataLoading"
          :headerAffixedTop="true"
          :headerAffixProps="{ offsetTop: offsetTop, container: getContainer }"
        >
          <template #targets="{row}">
            <span v-if="typeof row.targets === 'string' && row.targets?.includes(',')"
                  v-for="item in row.targets.split(',')">
                <t-tag theme="primary" variant="light">{{ item }}</t-tag>
            </span>
            <span v-if="typeof row.targets === 'string' && !row.targets?.includes(',')">
              <t-tag theme="primary" variant="light">{{ row.targets }}</t-tag>
            </span>
          </template>
          <template #status="{row}">
            <t-tag v-if="row.status === 'down'" theme="danger" variant="light">异常</t-tag>
            <t-tag v-if="row.status === '' || row.status === null || row.status === 'unknown'" theme="warning" variant="light">未知</t-tag>
            <t-tag v-if="row.status === 'up'" theme="success" variant="light">正常</t-tag>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">编辑</a>
            <a class="t-button-link" @click="handleClickGrafana(slotProps.row)">可视化</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
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
      @confirm="onConfirmOk"
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
      <t-space v-show="drawer.operation === 'add'|| drawer.operation ==='edit'" direction="vertical"
               style="width: 100%">
        <t-form
          ref="formValidatorStatus"
          :data="formData"
          :label-width="100"
          @reset="onReset"
        >
          <t-form-item label="端点名称" name="jobName">
            <t-input v-model="formData.jobName" placeholder="请输入名称" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="exporter类型" name="exporterType">
            <t-select v-model="formData.exporterType" class="demo-select-base" clearable filterable
                      placeholder="请选择类型">
              <t-option v-for="(item, index) in typeList" :value="item" :label="item" :key="index">
                {{ item }}
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="地址" name="url">
            <t-input v-model="formData.targets" placeholder="请输入地址" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="metrics路径" name="metricsPath">
            <t-input v-model="formData.metricsPath" placeholder="请输入路径" :maxlength="64" with="120"></t-input>
          </t-form-item>
          <t-form-item label="地址类型" name="schemaType">
            <t-select v-model="formData.schemeType">
              <t-option label="http" value="http">http</t-option>
              <t-option label="https" value="https">https</t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="抓取间隔(s)">
            <t-input v-model="formData.scrapeInterval" type="number" :maxlength="5"></t-input>
          </t-form-item>
          <t-form-item label="抓取超时(s)">
            <t-input v-model="formData.scrapeTimeout" type="number" :maxlength="5"></t-input>
          </t-form-item>
          <t-form-item label="labels" name="labels">
            <t-textarea v-model="formData.labels" placeholder="请输入Json格式" :autosize="{minRows:3}"></t-textarea>
          </t-form-item>
          <t-form-item label="描述" name="description">
            <t-textarea v-model="formData.description" placeholder="请输入描述" :maxlength="200"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="名称">{{ formData.jobName }}</t-descriptions-item>
          <t-descriptions-item label="类型">{{ formData.exporterType }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ formData.status }}</t-descriptions-item>
          <t-descriptions-item label="端点">
            <span
              v-if="formData.targets != null && typeof formData.targets === 'string' && formData.targets?.includes(',')">
              <t-space v-for="item in formData.targets.split(',')">
                <t-tag theme="primary">{{ item }}</t-tag>
              </t-space>
            </span>
            <span
              v-if="formData.targets != null && typeof formData.targets === 'string' && !formData.targets?.includes(',')">
              <t-tag theme="primary">{{ formData.targets }}</t-tag>
            </span>
          </t-descriptions-item>
          <t-descriptions-item label="地址"><a :href="formData.globalUrl">{{ formData.globalUrl }}</a>
          </t-descriptions-item>
          <t-descriptions-item label="描述">{{ formData.description }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ formData.createTime }}</t-descriptions-item>
          <t-descriptions-item label="创建人">{{ formData.createByUserName }}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{ formData.updateTime }}</t-descriptions-item>
          <t-descriptions-item label="更新人">{{ formData.updateByUserName }}</t-descriptions-item>
          <t-descriptions-item v-show="formData.status === 'down'|| formData.status === 'unknown'" label="异常原因">{{formData.errorReason}}</t-descriptions-item>
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
        {
          title: '名称',
          align: 'left',
          width: 250,
          colKey: 'jobName',
          fixed: 'left',
          sorter: true,
        },
        {
          align: 'center',
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
          width: 220,
          ellipsis: true,
          colKey: 'description',
          fixed: 'left',
        },
        {
          title: '创建时间',
          width: 150,
          ellipsis: true,
          colKey: "createTime",
          sorter: true,
        },
        {
          title: '更新时间',
          width: 150,
          ellipsis: true,
          colKey: "updateTime",
          sorter: true,
        },
        {
          align: 'center',
          fixed: 'left',
          width: 220,
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
      //
      operation: '',
      // 当前数据
      formData: {
        id: 0,
        jobName: "",
        exporterType: "",
        metricsPath: "/metrics",
        targets: "",
        labels: {},
        schemeType: "http",
        scrapeInterval: 15,
        scrapeTimeout: 10,
        description: "",
        createTime: "",
        updateTime: "",
        createBy: "",
        updateBy: "",
        status: "",
        globalUrl: "",
        createByUserName: "",
        updateByUserName: "",
        errorReason: "",
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
        current: 1,
        size: 10,
        isAsc: "desc",
        orderByColumn: "createTime",
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
    "searchForm.size"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.current"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.isAsc"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    },
    "searchForm.orderByColumn"(newVal, oldVal) {
      if (newVal != oldVal) {
        this.page()
      }
    }
  },
  methods: {
    onsizeChange(size, pageInfo) {
      console.log('Page Size:', this.size, size, pageInfo);
      this.searchForm.size = size
    },
    onCurrentChange(current, pageInfo) {
      console.log('Current Page', this.current, current, pageInfo);
      this.searchForm.current = current
    },
    onChange(pageInfo) {
      console.log('Page Info: ', pageInfo);
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    sortChange(sort: any) {
      // 对于受控属性而言，这里的赋值很重要，不可缺少
      console.log('sort-change', sort);
      this.searchForm.isAsc = sort.descending ? 'desc' : 'asc';
      this.searchForm.orderByColumn = sort.sortBy
    },
    // 点击详情
    handleClickDetail(row: any) {
      this.formData = row;
      this.drawer.visible = true;
      this.drawer.header = row.jobName;
      this.drawer.operation = 'detail';
    },
    // 编辑
    handleClickEdit(row: any) {
      this.formData = {
        ...row,
        labels: JSON.stringify(row.labels)
      };
      this.drawer.visible = true;
      this.drawer.header = row.jobName;
      this.drawer.operation = 'edit';
      this.types();
    },
    handleClickGrafana(row: any) {

    },
    // 新增
    handleSetupContract() {
      this.formData = {
        ...Object,
        scrapeInterval: 10,
        scrapeTimeout: 15,
        schemeType: 'http',
        metricsPath: "/metrics",
        labels: JSON.stringify(JSON)
      }
      this.drawer.visible = true;
      this.drawer.header = "新增";
      this.drawer.operation = 'add';
      this.types();
    },
    handleExport() {
      this.$request.post('/prometheus/exporter/export', this.formData, {responseType: 'blob'}).then(res => {
        const blob = new Blob([res.data]);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'prometheus-exporter.json';
        link.click();
        URL.revokeObjectURL(link.href); // 释放内存
      }).catch(e => {

      }).finally(() => {

      })
    },
    // 删除
    handleClickDelete(row) {
      this.formData = row;
      this.confirm.visible = true;
      this.confirm.header = '删除' + row.jobName;
      this.confirm.body = '本次操作将会彻底删除' + row.jobName + '的数据，是否继续？';
      this.confirm.operation = 'delete';
    },
    onConfirmOk() {
      switch (this.confirm.operation) {
        case 'add':
          break;
        case 'delete':
          // 请求删除
          this.$request.delete("/prometheus/exporter/delete", {
            params: {
              id: this.formData.id,
            }
          }).then(res => {
            if (res.data.code == 200) {
              this.$message.success(res.data.msg);
              this.confirm.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch(err => {
          }).finally(() => {
            this.page();
          })
          break;
      }
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
        case 'add':
          this.$request.post("/prometheus/exporter/add", this.formData).then(res => {
            if (res.data.code == 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch(err => {

          }).finally(() => {
            this.page();
          })
          break;
        case 'edit':
          this.$request.put("/prometheus/exporter/edit", this.formData).then(res => {
            if (res.data.code == 200) {
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch(err => {

          }).finally(() => {
            this.page();
          })
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
    },
    // 查询类型
    types() {
      this.$request.get("/prometheus/exporter/types", {}).then((res) => {
        if (res.data.code === 200) {
          this.typeList = res.data.data;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {

      })
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
