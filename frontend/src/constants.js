/** 列表分页可选条数 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 10

export const STAGE_OPTIONS = [
  { value: 'demand', label: '需求沟通' },
  { value: 'proposal', label: '发方案报价' },
  { value: 'development', label: '开发阶段' },
  { value: 'testing', label: '测试阶段' },
  { value: 'delivered', label: '已交付' },
]

export const DEAL_OPTIONS = [
  { value: 'no', label: '未成交' },
  { value: 'yes', label: '已成交' },
]

export const PRIORITY_OPTIONS = [
  { value: 'high', label: '高' },
  { value: 'normal', label: '中' },
  { value: 'low', label: '低' },
]

export const PRIORITY_LABEL = Object.fromEntries(
  PRIORITY_OPTIONS.map((item) => [item.value, item.label]),
)

export const PRIORITY_COLOR = {
  high: {
    color: '#FCA5A5',
    background: 'rgba(239, 68, 68, 0.16)',
    borderColor: 'transparent',
  },
  normal: {
    color: '#FCD34D',
    background: 'rgba(245, 158, 11, 0.16)',
    borderColor: 'transparent',
  },
  low: {
    color: '#D1D5DB',
    background: 'rgba(156, 163, 175, 0.16)',
    borderColor: 'transparent',
  },
}

export const STATUS_OPTIONS = [
  { value: 'normal', label: '正常' },
  { value: 'paused', label: '暂停' },
  { value: 'stopped', label: '停止' },
]

export const CHANNEL_OPTIONS = [
  { value: 'talk', label: '沟通' },
  { value: 'phone', label: '电话' },
  { value: 'wechat', label: '微信' },
  { value: 'quote', label: '报价' },
  { value: 'other', label: '其他' },
]

export const WORK_STATUS_OPTIONS = [
  { value: 'todo', label: '未做' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
]

export const WORK_TYPE_OPTIONS = [
  { value: 'task', label: '待办' },
  { value: 'milestone', label: '里程碑' },
]

export const WORK_STATUS_LABEL = Object.fromEntries(
  WORK_STATUS_OPTIONS.map((item) => [item.value, item.label]),
)
export const WORK_TYPE_LABEL = Object.fromEntries(
  WORK_TYPE_OPTIONS.map((item) => [item.value, item.label]),
)

export const WORK_STATUS_COLOR = {
  todo: {
    color: '#D1D5DB',
    background: 'rgba(156, 163, 175, 0.16)',
    borderColor: 'transparent',
  },
  doing: {
    color: '#93C5FD',
    background: 'rgba(59, 130, 246, 0.18)',
    borderColor: 'transparent',
  },
  done: {
    color: '#86EFAC',
    background: 'rgba(34, 197, 94, 0.16)',
    borderColor: 'transparent',
  },
}

export const WORK_TYPE_COLOR = {
  task: {
    color: '#D1D5DB',
    background: 'rgba(156, 163, 175, 0.16)',
    borderColor: 'transparent',
  },
  milestone: {
    color: '#FCD34D',
    background: 'rgba(245, 158, 11, 0.16)',
    borderColor: 'transparent',
  },
}

export const CHANNEL_LABEL = Object.fromEntries(
  CHANNEL_OPTIONS.map((item) => [item.value, item.label]),
)

/** 可执行成交/无法成交/暂停 */
export const ACTIONABLE_STATUSES = ['normal']

/** 可重新启动 */
export const RESTARTABLE_STATUSES = ['paused', 'stopped']

/** 记跟进时可选改状态 */
export const FOLLOW_STATUS_OPTIONS = STATUS_OPTIONS

export const STAGE_LABEL = Object.fromEntries(
  STAGE_OPTIONS.map((item) => [item.value, item.label]),
)
export const DEAL_LABEL = Object.fromEntries(
  DEAL_OPTIONS.map((item) => [item.value, item.label]),
)
export const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((item) => [item.value, item.label]),
)

/** 深色软 Tag：半透明底 + 浅字，阶段中性不抢状态色 */
export const STAGE_TAG_STYLE = {
  color: '#D1D5DB',
  background: 'rgba(156, 163, 175, 0.16)',
  borderColor: 'transparent',
}

export const STATUS_COLOR = {
  normal: {
    color: '#93C5FD',
    background: 'rgba(59, 130, 246, 0.18)',
    borderColor: 'transparent',
  },
  paused: {
    color: '#D1D5DB',
    background: 'rgba(156, 163, 175, 0.16)',
    borderColor: 'transparent',
  },
  stopped: {
    color: '#FCA5A5',
    background: 'rgba(185, 28, 28, 0.16)',
    borderColor: 'transparent',
  },
}

export const DEAL_COLOR = {
  no: {
    color: '#D1D5DB',
    background: 'rgba(156, 163, 175, 0.16)',
    borderColor: 'transparent',
  },
  yes: {
    color: '#86EFAC',
    background: 'rgba(34, 197, 94, 0.16)',
    borderColor: 'transparent',
  },
}
