# app/services/prepare_input.py
from openpyxl import load_workbook
from openpyxl.utils import get_column_letter
import xml.etree.ElementTree as ET

def init(params: list, tree):
    val_params = {}
    pictures_extra = []

    # build row-wise values
    values = list(tree.values())

    for param, value in zip(params, values):
        if param == "None":
            continue
        
        if param == "Picture (optional)":
            pictures_extra.append(value)
        else:
            val_params[param] = value


    return val_params, pictures_extra