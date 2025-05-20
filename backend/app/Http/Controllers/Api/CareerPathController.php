<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareerPath;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CareerPathController extends Controller
{
    /**
     * Display a listing of career paths.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        // If user is an employee, only show their own career path
        if (Auth::user()->isEmployee()) {
            $employeeId = Auth::user()->employee->id;
            $careerPath = CareerPath::with('employee.user')
                ->where('employee_id', $employeeId)
                ->first();
                
            return response()->json([
                'status' => 'success',
                'data' => $careerPath
            ]);
        }
        
        // Admin and HR can view all career paths
        $careerPaths = CareerPath::with('employee.user')->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $careerPaths
        ]);
    }

    /**
     * Store a newly created career path.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Only admin and HR can create career paths
        if (!Auth::user()->isAdmin() && !Auth::user()->isHR()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to create career paths'
            ], 403);
        }
        
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'current_position' => 'required|string|max:255',
            'target_position' => 'nullable|string|max:255',
            'last_promotion' => 'nullable|date',
            'next_review' => 'nullable|date',
            'skills_to_develop' => 'nullable|string',
            'achievements' => 'nullable|string'
        ]);
        
        // Check if career path already exists for this employee
        $existingPath = CareerPath::where('employee_id', $request->employee_id)->first();
        if ($existingPath) {
            return response()->json([
                'status' => 'error',
                'message' => 'Career path already exists for this employee'
            ], 400);
        }
        
        $careerPath = CareerPath::create($request->all());
        
        return response()->json([
            'status' => 'success',
            'message' => 'Career path created successfully',
            'data' => $careerPath
        ], 201);
    }

    /**
     * Display the specified career path.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $careerPath = CareerPath::with('employee.user')->findOrFail($id);
        
        // Check if user has permission to view this career path
        if (Auth::user()->isEmployee() && Auth::user()->employee->id !== $careerPath->employee_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this career path'
            ], 403);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $careerPath
        ]);
    }

    /**
     * Show the career path for a specific employee.
     *
     * @param  int  $employeeId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showForEmployee($employeeId)
    {
        $employee = Employee::findOrFail($employeeId);
        
        // Check if user has permission to view this employee's career path
        if (Auth::user()->isEmployee() && Auth::user()->employee->id !== $employee->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this employee\'s career path'
            ], 403);
        }
        
        $careerPath = CareerPath::with('employee.user')
            ->where('employee_id', $employeeId)
            ->first();
            
        if (!$careerPath) {
            return response()->json([
                'status' => 'error',
                'message' => 'Career path not found for this employee'
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $careerPath
        ]);
    }

    /**
     * Update the specified career path.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        // Only admin and HR can update career paths
        if (!Auth::user()->isAdmin() && !Auth::user()->isHR()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to update career paths'
            ], 403);
        }
        
        $careerPath = CareerPath::findOrFail($id);
        
        $request->validate([
            'current_position' => 'sometimes|string|max:255',
            'target_position' => 'sometimes|nullable|string|max:255',
            'last_promotion' => 'sometimes|nullable|date',
            'next_review' => 'sometimes|nullable|date',
            'skills_to_develop' => 'sometimes|nullable|string',
            'achievements' => 'sometimes|nullable|string'
        ]);
        
        $careerPath->update($request->all());
        
        return response()->json([
            'status' => 'success',
            'message' => 'Career path updated successfully',
            'data' => $careerPath
        ]);
    }
    
    /**
     * Get the career path data for the authenticated employee.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEmployeeCareerPath()
    {
        // Ensure the user is an employee
        if (!Auth::user()->isEmployee()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }
        
        $employeeId = Auth::user()->employee->id;
        
        // Get the employee's career data
        $careerPath = CareerPath::where('employee_id', $employeeId)->first();
        
        // If no career path exists yet, return a default structure
        if (!$careerPath) {
            $employee = Employee::with('user')->find($employeeId);
            
            // Mock data for demonstration
            return response()->json([
                'status' => 'success',
                'data' => [
                    'currentPosition' => $employee->position ?? 'N/A',
                    'currentGrade' => $employee->grade ?? 'N/A',
                    'hireDate' => $employee->hire_date ?? 'N/A',
                    'nextPromotionDate' => 'N/A',
                    'careerHistory' => [],
                    'skills' => [],
                    'evaluations' => []
                ]
            ]);
        }
        
        // Format the data for the frontend
        $formattedData = [
            'currentPosition' => $careerPath->current_position,
            'currentGrade' => $careerPath->employee->grade ?? 'N/A',
            'hireDate' => $careerPath->employee->hire_date ?? 'N/A',
            'nextPromotionDate' => $careerPath->next_review ?? 'N/A',
            'careerHistory' => $this->formatCareerHistory($employeeId),
            'skills' => $this->formatSkills($employeeId),
            'evaluations' => $this->formatEvaluations($employeeId)
        ];
        
        return response()->json([
            'status' => 'success',
            'data' => $formattedData
        ]);
    }
    
    /**
     * Format career history for an employee.
     *
     * @param int $employeeId
     * @return array
     */
    private function formatCareerHistory($employeeId)
    {
        // This would typically come from a database table
        // Mock data for demonstration
        return [
            [
                'position' => 'Junior Developer',
                'grade' => '1',
                'startDate' => '2022-01-01',
                'endDate' => '2022-06-30',
                'notes' => 'Initial position'
            ],
            [
                'position' => 'Developer',
                'grade' => '2',
                'startDate' => '2022-07-01',
                'endDate' => null,
                'notes' => 'Promotion after 6 months'
            ]
        ];
    }
    
    /**
     * Format skills for an employee.
     *
     * @param int $employeeId
     * @return array
     */
    private function formatSkills($employeeId)
    {
        // This would typically come from a database table
        // Mock data for demonstration
        return [
            [
                'name' => 'Communication',
                'level' => 4,
                'description' => 'Excellent verbal and written communication skills'
            ],
            [
                'name' => 'Problem Solving',
                'level' => 3,
                'description' => 'Good analytical and problem-solving abilities'
            ],
            [
                'name' => 'Teamwork',
                'level' => 5,
                'description' => 'Outstanding team player'
            ]
        ];
    }
    
    /**
     * Format evaluations for an employee.
     *
     * @param int $employeeId
     * @return array
     */
    private function formatEvaluations($employeeId)
    {
        // This would typically come from a database table
        // Mock data for demonstration
        return [
            [
                'title' => 'Évaluation Semestrielle',
                'date' => '2022-06-15',
                'rating' => 4,
                'feedback' => 'Très bon travail ce semestre. Continue comme ça!',
                'strengths' => ['Communication', 'Respect des délais', 'Qualité du travail'],
                'improvements' => ['Documentation du code', 'Partage des connaissances']
            ],
            [
                'title' => 'Évaluation Annuelle',
                'date' => '2022-12-15',
                'rating' => 4,
                'feedback' => 'Excellente année avec des progrès constants.',
                'strengths' => ['Résolution de problèmes', 'Travail d\'équipe', 'Initiative'],
                'improvements' => ['Leadership', 'Présentation des idées']
            ]
        ];
    }
}
