from flask import Flask, render_template
import sys

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    debug = "debug" in sys.argv
    app.run(debug=debug)
