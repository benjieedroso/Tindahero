#Froms
from flask_restx import Namespace, Resource
from .api_models import api_user_model, api_input_user_model
from ..extensions import db

#Models
from .models import User, Permission

#Imports
import bcrypt
import datetime

ns = Namespace('users', description='User related operations')
@ns.route('/')
class UserAPI(Resource):
    #Read
    @ns.marshal_list_with(api_user_model)
    def get(self):
        users = User.query.all()
        return users, 200
    #Create
    @ns.expect(api_input_user_model)
    @ns.marshal_with(api_user_model)
    def post(self):

        hashed_password = bcrypt.hashpw(ns.payload['password'].encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')


        new_user = User(
            name = ns.payload['name'],
            email = ns.payload['email'],
            password = hashed_password,
            role = ns.payload['role']
        )

        db.session.add(new_user)
        db.session.commit()

        return {"id": new_user.id, 'name': new_user.name, 'created_at': new_user.created_at}, 201
    
@ns.route('/<string:id>')
class UserAPIByID(Resource):
    #Update
    @ns.expect(api_input_user_model)
    @ns.marshal_with(api_user_model)
    def put(self, id):
        user = User.query.get(id)

        if not user:
            ns.abort(404, "User not found")

        user.name = ns.payload['name']
        user.email = ns.payload['email']
        user.password = bcrypt.hashpw(ns.payload['password'].encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
        user.role = ns.payload['role']
        user.created_at = datetime.utcnow()

        db.session.commit()

        return {"id": user.id, 'name': user.name, 'updated_at': user.created_at}, 200
    
    #Delete
    @ns.marshal_with(api_user_model)
    def delete(self, id):
        user = User.query.get(id)

        if not user:
            ns.abort(404, "User not found")

        db.session.delete(user)
        db.session.commit()

        return {}, 204




    
    

