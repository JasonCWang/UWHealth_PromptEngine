import argparse
import multiprocessing
import os
from hashlib import sha256
from multiprocessing import Manager, Pool
import streamlit as st
import pandas as pd
import numpy as np
import random
from promptsource.templates import INCLUDED_USERS, LANGUAGES, METRICS, DatasetTemplates, Template, TemplateCollection


multiprocessing.set_start_method("spawn", force=True)

st.title("Prompt Database")

st.sidebar.image('promptsource/assets/school_logo.png')

LLM_list = ["GPT-4", "LLaMA"]

llm_key = st.selectbox(
    "LLM",
    LLM_list,
    key="llm_select",
    index=0,
    help="Select the llm to work on.")

usecase_list = ["Question & Answer", "1-Page Visit Summuary", "Diagnosis Summarization"]

usecase_key = st.selectbox(
    "Use Case",
    usecase_list,
    key="usecase_select",
    index=0,
    help="Select the usecase to work on.",
    )

with open("promptsource/templates/temp_templates/prompt_paraphrase_v3.txt", mode="r") as prompt_file:
    f = prompt_file.read()

df = pd.DataFrame(
    {
        "rank": [i for i in range(1, len(f.split("#"))+1)],
        "perplexity": [random.randint(0, 1000) for _ in range(21)],
        "N-Shot": [1] * len(f.split("#")),
        "Chain of thought": [False] * len(f.split("#")),
        "prompt": f.split("#"),
    }
)

st.dataframe(
    df,
    column_config={
        "rank": st.column_config.NumberColumn(
            "Prompt Rank",
            help="Rank based on perplexity, self-complexity, and others",
            format="%d ⭐"),
        "perplexity": "Perplexity",
        "fewshot": "N-Shot",
        "cot": "Chain of Thought",
        "prompt": "Prompt",
    },
    hide_index=True,
)