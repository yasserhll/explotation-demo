<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductionController;
use App\Http\Controllers\Api\EnginController;
use App\Http\Controllers\Api\AffectationController;
use App\Http\Controllers\Api\ArretController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RotationController;

/*
|--------------------------------------------------------------------------
| API Routes - BenGuerir Mining App
|--------------------------------------------------------------------------
*/

// Dashboard & KPIs
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/optimisations', [DashboardController::class, 'optimisations']);
Route::get('/rapports/hebdo', [DashboardController::class, 'rapportHebdo']);

// Productions
Route::get('/productions/export', [ProductionController::class, 'export']);
Route::get('/productions/daily', [ProductionController::class, 'daily']);
Route::get('/productions/monthly', [ProductionController::class, 'monthly']);
Route::apiResource('productions', ProductionController::class);

// Engins
Route::apiResource('engins', EnginController::class);

// Affectations
Route::post('/affectations/bulk', [AffectationController::class, 'bulk']);
Route::apiResource('affectations', AffectationController::class);

// Arrêts & Disponibilité
Route::get('/disponibilite', [ArretController::class, 'disponibilite']);
Route::apiResource('arrets', ArretController::class);

// Rotations Chauffeurs (journalier + mensuel)
Route::get('/rotations/rapport-journalier', [RotationController::class, 'rapportJournalier']);
Route::get('/rotations/dates',   [RotationController::class, 'dates']);
Route::get('/rotations/monthly', [RotationController::class, 'monthly']);
Route::apiResource('rotations', RotationController::class);
