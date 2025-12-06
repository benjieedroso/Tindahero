from flask import Flask
from .extensions import db
from .extensions import migrate

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres.hslkcfqdmfivanptvpfp:tindahero2025!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
    
    #Database
    db.init_app(app)

    #Models
    from . import models

    #Migrations
    migrate.init_app(app, db)

    #Routes
    from .app import register_routes
    register_routes(app)

    return app


