from flask import Blueprint, request, jsonify
import subprocess
import os
from app import config

command_bp = Blueprint("run", __name__)

@command_bp.route("/run", methods=["POST"])
def run():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    script_name = data.get("script_name")
    script_path = os.path.join(config.SCRIPTS_DIR, script_name)
    args = data.get("args", [])

    if not script_path:
        return jsonify({"error": "Missing 'script_name'"}), 400

    if not isinstance(args, list) or not all(isinstance(a, str) for a in args):
        return jsonify({"error": "'args' must be a list of strings"}), 400

    if not os.path.isfile(script_path):
        return jsonify({"error": f"Script '{script_path}' not found"}), 404

    try:
        # Run the script using AutoHotkey
        result = subprocess.run(
            [config.AHK_EXE, script_path, *args],
            capture_output=True,
            text=True,
            check=True
        )
        return jsonify({
            "status": "success",
            "stdout": result.stdout,
            "stderr": result.stderr
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            "status": "error",
            "stdout": e.stdout,
            "stderr": e.stderr
        }), 400
    except FileNotFoundError:
        return jsonify({"error": f"AutoHotkey executable not found at '{config.AHK_EXE}'"}), 404

@command_bp.route("/health", methods=["GET"])
def health():
    return {"status": "ok"}, 200