import { Button, Card, Form, Space, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createProject,
  formatValidationError,
  getProject,
  listProjects,
  updateProject,
} from '../api'
import ProjectForm, { valuesToPayload } from '../components/ProjectForm'

export default function ProjectFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)
  const [initialValues, setInitialValues] = useState(null)
  const [parentOptions, setParentOptions] = useState([])

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      try {
        const listRes = await listProjects()
        if (cancelled) return
        setParentOptions(
          (listRes.data || []).map((p) => ({
            value: p.id,
            label: p.name,
          })),
        )

        if (isEdit) {
          const res = await getProject(id)
          if (cancelled) return
          setInitialValues(res.data)
          form.setFieldsValue(res.data)
        }
      } catch (err) {
        message.error(formatValidationError(err))
        if (isEdit) {
          navigate('/projects', { replace: true })
        }
      } finally {
        if (!cancelled) {
          setBooting(false)
        }
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [form, id, isEdit, navigate])

  const onSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      const payload = valuesToPayload(values)
      if (isEdit) {
        await updateProject(id, payload)
        message.success('已保存')
        navigate(`/projects/${id}`, { replace: true })
      } else {
        const res = await createProject(payload)
        message.success('已创建')
        navigate(`/projects/${res.data.id}`, { replace: true })
      }
    } catch (err) {
      if (err?.errorFields) {
        return
      }
      message.error(formatValidationError(err))
    } finally {
      setLoading(false)
    }
  }

  if (booting) {
    return <Typography.Text type="secondary">加载中…</Typography.Text>
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div className="page-header">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {isEdit ? '编辑项目' : '新建项目'}
        </Typography.Title>
        <Button onClick={() => navigate(-1)}>返回</Button>
      </div>
      <Card style={{ maxWidth: 640 }}>
        <ProjectForm
          form={form}
          initialValues={initialValues || undefined}
          parentOptions={parentOptions}
          excludeProjectId={isEdit ? id : null}
        />
        <Space>
          <Button type="primary" loading={loading} onClick={onSubmit}>
            保存
          </Button>
          <Button onClick={() => navigate('/projects')}>取消</Button>
        </Space>
      </Card>
    </Space>
  )
}
