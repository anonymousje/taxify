"""User DB Model"""

from sqlalchemy import Column, LargeBinary, Integer, String
from models.base import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    name = Column(String)
    password = Column(LargeBinary)
