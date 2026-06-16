from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session, joinedload

from app.models import AnomalyEvent, Order, SensorData
from app.schemas import DashboardStats, MonitoringItem, OrderOut
from app.services.anomaly import level_to_ui


def _format_order_code(order_id: int) -> str:
    return f"#{str(order_id).zfill(3)}"


def _latest_sensor(db: Session, cargo_id: int) -> Optional[SensorData]:
    return (
        db.query(SensorData)
        .filter(SensorData.cargo_id == cargo_id)
        .order_by(SensorData.timestamp.desc())
        .first()
    )


def order_to_out(db: Session, order: Order) -> OrderOut:
    sensor_status = "normal"
    temperature = humidity = vibration = None
    last_update = None

    if order.cargo:
        reading = _latest_sensor(db, order.cargo.cargo_id)
        if reading:
            temperature = reading.temperature
            humidity = reading.humidity
            vibration = reading.vibration
            last_update = reading.timestamp.strftime("%H:%M") if reading.timestamp else None
            if order.cargo.current_status:
                sensor_status = order.cargo.current_status

    status = order.status.value
    if status == "completed":
        status = "delivered"

    return OrderOut(
        id=order.order_id,
        order_id=_format_order_code(order.order_id),
        start_point=order.route.start_point if order.route else "",
        end_point=order.route.end_point if order.route else "",
        cargo_type=order.cargo.cargo_type if order.cargo else "",
        weight=order.cargo.weight if order.cargo else 0,
        transport_modes=order.transport_modes,
        status=status,
        order_date=order.order_date,
        notes=order.notes,
        temperature=temperature,
        humidity=humidity,
        vibration=vibration,
        sensor_status=sensor_status,
        last_update=last_update,
    )


def get_dashboard_stats(db: Session, user_id: int) -> DashboardStats:
    orders = db.query(Order).filter(Order.sender_id == user_id).all()
    on_route = sum(1 for o in orders if o.status.value in ("in_transit", "planned"))
    anomalies = (
        db.query(AnomalyEvent)
        .join(Order)
        .filter(Order.sender_id == user_id, AnomalyEvent.resolved.is_(False))
        .count()
    )
    active = sum(1 for o in orders if o.status.value not in ("completed", "cancelled"))
    return DashboardStats(
        total_orders=len(orders),
        active_orders=active,
        on_route=on_route,
        anomalies=anomalies,
    )


def get_monitoring_items(db: Session, user_id: int) -> List[MonitoringItem]:
    orders = (
        db.query(Order)
        .options(joinedload(Order.route), joinedload(Order.cargo))
        .filter(Order.sender_id == user_id)
        .order_by(Order.order_date.desc())
        .all()
    )
    items: List[MonitoringItem] = []
    for order in orders:
        out = order_to_out(db, order)
        items.append(
            MonitoringItem(
                id=out.id,
                order_id=out.order_id,
                start_point=out.start_point,
                end_point=out.end_point,
                cargo_type=out.cargo_type,
                weight=out.weight,
                temperature=out.temperature,
                humidity=out.humidity,
                vibration=out.vibration,
                sensor_status=out.sensor_status,
                last_update=out.last_update,
            )
        )
    return items
