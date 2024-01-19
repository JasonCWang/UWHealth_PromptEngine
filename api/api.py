import torch, json, betterprompt, openai
import os
from flask import Flask, request
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
from flask_cors import CORS
import math

os.environ['OPENAI_API_KEY'] = "### OPENAI API KEY ###"
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased") 
model = AutoModel.from_pretrained("bert-base-uncased", output_hidden_states=True) 

app = Flask(__name__)
CORS(app, origins="*")

'''
This endpoint takes in three values and calculates the cosine similarity for self-consistency. 

POST request fields:
String1 = The prompt we are trying to evaluate
String2 = Ground Truth question (Patient)
String3 = Ground Truth response we are expecting (Doctor)
'''
@app.route('/calculate-cosine-similarity/', methods = ['POST'])
def measure_self_consistency_auto_bert():
    print("Entering endpoint...")
    if request.method == 'POST':
        data = json.loads(request.data)
    else:
        return {"self_consistency": "error"}
    
    string1 = data['string1']
    string2 = data['string2']
    string3 = data['string3']
    model_type = data['llm']
    if model_type == 'GPT-4':
        use_model = 'gpt-4-1106-preview'
    elif model_type == 'GPT-3':
        use_model = 'gpt-3.5-turbo-1106'
    num_instances = 3
    list_instances = []
    print('USING MODEL:', use_model)
    for i in range(num_instances):
        gpt_output = openai.ChatCompletion.create(
            model = use_model,
            messages=[
                {'role': 'system', 'content': string1},
                {'role': 'user', 'content': string2 }],
            temperature=0.5,
            max_tokens=160,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0)
        list_instances.append(gpt_output['choices'][0]['message']['content'])
    
    ground_truth_embedding = model(**tokenizer(string3,return_tensors='pt', max_length=256, padding=True, truncation=True))
    self_consistencies = []
    for doctor_response in list_instances:
        # Tokenize and encode the strings
        prompt_encoding = model(**tokenizer(doctor_response,return_tensors='pt', max_length=256, padding=True, truncation=True))
        prompt_encoding = model(**tokenizer(doctor_response,return_tensors='pt', max_length=256, padding=True, truncation=True))
        # Get the model's output
        with torch.no_grad():
            embeddings1= prompt_encoding.pooler_output.detach().numpy()
            embeddings2= ground_truth_embedding.pooler_output.detach().numpy()
        
        # Calculate cosine similarity
        cosine_sim = cosine_similarity(embeddings1, embeddings2)
        self_consistencies.append(cosine_sim[0][0])
    print('List of cosine similarities', self_consistencies)
    output = sum(self_consistencies)/len(self_consistencies)
    print('Mean cosine similarity', output)
    return {'self_consistency': str(output)}

'''
This function calculates the best perplexities given a user-inputted prompt.
It returns two lists: the best paraphrases and the least perplexities. 
'''
@app.route('/calculate-best-perplexity/<prompt>', methods = ['GET'])
def measure_perplexity(prompt):
    print("Entering endpoint...")
    # Code inspired by betterprompt
    # https://github.com/stjordanis/betterprompt/blob/main/betterprompt/__init__.py
    def calculate_perplexity(prompt: str):
        nlls = []
        gpt_output = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {'role': 'user', 'content': prompt}],
                logprobs=True,
        )
        print(gpt_output)
        word_logprobs = gpt_output["choices"][0]["logprobs"]["content"]
        token_logprobs = []
        for probs in word_logprobs:
            token_logprobs.append(probs['logprob'])
        print(token_logprobs)
        perplexity = math.exp(sum(token_logprobs)/len(token_logprobs))
        return perplexity
    # Get paraphrases from openai
    num_paraphrases = '5'
    gpt_output = openai.ChatCompletion.create(
        model='gpt-3.5-turbo-1106',
        messages=[
            {'role': 'user', 'content': "Please paraphrases the following message " + num_paraphrases + " times while keeping the meaning the same. End each paraphrases with @@."},
            {'role': 'user', 'content': prompt }]
    )
    paraphrases = gpt_output['choices'][0]['message']['content']
    print('GPT OUTPUT', paraphrases)
    paraphrase_list = paraphrases.split('@@')
    paraphrase_list = [x.strip() for x in paraphrase_list if x != '' and x != '.']
    print('ALL_PARAPHRASES', paraphrase_list)
    # Get perplexity of each paraphrase
    prompt_score = {}
    for index, paraphrase in enumerate(paraphrase_list):
        perplexity = calculate_perplexity(paraphrase.strip())
        prompt_score[index] = perplexity
    sorted_dict = sorted(prompt_score.items(), key=lambda x: x[1])

    num_paraphrases = 2
    # Get the two paraphrases with the least perplexity
    smallest_keys = [key for key, value in sorted_dict[:num_paraphrases]]
    output_prompts = []
    for prompt_index in smallest_keys:
        output_prompts.append(paraphrase_list[prompt_index])
        
    return {'best_paraphrases': output_prompts, 'least_perplexities': sorted_dict[:num_paraphrases]}