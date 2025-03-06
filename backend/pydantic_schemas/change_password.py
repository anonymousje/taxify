"""Ensures the following schema is present in request body"""

from pydantic import BaseModel


class ChangeUserPassword(BaseModel):
    """Makes sure these parameters exist in the request.body"""
    new_password: str
