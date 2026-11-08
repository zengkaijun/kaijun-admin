<?php

namespace App\Http\Requests;

use App\Enums\ProjectDeal;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'customer_name' => ['required', 'string', 'max:255'],
            'stage' => ['sometimes', 'string', Rule::in(ProjectStage::values())],
            'is_deal' => ['sometimes', 'string', Rule::in(ProjectDeal::values())],
            'status' => ['sometimes', 'string', Rule::in(ProjectStatus::values())],
            'expected_amount' => ['nullable', 'numeric', 'min:0'],
            'deal_amount' => ['nullable', 'numeric', 'min:0'],
            'parent_project_id' => ['nullable', 'integer', 'exists:projects,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => '项目名称不能为空',
            'start_date.required' => '项目开始日期不能为空',
            'customer_name.required' => '客户名称不能为空',
            'stage.in' => '阶段取值非法',
            'is_deal.in' => '是否成交取值非法',
            'status.in' => '状态取值非法',
            'parent_project_id.exists' => '关联源项目不存在',
            'parent_project_id.integer' => '关联源项目取值非法',
        ];
    }
}
