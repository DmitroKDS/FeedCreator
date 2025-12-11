# app/services/xml_builder.py

from datetime import datetime
from config import Config
import math

STD_KEYS = {
    "None","Id (required)","Price (required)","Picture (required)","Name (required)","Description (required)",
    "Stock quantity (optional)","Url (optional)","Price old (optional)","Price promo (optional)",
    "State (optional)","Picture (optional)","Artikel (optional)"
}

async def init():
    val_params = Config.current_data["data"]["val_params"]
    
    n = 10000
    
    files_num = math.ceil(len(val_params["Id (required)"])/n)
    files = []
    for time in range(1, files_num+1):
        params_range = time*n
        if time == files_num:
            params_range = len(val_params["Id (required)"])
        
        lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '    <!DOCTYPE yml_catalog SYSTEM "shops.dtd">',
            f'    <yml_catalog date="{datetime.now().strftime("%Y-%m-%d %H:%M")}">',
            '        <shop>',
            f'            <name>{Config.current_data["company"]["name"]}</name>',
            f'            <company>{Config.current_data["company"]["marketplace_name"]}</company>',
            f'            <url>{Config.current_data["company"]["url"]}</url>',
            '            <currencies>',
            '                <currency id="UAH" rate="1"/>',
            '            </currencies>',
            '            <categories>',
            f'                <category id="{Config.current_data["category"]["id"]}" rz_id="{Config.current_data["category"]["id"]}">{Config.current_data["category"]["name"]}</category>',
            '            </categories>',
            '            <offers>'
        ]

        for i in range(
            (time-1)*n,
            params_range
        ):
            lines += [
                f'                <offer id="{val_params["Id (required)"][i]}" available="true">',
                f'                    <price>{val_params["Price (required)"][i]}</price>',
            ]
            if "Price promo (optional)" in val_params:
                lines.append(f'                    <price_promo>{val_params["Price promo (optional)"][i]}</price_promo>')
            if "Price old (optional)" in val_params:
                lines.append(f'                    <price_old>{val_params["Price old (optional)"][i]}</price_old>')

            lines += [
                '                    <currencyId>UAH</currencyId>',
                f'                    <categoryId>{Config.current_data["category"]["id"]}</categoryId>',
                f'                    <picture>{val_params["Picture (required)"][i]}</picture>',
            ]

            for pics in Config.current_data["data"]["extra_pictures"]:
                if i < len(pics) and pics[i]:
                    lines.append(f'                    <picture>{pics[i]}</picture>')

            lines += [
                f'                    <vendor>{Config.current_data["company"]["marketplace_name"]}</vendor>',
                f'                    <name><![CDATA[{val_params["Name (required)"][i]}]]></name>',
                f'                    <name_ua><![CDATA[{val_params["Name (required)"][i]}]]></name_ua>',
                '                    <description>',
                '                    <![CDATA[',
                f'{val_params["Description (required)"][i]}',
                '                    ]]>',
                '                    </description>',
                '                    <description_ua>',
                '                    <![CDATA[',
                f'{val_params["Description (required)"][i]}',
                '                    ]]>',
                '                    </description_ua>',
            ]

            if "Artikel (optional)" in val_params:
                lines.append(f'                    <article>{val_params["Artikel (optional)"][i]}</article>')

            if "Stock quantity (optional)" in val_params:
                lines.append(f'                    <stock_quantity>{val_params["Stock quantity (optional)"][i]}</stock_quantity>')
            else:
                lines.append('                    <stock_quantity>1000</stock_quantity>')

            if "Url (optional)" in val_params:
                lines.append(f'                    <url>{val_params["Url (optional)"][i]}</url>')

            if "State (optional)" in val_params:
                lines.append(f'                    <state>{val_params["State (optional)"][i]}</state>')

            # for-all params
            for param, param_id, val, val_id, _ in Config.current_data["params"]:
                vals = val if isinstance(val, list) else [val]
                val_ids  = val_id   if isinstance(val_id, list)   else [val_id]
                for value, value_id in zip(vals, val_ids):
                    lines.append(
                        f'                    <param name="{param}" paramid="{param_id}"' +
                        ("" if str(value_id) == "None" else f' valueid="{value_id}"') +
                        f'>{value}</param>'
                    )


            for key, values in val_params.items():
                if key in STD_KEYS:
                    continue
                # key is like "Param (category)" in your UI; strip suffix
                clean = key.replace(" (category)", "")
                if i >= len(values):
                    continue
                val_name = values[i]
                valid = Config.categories[Config.current_data["category"]["id"]][clean]["details"]["values"].get(val_name, "")
                
                if clean == "Зріст, см":
                    val_name = f"{val_name} см"

                edited = {
                    "Зріст, см": "Зріст"
                }
                        
                lines.append(
                    f'                    <param name="{edited.get(clean, clean)}" paramid="{Config.categories[Config.current_data["category"]["id"]][clean]["id"]}"' +
                    ("" if valid in ("", "None") else f' valueid="{valid}"') +
                    f'>{val_name}</param>'
                )

            # IF rules
            for statement_param, statement, statement_value, parametr, param_id, val, val_id, _ in Config.current_data["condition_params"]:
                if statement_param+' (category)' in val_params and i < len(val_params[statement_param+' (category)']):
                    left = val_params[statement_param+' (category)'][i]
                    ok = False
                    try:
                        if statement == ">":
                            ok = str(left).replace(",", ".").replace(" ", "").replace("\u00A0","").replace("\u2007","").replace("\u202F","").replace("\u00B7",".").replace("\u2219",".").replace("\u2024",".").replace("\u22C5",".").replace("\uFF0E",".").replace("\u2027",".")
                            ok = float(ok) > float(str(statement_value).replace(",", "."))
                        elif statement == "<":
                            ok = str(left).replace(",", ".")
                            ok = float(ok) < float(str(statement_value).replace(",", "."))
                        elif statement == "Contains":
                            ok = str(statement_value) in str(left)
                        elif statement == "=":
                            ok = str(statement_value) == str(left)
                    except Exception:
                        ok = False

                    if ok:
                        vals = val if isinstance(val, list) else [val]
                        val_ids  = val_id   if isinstance(val_id, list)   else [val_id]
                        for value, value_id in zip(vals, val_ids):
                            lines.append(
                                f'                    <param name="{parametr}" paramid="{param_id}"' +
                                ("" if str(value_id) == "None" else f' valueid="{value_id}"') +
                                f'>{value}</param>'
                            )

            lines.append('                </offer>')

        lines += [
            '            </offers>',
            '        </shop>',
            '    </yml_catalog>'
        ]
        files.append("\n".join(lines))
        
    return files