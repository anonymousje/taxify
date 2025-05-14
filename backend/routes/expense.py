from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.expense_model import Expense
from models.income_model import Income
from models.receipt_model import Receipt
from pydantic_schemas.expense_create import ExpenseCreate
from jwt_handler import get_current_user
from models.user import User

router = APIRouter()


@router.post("/add_expense", status_code=201)
def add_expense_for_user(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_expense = Expense(
        total=expense_data.total,
        tax=expense_data.tax,
        description=expense_data.description,
        date=expense_data.date,
        expense_category=expense_data.expense_category,
        user_id=current_user.id
    )

    if expense_data.receipt:
        print("receipt here")
        new_receipt = Receipt(
            receipt_image=expense_data.receipt.receipt_image,
            date_uploaded=expense_data.receipt.date_uploaded,
            vendor_name=expense_data.receipt.vendor_name,
            total_amount=expense_data.receipt.total_amount,
            user_id=current_user.id
        )
        new_expense.receipts.append(new_receipt)

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.delete("/delete_expense/{expense_id}", status_code=200)
def delete_expense_for_user(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, Expense.user_id == current_user.id).first()

    receipt = db.query(Receipt).filter(Receipt.expense_id ==
                                       expense_id, Receipt.user_id == current_user.id).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense record not found")

    if receipt:
        db.delete(receipt)

    db.delete(expense)
    db.commit()

    return {"detail": "Expense deleted successfully"}


@router.get("/get_expenses", status_code=200)
def get_expenses_for_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    expense_list = db.query(Expense).filter(
        Expense.user_id == current_user.id).all()

    return expense_list
