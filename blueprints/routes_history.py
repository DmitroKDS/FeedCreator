# app/blueprints/routes_history.py
from quart import Blueprint, render_template, redirect

from config import Config

bp = Blueprint("history", __name__)


@bp.route("/history")
async def history_page():
    show = [
        (
            id,
            item["file"].get("initial_name",""),
            item["category"].get("name",""),
            f'{item["company"].get("name","")}, {item["company"].get("url","")}, {item["company"].get("marketplace_name","")}',
            item["created_at"],
        )
        for id, item in Config.history.items()
    ]
    return await render_template("history.html", show_history=show)


@bp.route("/history/<string:history_id>")
async def history_detailed(history_id: str):
    item = Config.history[history_id]

    company_info = [
        ("CompanyName", item["company"].get("name", "")),
        ("CompanyMarketplaceName", item["company"].get("marketplace_name", "")),
        ("CompanyUrl", item["company"].get("url", "")),
    ]

    for_all_parametrs = [(p, vname) for (p, _pid, _v, _vid, vname) in item.get("params", [])]
    if_parametrs = [(sp, st, sv, pn, v) for (sp, st, sv, pn, _pid, _val, _vid, v) in item.get("condition_params", [])]

    return await render_template(
        "history_detailed.html",
        history_id=history_id,
        category=f'{item["category"]["name"]}(c{item["category"]["id"]})',
        file_name=item["file"]["initial_name"],
        company_info=company_info,
        for_all_parametrs=for_all_parametrs,
        if_parametrs=if_parametrs,
    )


@bp.route("/use_history/<string:history_id>")
async def use_history(history_id: str):
    Config.current_data = Config.history[history_id]

    return redirect("/rozetka/1/")


@bp.route("/delete_history/<string:history_id>")
async def delete_history(history_id: str):
    Config.history.pop(history_id)
    return redirect("/history")
