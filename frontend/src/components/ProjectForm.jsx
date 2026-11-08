import { Form, Input, InputNumber, Select } from 'antd'
import { DEAL_OPTIONS, STAGE_OPTIONS, STATUS_OPTIONS } from '../constants'

export default function ProjectForm({
  form,
  initialValues,
  parentOptions = [],
  excludeProjectId = null,
}) {
  const values = {
    stage: 'demand',
    is_deal: 'no',
    status: 'normal',
    ...initialValues,
  }

  const options = parentOptions.filter(
    (item) => String(item.value) !== String(excludeProjectId),
  )

  return (
    <Form form={form} layout="vertical" initialValues={values} requiredMark>
      <Form.Item
        label="项目名称"
        name="name"
        rules={[{ required: true, message: '请填写项目名称' }]}
      >
        <Input placeholder="例如：某某公司官网改版" />
      </Form.Item>
      <Form.Item
        label="开始日期"
        name="start_date"
        rules={[{ required: true, message: '请选择开始日期' }]}
      >
        <Input type="date" />
      </Form.Item>
      <Form.Item
        label="客户名称"
        name="customer_name"
        rules={[{ required: true, message: '请填写客户名称' }]}
      >
        <Input placeholder="客户公司或联系人" />
      </Form.Item>
      <Form.Item label="阶段" name="stage">
        <Select options={STAGE_OPTIONS} />
      </Form.Item>
      <Form.Item label="是否成交" name="is_deal">
        <Select options={DEAL_OPTIONS} />
      </Form.Item>
      <Form.Item label="当前状态" name="status">
        <Select options={STATUS_OPTIONS} />
      </Form.Item>
      <Form.Item
        label="关联源项目"
        name="parent_project_id"
        extra="成交后手动新建升级项目时，可在此关联原项目"
      >
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="不关联（可选）"
          options={options}
        />
      </Form.Item>
      <Form.Item label="预计金额" name="expected_amount">
        <InputNumber min={0} precision={2} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="成交金额" name="deal_amount">
        <InputNumber min={0} precision={2} style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  )
}

export function valuesToPayload(values) {
  return {
    name: values.name?.trim(),
    start_date: values.start_date || undefined,
    customer_name: values.customer_name?.trim(),
    stage: values.stage,
    is_deal: values.is_deal,
    status: values.status,
    expected_amount: values.expected_amount ?? null,
    deal_amount: values.deal_amount ?? null,
    parent_project_id: values.parent_project_id ?? null,
  }
}
