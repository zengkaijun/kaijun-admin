import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  List,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createFollowUp,
  createWorkItem,
  fetchSummary,
  formatValidationError,
  listProjects,
  reorderSummary,
  updateProject,
  updateWorkItem,
} from '../api'
import {
  CHANNEL_OPTIONS,
  DEAL_OPTIONS,
  PRIORITY_OPTIONS,
  STAGE_LABEL,
  STAGE_OPTIONS,
  STAGE_TAG_STYLE,
  STATUS_COLOR,
  STATUS_LABEL,
  STATUS_OPTIONS,
  WORK_STATUS_COLOR,
  WORK_STATUS_LABEL,
  WORK_STATUS_OPTIONS,
  WORK_TYPE_OPTIONS,
} from '../constants'

function moveItem(list, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list
  }
  const next = [...list]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export default function HomePage({ user }) {
  const [loading, setLoading] = useState(true)
  const [dueFollowUps, setDueFollowUps] = useState([])
  const [openWorkItems, setOpenWorkItems] = useState([])
  const [projects, setProjects] = useState([])
  const [dragState, setDragState] = useState(null)
  const [savingPriorityId, setSavingPriorityId] = useState(null)

  const [followOpen, setFollowOpen] = useState(false)
  const [followTarget, setFollowTarget] = useState(null)
  const [savingFollow, setSavingFollow] = useState(false)
  const [followForm] = Form.useForm()

  const [workOpen, setWorkOpen] = useState(false)
  const [savingWork, setSavingWork] = useState(false)
  const [completingId, setCompletingId] = useState(null)
  const [workForm] = Form.useForm()

  const loadSummary = async () => {
    setLoading(true)
    try {
      const res = await fetchSummary()
      setDueFollowUps(res.due_follow_ups || [])
      setOpenWorkItems(res.open_work_items || [])
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchSummary(), listProjects()])
      .then(([summaryRes, projectRes]) => {
        if (cancelled) return
        setDueFollowUps(summaryRes.due_follow_ups || [])
        setOpenWorkItems(summaryRes.open_work_items || [])
        setProjects(projectRes.data || [])
      })
      .catch((err) => {
        if (!cancelled) {
          message.error(formatValidationError(err))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const persistOrder = async (listKey, nextItems, rollback) => {
    try {
      await reorderSummary(
        listKey,
        nextItems.map((item) => item.id),
      )
    } catch (err) {
      rollback()
      message.error(formatValidationError(err))
    }
  }

  const onDropReorder = (listKey, toIndex) => {
    if (!dragState || dragState.listKey !== listKey) {
      setDragState(null)
      return
    }
    const fromIndex = dragState.index
    setDragState(null)
    if (fromIndex === toIndex) return

    if (listKey === 'due_follow_ups') {
      const prev = dueFollowUps
      const next = moveItem(prev, fromIndex, toIndex)
      setDueFollowUps(next)
      persistOrder(listKey, next, () => setDueFollowUps(prev))
      return
    }

    const prev = openWorkItems
    const next = moveItem(prev, fromIndex, toIndex)
    setOpenWorkItems(next)
    persistOrder(listKey, next, () => setOpenWorkItems(prev))
  }

  const onChangeDuePriority = async (item, priority) => {
    if (priority === item.priority) return
    setSavingPriorityId(`project-${item.id}`)
    try {
      await updateProject(item.id, { priority })
      setDueFollowUps((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, priority } : row)),
      )
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setSavingPriorityId(null)
    }
  }

  const onChangeWorkPriority = async (item, priority) => {
    if (priority === item.priority) return
    setSavingPriorityId(`work-${item.id}`)
    try {
      await updateWorkItem(item.id, { priority })
      setOpenWorkItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, priority } : row)),
      )
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setSavingPriorityId(null)
    }
  }

  const openFollowModal = (item) => {
    setFollowTarget(item)
    followForm.setFieldsValue({
      occurred_at: dayjs(),
      channel: 'talk',
      content: undefined,
      next_follow_up_at: item.next_follow_up_at
        ? dayjs(item.next_follow_up_at)
        : null,
      stage: item.stage,
      is_deal: item.is_deal || 'no',
      status: item.status || 'normal',
      expected_amount:
        item.expected_amount === null || item.expected_amount === undefined
          ? undefined
          : Number(item.expected_amount),
      deal_amount:
        item.deal_amount === null || item.deal_amount === undefined
          ? undefined
          : Number(item.deal_amount),
    })
    setFollowOpen(true)
  }

  const closeFollowModal = () => {
    setFollowOpen(false)
    setFollowTarget(null)
    followForm.resetFields()
  }

  const onSaveFollow = async () => {
    if (!followTarget) return
    try {
      const values = await followForm.validateFields()
      setSavingFollow(true)
      await createFollowUp(followTarget.id, {
        occurred_at: values.occurred_at.format('YYYY-MM-DD HH:mm:ss'),
        channel: values.channel,
        content: values.content,
        next_follow_up_at: values.next_follow_up_at
          ? values.next_follow_up_at.format('YYYY-MM-DD')
          : null,
        stage_after: values.stage || null,
        status_after: values.status || null,
      })
      const projectPatch = {
        expected_amount: values.expected_amount ?? null,
        deal_amount: values.deal_amount ?? null,
      }
      if (values.is_deal && values.is_deal !== followTarget.is_deal) {
        projectPatch.is_deal = values.is_deal
      }
      await updateProject(followTarget.id, projectPatch)
      message.success('已记录跟进')
      closeFollowModal()
      await loadSummary()
    } catch (err) {
      if (err?.errorFields) return
      message.error(formatValidationError(err))
    } finally {
      setSavingFollow(false)
    }
  }

  const openCreateWork = () => {
    workForm.resetFields()
    workForm.setFieldsValue({
      type: 'task',
      status: 'todo',
      priority: 'normal',
    })
    setWorkOpen(true)
  }

  const onSaveWork = async () => {
    try {
      const values = await workForm.validateFields()
      setSavingWork(true)
      await createWorkItem({
        title: values.title,
        type: values.type,
        status: values.status,
        priority: values.priority || 'normal',
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        project_id: values.project_id ?? null,
      })
      message.success('已创建工作项')
      setWorkOpen(false)
      workForm.resetFields()
      await loadSummary()
    } catch (err) {
      if (err?.errorFields) return
      message.error(formatValidationError(err))
    } finally {
      setSavingWork(false)
    }
  }

  const onCompleteWork = async (item) => {
    setCompletingId(item.id)
    try {
      await updateWorkItem(item.id, { status: 'done' })
      message.success('已完成')
      setOpenWorkItems((prev) => prev.filter((row) => row.id !== item.id))
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setCompletingId(null)
    }
  }

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }))

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div className="page-header">
        <div className="page-header-text">
          <div className="page-header-title-row">
            <Typography.Title level={3}>总览</Typography.Title>
          </div>
          <div className="page-header-sub">
            你好，{user?.name || user?.username} · 拖左侧手柄排序，可改优先级
          </div>
        </div>
        <Space>
          <Link to="/projects">项目</Link>
          <Link to="/work-items">工作项</Link>
        </Space>
      </div>

      <div className="dashboard-grid">
        <Card
          className="dashboard-card"
          title={
            <span>
              未成交跟进
              <span className="page-count-badge" style={{ marginLeft: 8 }}>
                {loading ? '…' : `${dueFollowUps.length} 个`}
              </span>
            </span>
          }
        >
          <List
            loading={loading}
            locale={{ emptyText: <Empty description="暂无未成交跟进" /> }}
            dataSource={dueFollowUps}
            renderItem={(item, index) => (
              <List.Item
                className={`dashboard-list-item${
                  dragState?.listKey === 'due_follow_ups' &&
                  dragState.index === index
                    ? ' is-dragging'
                    : ''
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropReorder('due_follow_ups', index)}
              >
                <span
                  className="dashboard-drag-handle"
                  title="拖拽排序"
                  draggable
                  onDragStart={() =>
                    setDragState({ listKey: 'due_follow_ups', index })
                  }
                  onDragEnd={() => setDragState(null)}
                >
                  ⋮⋮
                </span>
                <Link
                  className="dashboard-item-link"
                  to={`/projects/${item.id}`}
                >
                  <div className="dashboard-item-main">
                    <span className="dashboard-item-title">{item.name}</span>
                    <span className="dashboard-item-sub">
                      {item.customer_name || '—'}
                    </span>
                  </div>
                </Link>
                <Space size={8} wrap className="dashboard-item-meta">
                  <Select
                    size="small"
                    className="dashboard-priority-select"
                    value={item.priority || 'normal'}
                    options={PRIORITY_OPTIONS}
                    disabled={savingPriorityId === `project-${item.id}`}
                    onChange={(value) => onChangeDuePriority(item, value)}
                    popupMatchSelectWidth={false}
                  />
                  <Tag style={STAGE_TAG_STYLE}>
                    {STAGE_LABEL[item.stage] || item.stage}
                  </Tag>
                  <Tag style={STATUS_COLOR[item.status]}>
                    {STATUS_LABEL[item.status] || item.status}
                  </Tag>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => openFollowModal(item)}
                  >
                    记跟进
                  </Button>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        <Card
          className="dashboard-card"
          title={
            <span>
              未完成工作项
              <span className="page-count-badge" style={{ marginLeft: 8 }}>
                {loading ? '…' : `${openWorkItems.length} 个`}
              </span>
            </span>
          }
          extra={
            <Button type="primary" size="small" onClick={openCreateWork}>
              新建工作项
            </Button>
          }
        >
          <List
            loading={loading}
            locale={{ emptyText: <Empty description="暂无未完成工作项" /> }}
            dataSource={openWorkItems}
            renderItem={(item, index) => (
              <List.Item
                className={`dashboard-list-item${
                  dragState?.listKey === 'open_work_items' &&
                  dragState.index === index
                    ? ' is-dragging'
                    : ''
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDropReorder('open_work_items', index)}
              >
                <span
                  className="dashboard-drag-handle"
                  title="拖拽排序"
                  draggable
                  onDragStart={() =>
                    setDragState({ listKey: 'open_work_items', index })
                  }
                  onDragEnd={() => setDragState(null)}
                >
                  ⋮⋮
                </span>
                <Link className="dashboard-item-link" to="/work-items">
                  <div className="dashboard-item-main">
                    <span className="dashboard-item-title">{item.title}</span>
                    <span className="dashboard-item-sub">
                      {item.project_name
                        ? `项目：${item.project_name}`
                        : '独立杂事'}
                    </span>
                  </div>
                </Link>
                <Space size={8} wrap className="dashboard-item-meta">
                  <Select
                    size="small"
                    className="dashboard-priority-select"
                    value={item.priority || 'normal'}
                    options={PRIORITY_OPTIONS}
                    disabled={savingPriorityId === `work-${item.id}`}
                    onChange={(value) => onChangeWorkPriority(item, value)}
                    popupMatchSelectWidth={false}
                  />
                  <Tag style={WORK_STATUS_COLOR[item.status]}>
                    {WORK_STATUS_LABEL[item.status] || item.status}
                  </Tag>
                  {item.due_date ? (
                    <span
                      className={
                        item.overdue
                          ? 'work-due--overdue'
                          : 'dashboard-due-normal'
                      }
                    >
                      {item.due_date}
                      {item.overdue ? ' · 过期' : ''}
                    </span>
                  ) : (
                    <Typography.Text type="secondary">无截止</Typography.Text>
                  )}
                  <Button
                    type="link"
                    size="small"
                    loading={completingId === item.id}
                    onClick={() => onCompleteWork(item)}
                  >
                    完成
                  </Button>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </div>

      <Modal
        title={
          followTarget
            ? `记跟进 · ${followTarget.name}`
            : '记跟进'
        }
        open={followOpen}
        onCancel={closeFollowModal}
        onOk={onSaveFollow}
        confirmLoading={savingFollow}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
        width={560}
      >
        <Form form={followForm} layout="vertical">
          <Form.Item
            name="occurred_at"
            label="跟进时间"
            rules={[{ required: true, message: '请选择跟进时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="channel"
            label="方式"
            rules={[{ required: true, message: '请选择方式' }]}
          >
            <Select options={CHANNEL_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请填写跟进内容' }]}
          >
            <Input.TextArea rows={4} placeholder="沟通要点、客户反馈…" />
          </Form.Item>
          <Form.Item name="next_follow_up_at" label="下次跟进日">
            <DatePicker style={{ width: '100%' }} allowClear />
          </Form.Item>
          <Form.Item name="stage" label="阶段">
            <Select options={STAGE_OPTIONS} />
          </Form.Item>
          <Form.Item name="is_deal" label="是否成交">
            <Select options={DEAL_OPTIONS} />
          </Form.Item>
          <Form.Item name="expected_amount" label="预计金额">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="选填"
            />
          </Form.Item>
          <Form.Item name="deal_amount" label="成交金额">
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="选填"
            />
          </Form.Item>
          <Form.Item name="status" label="当前状态">
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建工作项"
        open={workOpen}
        onCancel={() => setWorkOpen(false)}
        onOk={onSaveWork}
        confirmLoading={savingWork}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
      >
        <Form form={workForm} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请填写标题' }]}
          >
            <Input placeholder="要做的事" maxLength={255} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={WORK_TYPE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={WORK_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <Select options={PRIORITY_OPTIONS} />
          </Form.Item>
          <Form.Item name="due_date" label="截止日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="project_id" label="关联项目">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="不挂项目（独立杂事）"
              options={projectOptions}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
