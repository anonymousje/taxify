"""User DB Model"""

from sqlalchemy import Column, LargeBinary, Integer, String
from sqlalchemy.orm import relationship
from models.base import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    name = Column(String)
    password = Column(LargeBinary)

    incomes = relationship("Income", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    receipts = relationship("Receipt", back_populates="user")
