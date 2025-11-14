import { TdBaseTableProps } from 'tdesign-vue';

interface DashboardPanel {
  title: string;
  number: string | number;
  leftType: string;
  upTrend?: string;
  downTrend?: string;
}

interface TendItem {
  growUp?: number;
  productName: string;
  count: number;
  date: string;
}

export const PANE_LIST: Array<DashboardPanel> = [
  {
    title: 'xxx',
    number: '¥ xxx',
    upTrend: '20.5%',
    leftType: 'echarts-line',
  },
  {
    title: 'xxx',
    number: '¥ xxx',
    downTrend: '20.5%',
    leftType: 'echarts-bar',
  },
  {
    title: '活跃用户（个）',
    number: 'xxx',
    downTrend: '20.5%',
    leftType: 'icon-usergroup',
  },
  {
    title: '订单（个）',
    number: 'xxx',
    downTrend: '20.5%',
    leftType: 'icon-file-paste',
  },
];

export const SALE_TEND_LIST: Array<TendItem> = [
  {
    growUp: 1,
    productName: 'xxx',
    count: 7059,
    date: '2021-09-01',
  },
  {
    growUp: -1,
    productName: 'xxx',
    count: 6437,
    date: '2021-09-01',
  },
  {
    growUp: 4,
    productName: 'xxx',
    count: 4221,
    date: '2021-09-01',
  },
  {
    growUp: 3,
    productName: 'xxx',
    count: 3317,
    date: '2021-09-01',
  },
  {
    growUp: -3,
    productName: 'xxx',
    count: 3015,
    date: '2021-09-01',
  },
  {
    growUp: -3,
    productName: 'xxx',
    count: 2015,
    date: '2021-09-12',
  },
];

export const BUY_TEND_LIST: Array<TendItem> = [
  {
    growUp: 1,
    productName: 'xxx',
    count: 3015,
    date: '2021-09-01',
  },
  {
    growUp: -1,
    productName: 'xxx',
    count: 2015,
    date: '2021-09-01',
  },
  {
    growUp: 6,
    productName: 'xxx',
    count: 1815,
    date: '2021-09-11',
  },
  {
    growUp: -3,
    productName: 'xxx',
    count: 1015,
    date: '2021-09-21',
  },
  {
    growUp: -4,
    productName: 'xxx',
    count: 445,
    date: '2021-09-19',
  },
  {
    growUp: -3,
    productName: 'xxx',
    count: 2015,
    date: '2021-09-12',
  },
];

export const SALE_COLUMNS: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: 'xxx',
    width: 80,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    title: 'xxx',
    minWidth: 200,
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 100,
    title: 'xxx',
  },
  {
    align: 'center',
    colKey: 'count',
    title: 'xxx',
    width: 100,
  },
  {
    align: 'center',
    colKey: 'date',
    width: 140,
    title: 'xxx',
  },
  {
    align: 'center',
    colKey: 'operation',
    title: '操作',
    width: 80,
    fixed: 'right',
  },
];

export const BUY_COLUMNS: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: 'xx',
    width: 80,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    title: 'xxx',
    minWidth: 200,
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 100,
    title: 'xxx',
  },
  {
    align: 'center',
    colKey: 'count',
    title: 'xxx',
    width: 100,
  },
  {
    align: 'center',
    colKey: 'date',
    width: 140,
    title: 'xxx',
  },
  {
    align: 'center',
    colKey: 'operation',
    title: '操作',
    width: 80,
    fixed: 'right',
  },
];
