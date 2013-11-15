from flask import Flask, render_template, redirect, request, session, url_for

app = Flask(__name__)

@app.route("/")
def index():
	return render_template("/index.html")

@app.route("/threejs")
def threejs():
	return render_template("/threejssample.html")

if __name__ == "__main__":
    app.run(debug=True)