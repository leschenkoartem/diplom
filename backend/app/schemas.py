from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=4)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    user_id: int
    login: str
    full_name: str
    role: str
    contact_info: Optional[str]

    class Config:
        from_attributes = True


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class OrderCreate(BaseModel):
    start_point: str
    end_point: str
    cargo_type: str
    weight: float = Field(gt=0)
    transport_modes: str = "Повний мультимодальний"
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: Literal["new", "planned", "in_transit", "completed", "cancelled", "delivered"]


class RouteOut(BaseModel):
    route_id: int
    start_point: str
    end_point: str
    total_distance: Optional[float]

    class Config:
        from_attributes = True


class CargoOut(BaseModel):
    cargo_id: int
    cargo_type: str
    weight: float
    current_status: Optional[str]

    class Config:
        from_attributes = True


class SensorOut(BaseModel):
    temperature: Optional[float]
    humidity: Optional[float]
    vibration: Optional[float]
    timestamp: Optional[datetime]
    sensor_status: str = "normal"

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    order_id: str
    start_point: str
    end_point: str
    cargo_type: str
    weight: float
    transport_modes: Optional[str]
    status: str
    order_date: datetime
    notes: Optional[str]
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    vibration: Optional[float] = None
    sensor_status: str = "normal"
    last_update: Optional[str] = None

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_orders: int
    active_orders: int
    on_route: int
    anomalies: int


class MonitoringItem(BaseModel):
    id: int
    order_id: str
    start_point: str
    end_point: str
    cargo_type: str
    weight: float
    temperature: Optional[float]
    humidity: Optional[float]
    vibration: Optional[float]
    sensor_status: str
    last_update: Optional[str]
