import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createFollowUp,
  formatValidationError,
  getProject,
  listProjects,
  updateProject,
} from '../api'
import ProjectForm, { valuesToPayload } from '../components/ProjectForm'
import {
  CHANNEL_OPTIONS,
  DEAL_OPTIONS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  STAGE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function nextFollowClass(dateStr) {
  if (!dateStr) return 'next-follow-chip next-follow-chip--muted'
  const today = todayStr()
  if (dateStr < today) return 'next-follow-chip next-follow-chip--overdue'
  if (dateStr === today) return 'next-follow-chip next-follow-chip--today'
  return 'next-follow-chip next-follow-chip--upcoming'
}

export default function ProjectListPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    stage: undefined,
    is_deal: undefined,
    status: undefined,
  })
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editInitial, setEditInitial] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [patchingId, setPatchingId] = useState(null)
  const [parentOptions, setParentOptions] = useState([])
  const [form] = Form.useForm()
  const [followOpen, setFollowOpen] = useState(false)
  const [followTarget, setFollowTarget] = useState(null)
  const [savingFollow, setSavingFollow] = useState(false)
  const [followForm] = Form.useForm()

  const load = async ({
    filters: nextFilters = filters,
    page: nextPage = page,
    pageSize: nextPageSize = pageSize,
  } = {}) => {
    setLoading(true)
    try {
      const params = {
        ...nextFilters,
        page: nextPage,
        per_page: nextPageSize,
      }
      const res = await listProjects(params)
      setRows(res.data || [])
      setTotal(res.meta?.total ?? 0)
      setPage(res.meta?.current_page ?? nextPage)
      setPageSize(res.meta?.per_page ?? nextPageSize)
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    listProjects()
      .then((res) =>
        setParentOptions(
          (res.data || []).map((p) => ({
            value: p.id,
            label: p.name,
          })),
        ),
      )
      .catch((err) => message.error(formatValidationError(err)))
    // 仅首屏加载；筛选走 onValuesChange
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openEdit = async (record) => {
    setEditing(record)
    setEditInitial(null)
    setEditOpen(true)
    setEditLoading(true)
    form.resetFields()
    try {
      const res = await getProject(record.id)
      setEditInitial(res.data)
      form.setFieldsValue(res.data)
    } catch (err) {
      message.error(formatValidationError(err))
      setEditOpen(false)
      setEditing(null)
    } finally {
      setEditLoading(false)
    }
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditing(null)
    setEditInitial(null)
    form.resetFields()
  }

  const onSaveEdit = async () => {
    if (!editing) return
    try {
      const values = await form.validateFields()
      setSaving(true)
      await updateProject(editing.id, valuesToPayload(values))
      message.success('已保存')
      closeEdit()
      await load()
    } catch (err) {
      if (err?.errorFields) {
        return
      }
      message.error(formatValidationError(err))
    } finally {
      setSaving(false)
    }
  }

  const openFollowModal = (record) => {
    setFollowTarget(record)
    followForm.setFieldsValue({
      occurred_at: dayjs(),
      channel: 'talk',
      content: undefined,
      next_follow_up_at: record.next_follow_up_at
        ? dayjs(record.next_follow_up_at)
        : null,
      stage: record.stage,
      is_deal: record.is_deal || 'no',
      status: record.status || 'normal',
      expected_amount:
        record.expected_amount === null || record.expected_amount === undefined
          ? undefined
          : Number(record.expected_amount),
      deal_amount:
        record.deal_amount === null || record.deal_amount === undefined
          ? undefined
          : Number(record.deal_amount),
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
      await load()
    } catch (err) {
      if (err?.errorFields) return
      message.error(formatValidationError(err))
    } finally {
      setSavingFollow(false)
    }
  }

  const patchRow = async (record, payload) => {
    const key = Object.keys(payload)[0]
    const nextValue = payload[key]
    const prevValue = record[key] ?? null
    if (nextValue === prevValue || (nextValue == null && prevValue == null)) {
      return
    }
    setPatchingId(record.id)
    try {
      const res = await updateProject(record.id, payload)
      setRows((prev) =>
        prev.map((row) => (row.id === record.id ? { ...row, ...res.data } : row)),
      )
    } catch (err) {
      message.error(formatValidationError(err))
      await load()
    } finally {
      setPatchingId(null)
    }
  }

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 180,
      render: (text, record) => (
        <Link className="project-name-link" to={`/projects/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: '客户',
      dataIndex: 'customer_name',
      width: 140,
      render: (value, record) => (
        <Input
          size="small"
          className="project-inline-input"
          defaultValue={value}
          key={`${record.id}-customer-${value}`}
          disabled={patchingId === record.id}
          onBlur={(e) => {
            const next = e.target.value.trim()
            if (!next) {
              message.error('客户名称不能为空')
              e.target.value = value
              return
            }
            patchRow(record, { customer_name: next })
          }}
          onPressEnter={(e) => e.currentTarget.blur()}
        />
      ),
    },
    {
      title: '源项目',
      dataIndex: 'parent_project_name',
      ellipsis: true,
      width: 140,
      render: (text, record) =>
        record.parent_project_id ? (
          <Link to={`/projects/${record.parent_project_id}`}>
            {text || `#${record.parent_project_id}`}
          </Link>
        ) : (
          '—'
        ),
    },
    {
      title: '开始日',
      dataIndex: 'start_date',
      width: 110,
      align: 'right',
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      width: 128,
      render: (value, record) => (
        <Select
          size="small"
          className="project-inline-select"
          value={value}
          options={STAGE_OPTIONS}
          disabled={patchingId === record.id}
          onChange={(next) => patchRow(record, { stage: next })}
          popupMatchSelectWidth={false}
        />
      ),
    },
    {
      title: '是否成交',
      dataIndex: 'is_deal',
      width: 108,
      render: (value, record) => (
        <Select
          size="small"
          className="project-inline-select"
          value={value}
          options={DEAL_OPTIONS}
          disabled={patchingId === record.id}
          onChange={(next) => patchRow(record, { is_deal: next })}
          popupMatchSelectWidth={false}
        />
      ),
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      width: 136,
      render: (value, record) => (
        <Select
          size="small"
          className="project-inline-select"
          value={value}
          options={STATUS_OPTIONS}
          disabled={patchingId === record.id}
          onChange={(next) => patchRow(record, { status: next })}
          popupMatchSelectWidth={false}
        />
      ),
    },
    {
      title: '下次跟进',
      dataIndex: 'next_follow_up_at',
      width: 148,
      render: (value, record) => (
        <DatePicker
          size="small"
          allowClear
          className={`project-inline-date ${nextFollowClass(value)}`}
          value={value ? dayjs(value) : null}
          disabled={patchingId === record.id}
          onChange={(date) =>
            patchRow(record, {
              next_follow_up_at: date ? date.format('YYYY-MM-DD') : null,
            })
          }
        />
      ),
    },
    {
      title: '操作',
      width: 148,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Button type="link" onClick={() => openFollowModal(record)}>
            记跟进
          </Button>
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="project-list-page">
      <div className="page-header">
        <div className="page-header-text">
          <div className="page-header-title-row">
            <Typography.Title level={3}>项目</Typography.Title>
            <span className="page-count-badge">
              {loading ? '…' : `共 ${total} 个`}
            </span>
          </div>
          <div className="page-header-sub">阶段 / 成交 / 状态可筛</div>
        </div>
        <Button type="primary" onClick={() => navigate('/projects/new')}>
          新建项目
        </Button>
      </div>

      <div className="filter-toolbar">
        <Form
          layout="inline"
          initialValues={filters}
          onValuesChange={(_, all) => {
            setFilters(all)
            load({ filters: all, page: 1 })
          }}
        >
          <Form.Item name="stage" label="阶段">
            <Select
              allowClear
              placeholder="全部"
              style={{ width: 140 }}
              options={STAGE_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="is_deal" label="是否成交">
            <Select
              allowClear
              placeholder="全部"
              style={{ width: 120 }}
              options={DEAL_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              allowClear
              placeholder="全部"
              style={{ width: 140 }}
              options={STATUS_OPTIONS}
            />
          </Form.Item>
        </Form>
      </div>

      <div className="project-table-wrap">
        <Table
          rowKey="id"
          size="middle"
          loading={loading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 1400 }}
          locale={{ emptyText: <Empty description="暂无项目" /> }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
            showTotal: (count) => `共 ${count} 条`,
            onChange: (nextPage, nextSize) => {
              load({ page: nextPage, pageSize: nextSize })
            },
          }}
        />
      </div>

      <Modal
        title={editing ? `编辑项目 · ${editing.name}` : '编辑项目'}
        open={editOpen}
        onCancel={closeEdit}
        onOk={onSaveEdit}
        confirmLoading={saving}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
        width={640}
      >
        <Spin spinning={editLoading}>
          {editInitial ? (
            <ProjectForm
              form={form}
              initialValues={editInitial}
              parentOptions={parentOptions}
              excludeProjectId={editing?.id}
            />
          ) : (
            <div style={{ minHeight: 120 }} />
          )}
        </Spin>
      </Modal>

      <Modal
        title={
          followTarget ? `记跟进 · ${followTarget.name}` : '记跟进'
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
    </div>
  )
}
