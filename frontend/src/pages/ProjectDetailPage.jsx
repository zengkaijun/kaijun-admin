import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  createFollowUp,
  formatValidationError,
  getProject,
  listFollowUps,
} from '../api'
import {
  CHANNEL_LABEL,
  CHANNEL_OPTIONS,
  DEAL_COLOR,
  DEAL_LABEL,
  STAGE_LABEL,
  STAGE_OPTIONS,
  STAGE_TAG_STYLE,
  STATUS_COLOR,
  STATUS_LABEL,
} from '../constants'

function todayStr() {
  return dayjs().format('YYYY-MM-DD')
}

function followTone(dateStr) {
  if (!dateStr) return 'muted'
  const today = todayStr()
  if (dateStr < today) return 'overdue'
  if (dateStr === today) return 'today'
  return 'upcoming'
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingFollow, setSavingFollow] = useState(false)
  const [form] = Form.useForm()

  const loadAll = async () => {
    const [projectRes, followRes] = await Promise.all([
      getProject(id),
      listFollowUps(id),
    ])
    setProject(projectRes.data)
    setFollowUps(followRes.data || [])
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    loadAll()
      .catch((err) => {
        message.error(formatValidationError(err))
        navigate('/projects', { replace: true })
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate])

  const onSaveFollow = async (values) => {
    setSavingFollow(true)
    try {
      const payload = {
        occurred_at: values.occurred_at.format('YYYY-MM-DD HH:mm:ss'),
        channel: values.channel,
        content: values.content,
        next_follow_up_at: values.next_follow_up_at
          ? values.next_follow_up_at.format('YYYY-MM-DD')
          : null,
        stage_after: values.stage_after || null,
      }
      const res = await createFollowUp(id, payload)
      if (res.project) {
        setProject(res.project)
      }
      setFollowUps((prev) => [res.data, ...prev])
      form.resetFields(['content', 'next_follow_up_at', 'stage_after'])
      form.setFieldsValue({
        occurred_at: dayjs(),
        channel: 'talk',
      })
      message.success('已记录跟进')
    } catch (err) {
      message.error(formatValidationError(err))
    } finally {
      setSavingFollow(false)
    }
  }

  if (loading || !project) {
    return <Typography.Text type="secondary">加载中…</Typography.Text>
  }

  const nextTone = followTone(project.next_follow_up_at)

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <div className="page-header">
        <Typography.Title level={3}>{project.name}</Typography.Title>
        <Space>
          <Button onClick={() => navigate('/projects')}>返回列表</Button>
          <Button type="primary" onClick={() => navigate(`/projects/${id}/edit`)}>
            编辑
          </Button>
        </Space>
      </div>

      <Card>
        <div className="project-status-tags project-status-tags--lg">
          <Tag style={STAGE_TAG_STYLE}>
            {STAGE_LABEL[project.stage] || project.stage}
          </Tag>
          <Tag style={DEAL_COLOR[project.is_deal]}>
            {DEAL_LABEL[project.is_deal] || project.is_deal}
          </Tag>
          <Tag style={STATUS_COLOR[project.status]}>
            {STATUS_LABEL[project.status] || project.status}
          </Tag>
          <span className={`next-follow-chip next-follow-chip--${nextTone}`}>
            下次跟进{' '}
            {project.next_follow_up_at || '未约'}
          </span>
        </div>

        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="客户">
            {project.customer_name}
          </Descriptions.Item>
          <Descriptions.Item label="开始日">
            {project.start_date}
          </Descriptions.Item>
          <Descriptions.Item label="预计金额">
            {project.expected_amount ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="成交金额">
            {project.deal_amount ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="关联源项目">
            {project.parent_project_id ? (
              <Link to={`/projects/${project.parent_project_id}`}>
                {project.parent_project_name || `#${project.parent_project_id}`}
              </Link>
            ) : (
              '—'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="升级项目">
            {(project.upgrade_projects || []).length === 0 ? (
              '—'
            ) : (
              <Space direction="vertical" size={4}>
                {project.upgrade_projects.map((child) => (
                  <Link key={child.id} to={`/projects/${child.id}`}>
                    {child.name}
                  </Link>
                ))}
              </Space>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="跟进时间线">
            {followUps.length === 0 ? (
              <Typography.Text type="secondary">暂无跟进记录</Typography.Text>
            ) : (
              <Timeline
                items={followUps.map((item) => ({
                  key: item.id,
                  children: (
                    <div className="follow-timeline-item">
                      <div className="follow-timeline-meta">
                        <strong>
                          {(item.occurred_at || '').slice(0, 10)}
                        </strong>
                        <Tag>{CHANNEL_LABEL[item.channel] || item.channel}</Tag>
                        {item.next_follow_up_at && (
                          <span
                            className={`next-follow-chip next-follow-chip--${followTone(item.next_follow_up_at)}`}
                          >
                            下次 {item.next_follow_up_at}
                          </span>
                        )}
                      </div>
                      <div className="follow-timeline-content">
                        {item.content?.trim()
                          ? item.content
                          : '（无跟进内容）'}
                      </div>
                      {(item.stage_after || item.status_after) && (
                        <div className="follow-timeline-after">
                          {item.stage_after && (
                            <span>
                              阶段→{STAGE_LABEL[item.stage_after] || item.stage_after}
                            </span>
                          )}
                          {item.status_after && (
                            <span>
                              状态→{STATUS_LABEL[item.status_after] || item.status_after}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="记跟进">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                occurred_at: dayjs(),
                channel: 'talk',
              }}
              onFinish={onSaveFollow}
            >
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
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="stage_after" label="推进阶段（可选）">
                <Select allowClear options={STAGE_OPTIONS} placeholder="不变更" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={savingFollow} block>
                保存跟进
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
