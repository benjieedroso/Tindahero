from .api_models import api_role_permission_model
from flask_restx import Namespace, Resource
from ..extensions import db

#Actual Models
from .models import RolePermission

ns = Namespace('role_permission', description='Role Permission related operations')
@ns.route('/')
class RolePermissionAPI(Resource):
    @ns.marshal_list_with(api_role_permission_model)
    def get(self):
        role_permissions = RolePermission.query.all()
        return role_permissions, 200




    
