from flask import Flask, render_template
import sys

app = Flask(__name__, static_url_path="")


@app.route("/")
def home():
    return app.send_static_file("index.html")

if __name__ == "__main__":
    debug = "debug" in sys.argv
    app.run(debug=debug)
