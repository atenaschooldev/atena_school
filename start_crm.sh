#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

ENV_MODE="${1:-dev}"

if [ "$ENV_MODE" = "prod" ]; then
    ENV_LABEL="🟢 ПРОДАКШЕН БАЗА (jnfbfihz)"
else
    ENV_LABEL="🟡 DEV БАЗА (hcxpfzsm)"
fi

echo "==================================================="
echo "  🎓 ATENA SCHOOL CRM — ЗАПУСК ($ENV_LABEL)"
echo "==================================================="
echo ""

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Ошибка: Node.js не установлен на компьютере."
    echo "Установите Node.js (LTS v20 или v22) с сайта: https://nodejs.org/"
    exit 1
fi

# Проверка наличия pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️ pnpm не найден. Устанавливаем pnpm глобально..."
    npm install -g pnpm
fi

# 1. Установка зависимостей, если еще не установлены
if [ ! -d "node_modules" ]; then
    echo "[1/3] Установка зависимостей (pnpm install)..."
    pnpm install
fi

# 2. Сборка проекта, если еще не собран
if [ ! -f "apps/backend/dist/main.js" ] || [ ! -f "apps/admin/dist/index.html" ]; then
    echo "[2/3] Сборка проекта (pnpm build)..."
    pnpm build
fi

echo "[3/3] Запуск сервера CRM..."
echo "Админка будет доступна по адресу: http://localhost:3001"
echo ""

# Открытие браузера через 2 секунды в фоновом режиме
(
    sleep 3
    if command -v open &> /dev/null; then
        open "http://localhost:3001"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3001"
    fi
) &

node scripts/start-crm-prod.js "$ENV_MODE"
