from app import create_app
from app.config import CLIENT_HOST, CLIENT_PORT, CLIENT_DEBUG

app = create_app()

if __name__ == "__main__":
    app.run(host=CLIENT_HOST, port=CLIENT_PORT, debug=CLIENT_DEBUG)