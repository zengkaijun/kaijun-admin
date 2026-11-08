<?php

namespace App\Http\Requests;

use App\Enums\ItemPriority;
use App\Enums\ProjectDeal;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateProjectRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date'],
            'customer_name' => ['sometimes', 'required', 'string', 'max:255'],
            'stage' => ['sometimes', 'string', Rule::in(ProjectStage::values())],
            'is_deal' => ['sometimes', 'string', Rule::in(ProjectDeal::values())],
            'status' => ['sometimes', 'string', Rule::in(ProjectStatus::values())],
            'priority' => ['sometimes', 'string', Rule::in(ItemPriority::values())],
            'next_follow_up_at' => ['sometimes', 'nullable', 'date'],
            'expected_amount' => ['nullable', 'numeric', 'min:0'],
            'deal_amount' => ['nullable', 'numeric', 'min:0'],
            'parent_project_id' => ['nullable', 'integer', 'exists:projects,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            /** @var Project $project */
            $project = $this->route('project');
            $parentId = $this->input('parent_project_id');

            if ($parentId === null || $parentId === '') {
                return;
            }

            if ((int) $parentId === (int) $project->id) {
                $validator->errors()->add('parent_project_id', '不能关联自己为源项目');
            }
        });
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
            'priority.in' => '优先级取值非法',
            'parent_project_id.exists' => '关联源项目不存在',
            'parent_project_id.integer' => '关联源项目取值非法',
        ];
    }
}
