from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.income_model import Income
from pydantic_schemas.income_create import IncomeCreate
from jwt_handler import get_current_user
from models.user import User

router = APIRouter()


@router.post("/add_income", status_code=201)
def add_income_for_user(
    income_data: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_income = Income(
        total=income_data.total,
        description=income_data.description,
        date=income_data.date,
        income_category=income_data.income_category,
        user_id=current_user.id
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return new_income


@router.delete("/delete_income/{income_id}", status_code=200)
def delete_income_for_user(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income = db.query(Income).filter(Income.id == income_id,
                                     Income.user_id == current_user.id).first()

    if not income:
        raise HTTPException(status_code=404, detail="Income record not found")

    db.delete(income)
    db.commit()

    return {"detail": "Income deleted successfully"}


@router.get("/get_incomes", status_code=200)
def get_incomes_for_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income_list = db.query(Income).filter(
        Income.user_id == current_user.id).all()

    return income_list
