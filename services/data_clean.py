# app/services/data_clean.py
import re
import emoji

def init(mp: dict):
    def del_emoji(text: str) -> str:
        return "".join(ch for ch in text or "" if ch not in emoji.EMOJI_DATA)

    # required presence (caller ensures mapping, but we sanity-check)
    required = ["Id (required)","Price (required)","Picture (required)","Name (required)","Description (required)"]
    for key in required:
        if key not in mp:
            return "missing required", f"'{key}' column is not mapped.", mp

    # id: keep as-is, ensure uniqueness (suffix index)
    uniq = {}
    ids = []
    for x in mp["Id (required)"]:
        val = str(x)
        uniq[val] = uniq.get(val, 0) + 1
        ids.append(val)
    # suffix duplicates
    seen = {}
    out_ids = []
    for val in ids:
        seen[val] = seen.get(val, 0) + 1
        out_ids.append(f"{val}-{seen[val]}" if seen[val] > 1 else val)
    mp["Id (required)"] = out_ids

    # price float
    try:
        mp["Price (required)"] = [float(str(p).replace(",", ".")) for p in mp["Price (required)"]]
    except Exception:
        return "price not a number", "check price column. one value is not numeric.", mp

    # name length & cleanup
    names = [str(x) for x in mp["Name (required)"]]
    if any(len(n) > 255 for n in names):
        return "name too long", f"name must be < 255 chars.", mp
    mp["Name (required)"] = [n.replace("  ", " ").strip() for n in names]

    # description len + emoji strip
    descs = [str(x) for x in mp["Description (required)"]]
    if any(len(d) > 5000 for d in descs):
        return "description too long", f"description must be < 5000 chars.", mp
    mp["Description (required)"] = [del_emoji(d) for d in descs]

    # picture main
    pics = [str(x) for x in mp["Picture (required)"]]
    if any(len(p) > 1999 for p in pics):
        return "picture url too long", "picture must be < 1999 chars.", mp
    if any(" " in p for p in pics):
        return "picture url spaces", "picture url cannot contain spaces.", mp
    if any(all(ext not in p for ext in [".jpeg",".jpg",".png",".PNG",".webp",".gif"]) for p in pics):
        return "picture format not supported", "allowed: .jpeg .jpg .png .PNG .webp .gif", mp
    if any(bool(re.search(r"[\u0400-\u04FF]", p)) for p in pics):
        return "picture url cyrillic", "picture url cannot contain cyrillic.", mp

    # optional numerics
    if "Price promo (optional)" in mp:
        try:
            mp["Price promo (optional)"] = [float(str(p).replace(",", ".")) for p in mp["Price promo (optional)"]]
        except Exception:
            return "price promo not a number", "check price promo column.", mp

    if "Price old (optional)" in mp:
        try:
            mp["Price old (optional)"] = [float(str(p).replace(",", ".")) for p in mp["Price old (optional)"]]
        except Exception:
            return "price old not a number", "check price old column.", mp

    if "Stock quantity (optional)" in mp:
        try:
            mp["Stock quantity (optional)"] = [int(float(str(x).replace(",", "."))) for x in mp["Stock quantity (optional)"]]
        except Exception:
            return "stock not a number", "check stock quantity column.", mp

    if "Url (optional)" in mp:
        if any(len(str(u)) > 500 for u in mp["Url (optional)"]):
            return "url too long", "url must be < 500 chars.", mp

    if "State (optional)" in mp:
        allowed = {"new","used","refurbished"}
        vals = [str(x).lower() for x in mp["State (optional)"]]
        if any(x not in allowed for x in vals):
            return "state invalid", "state must be one of new|used|refurbished", mp
        mp["State (optional)"] = vals

    # extra pictures
    if "Picture (optional)" in mp:
        opt_pics = [str(x) for x in mp["Picture (optional)"]]
        if any(len(p) > 1999 for p in opt_pics):
            return "extra picture url too long", "extra picture must be < 1999 chars.", mp
        if any(" " in p for p in opt_pics):
            return "extra picture url spaces", "extra picture url cannot contain spaces.", mp
        if any(all(ext not in p for ext in [".jpeg",".jpg",".png",".PNG",".webp",".gif"]) for p in opt_pics):
            return "extra picture format not supported", "allowed: .jpeg .jpg .png .PNG .webp .gif", mp
        if any(bool(re.search(r"[\u0400-\u04FF]", p)) for p in opt_pics):
            return "extra picture url cyrillic", "extra picture url cannot contain cyrillic.", mp

    return "", "", mp