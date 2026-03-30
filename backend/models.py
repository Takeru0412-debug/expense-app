from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.sql import func
from database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    category = Column(String, nullable=False)
    spent_at = Column(Date, nullable=False)
    memo = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())