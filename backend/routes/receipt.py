from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.income_model import Income
from models.receipt_model import Receipt
from pydantic_schemas.expense_create import ExpenseCreate
from jwt_handler import get_current_user
from models.user import User
from pydantic_schemas.receipt_create import ReceiptCreate

router = APIRouter()


@router.post("/add_receipt", status_code=201)
def add_receipt_for_user(
    receipt_data: ReceiptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_receipt = Receipt(
        expense_id=receipt_data.expense_id,
        receipt_image=receipt_data.receipt_image,
        date_uploaded=receipt_data.date_uploaded,
        vendor_name=receipt_data.vendor_name,
        total_amount=receipt_data.total_amount,
        user_id=current_user.id
    )
    db.add(new_receipt)
    db.commit()
    db.refresh(new_receipt)
    return new_receipt


@router.delete("/delete_receipt/{receipt_id}", status_code=200)
def delete_receipt_for_user(
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    receipt = db.query(Receipt).filter(Receipt.id == receipt_id,
                                       Receipt.user_id == current_user.id).first()

    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt record not found")

    db.delete(receipt)
    db.commit()

    return {"detail": "Receipt deleted successfully"}


@router.get("/get_receipts", status_code=200)
def get_receipt_for_user(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    receipt_list = db.query(Receipt).filter(
        Receipt.user_id == current_user.id).all()

    return receipt_list
