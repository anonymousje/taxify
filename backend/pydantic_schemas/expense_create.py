"""Ensures the following schema is present in request body"""

from pydantic import BaseModel
from datetime import date
from typing import Optional


class ExpenseCreate(BaseModel):
    """Makes sure these parameters exist in the request.body"""
    date: date
    expense_category: str
    description: Optional[str] = None
    total: float
    tax: Optional[float] = None
