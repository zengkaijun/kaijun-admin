<?php

namespace App\Models;

use App\Enums\FollowChannel;
use App\Enums\ProjectStage;
use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FollowUp extends Model
{
    protected $fillable = [
        'project_id',
        'occurred_at',
        'channel',
        'content',
        'next_follow_up_at',
        'stage_after',
        'status_after',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'next_follow_up_at' => 'date:Y-m-d',
            'channel' => FollowChannel::class,
            'stage_after' => ProjectStage::class,
            'status_after' => ProjectStatus::class,
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
