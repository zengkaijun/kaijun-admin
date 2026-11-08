<?php

namespace App\Enums;

enum FollowChannel: string
{
    case Talk = 'talk';
    case Phone = 'phone';
    case Wechat = 'wechat';
    case Quote = 'quote';
    case Other = 'other';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
