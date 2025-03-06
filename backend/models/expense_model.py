"""Expense Model"""

from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base


class Expense(Base):
    __tablename__ = "expense"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    expense_category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    total = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="expenses")
    receipts = relationship(
        "Receipt", back_populates="expense", cascade="all, delete-orphan")
