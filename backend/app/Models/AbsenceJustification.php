<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbsenceJustification extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'absence_date',
        'duration',
        'type',
        'reason',
        'document_path',
        'status',
        'rejection_reason',
        'processed_by',
        'processed_at'
    ];

    protected $casts = [
        'absence_date' => 'date',
        'processed_at' => 'datetime'
    ];

    /**
     * Get the employee that owns the absence justification.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user that processed the absence justification.
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
