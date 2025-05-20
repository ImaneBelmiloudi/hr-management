<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AbsenceJustification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AbsenceJustificationController extends Controller
{
    /**
     * Display a listing of absence justifications.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = AbsenceJustification::with(['employee.user']);
        
        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // If user is an employee, only show their own justifications
        if (Auth::user()->isEmployee()) {
            $employeeId = Auth::user()->employee->id;
            $query->where('employee_id', $employeeId);
        }
        
        $absenceJustifications = $query->latest()->get();
        $data = $absenceJustifications->map(function ($justification) {
            $startDate = $justification->absence_date;
            $endDate = $justification->absence_date ? $justification->absence_date->copy()->addDays(max(0, $justification->duration - 1)) : null;
            return [
                'id' => $justification->id,
                'type' => $justification->type,
                'absence_date' => $startDate,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'duration' => $justification->duration,
                'reason' => $justification->reason,
                'status' => $justification->status,
                'created_at' => $justification->created_at,
                'document_url' => $justification->document_path ? asset('storage/' . $justification->document_path) : null,
                'employee' => $justification->employee ? [
                    'id' => $justification->employee->id,
                    'user' => [
                        'name' => $justification->employee->user->name ?? 'N/A'
                    ]
                ] : null,
            ];
        });
        
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Store a newly created absence justification.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'absence_date' => 'required|date',
            'duration' => 'required|integer|min:1',
            'type' => 'required|string',
            'reason' => 'required|string',
            'document' => 'sometimes|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ]);
        
        // Get employee ID from authenticated user
        $employeeId = Auth::user()->employee->id;
        
        // Handle file upload if document provided
        $documentPath = null;
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('absence-documents', 'public');
        }
        
        $absenceJustification = AbsenceJustification::create([
            'employee_id' => $employeeId,
            'absence_date' => $request->absence_date,
            'duration' => $request->duration,
            'type' => $request->type,
            'reason' => $request->reason,
            'document_path' => $documentPath,
            'status' => 'pending'
        ]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Absence justification submitted successfully',
            'data' => $absenceJustification
        ], 201);
    }

    /**
     * Display the specified absence justification.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $justification = AbsenceJustification::with(['employee.user', 'processor'])->findOrFail($id);
        
        // Check if user has permission to view this justification
        if (Auth::user()->isEmployee() && Auth::user()->employee->id !== $justification->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this absence justification'
            ], 403);
        }
        
        $data = [
            'id' => $justification->id,
            'type' => $justification->type,
            'absence_date' => $justification->absence_date,
            'duration' => $justification->duration,
            'reason' => $justification->reason,
            'status' => $justification->status,
            'created_at' => $justification->created_at,
            'document_url' => $justification->document_path ? asset('storage/' . $justification->document_path) : null,
        ];
        
        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Update the specified absence justification status (for admins and HR).
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
                'message' => 'Unauthorized to update absence justification status'
            ], 403);
        }
        
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string'
        ]);
        
        $absenceJustification = AbsenceJustification::findOrFail($id);
        
        // Can only update pending justifications
        if ($absenceJustification->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only update pending absence justifications'
            ], 400);
        }
        
        $absenceJustification->status = $request->status;
        $absenceJustification->rejection_reason = $request->rejection_reason;
        $absenceJustification->processed_by = Auth::id();
        $absenceJustification->processed_at = now();
        $absenceJustification->save();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Absence justification ' . $request->status . ' successfully',
            'data' => $absenceJustification
        ]);
    }

    /**
     * Update the absence justification details (only allowed for pending justifications by the employee).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $absenceJustification = AbsenceJustification::findOrFail($id);
        
        // Only the employee who created the justification can update it
        if (Auth::user()->employee->id !== $absenceJustification->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update this absence justification'
            ], 403);
        }
        
        // Can only update pending justifications
        if ($absenceJustification->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only update pending absence justifications'
            ], 400);
        }
        
        $request->validate([
            'absence_date' => 'sometimes|date',
            'duration' => 'sometimes|integer|min:1',
            'type' => 'sometimes|string',
            'reason' => 'sometimes|string',
            'document' => 'sometimes|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240'
        ]);
        
        // Handle file upload if new document provided
        if ($request->hasFile('document')) {
            // Delete old document if exists
            if ($absenceJustification->document_path) {
                Storage::disk('public')->delete($absenceJustification->document_path);
            }
            
            $documentPath = $request->file('document')->store('absence-documents', 'public');
            $absenceJustification->document_path = $documentPath;
        }
        
        $absenceJustification->update($request->only(['absence_date', 'duration', 'type', 'reason']));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Absence justification updated successfully',
            'data' => $absenceJustification
        ]);
    }

    /**
     * Delete an absence justification (only allowed for pending justifications by the employee).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $absenceJustification = AbsenceJustification::findOrFail($id);
        
        // Only the employee who created the justification can delete it
        if (Auth::user()->employee->id !== $absenceJustification->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this absence justification'
            ], 403);
        }
        
        // Can only delete pending justifications
        if ($absenceJustification->status !== 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only delete pending absence justifications'
            ], 400);
        }
        
        // Delete the associated document if exists
        if ($absenceJustification->document_path) {
            Storage::disk('public')->delete($absenceJustification->document_path);
        }
        
        $absenceJustification->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Absence justification deleted successfully'
        ]);
    }
}
