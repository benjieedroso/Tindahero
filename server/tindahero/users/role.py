from .api_models import api_role_model
from flask_restx import Namespace, Resource
from ..extensions import db

#Actual Models
from .models import Role

ns = Namespace('roles', description='Role related operations')
@ns.route('/')
class RoleAPI(Resource):
    @ns.marshal_list_with(api_role_model)
    def get(self):
        roles = Role.query.all()
        return roles, 200


