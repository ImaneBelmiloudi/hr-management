<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AbsenceJustification;
use App\Models\Complaint;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function adminStats()
    {
        // Ensure user is admin
        if (!Auth::user()->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get employee stats - only regular employees (role='employee')
        $totalEmployees = Employee::whereHas('user', function($query) {
            $query->where('role', 'employee');
        })->count();
        $activeEmployees = Employee::whereHas('user', function($query) {
            $query->where('role', 'employee');
        })->where('status', 'active')->count();
        $inactiveEmployees = Employee::whereHas('user', function($query) {
            $query->where('role', 'employee');
        })->where('status', 'inactive')->count();
        
        // Get pending leave requests
        $pendingLeaves = LeaveRequest::where('status', 'pending')->count();
        
        // Get recent complaints
        $recentComplaints = Complaint::where('status', 'pending')->count();
        
        // Get recent employees - only regular employees (role='employee')
        $recentEmployees = Employee::with('user')
            ->whereHas('user', function($query) {
                $query->where('role', 'employee');
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                    'position' => $employee->position,
                    'status' => $employee->status,
                ];
            });
        
        return response()->json([
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'inactiveEmployees' => $inactiveEmployees,
                'pendingLeaves' => $pendingLeaves,
                'recentComplaints' => $recentComplaints,
            ],
            'recentEmployees' => $recentEmployees,
        ]);
    }
    
    /**
     * Get RH dashboard statistics
     */
    public function rhStats()
    {
        // Ensure user is HR
        if (!Auth::user()->isHR()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Get employee stats - only regular employees (role='employee')
        $totalEmployees = Employee::whereHas('user', function($query) {
            $query->where('role', 'employee');
        })->count();
        $activeEmployees = Employee::whereHas('user', function($query) {
            $query->where('role', 'employee');
        })->where('status', 'active')->count();
        $inactiveEmployees = Employee::whereHas('user', function($query) {
            $query->where('role', 'employee');
        })->where('status', 'inactive')->count();
        
        // Get pending leave requests
        $pendingLeaves = LeaveRequest::where('status', 'pending')->count();
        
        // Get recent complaints
        $recentComplaints = Complaint::where('status', 'pending')->count();
        
        // Get recent employees - only regular employees (role='employee')
        $recentEmployees = Employee::with('user')
            ->whereHas('user', function($query) {
                $query->where('role', 'employee');
            })
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($employee) {
                return [
                    'id' => $employee->id,
                    'name' => $employee->user->name,
                    'email' => $employee->user->email,
                    'position' => $employee->position,
                    'grade' => $employee->grade,
                    'hire_date' => $employee->hire_date,
                    'status' => $employee->status,
                ];
            });
        
        return response()->json([
            'stats' => [
                'totalEmployees' => $totalEmployees,
                'activeEmployees' => $activeEmployees,
                'inactiveEmployees' => $inactiveEmployees,
                'pendingLeaves' => $pendingLeaves,
                'recentComplaints' => $recentComplaints,
            ],
            'recentEmployees' => $recentEmployees,
        ]);
    }
    
    /**
     * Get employee dashboard statistics
     */
    public function employeeStats()
    {
        // Get current employee
        $user = Auth::user();
        $employee = $user->employee;
        
        if (!$employee) {
            return response()->json(['error' => 'Employee profile not found'], 404);
        }
        
        // Get leave requests stats
        $leaveRequests = LeaveRequest::where('employee_id', $employee->id)->get();
        $pendingLeaves = $leaveRequests->where('status', 'pending')->count();
        $approvedLeaves = $leaveRequests->where('status', 'approved')->count();
        $rejectedLeaves = $leaveRequests->where('status', 'rejected')->count();
        
        // Get absence justifications stats
        $absenceJustifications = AbsenceJustification::where('employee_id', $employee->id)->get();
        $pendingAbsences = $absenceJustifications->where('status', 'pending')->count();
        $approvedAbsences = $absenceJustifications->where('status', 'approved')->count();
        $rejectedAbsences = $absenceJustifications->where('status', 'rejected')->count();
        
        // Get complaints stats
        $complaints = Complaint::where('employee_id', $employee->id)->get();
        $pendingComplaints = $complaints->where('status', 'pending')->count();
        $resolvedComplaints = $complaints->where('status', 'resolved')->count();
        
        // Get recent leave requests
        $recentLeaveRequests = LeaveRequest::where('employee_id', $employee->id)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get();
        
        return response()->json([
            'employee' => [
                'id' => $employee->id,
                'name' => $user->name,
                'position' => $employee->position,
                'department' => $employee->department,
                'leaveBalance' => $employee->leave_balance,
                'status' => $employee->status,
            ],
            'stats' => [
                'pendingLeaves' => $pendingLeaves,
                'approvedLeaves' => $approvedLeaves,
                'rejectedLeaves' => $rejectedLeaves,
                'pendingAbsences' => $pendingAbsences,
                'approvedAbsences' => $approvedAbsences,
                'rejectedAbsences' => $rejectedAbsences,
                'pendingComplaints' => $pendingComplaints,
                'resolvedComplaints' => $resolvedComplaints,
            ],
            'recentLeaveRequests' => $recentLeaveRequests,
        ]);
    }
}
