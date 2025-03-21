import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from jwt_handler import create_access_token, get_current_user
from models.user import User
from pydantic_schemas.change_email import ChangeUserEmail
from pydantic_schemas.change_name import ChangeUserName
from pydantic_schemas.change_password import ChangeUserPassword
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

    access_token = create_access_token(data={"user_id": user_db.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get('/fetch_user', status_code=200)
def fetch_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Gets current user"""
    user_db = db.query(User).filter(User.id == current_user.id).first()

    if not user_db:
        raise HTTPException(
            400,
            "User with this ID does not exist",
        )

    return user_db


@router.post('/change_password', status_code=200)
def change_user_password(user: ChangeUserPassword, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Changes user password"""
    user_db = db.query(User).filter(User.id == current_user.id).first()

    if not user_db:
        raise HTTPException(
            400,
            "User with this ID does not exist",
        )

    hashed_password = bcrypt.hashpw(
        user.new_password.encode(), bcrypt.gensalt())
    user_db.password = hashed_password

    db.commit()
    db.refresh(user_db)

    return user_db


@router.post('/change_email', status_code=200)
def change_user_password(user: ChangeUserEmail, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Changes user email"""
    user_db = db.query(User).filter(User.id == current_user.id).first()

    if not user_db:
        raise HTTPException(
            400,
            "User with this ID does not exist",
        )

    user_db.email = user.new_email

    db.commit()
    db.refresh(user_db)

    return user_db


@router.post('/change_name', status_code=200)
def change_user_password(user: ChangeUserName, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Changes user name"""
    user_db = db.query(User).filter(User.id == current_user.id).first()

    if not user_db:
        raise HTTPException(
            400,
            "User with this ID does not exist",
        )

    user_db.name = user.new_name

    db.commit()
    db.refresh(user_db)

    return user_db
