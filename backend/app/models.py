from __future__ import annotations
import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    operator = "operator"
    carrier = "carrier"
    sender = "sender"


class OrderStatus(str, enum.Enum):
    new = "new"
    planned = "planned"
    in_transit = "in_transit"
    completed = "completed"
    cancelled = "cancelled"


class AnomalyLevel(str, enum.Enum):
    normal = "normal"
    warning = "warning"
    critical = "critical"


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    login: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.operator, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    contact_info: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    orders_as_sender: Mapped[list["Order"]] = relationship(
        back_populates="sender", foreign_keys="Order.sender_id"
    )


class Route(Base):
    __tablename__ = "routes"

    route_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    start_point: Mapped[str] = mapped_column(String(200), nullable=False)
    end_point: Mapped[str] = mapped_column(String(200), nullable=False)
    total_distance: Mapped[Optional[float]] = mapped_column(Float)

    order: Mapped[Optional["Order"]] = relationship(back_populates="route", uselist=False)


class Cargo(Base):
    __tablename__ = "cargos"

    cargo_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cargo_type: Mapped[str] = mapped_column(String(100), nullable=False)
    weight: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[Optional[float]] = mapped_column(Float)
    special_conditions: Mapped[Optional[str]] = mapped_column(Text)
    current_status: Mapped[Optional[str]] = mapped_column(String(50), default="stored")

    order: Mapped[Optional["Order"]] = relationship(back_populates="cargo", uselist=False)
    sensor_readings: Mapped[list["SensorData"]] = relationship(back_populates="cargo")


class Order(Base):
    __tablename__ = "orders"

    order_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sender_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.user_id"), nullable=False)
    operator_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.user_id"))
    cargo_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("cargos.cargo_id"))
    route_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("routes.route_id"))
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.new, nullable=False)
    order_date: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    total_cost: Mapped[Optional[float]] = mapped_column(Float)
    transport_modes: Mapped[Optional[str]] = mapped_column(String(100))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    sender: Mapped["User"] = relationship(back_populates="orders_as_sender", foreign_keys=[sender_id])
    route: Mapped[Optional["Route"]] = relationship(back_populates="order", foreign_keys=[route_id])
    cargo: Mapped[Optional["Cargo"]] = relationship(back_populates="order", foreign_keys=[cargo_id])
    anomalies: Mapped[list["AnomalyEvent"]] = relationship(back_populates="order")


class SensorData(Base):
    __tablename__ = "sensor_data"

    sensor_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cargo_id: Mapped[int] = mapped_column(Integer, ForeignKey("cargos.cargo_id"), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    temperature: Mapped[Optional[float]] = mapped_column(Float)
    humidity: Mapped[Optional[float]] = mapped_column(Float)
    vibration: Mapped[Optional[float]] = mapped_column(Float)
    location_lat: Mapped[Optional[float]] = mapped_column(Float)
    location_lon: Mapped[Optional[float]] = mapped_column(Float)

    cargo: Mapped["Cargo"] = relationship(back_populates="sensor_readings")


class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"

    event_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.order_id"), nullable=False)
    cargo_id: Mapped[int] = mapped_column(Integer, ForeignKey("cargos.cargo_id"), nullable=False)
    level: Mapped[AnomalyLevel] = mapped_column(Enum(AnomalyLevel), nullable=False)
    parameter: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)

    order: Mapped["Order"] = relationship(back_populates="anomalies")
