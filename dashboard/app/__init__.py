from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
import os


def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for cross-origin requests to client APIs

    @app.route("/")
    def index():
        return render_template("index.html")

    @app.route("/config/<path:filename>")
    def config_files(filename):
        config_dir = os.path.join(os.path.dirname(app.instance_path), "config")
        return send_from_directory(config_dir, filename)

    return app
