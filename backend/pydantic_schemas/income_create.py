"""Ensures the following schema is present in request body"""

from pydantic import BaseModel
from datetime import date
from typing import Optional


class IncomeCreate(BaseModel):
    """Makes sure these parameters exist in the request.body"""
    date: date
    income_category: str
    description: Optional[str] = None
    total: float
