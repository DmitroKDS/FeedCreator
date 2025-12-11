import asyncio
import json
import copy
import logging
import os
from config import Config

# Sentinel to mark "drop this value"
_DROP = object()

def _normalize(value):
    """Keep only dict/list/str/int/float/None. Recurse into dicts/lists and drop others."""
    if value is None or isinstance(value, (str, int, float)):
        return value
    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            nv = _normalize(v)
            if nv is not _DROP:
                out[k] = nv
        return out
    if isinstance(value, list):
        out = []
        for v in value:
            nv = _normalize(v)
            if nv is not _DROP:
                out.append(nv)
        return out

    return _DROP

def _ensure_parent_dir(path: str):
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)

async def init():
    old = {}

    while True:
        try:
            new = {
                "cache/history.json": _normalize(Config.history),
                "cache/current_data.json": _normalize(Config.current_data),
                "cache/categories.json": _normalize(Config.categories),
            }

            for name, tree in getattr(Config, "trees", {}).items():
                new[f"cache/trees/{name}.json"] = {name: tree}

            for name, new_tree in getattr(Config, "new_trees", {}).items():
                new[f"cache/new_trees/{name}.json"] = {name: new_tree}

            for path, snapshot in new.items():
                if snapshot is _DROP:
                    logging.warning(f"⚠️ Skip saving {path}: top-level value is not a simple JSON type")
                    continue

                # Only write if changed
                if snapshot != old.get(path):
                    old[path] = copy.deepcopy(snapshot)

                    _ensure_parent_dir(path)
                    tmp_path = path + ".tmp"
                    try:
                        with open(tmp_path, "w", encoding="utf-8") as f:
                            json.dump(old[path], f, ensure_ascii=False, indent=2)
                        os.replace(tmp_path, path)  # atomic on same filesystem
                        logging.info(f"💾 Wrote {path}")
                    except Exception as e:
                        logging.error(f"❌ Failed to write {path}: {e}")
                        # Clean temp if something went wrong
                        try:
                            if os.path.exists(tmp_path):
                                os.remove(tmp_path)
                        except Exception:
                            pass

        except Exception as loop_err:
            logging.exception(f"💥 Saver loop error (continuing): {loop_err}")

        await asyncio.sleep(5)