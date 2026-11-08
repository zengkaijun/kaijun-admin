<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'kaijun-api',
        'status' => 'ok',
    ]);
});
