<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Normal = 'normal';
    case Paused = 'paused';
    case Stopped = 'stopped';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
