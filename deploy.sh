#!/usr/bin/env bash
set -e

# ====================================================
# Mestory Platform Deployment & Management Script
# ====================================================

function show_help() {
  echo "Использование: ./deploy.sh [команда]"
  echo ""
  echo "Команды Docker Compose:"
  echo "  up         - Собрать и запустить все сервисы в фоне (Docker Compose)"
  echo "  down       - Остановить сервисы (данные в БД сохраняются)"
  echo "  restart    - Перезапустить все сервисы"
  echo "  logs       - Просмотр логов контейнеров в реальном времени"
  echo "  ps         - Статус запущенных контейнеров"
  echo "  clean      - Полная очистка контейнеров и образов (БД сохраняется в томе)"
  echo ""
  echo "Команды Kubernetes:"
  echo "  k8s:apply  - Применить все K8s манифесты (kubectl apply -k k8s/)"
  echo "  k8s:delete - Удалить все K8s ресурсы mestory (kubectl delete -k k8s/)"
  echo "  k8s:status - Статус подов, сервисов и PVC в namespace mestory"
  echo ""
}

CMD=${1:-up}

case "$CMD" in
  up)
    echo "🚀 Запуск Mestory через Docker Compose..."
    docker compose up -d --build
    echo ""
    echo "✅ Все сервисы запущены:"
    echo "   - Веб-приложение: http://localhost:3000"
    echo "   - API Бэкенд:     http://localhost:4000"
    echo "   - Swagger Docs:   http://localhost:4000/docs"
    echo "   - PostgreSQL:     localhost:5432 (данные персистентны в томе mestory_postgres_data)"
    ;;
  down)
    echo "🛑 Остановка сервисов Mestory..."
    docker compose down
    echo "✅ Сервисы остановлены. База данных сохранена."
    ;;
  restart)
    echo "🔄 Перезапуск сервисов Mestory..."
    docker compose restart
    echo "✅ Сервисы успешно перезапущены."
    ;;
  logs)
    docker compose logs -f
    ;;
  ps)
    docker compose ps
    ;;
  clean)
    echo "🧹 Очистка контейнеров..."
    docker compose down --rmi local --remove-orphans
    echo "✅ Очистка завершена."
    ;;
  "k8s:apply")
    echo "☸️ Применение манифестов Kubernetes в namespace mestory..."
    kubectl apply -k k8s/
    echo "✅ Манифесты успешно применены!"
    ;;
  "k8s:delete")
    echo "☸️ Удаление ресурсов Kubernetes..."
    kubectl delete -k k8s/
    echo "✅ Ресурсы удалены."
    ;;
  "k8s:status")
    kubectl -n mestory get pods,svc,pvc,ingress -o wide
    ;;
  *)
    show_help
    exit 1
    ;;
esac
