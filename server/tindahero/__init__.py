from flask import Flask
from .extensions import db
from .extensions import migrate
from .extensions import api

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres.hslkcfqdmfivanptvpfp:tindahero2025!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
    api.init_app(app)
    #Database
    db.init_app(app)

    #Models
    from .users import models

    #Migrations
    migrate.init_app(app, db)

    #Routes
    from .app import register_routes
    register_routes(app)

    #Users Module
    from .users.users import ns as users_ns
    from .users.role import ns as role_ns
    from .users.role_permissions import ns as role_permissions_ns

    api.add_namespace(role_ns)
    api.add_namespace(role_permissions_ns)
    api.add_namespace(users_ns)
   

    return app


