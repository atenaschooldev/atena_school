@echo off
chcp 65001 > nul
title Atena School CRM — Production

echo ===================================================
echo   🎓 ATENA SCHOOL CRM — ЗАПУСК ПРОДАКШЕН ВЕРСИИ
echo ===================================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo [1/3] Установка зависимостей pnpm install...
    call pnpm install
)

if not exist "apps\backend\dist\main.js" (
    echo [2/3] Сборка проекта pnpm build...
    call pnpm build
)

echo [3/3] Запуск сервера CRM...
echo Админка будет доступна по адресу: http://localhost:3001
echo.

:: Автоматическое открытие браузера через 2 секунды
start "" cmd /c "timeout /t 3 >nul & start http://localhost:3001"

call node scripts/start-crm-prod.js prod
pause
