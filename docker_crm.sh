#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "==================================================="
echo "  🐳 ATENA SCHOOL CRM — ЗАПУСК В DOCKER"
echo "==================================================="
echo ""

# 1. Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Ошибка: Docker не установлен!"
    echo "Установите Docker Desktop с сайта: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# 2. Проверка запущен ли демон Docker
if ! docker info &> /dev/null; then
    echo "⚠️ Docker установлен, но демон не запущен."
    echo "Откройте приложение Docker Desktop и подождите 10-15 секунд."
    exit 1
fi

echo "[1/2] Сборка и запуск контейнера CRM (DEV база)..."
docker compose up -d --build

echo ""
echo "[2/2] CRM успешно запущена!"
echo "🏢 Админка: http://localhost:3001"
echo "⚙️  API / Swagger: http://localhost:4000/docs"
echo ""

# Автоматическое открытие браузера
(
    sleep 2
    if command -v open &> /dev/null; then
        open "http://localhost:3001"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3001"
    fi
) &

echo "💡 Чтобы остановить CRM, выполните: docker compose down"
