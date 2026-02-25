@echo off
echo Creating PostgreSQL database 'riders_forge'...
echo.
echo Please enter your PostgreSQL password when prompted.
echo.
psql -U postgres -f create-database.sql
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Database created successfully!
    echo You can now run: npm run seed
) else (
    echo.
    echo Failed to create database. Please check:
    echo 1. PostgreSQL is running
    echo 2. psql is in your PATH
    echo 3. Password is correct
    echo.
    echo Alternative: Open pgAdmin or psql manually and run:
    echo CREATE DATABASE riders_forge;
)
pause







