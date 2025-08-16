from flask import Flask, render_template
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for cross-origin requests to client APIs
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    return app