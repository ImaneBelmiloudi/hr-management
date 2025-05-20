<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CareerPath extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'current_position',
        'target_position',
        'last_promotion',
        'next_review',
        'skills_to_develop',
        'achievements'
    ];

    protected $casts = [
        'last_promotion' => 'date',
        'next_review' => 'date'
    ];

    /**
     * Get the employee that owns the career path.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
