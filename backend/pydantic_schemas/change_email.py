"""Ensures the following schema is present in request body"""

from pydantic import BaseModel


class ChangeUserEmail(BaseModel):
    """Makes sure these parameters exist in the request.body"""
    new_email: str
