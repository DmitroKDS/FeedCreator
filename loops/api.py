import asyncio
from quart import Quart, request, jsonify, abort, render_template, redirect

from blueprints.routes_index import bp as bp_index
from blueprints.routes_history import bp as bp_history
from blueprints.routes_wizard import bp as bp_wizard
from blueprints.routes_xml import bp as bp_xml

import os

import uvicorn



async def init():
    app = Quart(__name__, template_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "templates")), static_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static")))

    app.register_blueprint(bp_index)
    app.register_blueprint(bp_history)
    app.register_blueprint(bp_wizard)
    app.register_blueprint(bp_xml)
    
    app.config["MAX_CONTENT_LENGTH"] = 200 * 1024 * 1024  # 200 MB





    config = uvicorn.Config(
        app=app,
        # host="127.1.5.176",
        port=3000,
        log_level="info",
    )

    server = uvicorn.Server(config)
    await server.serve()
