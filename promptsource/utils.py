# coding=utf-8
import os
import csv

import datasets
import requests

from promptsource import DEFAULT_PROMPTSOURCE_CACHE_HOME
from promptsource.templates import INCLUDED_USERS


def removeHyphen(example):
    example_clean = {}
    for key in example.keys():
        if "-" in key:
            new_key = key.replace("-", "_")
            example_clean[new_key] = example[key]
        else:
            example_clean[key] = example[key]
    example = example_clean
    return example


def renameDatasetColumn(dataset):
    col_names = dataset.column_names
    for cols in col_names:
        if "-" in cols:
            dataset = dataset.rename_column(cols, cols.replace("-", "_"))
    return dataset


#
# Helper functions for datasets library
#


def get_dataset_builder(path, conf=None):
    "Get a dataset builder from name and conf."
    module_path = datasets.load.dataset_module_factory(path)
    builder_cls = datasets.load.import_main_class(module_path.module_path, dataset=True)
    if conf:
        builder_instance = builder_cls(name=conf, cache_dir=None, hash=module_path.hash)
    else:
        builder_instance = builder_cls(cache_dir=None, hash=module_path.hash)
    return builder_instance


def get_dataset(path, conf=None):
    "Get a dataset from name and conf."
    try:
        return datasets.load_dataset(path, conf)
    except datasets.builder.ManualDownloadError:
        cache_root_dir = (
            os.environ["PROMPTSOURCE_MANUAL_DATASET_DIR"]
            if "PROMPTSOURCE_MANUAL_DATASET_DIR" in os.environ
            else DEFAULT_PROMPTSOURCE_CACHE_HOME
        )
        data_dir = f"{cache_root_dir}/{path}" if conf is None else f"{cache_root_dir}/{path}/{conf}"
        try:
            return datasets.load_dataset(
                path,
                conf,
                data_dir=data_dir,
            )
        except Exception as err:
            raise err
    except Exception as err:
        raise err


def get_dataset_confs(path):
    "Get the list of confs for a dataset."
    module_path = datasets.load.dataset_module_factory(path).module_path
    # Get dataset builder class from the processing script
    builder_cls = datasets.load.import_main_class(module_path, dataset=True)
    # Instantiate the dataset builder
    confs = builder_cls.BUILDER_CONFIGS
    if confs and len(confs) > 1:
        return confs
    return []


def render_features(features):
    """Recursively render the dataset schema (i.e. the fields)."""
    if isinstance(features, dict):
        return {k: render_features(v) for k, v in features.items()}
    if isinstance(features, datasets.features.ClassLabel):
        return features.names

    if isinstance(features, datasets.features.Value):
        return features.dtype

    if isinstance(features, datasets.features.Sequence):
        return {"[]": render_features(features.feature)}
    return features


#
# Loads dataset information
#

def list_datasets():
    """Get all the datasets to work with."""
    folderpath = "./promptsource/databases/MyChart_message"
    fewshot, ground_truth = []

    for filename in os.listdir(folderpath):
        if filename.endswith(".txt"):
            print(filename.split("_"))
            if filename[1] == "example.txt":
                f = open(os.path.join(folderpath,filename), 'r')
                ground_truth.append(f.read())
            elif filename[1] == "fewshot.txt":
                f = open(os.path.join(folderpath,filename), 'r')
                fewshot.append(f.read())
                
    return fewshot, ground_truth

def list_summarization_datasets():
    """Get all the datasets to work with."""
    print("TBD")
                
    return []
