from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.schemas import TokenOut, UserLogin, UserOut, UserRegister
from app.security import create_access_token, hash_password, verify_password, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    login = payload.email.lower()
    if db.query(User).filter(User.login == login).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Користувач з таким email вже існує")

    user = User(
        login=login,
        password_hash=hash_password(payload.password),
        role=UserRole.operator,
        full_name=payload.full_name,
        contact_info=login,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.user_id)
    return TokenOut(
        access_token=token,
        user=UserOut(
            user_id=user.user_id,
            login=user.login,
            full_name=user.full_name,
            role=user.role.value,
            contact_info=user.contact_info,
        ),
    )


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    login = payload.email.lower()
    user = db.query(User).filter(User.login == login).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Невірний email або пароль")

    token = create_access_token(user.user_id)
    return TokenOut(
        access_token=token,
        user=UserOut(
            user_id=user.user_id,
            login=user.login,
            full_name=user.full_name,
            role=user.role.value,
            contact_info=user.contact_info,
        ),
    )


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        user_id=current_user.user_id,
        login=current_user.login,
        full_name=current_user.full_name,
        role=current_user.role.value,
        contact_info=current_user.contact_info,
    )
