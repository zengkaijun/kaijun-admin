<?php

namespace App\Http\Controllers;

use App\Enums\ItemPriority;
use App\Enums\WorkItemStatus;
use App\Enums\WorkItemType;
use App\Http\Requests\StoreWorkItemRequest;
use App\Http\Requests\UpdateWorkItemRequest;
use App\Models\WorkItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WorkItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'status' => ['sometimes', 'nullable', 'string', Rule::in(WorkItemStatus::values())],
            'type' => ['sometimes', 'nullable', 'string', Rule::in(WorkItemType::values())],
            'project_id' => ['sometimes', 'nullable', 'integer', 'exists:projects,id'],
            'page' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'nullable', 'integer', Rule::in([10, 20, 50, 100])],
        ]);

        $query = WorkItem::query()
            ->with('project:id,name')
            ->orderByDesc('id');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (array_key_exists('project_id', $filters) && $filters['project_id'] !== null) {
            $query->where('project_id', $filters['project_id']);
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
                    ->map(fn (WorkItem $item) => $item->toApiArray())
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
            'data' => $query->get()->map(fn (WorkItem $item) => $item->toApiArray()),
        ]);
    }

    public function store(StoreWorkItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['status'] ??= WorkItemStatus::Todo->value;
        $data['type'] ??= WorkItemType::Task->value;
        $data['priority'] ??= ItemPriority::Normal->value;
        $data['sort_order'] ??= ((int) WorkItem::query()->max('sort_order')) + 1;

        $item = WorkItem::query()->create($data);
        $item->load('project:id,name');

        return response()->json(['data' => $item->toApiArray()], 201);
    }

    public function show(WorkItem $workItem): JsonResponse
    {
        $workItem->load('project:id,name');

        return response()->json(['data' => $workItem->toApiArray()]);
    }

    public function update(UpdateWorkItemRequest $request, WorkItem $workItem): JsonResponse
    {
        $workItem->fill($request->validated());
        $workItem->save();
        $workItem->load('project:id,name');

        return response()->json(['data' => $workItem->toApiArray()]);
    }

    public function destroy(WorkItem $workItem): JsonResponse
    {
        $workItem->delete();

        return response()->json(['ok' => true]);
    }
}
