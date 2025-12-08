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
            <!--            <t-button @click="handleSetupContract">添加</t-button>-->
            <!--            <t-button variant="base" theme="default" :disabled="!selectedRowKeys.length"> 导出</t-button>-->
            <!--            <p v-if="!!selectedRowKeys.length" class="selected-count">已选{{ selectedRowKeys.length }}项</p>-->
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
            <!--            <t-tag v-if="row.status === CONTRACT_STATUS.FAIL" theme="danger" variant="light">校验失败</t-tag>-->
            <!--            <t-tag v-if="row.status === CONTRACT_STATUS.AUDIT_PENDING" theme="warning" variant="light">打包失败</t-tag>-->
            <!--            <t-tag v-if="row.status === CONTRACT_STATUS.EXEC_PENDING" theme="warning" variant="light">未知</t-tag>-->
            <!--            <t-tag v-if="row.status === CONTRACT_STATUS.EXECUTING" theme="success" variant="light">打包中</t-tag>-->
            <!--            <t-tag v-if="row.status === CONTRACT_STATUS.FINISH" theme="success" variant="light">已完成</t-tag>-->
          </template>
          <template #url="{row}">
            <a :href="row.url" target="_blank">{{ row.url }}</a>
          </template>
          <template #op="slotProps">
            <a class="t-button-link" @click="handleClickIde(slotProps.row)">访问</a>
            <a class="t-button-link" @click="handleClickDetail(slotProps.row)">详情</a>
            <a class="t-button-link" @click="handleClickEdit(slotProps.row)">编辑</a>
            <a class="t-button-link" @click="handleClickDelete(slotProps.row)">删除</a>
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
      @change="onChange"/>
    <t-dialog
      :header="confirm.header"
      :body="confirm.body"
      :visible.sync="confirm.visible"
      @confirm="onConfirmOk"
      :onCancel="onCancel"
    />
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
      size="35%"
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
          <t-form-item label="Git地址" name="url">
            <t-input v-model="formData.url" class="search-input" placeholder="" clearable></t-input>
          </t-form-item>
          <t-form-item label="仓库名称" name="name">
            <t-input v-model="formData.name" class="search-input" placeholder="" clearable></t-input>
          </t-form-item>
          <t-form-item label="类型" name="type">
            <t-select
              v-model="formData.type"
              :style="{ width: '120px' }"
              placeholder="请选择类型"
              class="demo-select-base"
              clearable>
              <t-option v-for="(item, index) in gitRepoTypeList" :key="index" :value="item" :label="item">
                {{ item }}
              </t-option>
            </t-select>
          </t-form-item>
          <t-form-item label="描述" name="name">
            <t-textarea v-model="formData.description" class="search-input" placeholder="" clearable
                        maxlength="256"></t-textarea>
          </t-form-item>
        </t-form>
      </t-space>
      <t-space v-show="drawer.operation === 'detail'" direction="vertical" style="width: 100%">
        <t-descriptions bordered :layout="'vertical'" :item-layout="'horizontal'" :column="2">
          <t-descriptions-item label="名称">{{ formData.name }}</t-descriptions-item>
          <t-descriptions-item label="类型">{{ formData.type }}</t-descriptions-item>
          <t-descriptions-item label="状态">{{ formData.status }}</t-descriptions-item>
          <t-descriptions-item label="地址">{{ formData.url }}</t-descriptions-item>
          <t-descriptions-item label="创建者">{{ formData.createByUserName }}</t-descriptions-item>
          <t-descriptions-item label="创建时间">{{ formData.createTime }}</t-descriptions-item>
          <t-descriptions-item label="更新时间">{{ formData.updateTime }}</t-descriptions-item>
          <t-descriptions-item label="更新者">{{ formData.updateByUserName }}</t-descriptions-item>
          <t-descriptions-item label="备注">{{ formData.description }}</t-descriptions-item>
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
          title: '空间名称',
          align: 'left',
          width: 120,
          ellipsis: true,
          colKey: 'spaceName',
          fixed: 'left',
        },
        {
          title: "类型",
          align: 'left',
          width: 80,
          ellipsis: true,
          colKey: 'type',
        },
        {
          title: '状态',
          width: 80,
          ellipsis: true,
          colKey: 'spaceStatus',
        },
        {
          title: 'url地址',
          width: 120,
          ellipsis: true,
          colKey: 'spaceUrl',
        },
        {
          title: '描述',
          width: 160,
          ellipsis: true,
          colKey: 'description',
        },
        {
          title: '创建时间',
          width: 120,
          ellipsis: true,
          colKey: 'createTime',
        },
        {
          title: '更新时间',
          width: 120,
          ellipsis: true,
          colKey: 'updateTime',
        },
        {
          align: 'left',
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
      // 搜索框
      searchForm: {
        name: "",
        type: "",
        pageNum: 1,
        pageSize: 10
      },
      formData: {
        name: "",
        url: "",
        type: "",
        status: "",
        createByUserName: '',
        updateByUserName: '',
        createTime: '',
        updateTime: '',
        description: "",
      },
      // 对话框
      confirm: {
        header: "",
        body: "",
        operation: "update",
        visible: false
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
      gitRepoTypeList: []
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
    getRepoList() {
      this.dataLoading = true;
      this.$request.get('/git/repo/page', {
        params: {
          type: this.dialog.type,
          name: this.dialog.name
        }
      }).then((res) => {
        if (res.data.code === 200) {
          console.log("repos", res.data.rows)
          this.gitRepoList = res.data.rows;
          this.dialog.total = res.data.total;
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
    },
    getRepoTypeList() {
      this.$request.get('/git/common/types').then((res) => {
        if (res.data.code === 200) {
          console.log("types", res.data.data)
          this.gitRepoTypeList = res.data.data;
        }
      })
    },
    getContainer() {
      return document.querySelector('.tdesign-starter-layout');
    },
    // 导入仓库
    importRepo(row) {
      this.$request.post('/git/repo/import?type=' + this.dialog.type,
        {
          id: row.id,
          name: row.name,
          type: this.dialog.type,
          gitUrl: row.hasOwnProperty("git_url") ? row.git_url : row.html_url,
          language: row.language,
          description: row.description,
          status: row.status,
          htmlUrl: row.html_url,
          sshUrl: row.ssh_url,
          fullName: row.full_name,
          humanName: row.human_name,
        }
      ).then((res) => {
        if (res.data.code === 200) {
          this.$message.success(res.data.msg)
          this.getList()
        }
      })
    },
    onPageSizeChange(size, pageInfo) {
      console.log('Page Size:', this.pageSize, size, pageInfo);
      // 刷新
      this.formData.pageSize = size
      this.getList()
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
    handleClickIde(row) {
      this.formData = row;
      const newWindow = window.open('about:blank', '_blank');
      newWindow.location.href = row.spaceUrl;
    },
    handleClickDetail(row) {
      this.formData = row;
      this.drawer.operation = 'detail';
      this.drawer.header = row.name
      this.drawer.visible = true;
    },
    // 点击导入
    handleSetupContract() {
      this.drawer.operation = 'add'
      this.drawer.title = '添加仓库'
      this.drawer.visible = true
      this.getRepoTypeList()
    },
    // 点击删除
    handleClickDelete(row) {
      this.formData = row;
      this.confirm.visible = true;
    },
    handleClickEdit(row) {
      this.drawer.operation = 'edit'
      this.formData = row;
      this.drawer.title = row.name
      this.drawer.visible = true
    },
    handleClickSuccess() {
      this.$router.push('/build/success');
    },
    // 确认删除
    onConfirmOk() {
      switch (this.confirm.operation) {
        case "delete":
          // 真实业务请发起请求
          this.$request.delete("/git/codespace/delete?id=" + this.formData.id).then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg)
              this.confirm.visible = false;
              this.getList();
            }else {
              this.$message.error(res.data.msg)
            }
          })
          break;
      }
    },
    // 确认对话框
    onConfirmDialog() {

    },
    // 确定关闭对话框
    onCloseDialogBtnClick() {

    },
    // 确认抽屉
    handleDrawerOk() {
      switch (this.drawer.operation) {
        case 'add':
          this.$request.post('/git/codespace/add', this.formData).then((res) => {
            if (res.data.code === 200) {
              console.log(res.data.data);
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((err) => {

          }).finally(() => {
            this.page();
            this.dataLoading = false;
          })
          break;
        case 'edit':
          this.$request.put('/git/codespace/edit', this.formData).then((res) => {
            if (res.data.code === 200) {
              console.log(res.data.data);
              this.$message.success(res.data.msg);
              this.drawer.visible = false;
            } else {
              this.$message.error(res.data.msg);
            }
          }).catch((err) => {

          }).finally(() => {
            this.page();
            this.dataLoading = false;
          })
          break;
        case 'detail':
          break;
      }
    },
    // 取消删除
    onCancel() {
      this.confirm.visible = false;
      this.dataLoading = false;
      this.$message.info("取消删除！");
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
    resetIdx() {
      this.deleteIdx = -1;
    },
    onReset(data) {
      this.searchForm = {}
    },
    onSubmit(data) {
      this.page();
    },
    page() {
      this.dataLoading = true;
      this.$request.get('/git/codeSpace/page', {
        params: this.searchForm
      }).then((res) => {
        if (res.data.code === 200) {
          this.data = res.data.rows;
          this.pagination = {
            ...this.pagination,
            total: res.data.total,
          };
        }
      }).catch((e: Error) => {
        console.log(e);
      }).finally(() => {
        this.dataLoading = false;
      });
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
