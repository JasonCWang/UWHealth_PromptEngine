import argparse
import functools
import multiprocessing
import os
import textwrap
from hashlib import sha256
from multiprocessing import Manager, Pool
import betterprompt
from numpy import random

import pandas as pd
import plotly.express as px
import streamlit as st
from datasets import get_dataset_infos
from datasets.info import DatasetInfosDict
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import DjangoLexer

from promptsource import DEFAULT_PROMPTSOURCE_CACHE_HOME
from promptsource.session import _get_state
from promptsource.templates import INCLUDED_USERS, LANGUAGES, METRICS, DatasetTemplates, Template, TemplateCollection
from promptsource.utils import (
    get_dataset,
    get_dataset_confs,
    list_datasets,
    removeHyphen,
    renameDatasetColumn,
    render_features,
)


DATASET_INFOS_CACHE_DIR = os.path.join(DEFAULT_PROMPTSOURCE_CACHE_HOME, "DATASET_INFOS")
os.makedirs(DATASET_INFOS_CACHE_DIR, exist_ok=True)

# Python 3.8 switched the default start method from fork to spawn. OS X also has
# some issues related to fork, eee, e.g., https://github.com/bigscience-workshop/promptsource/issues/572
# so we make sure we always use spawn for consistency
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


def format_language(tag):
    """
    Formats a language tag for display in the UI.

    For example, if the tag is "en", then the function returns "en (English)"
    :param tag: language tag
    :return: formatted language name
    """
    return tag + " (" + LANGUAGES[tag] + ")"


# add an argument for read-only
# At the moment, streamlit does not handle python script arguments gracefully.
# Thus, for read-only mode, you have to type one of the below two:
# streamlit run promptsource/app.py -- -r
# streamlit run promptsource/app.py -- --read-only
# Check https://github.com/streamlit/streamlit/issues/337 for more information.
parser = argparse.ArgumentParser(description="run app.py with args")
parser.add_argument("-r", "--read-only", action="store_true", help="whether to run it as read-only mode")

args = parser.parse_args()
if args.read_only:
    select_options = ["Progress Summary", "List Dataset"]
    side_bar_title_prefix = "Promptsource (Read only)"
else:
    select_options = ["Progress Summary","List Dataset", "Create Dataset", "Create Prompt"]
    side_bar_title_prefix = "Promptsource"

def run_app():
    #
    # Loads session state
    #
    state = _get_state()

    def reset_template_state():
        state.template_name = None
        state.jinja = None
        state.reference = None

    #
    # Initial page setup
    #
    st.title("UW-Madison Prompt Engine")
    st.sidebar.image('promptsource/assets/madison_logo.png')
    st.sidebar.markdown(
        "<center>Code from: <a href='https://github.com/bigscience-workshop/promptsource'>Promptsource\n\n</a></center>",
        unsafe_allow_html=True,
    )
    mode = st.sidebar.selectbox(
        label="Choose a mode",
        options=select_options,
        index=0,
        key="mode_select",
    )
    st.sidebar.title(f"{side_bar_title_prefix} - {mode}")

    #
    # Adds pygments styles to the page.
    #
    st.markdown(
        "<style>" + HtmlFormatter(style="friendly").get_style_defs(".highlight") + "</style>", unsafe_allow_html=True
    )

    WIDTH = 140

    def show_jinja(t, width=WIDTH):
        def replace_linebreaks(t):
            """
            st.write does not handle double breaklines very well. When it encounters `\n\n`, it exit the curent <div> block.
            Explicitely replacing all `\n` with their html equivalent to bypass this issue.
            Also stripping the trailing `\n` first.
            """
            return t.strip("\n").replace("\n", "<br/>")

        wrap = textwrap.fill(t, width=width, replace_whitespace=False)
        out = highlight(wrap, DjangoLexer(), HtmlFormatter())
        out = replace_linebreaks(out)
        st.write(out, unsafe_allow_html=True)

    def show_text(t, width=WIDTH, with_markdown=False):
        wrap = [textwrap.fill(subt, width=width, replace_whitespace=False) for subt in t.split("\n")]
        wrap = "\n".join(wrap)
        if with_markdown:
            st.write(wrap, unsafe_allow_html=True)
        else:
            st.text(wrap)

    if mode == "Progress Summary":
        placeholder = st.empty()
        with placeholder.form("api_form"):
            api_key = st.text_input(
                        "Please input API Key",
                        key="",
                        value="",
                        help="Enter API Key and hit enter to create a new prompt.",
                        )
            new_api_key_submitted = st.form_submit_button("Submit")
            api_key = api_key
        if new_api_key_submitted:
            placeholder.empty()
        st.title("Summary of Prompts")
        #
        # Loads template data
        #
        try:
            template_collection = TemplateCollection()
        except FileNotFoundError:
            st.error(
                "Unable to find the prompt folder!\n\n"
                "We expect the folder to be in the working directory. "
                "You might need to restart the app in the root directory of the repo."
            )
            st.stop()

        #
        # Global metrics
        #
        counts = template_collection.get_templates_count()
        nb_prompted_datasets = len(counts)
        st.write(f"## Number of *prompted datasets*: `{nb_prompted_datasets}`")
        nb_prompts = sum(counts.values())
        st.write(f"## Number of *prompts*: `{nb_prompts}`")

    else:
        # Combining mode 'List Prompt', `Create Dataset` and `Create Prompt` since the backbone is the same

        usecase_list = ["Question & Answer", "1-Page Visit Summuary", "Diagnosis Summarization"]

        usecase_key = st.sidebar.selectbox(
            "Use Case",
            usecase_list,
            key="usecase_select",
            index=0,
            help="Select the usecase to work on.",
            )
        if usecase_key == "Question & Answer":  
            folderpath = "./promptsource/databases/MyChart_message"
            dataset_list = os.listdir(folderpath)

            dataset_key = st.sidebar.selectbox(
            "Q/A Datasets",
            dataset_list,
            key="dataset_select",
            index=0,
            help="Select the QA dataset to work on.",
            )
            if mode == "List Dataset":
                print(list_datasets())
            else:  # mode = Create Prompt
                #
                # Create a new template or select an existing one
                #
                col1a, col1b, _, col2 = st.beta_columns([9, 9, 1, 6])

                # current_templates_key and state.templates_key are keys for the templates object
                current_templates_key = dataset_key
                dataset_templates = DatasetTemplates(dataset_key, None)

                # Resets state if there has been a change in templates_key
                if state.templates_key != current_templates_key:
                    state.templates_key = current_templates_key
                    reset_template_state()

                with col1a, st.form("new_template_form"):
                    new_template_name = st.text_input(
                        "Create a New Prompt",
                        key="new_template",
                        value="",
                        help="Enter name and hit enter to create a new prompt.",
                    )
                    new_template_submitted = st.form_submit_button("Create")
                    if new_template_submitted:
                        if new_template_name in dataset_templates.all_template_names:
                            st.error(
                                f"A prompt with the name {new_template_name} already exists "
                                f"for dataset {state.templates_key}."
                            )
                        elif new_template_name == "":
                            st.error("Need to provide a prompt name.")
                        else:
                            template = Template(new_template_name, "", "")
                            dataset_templates.add_template(template)
                            reset_template_state()
                            state.template_name = new_template_name
                    else:
                        state.new_template_name = None

                with col1b, st.beta_expander("or Select Prompt", expanded=True):
                    template_list = dataset_templates.all_template_names
                    if state.template_name:
                        index = template_list.index(state.template_name)
                    else:
                        index = 0
                    state.template_name = st.selectbox(
                        "", template_list, key="template_select", index=index, help="Select the prompt to work on."
                    )

                    if st.button("Delete Prompt", key="delete_prompt"):
                        dataset_templates.remove_template(state.template_name)
                        reset_template_state()

                variety_guideline = """
                :heavy_exclamation_mark::question:Creating a diverse set of prompts whose differences go beyond surface wordings (i.e. marginally changing 2 or 3 words) is highly encouraged.
                Ultimately, the hope is that exposing the model to such a diversity will have a non-trivial impact on the model's robustness to the prompt formulation.
                \r**To get various prompts, you can try moving the cursor along theses axes**:
                \n- **Interrogative vs affirmative form**: Ask a question about an attribute of the inputs or tell the model to decide something about the input.
                \n- **Task description localization**: where is the task description blended with the inputs? In the beginning, in the middle, at the end?
                \n- **Implicit situation or contextualization**: how explicit is the query? For instance, *Given this review, would you buy this product?* is an indirect way to ask whether the review is positive.
                """

                #
                # Edit the created or selected template
                #
                if state.template_name is not None:
                    template = dataset_templates[state.template_name]
                    #
                    # If template is selected, displays template editor
                    #
                    with st.form("edit_template_form"):
                        updated_template_name = st.text_input("Name", value=template.name)
                        state.reference = st.text_input(
                            "Prompt Reference",
                            help="Short description of the prompt for the prompt.",
                            value=template.reference,
                        )

                        # Metadata
                        state.metadata = template.metadata
                        state.metadata.choices_in_prompt = st.checkbox(
                            "Choices in Template?",
                            value=template.metadata.choices_in_prompt,
                            help="Prompt explicitly lists choices in the template for the output.",
                        )

                        state.metadata.metrics = st.multiselect(
                            "Metrics",
                            sorted(METRICS),
                            default=template.metadata.metrics,
                            help="Select all metrics that are commonly used (or should "
                            "be used if a new task) to evaluate this prompt.",
                        )

                        state.metadata.languages = st.multiselect(
                            "Prompt Languages",
                            sorted(LANGUAGES.keys()),
                            default=template.metadata.languages,
                            format_func=format_language,
                            help="Select all languages used in this prompt. "
                            "This annotation is independent from the language(s) "
                            "of the dataset.",
                        )

                        # Answer choices
                        if template.get_answer_choices_expr() is not None:
                            answer_choices = template.get_answer_choices_expr()
                        else:
                            answer_choices = ""
                        state.answer_choices = st.text_input(
                            "Answer Choices",
                            value=answer_choices,
                            help="A Jinja expression for computing answer choices. "
                            "Separate choices with a triple bar (|||).",
                        )

                        # Jinja
                        state.jinja = st.text_area("Template", height=40, value=template.jinja)

                        # Submit form
                        if st.form_submit_button("Submit"):
                            folderpath = "./promptsource/templates/temp_templates/"
                            filename = "prompt_paraphrase_v3.txt"
                            temp_dict = {}
                            with open(os.path.join(folderpath,filename), 'r') as my_file:
                                for line in my_file:
                                    perplexity = random.rand() # betterprompt.calculate_perplexity(line)
                                    temp_dict[line] = perplexity
                                    
                            st.title("Paraphrases of Prompt:")
                            print(temp_dict)

                            
                            '''
                            if (
                                updated_template_name in dataset_templates.all_template_names
                                and updated_template_name != state.template_name
                            ):
                                st.error(
                                    f"A prompt with the name {updated_template_name} already exists "
                                    f"for dataset {state.templates_key}."
                                )
                            elif updated_template_name == "":
                                st.error("Need to provide a prompt name.")
                            else:
                                # Parses state.answer_choices
                                if state.answer_choices == "":
                                    updated_answer_choices = None
                                else:
                                    updated_answer_choices = state.answer_choices

                                dataset_templates.update_template(
                                    state.template_name,
                                    updated_template_name,
                                    state.jinja,
                                    state.reference,
                                    state.metadata,
                                    updated_answer_choices,
                                )
                                # Update the state as well
                                state.template_name = updated_template_name
                                '''
                        

    #
    # Must sync state at end
    #
    state.sync()


if __name__ == "__main__":
    run_app()
