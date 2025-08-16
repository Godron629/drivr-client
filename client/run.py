from flask import Flask
from flask_cors import CORS
from app.routes import command_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.register_blueprint(command_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)