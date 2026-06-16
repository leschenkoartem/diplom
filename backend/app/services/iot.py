"""Імітація IoT-датчиків для демонстраційного прототипу."""

import random
from datetime import datetime
from typing import Tuple

from sqlalchemy.orm import Session

from app.models import AnomalyEvent, Order, OrderStatus, SensorData
from app.services.anomaly import evaluate_readings, level_to_ui


def _base_reading(db: Session, cargo_id: int) -> Tuple[float, float, float]:
    last = (
        db.query(SensorData)
        .filter(SensorData.cargo_id == cargo_id)
        .order_by(SensorData.timestamp.desc())
        .first()
    )
    if last and last.temperature is not None:
        temp = last.temperature + random.uniform(-0.8, 0.8)
        humidity = (last.humidity or 55) + random.uniform(-2, 2)
        vibration = (last.vibration or 0.6) + random.uniform(-0.15, 0.15)
    else:
        temp = random.uniform(18, 22)
        humidity = random.uniform(45, 65)
        vibration = random.uniform(0.3, 0.9)

    if random.random() < 0.08:
        choice = random.choice(["temp", "humidity", "vibration"])
        if choice == "temp":
            temp = random.uniform(29, 32)
        elif choice == "humidity":
            humidity = random.uniform(78, 85)
        else:
            vibration = random.uniform(2.6, 3.2)

    return round(temp, 1), round(humidity, 0), round(max(0.1, vibration), 2)


def poll_iot_sensors(db: Session) -> None:
    """Цикл: отримання даних від IoT → запис у БД → перевірка порогів → події аномалій."""
    active_orders = (
        db.query(Order)
        .filter(Order.status.in_([OrderStatus.new, OrderStatus.planned, OrderStatus.in_transit]))
        .all()
    )

    for order in active_orders:
        if not order.cargo:
            continue
        cargo = order.cargo
        temp, humidity, vibration = _base_reading(db, cargo.cargo_id)

        reading = SensorData(
            cargo_id=cargo.cargo_id,
            timestamp=datetime.utcnow(),
            temperature=temp,
            humidity=humidity,
            vibration=vibration,
        )
        db.add(reading)

        result = evaluate_readings(temp, humidity, vibration)
        cargo.current_status = level_to_ui(result.level)

        if result.level.value != "normal":
            db.add(
                AnomalyEvent(
                    order_id=order.order_id,
                    cargo_id=cargo.cargo_id,
                    level=result.level,
                    parameter=result.parameter or "unknown",
                    message=result.message,
                )
            )

    db.commit()
