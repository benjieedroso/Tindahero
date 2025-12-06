
from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime
from .extensions import db
#Imports
import uuid



class Role(db.Model):
    __tablename__ = 'role'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)


class Permission(db.Model):
    __tablename__ = 'permission'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)



class User(db.Model):
    __tablename__ = 'user'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    role = Column(String, ForeignKey('role.id'))
    permission = Column(String, ForeignKey('permission.id'))
