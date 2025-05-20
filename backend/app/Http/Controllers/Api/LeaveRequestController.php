<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class LeaveRequestController extends Controller
{
    /**
     * Display a listing of leave requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = LeaveRequest::with(['employee.user']);
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // If user is an employee, only show their own requests
        if (Auth::user()->isEmployee()) {
            $employeeId = Auth::user()->employee->id;
            $query->where('employee_id', $employeeId);
        }
        
        $leaveRequests = $query->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $leaveRequests
        ]);
    }

    /**
     * Store a newly created leave request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'type' => 'required|string',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'reason' => 'required|string'
            ]);
            
            // Calculate duration in days
            $startDate = Carbon::parse($request->start_date);
            $endDate = Carbon::parse($request->end_date);
            $duration = $endDate->diffInDays($startDate) + 1; // +1 to include both start and end date
            
            // Get employee ID from authenticated user
            $employeeId = Auth::user()->employee->id;
            
            // Check if employee has enough leave balance
            $employee = Auth::user()->employee;
            if ($employee->leave_balance < $duration) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient leave balance. Available: ' . $employee->leave_balance . ' days.'
                ], 400);
            }
            
            $leaveRequest = LeaveRequest::create([
                'employee_id' => $employeeId,
                'type' => $request->type,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'duration' => $duration,
                'reason' => $request->reason,
                'status' => 'pending'
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Leave request submitted successfully',
                'data' => $leaveRequest
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error (leave request store):', $e->errors());
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Display the specified leave request.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $leaveRequest = LeaveRequest::with(['employee.user', 'processor'])->findOrFail($id);
        
        // Check if user has permission to view this leave request
        if (Auth::user()->isEmployee() && Auth::user()->employee->id !== $leaveRequest->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this leave request'
            ], 403);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $leaveRequest
        ]);
    }

    /**
     * Update the specified leave request status (for admins and HR).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        // Only admin and HR can update status
        if (!Auth::user()->isAdmin() && !Auth::user()->isHR()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update leave request status'
            ], 403);
        }
        
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string'
        ]);
        
        $leaveRequest = LeaveRequest::findOrFail($id);
        
        // Can only update pending requests
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only update pending leave requests'
            ], 400);
        }
        
        $leaveRequest->status = $request->status;
        $leaveRequest->rejection_reason = $request->rejection_reason;
        $leaveRequest->processed_by = Auth::id();
        $leaveRequest->processed_at = now();
        $leaveRequest->save();
        
        // If approved, deduct from employee's leave balance
        if ($request->status === 'approved') {
            $employee = $leaveRequest->employee;
            $employee->leave_balance -= $leaveRequest->duration;
            $employee->save();
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Leave request ' . $request->status . ' successfully',
            'data' => $leaveRequest
        ]);
    }

    /**
     * Update the leave request details (only allowed for pending requests by the employee).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $leaveRequest = LeaveRequest::findOrFail($id);
        
        // Only the employee who created the request can update it
        if (Auth::user()->employee->id !== $leaveRequest->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this leave request'
            ], 403);
        }
        
        // Can only update pending requests
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only update pending leave requests'
            ], 400);
        }
        
        $request->validate([
            'start_date' => 'sometimes|date|after_or_equal:today',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'reason' => 'sometimes|string'
        ]);
        
        // If dates changed, recalculate duration
        if ($request->has('start_date') || $request->has('end_date')) {
            $startDate = $request->has('start_date') ? Carbon::parse($request->start_date) : Carbon::parse($leaveRequest->start_date);
            $endDate = $request->has('end_date') ? Carbon::parse($request->end_date) : Carbon::parse($leaveRequest->end_date);
            $duration = $endDate->diffInDays($startDate) + 1;
            
            // Check if employee has enough leave balance for the new duration
            if ($duration > Auth::user()->employee->leave_balance) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Insufficient leave balance for the updated request'
                ], 400);
            }
            
            $leaveRequest->duration = $duration;
        }
        
        $leaveRequest->update($request->only(['start_date', 'end_date', 'reason']));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Leave request updated successfully',
            'data' => $leaveRequest
        ]);
    }

    /**
     * Cancel a leave request (only allowed for pending requests by the employee).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancel($id)
    {
        $leaveRequest = LeaveRequest::findOrFail($id);
        
        // Only the employee who created the request can cancel it
        if (Auth::user()->employee->id !== $leaveRequest->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to cancel this leave request'
            ], 403);
        }
        
        // Log the status for debugging
        \Log::info('Trying to cancel leave request', ['id' => $id, 'status' => $leaveRequest->status]);
        
        // Can only cancel pending requests
        if ($leaveRequest->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only cancel leave requests with status pending. Current status: ' . $leaveRequest->status
            ], 400);
        }
        
        $leaveRequest->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Leave request cancelled successfully'
        ]);
    }
}
