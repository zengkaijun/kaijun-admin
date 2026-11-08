<?php

namespace App\Http\Requests;

use App\Enums\FollowChannel;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFollowUpRequest extends FormRequest
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
            'occurred_at' => ['required', 'date'],
            'channel' => ['required', 'string', Rule::in(FollowChannel::values())],
            'content' => ['required', 'string'],
            'next_follow_up_at' => ['nullable', 'date'],
            'stage_after' => ['nullable', 'string', Rule::in(ProjectStage::values())],
            'status_after' => ['nullable', 'string', Rule::in(ProjectStatus::values())],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'occurred_at.required' => '跟进时间不能为空',
            'channel.required' => '跟进方式不能为空',
            'channel.in' => '跟进方式取值非法',
            'content.required' => '跟进内容不能为空',
            'stage_after.in' => '跟进后阶段取值非法',
            'status_after.in' => '跟进后状态取值非法（正常/暂停）',
        ];
    }
}
