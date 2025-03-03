import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models.user import User
from pydantic_schemas.user_create import UserCreate
from sqlalchemy.orm import Session

from pydantic_schemas.user_login import UserLogin

router = APIRouter()


@router.post('/signup', status_code=201)
def signup_user(user: UserCreate, db: Session = Depends(get_db)):
    """Adds a user to db"""
    user_db = db.query(User).filter(User.email == user.email).first()

    if user_db:
        raise HTTPException(
            400,
            "User already exists!",
        )

    hashed_password = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt())

    user_db = User(email=user.email, name=user.name,
                   password=hashed_password)

    db.add(user_db)
    db.commit()
    db.refresh(user_db)

    return user_db


@router.post('/login')
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    """Logs in a user"""
    user_db = db.query(User).filter(User.email == user.email).first()

    if not user_db:
        raise HTTPException(
            400,
            "User with this email does not exist!",
        )

    is_match = bcrypt.checkpw(user.password.encode(),
                              user_db.password)

    if not is_match:
        raise HTTPException(
            400,
            "Incorrect password!",
        )

    return user_db
