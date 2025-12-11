# app/blueprints/routes_wizard.py

import json
import uuid
from collections import Counter
import xml.etree.ElementTree as ET

from quart import Blueprint, render_template, request, redirect, current_app

from werkzeug.utils import secure_filename

from services import rozetka_api, prepare_input, data_clean

from config import Config




bp = Blueprint("wizard", __name__, url_prefix="/rozetka")




# ---------- back ----------
@bp.route("/back/<int:page>/")
async def back(page: int):
    prev_page = 1 if page <= 1 else page - 1
    return redirect(f"/rozetka/{prev_page}/")


# ---------- wizard ----------
@bp.route("/<int:page>/", methods=["GET", "POST"])
async def wizard(page: int):
    # ============ PAGE 1 — category ============
    if page == 1:
        if request.method == "POST":
            cat_text = (await request.form).get("category", "")
            if not cat_text:
                return await render_template(
                    'category.html',
                    categories=Config.rz_categories, 
                    category=Config.current_data["category"]["id"]
                )
            
            Config.current_data["category"]["name"] = cat_text.split(" (c")[0]
            Config.current_data["category"]["id"] = cat_text.split(" (c")[-1].rstrip(")")

            params = await rozetka_api.get_category_params(
                Config.rz_token, Config.current_data["category"]["id"]
            )
            Config.categories[Config.current_data["category"]["id"]] = params
            return redirect("/rozetka/2/")

        # GET
        return await render_template(
            'category.html',
            categories=Config.rz_categories, 
            category=int(Config.current_data["category"]["id"])
        )


    # ============ PAGE 2 — company info ============
    if page == 2:
        if request.method == "POST":
            Config.current_data["company"]["name"] = (await request.form).get("name", "").strip()
            Config.current_data["company"]["url"] = (await request.form).get("url", "").strip()
            Config.current_data["company"]["marketplace_name"] = (await request.form).get("marketplace_name", "").strip()

            url_error = (
                not (await request.form).get("name", "").strip() or not (await request.form).get("url", "").strip() or not (await request.form).get("marketplace_name", "").strip() or
                len((await request.form).get("name", "").strip()) > 255 or len((await request.form).get("url", "").strip()) > 255 or len((await request.form).get("marketplace_name", "").strip()) > 255
            )
            if url_error:
                return await render_template(
                    "general_info.html",
                    error="true",
                    name = Config.current_data["company"]["name"],
                    url = Config.current_data["company"]["url"],
                    marketplace_name = Config.current_data["company"]["marketplace_name"]
                )

            return redirect("/rozetka/3/")

        # GET
        return await render_template(
            "general_info.html",
            error="false",
            name = Config.current_data["company"]["name"],
            url = Config.current_data["company"]["url"],
            marketplace_name = Config.current_data["company"]["marketplace_name"]
        )

    # ============ PAGE 3 — upload XML ============
    if page == 3:
        if request.method == "POST":
            up = (await request.files).get("selected_file")

            if "cache/files/" not in up.filename:
                file = f"{uuid.uuid4().hex}.xml"
                await up.save(f"cache/files/{file}")
            else:
                file = up.filename.split("cache/files/")[1]
            

            # parse xml & collect tags
            try:
                tree = ET.parse(f"cache/files/{file}")
                tags = (
                    [(el.tag, a) for el in tree.iter()
                     if el.text is not None and el.text.strip() != "" and el.attrib
                     for a in el.attrib.keys()]
                    + [el.tag for el in tree.iter()
                       if el.text is not None and el.text.strip() != "" and not el.attrib and el.tag]
                )
                tags = [t for t, cnt in Counter(tags).items() if cnt ]
                
                items = list(tree.getroot().iterfind('.//item'))
                
                
                tree = {tag: [it.findtext(tag, "") for it in items] for tag in tags}
            except Exception:
                return await render_template(
                    "file.html",
                    error_title="Xml File Error",
                    error_text="The file is not a valid Xml file or cannot be parsed.",
                    used_file="",
                )

            # if len(tags) < 3:
            #     return await render_template(
            #         "file.html",
            #         error_title="Error in number of rows",
            #         error_text="Number of rows is too small. Minimum number of rows is 4",
            #         used_file="",
            #     )

            if "cache/files/" not in up.filename:
                Config.current_data["file"]["initial_name"] = up.filename
                Config.current_data["file"]["basename"] = up.filename.rsplit(".", 1)[0]
            Config.current_data["file"]["name"] = file
            Config.current_data["file"]["xml_tags"] = tags
            
            
            Config.trees[Config.current_data["file"]["basename"]] = tree
    
            return redirect("/rozetka/4/")

        # GET
        return await render_template(
            "file.html",
            error_title="",
            error_text="",
            used_file=f'cache/files/{Config.current_data["file"]["name"]}',
        )
        
    # ============ PAGE 4 — map columns/params ============
    if page == 4:
        if request.method == "POST":
            tags = Config.current_data["file"]["xml_tags"]
            
            tree = Config.trees[Config.current_data["file"]["basename"]]
            
            new_tree = {}
        
            data = json.loads(
                (
                    await request.form
                ).get("steps_json", "[]")
            )
            Config.current_data["add_params_json"] = data
            
            for group in data:
                params = {}
                for param in group["params"]:
                    name = param["name"]
                    params[name]=[""]*len(tree[tags[0]])
                    for i, row in enumerate(params[name]):
                        for step in param["steps"]:
                            if step["op"]=="set_text":
                                row=step["value"]
                                
                            elif step["op"]=="append_text":
                                row+=step["value"]
                                
                            elif step["op"]=="set_param":
                                row=tree[step["value"]][i]
                                
                            elif step["op"]=="append_param":
                                row+=tree[step["value"]][i]
                                
                            elif step["op"]=="replace":
                                row=row.replace(step["from"], step["to"])
                                
                            elif step["op"]=="lower":
                                row=row.lower()
                                
                            elif step["op"]=="to_int":
                                row=int(row)
                                
                            elif step["op"]=="plus_num":
                                row=row+int(step["value"])
                                
                            elif step["op"]=="delete_at":
                                row=row[:step["index"]]+row[step["index"]+1:]
                                
                            params[name][i] = row
                                
                for tag in tags:
                    new_tree.setdefault(tag, [])
                    for t in tree[tag]:
                        new_tree[tag].append(t)
                        
                    
                    
                max_len=max(len(new_tree.get(key, [])) for key in params.keys())
                for key, value in params.items():
                    new_tree.setdefault(key, [])
                    
                    new_tree[key].extend((['']*(max_len-len(new_tree.get(key, []))))+value)
                    

            max_len = max((len(v) for v in new_tree.values()), default=0)
            data = {k: v + [""] * (max_len - len(v)) for k, v in new_tree.items()}
                    
            Config.current_data["file"]["updated_xml_tags"]=list(new_tree.keys())
            
            Config.new_trees[Config.current_data["file"]["basename"]] = new_tree
            
            return redirect("/rozetka/5/")
    
        # GET
        return await render_template(
            "add_parameters.html",
            available_params = Config.current_data["file"]["xml_tags"],
            preload_data=Config.current_data["add_params_json"]
        )

    # ============ PAGE 5 — map columns/params ============
    if page == 5:
        tags = Config.current_data["file"]["updated_xml_tags"]
        
        params = Config.current_data.get("rozetka_my_params", []) or []
        tags = [(tag, params[i] if len(params)>i else "") for i, tag in enumerate(tags)]        
        
        tree = Config.new_trees[Config.current_data["file"]["basename"]]
        tiny_data = [[tree[tag][i] for tag, _ in tags] for i in range(3)]
        req = [f"{x} (required)" for x in ["Id", "Price", "Picture", "Name", "Description"]]
        opt = [f"{x} (optional)" for x in ["Stock quantity", "Url", "Price old", "Price promo", "State", "Picture", "Artikel"]]
        cat = [f"{x} (category)" for x in Config.categories[Config.current_data["category"]["id"]].keys()]
        
        if request.method == "POST":
            rozetka_my_params = (await request.form).getlist('param')
            
            val_params, pictures_extra = prepare_input.init(rozetka_my_params, tree)

            # validate
            err_title, err_msg, val_params = data_clean.init(val_params)
            Config.current_data["rozetka_my_params"] = rozetka_my_params
            if err_msg:
                return await render_template(
                    "rozetka-my_params.html",
                    error_title=err_title, error_text=err_msg,
                    tiny_data=tiny_data,
                    required_names=req,
                    optional_names=opt,
                    category_names=cat,
                    tags=[(tag, rozetka_my_params[i]) for i, tag in enumerate(tags)]
                )

            # success
            Config.current_data["data"]["val_params"] = val_params
            Config.current_data["data"]["extra_pictures"] = pictures_extra
            return redirect("/rozetka/6/")


        # GET
        
        return await render_template(
            "rozetka-my_params.html",
            error_title="", error_text="",
            tiny_data=tiny_data,
            required_names=req,
            optional_names=opt,
            category_names=cat,
            tags=tags
        )

    # ============ PAGE 6 — for-all params ============
    if page == 6:
        if request.method == "POST":
            params = []

            checkbox_group = ["CheckBox", "CheckBoxGroup"]
            select_group = ["ComboBox"]
            multi_group = ["List", "CheckBoxGroupValues"]
            multi_split = ["ListValues"]
            number_group = ["Integer", "Decimal"]
            text_group = ["MultiText", "TextArea", "TextInput"]

            if "parametr_name" in await request.form:
                params_info = Config.categories[Config.current_data["category"]["id"]]

                for param, value_name in zip((await request.form).getlist("parametr_name"), (await request.form).getlist("value_input")):
                    param_info = params_info[param]
                    
                    val = None
                    val_id = None

                    vid_map = param_info["details"]["values"]
                    if param_info["details"]["type"] in checkbox_group:
                        val = "так" if value_name == "true" else "ні"
                        val_id = vid_map.get(val, "None") if vid_map else "None"
                    elif param_info["details"]["type"] in select_group or param_info["details"]["type"] in number_group or param_info["details"]["type"] in text_group:
                        val = value_name
                        val_id = vid_map.get(value_name, "None") if vid_map else "None"
                    elif param_info["details"]["type"] in multi_group:
                        values = value_name.split("||")[1:]
                        val_id = ", ".join(str(vid_map.get(x, "None")) for x in values) if vid_map else ",".join("None" for _ in values)
                        val = ", ".join(values)
                    elif param_info["details"]["type"] in multi_split:
                        values = value_name.split("||")[1:]
                        val_id = [str(vid_map.get(x, "None")) for x in values] if vid_map else ["None"] * len(values)
                        val = values
                    else:
                        val = value_name
                        val_id = vid_map.get(value_name, "None") if vid_map else "None"

                    params.append([param, param_info["id"], val, val_id, value_name])

            Config.current_data["params"] = params

            names_allowed = {
                "None", "Id (required)", "Price (required)", "Picture (required)", "Name (required)",
                "Description (required)", "Stock quantity (optional)", "Url (optional)", "Price old (optional)",
                "Price promo (optional)", "State (optional)", "Picture (optional)", "Artikel (optional)"
            }
            chosen = set(Config.current_data["rozetka_my_params"])
            if len(chosen - names_allowed) == 0:
                return redirect("/rozetka/xml_file_generation_screen")

            return redirect("/rozetka/7/")


        return await render_template(
            "params.html",
            params_info=Config.categories[Config.current_data["category"]["id"]],
            params_names=list(Config.categories[Config.current_data["category"]["id"]].keys()),
            params={pn: vn for (pn, _, _, _, vn) in Config.current_data.get("params", [])}
        )

    # ============ PAGE 7 — IF rules ============
    if page == 7:
        if request.method == "POST":
            condition_params = []

            params_info = Config.categories[Config.current_data["category"]["id"]]

            checkbox_group = ["CheckBox", "CheckBoxGroup"]
            select_group = ["ComboBox"]
            multi_group = ["List", "CheckBoxGroupValues"]
            multi_split = ["ListValues"]
            number_group = ["Integer", "Decimal"]
            text_group = ["MultiText", "TextArea", "TextInput"]

            for statement_param, statement, statement_value, parametr, value_name in zip(
                (await request.form).getlist("statement_parametr"),
                (await request.form).getlist("statement"),
                (await request.form).getlist("statement_value_input"),
                (await request.form).getlist("parametr_name"),
                (await request.form).getlist("value_input"),
            ):
                param_info = params_info[parametr]
                vtype = param_info["details"]["type"]
                vid_map = param_info["details"]["values"]

                if vtype in checkbox_group:
                    val = "так" if value_name == "true" else "ні"
                    val_id = vid_map.get(val, "None") if vid_map else "None"
                elif vtype in select_group or vtype in number_group or vtype in text_group:
                    val = value_name
                    val_id = vid_map.get(value_name, "None") if vid_map else "None"
                elif vtype in multi_group:
                    values = value_name.split("||")[1:]
                    val_id = ", ".join(str(vid_map.get(x, "None")) for x in values) if vid_map else ",".join("None" for _ in values)
                    val = ", ".join(values)
                elif vtype in multi_split:
                    values = value_name.split("||")[1:]
                    val_id = [str(vid_map.get(x, "None")) for x in values] if vid_map else ["None"] * len(values)
                    val = values
                else:
                    val = value_name
                    val_id = vid_map.get(value_name, "None") if vid_map else "None"

                condition_params.append([statement_param, statement, statement_value, parametr, param_info["id"], val, val_id, value_name])

            Config.current_data["condition_params"] = condition_params
            return redirect("/rozetka/xml_file_generation_screen")

        # GET
        req_opt = {
            "None", "Id (required)", "Price (required)", "Picture (required)", "Name (required)",
            "Description (required)", "Stock quantity (optional)", "Url (optional)", "Price old (optional)",
            "Price promo (optional)", "State (optional)", "Picture (optional)", "Artikel (optional)"
        }

        statement_vals = {}

        tags = Config.current_data["file"]["updated_xml_tags"]
        tree = Config.new_trees[Config.current_data["file"]["basename"]]
        
        statement_vals = {
            param: list(set(
                el
                for el in tree[tag]
            ))
            for param, tag in zip(
                Config.current_data["rozetka_my_params"],
                tags
            )
            if param not in req_opt
        }

        Config.current_data["data"]["statement_vals"] = statement_vals

        return await render_template(
            "condition_params.html",
            statement_param_names=[k.replace(" (category)", "") for k in statement_vals.keys()],
            statement_param_vals=statement_vals,
            params_info=Config.categories[Config.current_data["category"]["id"]],
            params_names=list(Config.categories[Config.current_data["category"]["id"]].keys()),
            condition_params=[(sp, st, sv, pn, vname) for (sp, st, sv, pn, _, _, _, vname) in Config.current_data.get("condition_params", [])]
        )

    # any other page → start
    return redirect("/rozetka/1/")