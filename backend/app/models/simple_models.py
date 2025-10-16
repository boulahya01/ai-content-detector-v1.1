"""Compatibility shim: re-export canonical models from app.models

This file used to contain inline model definitions. To avoid duplicate
SQLAlchemy table registrations we now import and re-export canonical
models from `app.models` so older imports referencing
`app.models.simple_models` continue to work.
"""

from app.models.user import User, UserRole  # canonical User
from app.models.shobeis_transaction import ShobeisTransaction
from app.utils.database import Base

__all__ = ["Base", "User", "UserRole", "ShobeisTransaction"]