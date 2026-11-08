<?php

namespace App\Services;

use App\Enums\ProjectDeal;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Validation\ValidationException;

class ProjectStateMachine
{
    /**
     * @param  array{deal_amount?: mixed}  $payload
     *
     * @throws ValidationException
     */
    public function apply(Project $project, string $action, array $payload = []): Project
    {
        $current = $project->status instanceof ProjectStatus
            ? $project->status->value
            : (string) $project->status;

        match ($action) {
            'win' => $this->win($project, $current, $payload),
            'lose' => $this->lose($project, $current),
            'pause', 'delay' => $this->pause($project, $current),
            'stop' => $this->stop($project, $current),
            'restart' => $this->restart($project, $current),
            default => throw ValidationException::withMessages([
                'action' => ['动作取值非法'],
            ]),
        };

        $project->save();

        return $project;
    }

    /**
     * @param  array{deal_amount?: mixed}  $payload
     */
    private function win(Project $project, string $current, array $payload): void
    {
        $this->assertFrom($current, [ProjectStatus::Normal->value], '仅正常状态可成交');

        $project->status = ProjectStatus::Normal;
        $project->is_deal = ProjectDeal::Yes;
        // 成交后退出待跟进
        $project->next_follow_up_at = null;

        if (array_key_exists('deal_amount', $payload) && $payload['deal_amount'] !== null && $payload['deal_amount'] !== '') {
            $project->deal_amount = $payload['deal_amount'];
        }
    }

    private function lose(Project $project, string $current): void
    {
        $this->assertFrom($current, [ProjectStatus::Normal->value], '仅正常状态可标记无法成交');

        $project->status = ProjectStatus::Stopped;
        $project->is_deal = ProjectDeal::No;
    }

    private function pause(Project $project, string $current): void
    {
        $this->assertFrom($current, [ProjectStatus::Normal->value], '仅正常状态可暂停');

        $project->status = ProjectStatus::Paused;
    }

    private function stop(Project $project, string $current): void
    {
        $this->assertFrom(
            $current,
            [ProjectStatus::Normal->value, ProjectStatus::Paused->value],
            '仅正常或暂停状态可停止',
        );

        $project->status = ProjectStatus::Stopped;
    }

    private function restart(Project $project, string $current): void
    {
        $this->assertFrom(
            $current,
            [ProjectStatus::Paused->value, ProjectStatus::Stopped->value],
            '仅暂停或停止状态可重新启动',
        );

        $project->status = ProjectStatus::Normal;
    }

    /**
     * @param  list<string>  $allowedFrom
     */
    private function assertFrom(string $current, array $allowedFrom, string $message): void
    {
        if (! in_array($current, $allowedFrom, true)) {
            throw ValidationException::withMessages([
                'action' => [$message],
            ]);
        }
    }
}
