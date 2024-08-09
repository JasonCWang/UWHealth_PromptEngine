from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection
from transformers import BertModel, BertTokenizer
import torch
import os
import json

# Connect to Milvus
connections.connect("default", host="localhost", port="19530")

# Define the collection schema
fields = [
    FieldSchema(name="pk", dtype=DataType.INT64, is_primary=True, auto_id=True),
    FieldSchema(name="embeddings", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="text", dtype=DataType.VARCHAR, max_length=65535)
]
schema = CollectionSchema(fields, "Medical Textbook Collection")

# Create the collection
collection = Collection("medical_texts", schema)

# Load pre-trained model and tokenizer
model_name = 'bert-base-uncased'
tokenizer = BertTokenizer.from_pretrained(model_name)
model = BertModel.from_pretrained(model_name)

# Function to embed text
def embed_text(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    outputs = model(**inputs)
    embeddings = outputs.last_hidden_state.mean(dim=1).detach().numpy().tolist()
    return embeddings[0]

# Load text data from the textbooks folder
data_folder = 'path_to_textbooks_folder'
texts = []
for filename in os.listdir(data_folder):
    if filename.endswith(".txt"):
        with open(os.path.join(data_folder, filename), 'r', encoding='utf-8') as file:
            texts.append(file.read())

# Embed and insert the text data into Milvus
embeddings = [embed_text(text) for text in texts]
mr = [
    [embeddings[i], texts[i]]
    for i in range(len(texts))
]
mr = list(map(list, zip(*mr)))
collection.insert(mr)

# Create index on the embeddings field
collection.create_index("embeddings", {"index_type": "IVF_FLAT", "metric_type": "L2", "params": {"nlist": 1024}})
collection.load()

