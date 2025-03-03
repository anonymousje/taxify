"""Income Model"""

from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    income_category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    total = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"),
                     nullable=False)

    user = relationship("User", back_populates="incomes")
