<?php

namespace App\Http\Controllers;

use App\Enums\ItemPriority;
use App\Enums\ProjectDeal;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use App\Enums\WorkItemStatus;
use App\Http\Requests\ReorderSummaryRequest;
use App\Models\Project;
use App\Models\WorkItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SummaryController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = now()->toDateString();

        // 未成交跟进：未成交 + 需求沟通/发方案报价 + 正常或暂停
        $dueFollowUps = Project::query()
            ->where('is_deal', ProjectDeal::No->value)
            ->whereIn('stage', [
                ProjectStage::Demand->value,
                ProjectStage::Proposal->value,
            ])
            ->whereIn('status', [
                ProjectStatus::Normal->value,
                ProjectStatus::Paused->value,
            ])
            ->orderBy('sort_order')
            ->orderByRaw("FIELD(priority, 'high', 'normal', 'low')")
            ->orderBy('id')
            ->get([
                'id',
                'name',
                'customer_name',
                'stage',
                'is_deal',
                'status',
                'priority',
                'sort_order',
                'next_follow_up_at',
                'expected_amount',
                'deal_amount',
            ])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'customer_name' => $project->customer_name,
                'stage' => $project->stage?->value ?? $project->stage,
                'is_deal' => $project->is_deal?->value ?? $project->is_deal,
                'status' => $project->status?->value ?? $project->status,
                'priority' => $project->priority?->value ?? $project->priority ?? ItemPriority::Normal->value,
                'sort_order' => (int) $project->sort_order,
                'next_follow_up_at' => $project->next_follow_up_at?->format('Y-m-d'),
                'expected_amount' => $project->expected_amount,
                'deal_amount' => $project->deal_amount,
            ])
            ->values();

        $openWorkItems = WorkItem::query()
            ->with('project:id,name')
            ->where('status', '!=', WorkItemStatus::Done->value)
            ->orderBy('sort_order')
            ->orderByRaw("FIELD(priority, 'high', 'normal', 'low')")
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->orderByDesc('id')
            ->get()
            ->map(function (WorkItem $item) use ($today) {
                $dueDate = $item->due_date?->format('Y-m-d');
                $status = $item->status?->value ?? $item->status;

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'status' => $status,
                    'priority' => $item->priority?->value ?? $item->priority ?? ItemPriority::Normal->value,
                    'sort_order' => (int) $item->sort_order,
                    'due_date' => $dueDate,
                    'project_id' => $item->project_id,
                    'project_name' => $item->project?->name,
                    'overdue' => $dueDate !== null && $dueDate < $today,
                ];
            })
            ->values();

        return response()->json([
            'due_follow_ups' => $dueFollowUps,
            'open_work_items' => $openWorkItems,
        ]);
    }

    public function reorder(ReorderSummaryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $ids = array_map('intval', $data['ordered_ids']);

        if ($data['list'] === 'due_follow_ups') {
            $existing = Project::query()
                ->whereIn('id', $ids)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
            if (count($existing) !== count($ids)) {
                return response()->json(['message' => '排序项目不存在'], 422);
            }

            DB::transaction(function () use ($ids) {
                foreach ($ids as $index => $id) {
                    Project::query()->where('id', $id)->update(['sort_order' => $index]);
                }
            });
        } else {
            $existing = WorkItem::query()
                ->whereIn('id', $ids)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->all();
            if (count($existing) !== count($ids)) {
                return response()->json(['message' => '排序工作项不存在'], 422);
            }

            DB::transaction(function () use ($ids) {
                foreach ($ids as $index => $id) {
                    WorkItem::query()->where('id', $id)->update(['sort_order' => $index]);
                }
            });
        }

        return response()->json(['ok' => true]);
    }
}
