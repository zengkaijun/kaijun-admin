<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProjectActionRequest extends FormRequest
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
            'action' => ['required', 'string', Rule::in(['win', 'lose', 'pause', 'delay', 'stop', 'restart'])],
            'deal_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'action.required' => '动作不能为空',
            'action.in' => '动作取值非法',
            'deal_amount.numeric' => '成交金额须为数字',
            'deal_amount.min' => '成交金额不能为负',
        ];
    }
}
