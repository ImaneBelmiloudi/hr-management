<?php

use App\Http\Controllers\Api\AbsenceJustificationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\LeaveRequestController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    // User authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    
    // Employee management
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::get('/employees/{id}', [EmployeeController::class, 'show']);
    Route::put('/employees/{id}', [EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    
    // Leave requests
    Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
    Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
    Route::get('/leave-requests/{id}', [LeaveRequestController::class, 'show']);
    Route::put('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
    Route::post('/leave-requests/{id}/status', [LeaveRequestController::class, 'updateStatus']);
    Route::delete('/leave-requests/{id}', [LeaveRequestController::class, 'cancel']);
    
    // Absence justifications
    Route::get('/absence-justifications', [AbsenceJustificationController::class, 'index']);
    Route::post('/absence-justifications', [AbsenceJustificationController::class, 'store']);
    Route::get('/absence-justifications/{id}', [AbsenceJustificationController::class, 'show']);
    Route::put('/absence-justifications/{id}', [AbsenceJustificationController::class, 'update']);
    Route::post('/absence-justifications/{id}/status', [AbsenceJustificationController::class, 'updateStatus']);
    Route::delete('/absence-justifications/{id}', [AbsenceJustificationController::class, 'destroy']);
    
    // Employee-specific absence justifications
    Route::prefix('employee')->group(function () {
        Route::get('/absence-justifications', [AbsenceJustificationController::class, 'index']);
        Route::post('/absence-justifications', [AbsenceJustificationController::class, 'store']);
        Route::get('/absence-justifications/{id}', [AbsenceJustificationController::class, 'show']);
        Route::put('/absence-justifications/{id}', [AbsenceJustificationController::class, 'update']);
        Route::delete('/absence-justifications/{id}', [AbsenceJustificationController::class, 'destroy']);
    });
    
    // Complaints
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::get('/complaints/employee', [ComplaintController::class, 'index']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::put('/complaints/{id}', [ComplaintController::class, 'update']);
    Route::post('/complaints/{id}/status', [ComplaintController::class, 'updateStatus']);
    Route::delete('/complaints/{id}', [ComplaintController::class, 'destroy']);
    
    // Dashboard stats
    Route::get('/admin/dashboard-stats', [DashboardController::class, 'adminStats']);
    Route::get('/rh/dashboard-stats', [DashboardController::class, 'rhStats']);
    Route::get('/employee/dashboard-stats', [DashboardController::class, 'employeeStats']);
});

// Employee routes
Route::middleware(['auth:sanctum', 'role:employee'])->group(function () {
    Route::get('/employee/dashboard', [DashboardController::class, 'employeeDashboard']);
    Route::get('/employee/leaves', [LeaveRequestController::class, 'employeeLeaves']);
    Route::post('/employee/leaves', [LeaveRequestController::class, 'store']);
    Route::get('/employee/justifications', [AbsenceJustificationController::class, 'employeeJustifications']);
    Route::post('/employee/justifications', [AbsenceJustificationController::class, 'store']);
    Route::get('/employee/complaints', [ComplaintController::class, 'employeeComplaints']);
    Route::post('/employee/complaints', [ComplaintController::class, 'store']);
});
