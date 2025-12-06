from ..extensions import api
from flask_restx import fields

#Role
api_role_model = api.model('Role', {
    'id': fields.String,
    'name': fields.String,
    'description': fields.String
})

#Permission
api_permission_model = api.model('Permission', {
    'id': fields.String,
    'name': fields.String
})

#RolePermission
api_role_permission_model = api.model('RolePermission', {
    'id': fields.String,
    'role_id': fields.String,
    'roles': fields.List(fields.Nested(api_role_model)),
    'permission_id': fields.String,
    'permissions': fields.List(fields.Nested(api_permission_model))
})

#User
api_user_model = api.model('User', {
    'id': fields.String,
    'name': fields.String,
    'email': fields.String,
    'password': fields.String,
    'created_at': fields.DateTime,
    'role': fields.String,
    'permission': fields.String
})

api_input_user_model = api.model('User', {
    'name': fields.String,
    'email': fields.String,
    'password': fields.String,
    'role': fields.String,
})

