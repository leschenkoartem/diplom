from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import AnomalyEvent, Cargo, Order, OrderStatus, Route, SensorData, User
from app.schemas import OrderCreate, OrderOut, OrderStatusUpdate
from app.security import get_current_user
from app.services.orders import order_to_out

router = APIRouter(prefix="/orders", tags=["orders"])

STATUS_MAP = {
    "new": OrderStatus.new,
    "planned": OrderStatus.planned,
    "in_transit": OrderStatus.in_transit,
    "completed": OrderStatus.completed,
    "delivered": OrderStatus.completed,
    "cancelled": OrderStatus.cancelled,
}


@router.get("", response_model=List[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.route), joinedload(Order.cargo))
        .filter(Order.sender_id == current_user.user_id)
        .order_by(Order.order_date.desc())
        .all()
    )
    return [order_to_out(db, order) for order in orders]


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    route = Route(
        start_point=payload.start_point,
        end_point=payload.end_point,
        total_distance=None,
    )
    db.add(route)
    db.flush()

    cargo = Cargo(
        cargo_type=payload.cargo_type,
        weight=payload.weight,
        special_conditions=payload.notes,
        current_status="stored",
    )
    db.add(cargo)
    db.flush()

    order = Order(
        sender_id=current_user.user_id,
        operator_id=current_user.user_id,
        route_id=route.route_id,
        cargo_id=cargo.cargo_id,
        status=OrderStatus.new,
        transport_modes=payload.transport_modes,
        notes=payload.notes,
    )
    db.add(order)
    db.flush()

    db.commit()

    order = (
        db.query(Order)
        .options(joinedload(Order.route), joinedload(Order.cargo))
        .filter(Order.order_id == order.order_id)
        .one()
    )
    return order_to_out(db, order)


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.route), joinedload(Order.cargo))
        .filter(Order.order_id == order_id, Order.sender_id == current_user.user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено")

    new_status = STATUS_MAP.get(payload.status)
    if not new_status:
        raise HTTPException(status_code=400, detail="Невідомий статус")
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order_to_out(db, order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = (
        db.query(Order)
        .filter(Order.order_id == order_id, Order.sender_id == current_user.user_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Замовлення не знайдено")

    cargo_id = order.cargo_id
    route_id = order.route_id

    db.query(AnomalyEvent).filter(AnomalyEvent.order_id == order_id).delete()
    db.delete(order)
    db.flush()

    if cargo_id:
        db.query(SensorData).filter(SensorData.cargo_id == cargo_id).delete()
        cargo = db.get(Cargo, cargo_id)
        if cargo:
            db.delete(cargo)
    if route_id:
        route = db.get(Route, route_id)
        if route:
            db.delete(route)

    db.commit()
