from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import DashboardStats, MonitoringItem
from app.security import get_current_user
from app.services.orders import get_dashboard_stats, get_monitoring_items

router = APIRouter(tags=["monitoring"])


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard_stats(db, current_user.user_id)


@router.get("/monitoring", response_model=List[MonitoringItem])
def monitoring(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monitoring_items(db, current_user.user_id)
