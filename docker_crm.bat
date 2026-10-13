@echo off
chcp 65001 > nul
title Atena School CRM — Docker

echo ===================================================
echo   🐳 ATENA SCHOOL CRM — ЗАПУСК В DOCKER
echo ===================================================
echo.

cd /d "%~dp0"

:: 1. Проверка наличия Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка: Docker не установлен!
    echo Установите Docker Desktop с сайта: https://www.docker.com/products/docker-desktop/
    echo И убедитесь, что Docker Desktop запущен.
    echo.
    pause
    exit /b 1
)

:: 2. Проверка запущен ли демон Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Docker Desktop установлен, но еще не запущен.
    echo Запустите приложение Docker Desktop и подождите 10-15 секунд.
    echo.
    pause
    exit /b 1
)

echo [1/2] Запуск контейнера CRM (DEV база)...
docker compose up -d

echo.
echo [2/2] CRM успешно запущена!
echo 🏢 Админка: http://localhost:3001
echo ⚙️  API / Swagger: http://localhost:4000/docs
echo.

:: Автоматическое открытие браузера
timeout /t 2 >nul
start http://localhost:3001

echo.
echo 💡 Чтобы остановить CRM, выполните команду: docker compose down
echo.
pause
