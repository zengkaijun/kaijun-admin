<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\WorkItemController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/summary', SummaryController::class);
    Route::post('/summary/reorder', [SummaryController::class, 'reorder']);

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::patch('/projects/{project}', [ProjectController::class, 'update']);
    Route::get('/projects/{project}/upgrades', [ProjectController::class, 'upgrades']);
    Route::post('/projects/{project}/actions', [ProjectController::class, 'action']);
    Route::get('/projects/{project}/followups', [FollowUpController::class, 'index']);
    Route::post('/projects/{project}/followups', [FollowUpController::class, 'store']);

    Route::get('/work_items', [WorkItemController::class, 'index']);
    Route::post('/work_items', [WorkItemController::class, 'store']);
    Route::get('/work_items/{work_item}', [WorkItemController::class, 'show']);
    Route::patch('/work_items/{work_item}', [WorkItemController::class, 'update']);
    Route::delete('/work_items/{work_item}', [WorkItemController::class, 'destroy']);
});
