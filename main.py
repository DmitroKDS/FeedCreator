import asyncio

import logging
from logging.handlers import RotatingFileHandler

import loops.api
import loops.cacher

from config import Config

import os
import traceback

from services import rozetka_api




async def safe_run(coro, name):
    while True:
        try:
            logging.info(f"🔁 Starting task: {name}")
            await coro()
        except Exception:
            logging.error(f"❌ Task '{name}' error; {traceback.print_exc()}")
            logging.exception(f"❌ Task '{name}' failed; restarting in 2 seconds")
            await asyncio.sleep(2)



async def main():
    Config.rz_token = await rozetka_api.get_access_token(Config.RZ_USERNAME, Config.RZ_PASSWORD)
    Config.rz_categories = await rozetka_api.get_categories(Config.rz_token)
    await asyncio.gather(
        safe_run(loops.api.init, "api"),
        safe_run(loops.cacher.init, "cacher")
    )

if __name__ == "__main__":
    # Create folders
    folders = ["cache", "cache/files", "cache/trees", "cache/new_trees"]
    for f in folders:
        if not os.path.exists(f):
            os.makedirs(f)


    # SETTING LOGS

    root = logging.getLogger()
    root.setLevel(logging.INFO)

    fh = RotatingFileHandler(
        filename="log.log",
        maxBytes=5 * 1024 * 1024,
        backupCount=5,
        encoding="utf-8",
    )
    fh.setLevel(logging.INFO)

    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)

    fmt = logging.Formatter(
        "%(asctime)s %(levelname)-8s [%(name)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    fh.setFormatter(fmt)
    ch.setFormatter(fmt)

    class ExcludeGoogleGenAIModels(logging.Filter):
        def filter(self, record: logging.LogRecord) -> bool:
            return "google_genai.models" not in record.name
    fh.addFilter(ExcludeGoogleGenAIModels())
    ch.addFilter(ExcludeGoogleGenAIModels())

    root.addHandler(fh)
    root.addHandler(ch)




    # RUN


    asyncio.run(main())