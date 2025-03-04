"""Receipt Model"""

from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base


class Receipt(Base):
    __tablename__ = "receipt"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expense_id = Column(Integer, ForeignKey("expense.id"), nullable=True)
    receipt_image = Column(String, nullable=True)
    date_uploaded = Column(Date, nullable=True)
    vendor_name = Column(String, nullable=True)
    total_amount = Column(Float, nullable=True)

    user = relationship("User", back_populates="receipts")
    expense = relationship("Expense", back_populates="receipts")
