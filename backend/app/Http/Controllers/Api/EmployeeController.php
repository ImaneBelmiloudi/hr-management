<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Employee::with('user');
        
        // Filtrer par rôle si spécifié
        if ($request->has('role')) {
            $role = $request->query('role');
            $query->whereHas('user', function($q) use ($role) {
                $q->where('role', $role);
            });
        }
        
        $employees = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $employees
        ]);
    }

    /**
     * Store a newly created employee.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        try {
            // Log des données reçues pour le débogage
            \Log::info('Données reçues pour la création d\'employé:', $request->all());
            
            // Validation minimale
            $request->validate([
                'email' => 'required|string|email|max:255|unique:users',
            ]);
            
            // Générer des valeurs par défaut pour tous les champs
            $name = $request->name ?? 'Nouvel Employé';
            $email = $request->email;
            $password = $request->password ?? 'password123';
            $position = $request->position ?? 'Non spécifié';
            $department = $request->department ?? 'Général';
            $employee_id = $request->employee_id ?? 'EMP-' . uniqid();
            $hire_date = $request->hire_date ?? now()->format('Y-m-d');
            $leave_balance = $request->leave_balance ?? 30;
            $role = $request->role ?? 'employee';
            $grade = $request->grade ?? null;
            
            // Vérifier si l'employee_id existe déjà
            $existingEmployee = Employee::where('employee_id', $employee_id)->first();
            if ($existingEmployee) {
                $employee_id = 'EMP-' . uniqid(); // Générer un nouvel ID unique
            }
            
            // Create user account
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => $role
            ]);

            // Create employee profile
            $employee = Employee::create([
                'user_id' => $user->id,
                'position' => $position,
                'department' => $department,
                'employee_id' => $employee_id,
                'hire_date' => $hire_date,
                'leave_balance' => $leave_balance,
                'status' => $request->status ?? 'active',
                'grade' => $grade,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Employee created successfully',
                'data' => $employee->load('user')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create employee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified employee.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $employee = Employee::with('user')->findOrFail($id);
        
        return response()->json([
            'status' => 'success',
            'data' => $employee
        ]);
    }

    /**
     * Update the specified employee.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        try {
            $employee = Employee::findOrFail($id);
            $request->validate([
                'position' => 'sometimes|string|max:255',
                'department' => 'sometimes|string|max:255',
                'employee_id' => 'sometimes|string|max:255|unique:employees,employee_id,' . $id,
                'hire_date' => 'sometimes|date',
                'leave_balance' => 'sometimes|integer|min:0',
                'status' => 'sometimes|in:active,inactive',
                'grade' => 'nullable|string|max:255'
            ]);

            $employee->update($request->only([
                'position', 'department', 'employee_id', 'hire_date', 'leave_balance', 'status', 'grade'
            ]));

            // Update user information if provided
            if ($request->has('name') || $request->has('email')) {
                $userValidation = [];
                if ($request->has('name')) {
                    $userValidation['name'] = 'required|string|max:255';
                }
                if ($request->has('email')) {
                    $userValidation['email'] = 'required|string|email|max:255|unique:users,email,' . $employee->user_id;
                }
                $request->validate($userValidation);
                $employee->user->update($request->only(['name', 'email']));
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Employee updated successfully',
                'data' => $employee->load('user')
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error:', $e->errors());
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Remove the specified employee.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $employee = Employee::findOrFail($id);
        $userId = $employee->user_id;
        
        // Delete the employee profile
        $employee->delete();
        
        // Delete the associated user account
        User::find($userId)->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Employee deleted successfully'
        ]);
    }
}
