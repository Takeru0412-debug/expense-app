from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class ExpenseBase(BaseModel):
    title: str
    amount: int
    category: str
    spent_at: date
    memo: Optional[str] = None


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(ExpenseBase):
    pass


class ExpenseResponse(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True