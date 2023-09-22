import argparse
import functools
import multiprocessing
import os
import textwrap
from hashlib import sha256
from multiprocessing import Manager, Pool
from numpy import random

import pandas as pd
import plotly.express as px
import streamlit as st
from datasets import get_dataset_infos
from datasets.info import DatasetInfosDict
from promptsource.templates import INCLUDED_USERS, LANGUAGES, METRICS, DatasetTemplates, Template, TemplateCollection

multiprocessing.set_start_method("spawn", force=True)


def get_infos(all_infos, d_name):
    """
    Wrapper for mutliprocess-loading of dataset infos

    :param all_infos: multiprocess-safe dictionary
    :param d_name: dataset name
    """
    d_name_bytes = d_name.encode("utf-8")
    d_name_hash = sha256(d_name_bytes)
    foldername = os.path.join(DATASET_INFOS_CACHE_DIR, d_name_hash.hexdigest())
    if os.path.isdir(foldername):
        infos_dict = DatasetInfosDict.from_directory(foldername)
    else:
        infos = get_dataset_infos(d_name)
        infos_dict = DatasetInfosDict(infos)
        os.makedirs(foldername)
        infos_dict.write_to_directory(foldername)
    all_infos[d_name] = infos_dict

# Initial page setup
st.set_page_config(page_title="Home")
st.title("Welcome to UW-Madison Healthcare Prompt Engine")
st.image('promptsource/assets/madison_logo.png')
st.markdown(
    "<center>Code from: <a href='https://github.com/bigscience-workshop/promptsource'>Promptsource\n\n</a></center>",
    unsafe_allow_html=True,
)
st.subheader(
    "PromptSource Background"
)
st.markdown("""
    PromptSource is a toolkit for creating, sharing and using natural language prompts. Recent work has shown that large language models exhibit the ability to perform reasonable zero-shot generalization to new tasks. For instance, GPT-3 demonstrated that large language models have strong zero- and few-shot abilities. FLAN and T0 then demonstrated that pre-trained language models fine-tuned in a massively multitask fashion yield even stronger zero-shot performance. A common denominator in these works is the use of prompts which has gained interest among NLP researchers and engineers. This emphasizes the need for new tools to create, share and use natural language prompts.

    PromptSource provides the tools to create, and share natural language prompts, and then use the thousands of existing and newly created prompts through a simple API. Prompts are saved in standalone structured files and are written in a simple templating language called Jinja."""
)
st.markdown(
    """Please use the pages on the left to navigate the website"""
)


#Load Templates
try:
    template_collection = TemplateCollection()
except FileNotFoundError:
    st.error(
        "Unable to find the prompt folder!\n\n"
        "We expect the folder to be in the working directory. "
        "You might need to restart the app in the root directory of the repo."
    )
    st.stop()

#Global Metrics
st.subheader("Summary of Prompt Engine")
counts = template_collection.get_templates_count()
nb_prompted_datasets = len(counts)
st.write(f"#### Total Number of *prompted usecases*: `{nb_prompted_datasets}`")
nb_prompts = sum(counts.values())
st.write(f"#### Number of *prompts*: `{nb_prompts}`")