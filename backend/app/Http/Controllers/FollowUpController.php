<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFollowUpRequest;
use App\Models\FollowUp;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class FollowUpController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        $items = $project->followUps()
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (FollowUp $followUp) => $this->payload($followUp));

        return response()->json(['data' => $items]);
    }

    public function store(StoreFollowUpRequest $request, Project $project): JsonResponse
    {
        $data = $request->validated();

        $followUp = DB::transaction(function () use ($project, $data) {
            /** @var FollowUp $followUp */
            $followUp = $project->followUps()->create($data);

            // 同步项目下次跟进日；可选推进阶段/状态
            $project->next_follow_up_at = $followUp->next_follow_up_at;
            if (! empty($data['stage_after'])) {
                $project->stage = $data['stage_after'];
            }
            if (! empty($data['status_after'])) {
                $project->status = $data['status_after'];
            }
            $project->save();

            return $followUp;
        });

        $project->load('parentProject:id,name');

        return response()->json([
            'data' => $this->payload($followUp),
            'project' => $project->toApiArray(),
        ], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(FollowUp $followUp): array
    {
        return [
            'id' => $followUp->id,
            'project_id' => $followUp->project_id,
            'occurred_at' => $followUp->occurred_at?->format('Y-m-d H:i:s'),
            'channel' => $followUp->channel?->value ?? $followUp->channel,
            'content' => $followUp->content,
            'next_follow_up_at' => $followUp->next_follow_up_at?->format('Y-m-d'),
            'stage_after' => $followUp->stage_after?->value ?? $followUp->stage_after,
            'status_after' => $followUp->status_after?->value ?? $followUp->status_after,
            'created_at' => $followUp->created_at?->toIso8601String(),
        ];
    }
}
