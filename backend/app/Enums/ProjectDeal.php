<?php

namespace App\Enums;

enum ProjectDeal: string
{
    case No = 'no';
    case Yes = 'yes';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
