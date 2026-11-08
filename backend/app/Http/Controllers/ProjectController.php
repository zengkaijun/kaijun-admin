<?php

namespace App\Http\Controllers;

use App\Enums\ItemPriority;
use App\Enums\ProjectDeal;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use App\Http\Requests\ProjectActionRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Services\ProjectStateMachine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProjectController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'stage' => ['sometimes', 'nullable', 'string', Rule::in(ProjectStage::values())],
            'is_deal' => ['sometimes', 'nullable', 'string', Rule::in(ProjectDeal::values())],
            'status' => ['sometimes', 'nullable', 'string', Rule::in(ProjectStatus::values())],
            'page' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'nullable', 'integer', Rule::in([10, 20, 50, 100])],
        ]);

        $query = Project::query()->with('parentProject:id,name')->orderByDesc('id');

        if (! empty($filters['stage'])) {
            $query->where('stage', $filters['stage']);
        }
        if (! empty($filters['is_deal'])) {
            $query->where('is_deal', $filters['is_deal']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // 传 page / per_page 才分页；下拉选项等场景仍可一次取全量
        if ($request->filled('page') || $request->filled('per_page')) {
            $perPage = (int) ($filters['per_page'] ?? 10);
            $paginator = $query->paginate(
                $perPage,
                ['*'],
                'page',
                (int) ($filters['page'] ?? 1),
            );

            return response()->json([
                'data' => $paginator->getCollection()
                    ->map(fn (Project $project) => $project->toApiArray())
                    ->values(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'last_page' => $paginator->lastPage(),
                ],
            ]);
        }

        return response()->json([
            'data' => $query->get()->map(fn (Project $project) => $project->toApiArray()),
        ]);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['stage'] ??= ProjectStage::Demand->value;
        $data['is_deal'] ??= ProjectDeal::No->value;
        $data['status'] ??= ProjectStatus::Normal->value;
        $data['priority'] ??= ItemPriority::Normal->value;
        $data['sort_order'] ??= ((int) Project::query()->max('sort_order')) + 1;

        $project = Project::query()->create($data);
        $project->load('parentProject:id,name');

        return response()->json(['data' => $project->toApiArray()], 201);
    }

    public function show(Project $project): JsonResponse
    {
        $project->load([
            'parentProject:id,name',
            'upgradeProjects:id,name,status,is_deal,start_date,parent_project_id',
        ]);

        return response()->json(['data' => $project->toApiArray(withUpgrades: true)]);
    }

    public function upgrades(Project $project): JsonResponse
    {
        $children = $project->upgradeProjects()
            ->orderByDesc('id')
            ->get(['id', 'name', 'status', 'is_deal', 'start_date', 'parent_project_id']);

        return response()->json([
            'data' => $children->map(fn (Project $child) => [
                'id' => $child->id,
                'name' => $child->name,
                'status' => $child->status?->value ?? $child->status,
                'is_deal' => $child->is_deal?->value ?? $child->is_deal,
                'start_date' => $child->start_date?->format('Y-m-d'),
                'parent_project_id' => $child->parent_project_id,
            ]),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $project->fill($request->validated());
        $project->save();
        $project->load([
            'parentProject:id,name',
            'upgradeProjects:id,name,status,is_deal,start_date,parent_project_id',
        ]);

        return response()->json(['data' => $project->toApiArray(withUpgrades: true)]);
    }

    public function action(
        ProjectActionRequest $request,
        Project $project,
        ProjectStateMachine $stateMachine,
    ): JsonResponse {
        $data = $request->validated();
        $stateMachine->apply($project, $data['action'], $data);
        $project->load('parentProject:id,name');

        return response()->json(['data' => $project->toApiArray()]);
    }
}
