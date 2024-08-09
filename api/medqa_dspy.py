import json, openai
from openai import OpenAI
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import dspy
import itertools

import numpy as np
# from pymilvus import Collection
# from dspy.retrieve.milvus_rm import MilvusRM

os.environ['OPENAI_API_KEY'] = ""
client = OpenAI()

class MedQADataset:
    def __init__(self, filepath):
        self.filepath = filepath
        self.data = self.load_data()
        self.train_data, self.dev_data = self.split_data()

    # Loads medqa
    def load_data(self):
        with open(self.filepath, 'r') as file:
            data = json.load(file)
        return data['examples']

    # Split data into train/dev/test
    def split_data(self, test_size=0.2):
        keys = list(self.data.keys())
        train_keys, dev_keys = train_test_split(keys, test_size=test_size, random_state=42)
        train_data = {key: self.data[key] for key in train_keys}
        dev_data = {key: self.data[key] for key in dev_keys}
        print(train_data['1'])
        # print(dict(itertools.islice(train_data.items(), 1)))
        return train_data, dev_data

    # Getter function for train/dev
    def get_train_data(self):
        return self.train_data
    def get_dev_data(self):
        return self.dev_data[:10]

class Evaluator:
    @staticmethod
    def evaluate(predictions, references):
        accuracy = accuracy_score(references, predictions)
        return accuracy

class OptimizeModule:
    def __init__(self, train_data, dev_data):
        self.train_data = train_data
        self.dev_data = dev_data

    def predict(self, inputs):
        predictions = []
        for input_text in inputs:
            response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {'role': 'user', 'content': input_text}])
            predictions.append(response.choices[0].message.content)
        return predictions

    def optimize(self):
        dev_inputs = [item['input'] for item in self.dev_data.values()]
        dev_outputs = [item['output'] for item in self.dev_data.values()]

        predictions = self.predict(dev_inputs)
        accuracy = Evaluator.evaluate(predictions, dev_outputs)
        print(f'Development Set Accuracy: {accuracy}')

class MedQA(dspy.Signature):
    """Answer questions with short factoid answers."""
    question = dspy.InputField()
    answer = dspy.OutputField(desc="often between 1 and 5 words")

# RAG 

# Use ColBert temporarily
colbertv2 = dspy.ColBERTv2(url='http://20.102.90.50:2017/wiki17_abstracts')

class MedicalTextRetrievalModel:
    def __init__(self, collection_name="medical_texts"):
        self.collection = collection_name
    
    def embed_text(self, text):
        embedding = client.embeddings.create(
            input=[text],
            model="text-embedding-3-small")
        
    def search(self, query, top_k=5):
        query_embedding = self.embed_text(query)
        search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
        results = self.collection.search([query_embedding], "embeddings", search_params, limit=top_k)
        texts = [result.entity.get('text') for result in results[0]]
        return texts
    
class DSPYMedicalRAGModule:
    def __init__(self, collection_name="medical_texts"):
        self.retrieval_model = MedicalTextRetrievalModel(collection_name)
        self.rag_model = MilvusRM(self.retrieval_model)

    def answer_question(self, question):
        return self.rag_model.retrieve(question)

if __name__ == "__main__":
    gpt = dspy.OpenAI(model='gpt-3.5-turbo')
    colbertv2 = dspy.ColBERTv2(url='http://20.102.90.50:2017/wiki17_abstracts')
    dspy.settings.configure(lm=gpt, rm=colbertv2)
    dataset = MedQADataset('api/medqa.json')
    train_data = dataset.get_train_data()
    print(train_data)
    dev_data = dataset.get_dev_data()

    optimizer = OptimizeModule(train_data, dev_data)
    optimizer.optimize()

'''
import dspy, json

# Configure MedQA DSPY LLM
gpt = dspy.OpenAI(model='gpt-3.5-turbo')


# Setup MedQA DSPY RAG 
colbertv2_wiki17_abstracts = dspy.ColBERTv2(url='http://20.102.90.50:2017/wiki17_abstracts')
dspy.settings.configure(lm=gpt, rm=colbertv2_wiki17_abstracts)

with open('api/medqa.json', 'r') as f:
  medqa = json.load(f)
# print(medqa)
print(medqa['examples']['1']['input'] )
for example in medqa['examples']:
    print(example)
    question_plus_examples = example['input'] + example['options']['A']
    print(question_plus_examples)
    train = [dspy.Example(question=example['input'], answer=answer).with_inputs('question')]
class MedQA(dspy.Signature):
    """Answer questions with short factoid answers."""

    question = dspy.InputField()
    answer = dspy.OutputField(desc="often between 1 and 5 words")

    # Define the predictor.

generate_answer = dspy.Predict(MedQA)
dev_example = devset[0]

# Call the predictor on a particular input.
pred = generate_answer(question=dev_example.question)

# Print the input and the prediction.
print(f"Question: {dev_example.question}")
print(f"Predicted Answer: {pred.answer}")

retrieve = dspy.Retrieve(k=3)
topK_passages = retrieve(dev_example.question).passages

print(f"Top {retrieve.k} passages for question: {dev_example.question} \n", '-' * 30, '\n')

for idx, passage in enumerate(topK_passages):
    print(f'{idx+1}]', passage, '\n')

class GenerateAnswer(dspy.Signature):
    """Answer questions with short factoid answers."""

    context = dspy.InputField(desc="May contain relevant medical information!")
    question = dspy.InputField()
    answer = dspy.OutputField(desc="Will be a choice between A to D.")

class RAG(dspy.Module):
    def __init__(self, num_passages=3):
        super().__init__()
        self.retrieve = dspy.Retrieve(k=num_passages)
        self.generate_answer = dspy.ChainOfThought(GenerateAnswer)
    
    def forward(self, question):
        context = self.retrieve(question).passages
        prediction = self.generate_answer(context=context, question=question)
        return dspy.Prediction(context=context, answer=prediction.answer)

        
'''