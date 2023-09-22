import argparse
import multiprocessing
import os
from hashlib import sha256
from multiprocessing import Manager, Pool
import streamlit as st

multiprocessing.set_start_method("spawn", force=True)

parser = argparse.ArgumentParser(description="run app.py with args")
parser.add_argument("-r", "--read-only", action="store_true", help="whether to run it as read-only mode")

LLM_list = ["GPT-4", "LLaMA"]

llm_key = st.selectbox(
    "Use Case",
    LLM_list,
    key="llm_select",
    index=0,
    help="Select the llm to work on.")

usecase_list = ["Question & Answer", "1-Page Visit Summuary", "Diagnosis Summarization"]

usecase_key = st.sidebar.selectbox(
    "Use Case",
    usecase_list,
    key="usecase_select",
    index=0,
    help="Select the usecase to work on.",
    )