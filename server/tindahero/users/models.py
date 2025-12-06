
from sqlalchemy import Column, String, ForeignKey, DateTime
from datetime import datetime
from ..extensions import db
#Imports
import uuid

class Role(db.Model):
    __tablename__ = 'role'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)


class Permission(db.Model):
    __tablename__ = 'permission'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)


class RolePermission(db.Model):
    __tablename__ = 'role_permission'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role_id = Column(String, ForeignKey('role.id'))
    permission_id = Column(String, ForeignKey('permission.id'))

    roles = db.relationship('Role', backref='role_permissions')
    permissions = db.relationship('Permission', backref='role_permissions')



class User(db.Model):
    __tablename__ = 'user'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    role = Column(String, ForeignKey('role.id'))
    permission = Column(String, ForeignKey('permission.id'))

    roles = db.relationship('Role', backref='users')
    permissions = db.relationship('Permission', backref='users')
