# Інформаційно-управляюча система мультимодальних перевезень

Клієнт-серверний прототип дипломного проєкту (ІС-23, КПІ).

- **Frontend:** React + Vite + Bootstrap (`/src`)
- **Backend:** FastAPI + SQLite + SQLAlchemy (`/backend`)
- **БД:** SQLite (`backend/data/multimodal.db`) — модель за ER-діаграмою з ПЗ

## Архітектура

```
Браузер (React)  --REST/JSON-->  FastAPI API  -->  SQLite
                     WebSocket (моніторинг)
```

Серверна частина:
- авторизація (JWT + bcrypt)
- CRUD замовлень (Користувач → Замовлення → Маршрут → Вантаж)
- IoT-імітація (опитування кожні 2.4 с)
- порогова модель аномалій (табл. 6.1, кресленик Д4)

## Запуск

### 1. Backend (Python 3.9+)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: http://127.0.0.1:8000/api/health  
Swagger: http://127.0.0.1:8000/docs

### 2. Frontend

```bash
npm install
npm run dev
```

UI: http://localhost:5173

## Демо-сценарій

1. Зареєструватися / увійти
2. Створити замовлення на перевезення
3. Увімкнути імітацію сенсорів на дашборді або в моніторингу
4. Переглянути оновлення показників і аномалій з сервера
