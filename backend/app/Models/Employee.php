<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'position', 
        'department', 
        'employee_id', 
        'hire_date', 
        'leave_balance', 
        'status',
        'grade'
    ];

    /**
     * Get the user that owns the employee profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the leave requests for this employee.
     */
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /**
     * Get the absence justifications for this employee.
     */
    public function absenceJustifications(): HasMany
    {
        return $this->hasMany(AbsenceJustification::class);
    }

    /**
     * Get the complaints submitted by this employee.
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Get the career path for this employee.
     */
    public function careerPath(): HasOne
    {
        return $this->hasOne(CareerPath::class);
    }
}
