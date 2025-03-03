from fastapi import FastAPI
from routes import auth, income
from models.base import Base
from database import engine

app = FastAPI()

app.include_router(auth.router, prefix='/auth')
app.include_router(income.router, prefix='/income')

Base.metadata.create_all(engine)
