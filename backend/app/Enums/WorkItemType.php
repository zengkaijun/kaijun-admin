<?php

namespace App\Enums;

enum WorkItemType: string
{
    case Milestone = 'milestone';
    case Task = 'task';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
