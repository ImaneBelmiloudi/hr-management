<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ComplaintController extends Controller
{
    /**
     * Display a listing of complaints.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Complaint::with(['employee.user']);
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // If user is an employee, only show their own complaints
        if (Auth::user()->isEmployee()) {
            $employeeId = Auth::user()->employee->id;
            $query->where('employee_id', $employeeId);
        }
        
        $complaints = $query->latest()->get();
        $data = $complaints->map(function ($complaint) {
            return [
                'id' => $complaint->id,
                'subject' => $complaint->subject,
                'description' => $complaint->description,
                'status' => $complaint->status,
                'created_at' => $complaint->created_at,
                'employee_name' => $complaint->employee && $complaint->employee->user ? $complaint->employee->user->name : null,
                'resolution_details' => $complaint->resolution_details,
                'handled_by' => $complaint->handler ? $complaint->handler->name : null,
                'resolved_at' => $complaint->resolved_at
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Store a newly created complaint.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'attachment' => 'sometimes|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ]);
        
        // Get employee ID from authenticated user
        $employeeId = Auth::user()->employee->id;
        
        // Handle file upload if attachment provided
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('complaint-attachments', 'public');
        }
        
        $complaint = Complaint::create([
            'employee_id' => $employeeId,
            'subject' => $request->subject,
            'description' => $request->description,
            'attachment_path' => $attachmentPath,
            'status' => 'pending'
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Complaint submitted successfully',
            'data' => $complaint
        ], 201);
    }

    /**
     * Display the specified complaint.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $complaint = Complaint::with(['employee.user', 'handler'])->findOrFail($id);
        
        // Check if user has permission to view this complaint
        if (Auth::user()->isEmployee() && Auth::user()->employee->id !== $complaint->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this complaint'
            ], 403);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $complaint
        ]);
    }

    /**
     * Update the complaint status (for admins and HR).
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
                'message' => 'Unauthorized to update complaint status'
            ], 403);
        }
        
        $request->validate([
            'status' => 'required|in:in_review,resolved,rejected',
            'resolution_details' => 'required_if:status,resolved,rejected|nullable|string'
        ]);
        
        $complaint = Complaint::findOrFail($id);
        
        $complaint->status = $request->status;
        $complaint->resolution_details = $request->resolution_details;
        $complaint->handled_by = Auth::id();
        
        if ($request->status === 'resolved' || $request->status === 'rejected') {
            $complaint->resolved_at = now();
        }
        
        $complaint->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Complaint status updated successfully',
            'data' => $complaint
        ]);
    }

    /**
     * Update the complaint details (only allowed for pending complaints by the employee).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);
        
        // Only the employee who created the complaint can update it
        if (Auth::user()->employee->id !== $complaint->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this complaint'
            ], 403);
        }
        
        // Can only update pending complaints
        if ($complaint->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only update pending complaints'
            ], 400);
        }
        
        $request->validate([
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'attachment' => 'sometimes|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ]);
        
        // Handle file upload if new attachment provided
        if ($request->hasFile('attachment')) {
            // Delete old attachment if exists
            if ($complaint->attachment_path) {
                Storage::disk('public')->delete($complaint->attachment_path);
            }
            
            $attachmentPath = $request->file('attachment')->store('complaint-attachments', 'public');
            $complaint->attachment_path = $attachmentPath;
        }
        
        $complaint->update($request->only(['subject', 'description']));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Complaint updated successfully',
            'data' => $complaint
        ]);
    }

    /**
     * Delete a complaint (only allowed for pending complaints by the employee).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $complaint = Complaint::findOrFail($id);
        
        // Only the employee who created the complaint can delete it
        if (Auth::user()->employee->id !== $complaint->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this complaint'
            ], 403);
        }
        
        // Can only delete pending complaints
        if ($complaint->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only delete pending complaints'
            ], 400);
        }
        
        // Delete the associated attachment if exists
        if ($complaint->attachment_path) {
            Storage::disk('public')->delete($complaint->attachment_path);
        }
        
        $complaint->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Complaint deleted successfully'
        ]);
    }
}
