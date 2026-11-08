<?php

namespace App\Enums;

enum ProjectStage: string
{
    case Demand = 'demand';
    case Proposal = 'proposal';
    case Development = 'development';
    case Testing = 'testing';
    case Delivered = 'delivered';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
