import aiohttp
import json
import logging


async def request(req: str, url: str, headers: dict, data: dict|None = None):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, timeout=aiohttp.ClientTimeout(total=10), headers=headers, json=data) if req=="POST" else session.get(url, timeout=aiohttp.ClientTimeout(total=10), headers=headers) as resp:
            try:
                res = await resp.json()
            except:
                res = await resp.text()


    if resp.status not in [200, 204]:
        logging.warning(f"❌ Error {req} ({url}) [{data}]\n{res}")
    
    return res



async def get_access_token(username: str, password: str) -> str:
    r = await request(
        "POST",
        "https://api-seller.rozetka.com.ua/sites",
        {"Content-Type": "application/json"},
        {"username": username, "password": password}
    )

    return r["content"]["access_token"]



async def get_categories(token: str) -> dict:
    r = await request(
        "GET",
        "https://api-seller.rozetka.com.ua/market-categories/search?pageSizeLimit=100000",
        {"Content-Type": "application/json","Content-Language":"uk","Authorization":f"Bearer {token}"}
    )
        
    return {c["category_id"]:c["name"] for c in r["content"]["marketCategorys"] }



async def get_category_params(token: str, category_id: str):
    print(category_id)
    r = await request(
        "GET",
        f"https://api-seller.rozetka.com.ua/v1/market-categories/category-options?category_id={category_id}",
        {"Content-Type":"application/json","Content-Language":"uk","Authorization":f"Bearer {token}"},
    )
    raw = json.loads(r["content"])

    params = {}

    for p in raw:
        name = p["name"]
        params.setdefault(name, {
            "details": {
                "type": p.get("attr_type","TextInput"),
                "values": {},
                "unit": str(p.get("unit","")).replace("None","")
            },
            "id": p["id"]
        })
        
        if p.get("attr_type","TextInput") in ["CheckBoxGroupValues","ComboBox","List","ListValues"]:
            params[name]["details"]["values"][p["value_name"]] = p["value_id"]


    return params