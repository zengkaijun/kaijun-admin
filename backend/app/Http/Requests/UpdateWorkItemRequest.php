<?php

namespace App\Http\Requests;

use App\Enums\ItemPriority;
use App\Enums\WorkItemStatus;
use App\Enums\WorkItemType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWorkItemRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(WorkItemStatus::values())],
            'due_date' => ['nullable', 'date'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'type' => ['sometimes', 'string', Rule::in(WorkItemType::values())],
            'priority' => ['sometimes', 'string', Rule::in(ItemPriority::values())],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'title.required' => '标题不能为空',
            'status.in' => '状态取值非法',
            'type.in' => '类型取值非法',
            'priority.in' => '优先级取值非法',
            'project_id.exists' => '关联项目不存在',
        ];
    }
}
