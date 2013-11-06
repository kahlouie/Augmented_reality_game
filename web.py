from flask import Flask, render_template, redirect, request, session, url_for

app = Flask(__name__)

@app.route("/")
def index():
	return redirect("/static/video_on_web.html")

if __name__ == "__main__":
    app.run(debug=True)