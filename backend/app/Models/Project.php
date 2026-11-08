<?php

namespace App\Models;

use App\Enums\ItemPriority;
use App\Enums\ProjectDeal;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'name',
        'start_date',
        'customer_name',
        'stage',
        'is_deal',
        'status',
        'priority',
        'sort_order',
        'next_follow_up_at',
        'expected_amount',
        'deal_amount',
        'parent_project_id',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'next_follow_up_at' => 'date:Y-m-d',
            'stage' => ProjectStage::class,
            'is_deal' => ProjectDeal::class,
            'status' => ProjectStatus::class,
            'priority' => ItemPriority::class,
            'sort_order' => 'integer',
            'expected_amount' => 'decimal:2',
            'deal_amount' => 'decimal:2',
        ];
    }

    public function parentProject(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_project_id');
    }

    public function upgradeProjects(): HasMany
    {
        return $this->hasMany(self::class, 'parent_project_id');
    }

    public function followUps(): HasMany
    {
        return $this->hasMany(FollowUp::class);
    }

    public function workItems(): HasMany
    {
        return $this->hasMany(WorkItem::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toApiArray(bool $withUpgrades = false): array
    {
        $payload = [
            'id' => $this->id,
            'name' => $this->name,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'customer_name' => $this->customer_name,
            'stage' => $this->stage?->value ?? $this->stage,
            'is_deal' => $this->is_deal?->value ?? $this->is_deal,
            'status' => $this->status?->value ?? $this->status,
            'priority' => $this->priority?->value ?? $this->priority ?? ItemPriority::Normal->value,
            'sort_order' => (int) ($this->sort_order ?? 0),
            'next_follow_up_at' => $this->next_follow_up_at?->format('Y-m-d'),
            'expected_amount' => $this->expected_amount,
            'deal_amount' => $this->deal_amount,
            'parent_project_id' => $this->parent_project_id,
            'parent_project_name' => $this->parentProject?->name,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

        if ($withUpgrades) {
            $payload['upgrade_projects'] = $this->upgradeProjects
                ->map(fn (self $child) => [
                    'id' => $child->id,
                    'name' => $child->name,
                    'status' => $child->status?->value ?? $child->status,
                    'is_deal' => $child->is_deal?->value ?? $child->is_deal,
                    'start_date' => $child->start_date?->format('Y-m-d'),
                ])
                ->values()
                ->all();
        }

        return $payload;
    }
}
