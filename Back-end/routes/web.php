<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'BenGuerir Mining API - Laravel 12', 'version' => '1.0']);
});
