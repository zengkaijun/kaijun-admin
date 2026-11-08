<?php

namespace App\Enums;

enum WorkItemStatus: string
{
    case Todo = 'todo';
    case Doing = 'doing';
    case Done = 'done';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
