from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from routes import auth, income, expense, receipt
from models.base import Base
from database import engine

import models.user
import models.income_model
import models.expense_model
import models.receipt_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for testing)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth.router, prefix='/auth')
app.include_router(income.router, prefix='/income')
app.include_router(expense.router, prefix='/expense')
app.include_router(receipt.router, prefix='/receipt')


Base.metadata.create_all(engine)
