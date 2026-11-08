<?php

namespace App\Enums;

enum ItemPriority: string
{
    case High = 'high';
    case Normal = 'normal';
    case Low = 'low';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
