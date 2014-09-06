from flask import Flask
import sys

app = Flask(__name__, static_url_path="")


@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/parse_api_keys.js")
def parse_api_keys():
    return open("parse_api_keys.js").read()


@app.route("/init_fb.js")
def init_fb():
    return open("init_fb.js").read()

if __name__ == "__main__":
    debug = "debug" in sys.argv
    app.run(debug=debug)
