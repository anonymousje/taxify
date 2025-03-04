from pydantic import BaseModel
from datetime import date
from typing import Optional


class ReceiptCreate(BaseModel):
    """Schema for creating a new Receipt."""
    expense_id: Optional[int] = None
    receipt_image: Optional[str] = None
    date_uploaded: Optional[date] = None
    vendor_name: Optional[str] = None
    total_amount: Optional[float] = None
