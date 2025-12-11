# app/blueprints/routes_xml.py
from quart import Blueprint, render_template, send_file, request
import zipfile
import io
from datetime import datetime
import json, os

from config import Config

from services import xml_builder


bp = Blueprint("xml", __name__)


@bp.route("/rozetka/xml_file_generation_screen", methods=["GET"])
async def xml_generation_screen():
    return await render_template("proccess.html")


@bp.route("/rozetka/generated_xml_file", methods=["GET", "POST"])
async def generated_xml_file():
    if request.method == "POST":
        basename = Config.current_data["file"]["basename"]
        
        Config.current_data["created_at"] = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        
        Config.history[basename] = Config.current_data
        
        xml_files = await xml_builder.init()
        
        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w", compression=zipfile.ZIP_DEFLATED) as zf:
            for i, s in enumerate(xml_files, 1):
                zf.writestr(f"rozetka_xml_{basename}_{i:03}.xml", s)
                
        buf.seek(0)
        return await send_file(buf, mimetype="application/zip", as_attachment=True, attachment_filename=f"{basename}.zip")

    return await render_template(
        "result.html",
        FileName=Config.current_data["file"]["initial_name"].rsplit(".", 1)[0],
        Marketplace="rozetka",
    )
