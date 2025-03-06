"""Ensures the following schema is present in request body"""

from pydantic import BaseModel


class ChangeUserName(BaseModel):
    """Makes sure these parameters exist in the request.body"""
    new_name: str
