import os
import streamlit as st
import pandas as pd
import numpy as np
import random
import betterprompt
from promptsource.templates import INCLUDED_USERS, LANGUAGES, METRICS, DatasetTemplates, Template, TemplateCollection

st.title("Prompt Creator")

st.sidebar.image('promptsource/assets/school_logo.png')

with st.form("api_key"):
    api_key = st.text_input(
                "Please input API Key",
                key="api",
                value="",
                help="Enter API Key and hit enter to create a new prompt.",
                )
    submitted = st.form_submit_button("Submit")
    if submitted:
        st.success('Valid API Key', icon="✅")

os.environ['OPENAI_APIs_KEY'] = "new_api_key_submitted"

LLM_list = ["GPT-4", "LLaMA"]

llm_key = st.sidebar.selectbox(
    "LLM",
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

col1a, col1b = st.columns([9, 9])

template_names = []
with col1a, st.form("new_template_form"):
    new_template_name = st.text_input(
        "Create a New Prompt",
        key="new_template",
        value="",
        help="Enter name and hit enter to create a new prompt.",
    )
    new_template_submitted = st.form_submit_button("Create")
    if new_template_submitted:
        template = Template(new_template_name, "", "")
        state.template_name = new_template_name
        template_names.append(new_template_name)

with col1b, st.expander("or Select Prompt", expanded=True):
    template_list = template_names

    template_name = st.selectbox(
        "", template_list, 
        key="template_select", 
        index=0, 
        help="Select the prompt to work on."
    )

is_COT = st.checkbox('Is this a Chain-Of-Thought Prompt?')
fewshot_num = st.slider('How many-shot prompt?', 0, 10, 5)

with st.form("prompt_input"):
    prompt_input = st.text_input(
                "Please input your new prompt here",
                key="prompt",
                value="",
                help="Hit submit to create a new prompt.",
                )
    submitted = st.form_submit_button("Submit")
    
    if submitted:
        prompt = st.text_area("Prompt", height=40, value=template.jinja)
        st.markdown("Working to create better prompt for you...")
