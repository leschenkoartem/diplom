from __future__ import annotations
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, monitoring, orders
from app.services.iot import poll_iot_sensors


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    task = asyncio.create_task(_iot_loop())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


async def _iot_loop():
    while True:
        db = SessionLocal()
        try:
            poll_iot_sensors(db)
        finally:
            db.close()
        await asyncio.sleep(settings.iot_poll_interval_sec)


app = FastAPI(
    title="Multimodal Transport ICS API",
    description="REST API інформаційно-управляючої системи мультимодальних перевезень",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(monitoring.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws/monitoring")
async def monitoring_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({"event": "sensor_tick"})
            await asyncio.sleep(settings.iot_poll_interval_sec)
    except WebSocketDisconnect:
        pass
