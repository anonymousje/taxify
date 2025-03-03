"""Ensures the following schema is present in request body"""

from pydantic import BaseModel


class UserLogin(BaseModel):
    """Makes sure these parameters exist in the request.body"""
    email: str
    password: str
