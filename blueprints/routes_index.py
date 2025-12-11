# app/blueprints/routes_index.py
from quart import Blueprint, render_template

bp = Blueprint("index", __name__)

@bp.route("/")
async def index():
    return await render_template("main.html")