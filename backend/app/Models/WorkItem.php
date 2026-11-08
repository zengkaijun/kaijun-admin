<?php

namespace App\Models;

use App\Enums\ItemPriority;
use App\Enums\WorkItemStatus;
use App\Enums\WorkItemType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkItem extends Model
{
    protected $fillable = [
        'title',
        'status',
        'due_date',
        'project_id',
        'type',
        'priority',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date:Y-m-d',
            'status' => WorkItemStatus::class,
            'type' => WorkItemType::class,
            'priority' => ItemPriority::class,
            'sort_order' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(): array
    {
        $dueDate = $this->due_date?->format('Y-m-d');
        $status = $this->status?->value ?? $this->status;
        $overdue = $dueDate !== null
            && $status !== WorkItemStatus::Done->value
            && $dueDate < now()->toDateString();

        return [
            'id' => $this->id,
            'title' => $this->title,
            'status' => $status,
            'due_date' => $dueDate,
            'project_id' => $this->project_id,
            'project_name' => $this->project?->name,
            'type' => $this->type?->value ?? $this->type,
            'priority' => $this->priority?->value ?? $this->priority ?? ItemPriority::Normal->value,
            'sort_order' => (int) ($this->sort_order ?? 0),
            'overdue' => $overdue,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
