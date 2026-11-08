import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createWorkItem,
  deleteWorkItem,
  formatValidationError,
  listProjects,
  listWorkItems,
  updateWorkItem,
} from '../api'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  WORK_STATUS_COLOR,
  WORK_STATUS_LABEL,
  WORK_STATUS_OPTIONS,
  WORK_TYPE_COLOR,
  WORK_TYPE_LABEL,
  WORK_TYPE_OPTIONS,
} from '../constants'

function todayStr() {
  return dayjs().format('YYYY-MM-DD')
}

export default function WorkItemListPage() {
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [total, setTotal] = useState(0)
  const [projects, setProjects] = useState([])
  const [filters, setFilters] = useState({
    status: undefined,
    project_id: undefined,
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const load = async ({
    filters: nextFilters = filters,
    page: nextPage = page,
    pageSize: nextPageSize = pageSize,
  } = {}) => {
    setLoading(true)
    try {
      const res = await listWorkItems({
        ...nextFilters,
        page: nextPage,
        per_page: nextPageSize,
      })
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
      .then((res) => setProjects(res.data || []))
      .catch((err) => message.error(formatValidationError(err)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({
      type: 'task',
      status: 'todo',
    })
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({
      title: record.title,
      type: record.type,
      status: record.status,
      due_date: record.due_date ? dayjs(record.due_date) : null,
      project_id: record.project_id ?? undefined,
    })
    setModalOpen(true)
  }

  const onSave = async (values) => {
    setSaving(true)
    try {
      const payload = {
        title: values.title,
        type: values.type,
        status: values.status,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        project_id: values.project_id ?? null,
      }
      if (editing) {
        await updateWorkItem(editing.id, payload)
        message.success('已更新')
      } else {
        await createWorkItem(payload)
        message.success('已创建')
      }
      setModalOpen(false)
      form.resetFields()
      await load()
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setSaving(false)
    }
  }

  const onComplete = async (record) => {
    try {
      await updateWorkItem(record.id, { status: 'done' })
      message.success('已完成')
      await load()
    } catch (err) {
      message.error(formatValidationError(err))
    }
  }

  const onDelete = (record) => {
    Modal.confirm({
      title: '删除工作项？',
      content: record.title,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteWorkItem(record.id)
          message.success('已删除')
          await load()
        } catch (err) {
          message.error(formatValidationError(err))
        }
      },
    })
  }

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }))

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
      width: 240,
      render: (text, record) => (
        <span className={record.status === 'done' ? 'work-title--done' : undefined}>
          {text}
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (value) => (
        <Tag style={WORK_TYPE_COLOR[value]}>
          {WORK_TYPE_LABEL[value] || value}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 104,
      render: (value) => (
        <Tag style={WORK_STATUS_COLOR[value]}>
          {WORK_STATUS_LABEL[value] || value}
        </Tag>
      ),
    },
    {
      title: '截止日',
      dataIndex: 'due_date',
      width: 128,
      render: (value, record) => {
        if (!value) return '—'
        const overdue = record.overdue || (record.status !== 'done' && value < todayStr())
        return (
          <span className={overdue ? 'work-due--overdue' : undefined}>
            {value}
            {overdue ? ' · 过期' : ''}
          </span>
        )
      },
    },
    {
      title: '关联项目',
      dataIndex: 'project_name',
      ellipsis: true,
      width: 180,
      render: (text, record) =>
        record.project_id ? (
          <Link to={`/projects/${record.project_id}`}>{text || `#${record.project_id}`}</Link>
        ) : (
          <Typography.Text type="secondary">独立</Typography.Text>
        ),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          {record.status !== 'done' && (
            <Button type="link" onClick={() => onComplete(record)}>
              完成
            </Button>
          )}
          <Button type="link" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Button type="link" danger onClick={() => onDelete(record)}>
            删除
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
            <Typography.Title level={3}>工作项</Typography.Title>
            <span className="page-count-badge">
              {loading ? '…' : `共 ${total} 个`}
            </span>
          </div>
          <div className="page-header-sub">可挂项目，也可独立；按状态 / 项目筛选</div>
        </div>
        <Button type="primary" onClick={openCreate}>
          新建工作项
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
          <Form.Item name="status" label="状态">
            <Select
              allowClear
              placeholder="全部"
              style={{ width: 140 }}
              options={WORK_STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="project_id" label="项目">
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="全部"
              style={{ width: 220 }}
              options={projectOptions}
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
          scroll={{ x: 960 }}
          locale={{ emptyText: <Empty description="暂无工作项" /> }}
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
        title={editing ? '编辑工作项' : '新建工作项'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={saving}
        destroyOnHidden
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={onSave}>
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
    </div>
  )
}
