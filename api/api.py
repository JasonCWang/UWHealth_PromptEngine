import json, openai
import os
from flask import Flask, request
from transformers import AutoTokenizer, AutoModel
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import KNeighborsClassifier
from flask_cors import CORS
import math
from openai import OpenAI
import numpy as np

os.environ['OPENAI_API_KEY'] = "sk-OlIExXYjR2hQZO92"
client = OpenAI()
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased") 
model = AutoModel.from_pretrained("bert-base-uncased", output_hidden_states=True) 

app = Flask(__name__)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
# app.debug = False
CORS(app)
# app.use(cors());
'''
This endpoint takes in three values and calculates the cosine similarity for self-consistency. 

POST request fields:
String1 = The prompt we are trying to evaluate
String2 = Ground Truth question (Patient)
String3 = Ground Truth response we are expecting (Doctor)
'''
@app.route('/calculate-cosine-similarity/', methods = ['POST'])
def measure_self_consistency_auto_bert():
    print("Entering self consistency endpoint...")
    if request.method == 'POST':
        data = json.loads(request.data)
    else:
        return {"self_consistency": "error"}
    
    string1 = data['string1']
    string2 = data['string2']
    string3 = data['string3']
    print("Paraphrase being evaluated:", string1)
    print("GT Patient Question:", string2)
    print("GT Doctor Response:", string3)

    model_type = data['llm']
    if model_type == 'GPT-4':
        use_model = 'gpt-4-1106-preview'
    elif model_type == 'GPT-3':
        use_model = 'gpt-3.5-turbo-1106'
    
    num_instances = 3
    list_instances = []
    print('USING MODEL:', use_model)
    for i in range(num_instances):
        gpt_output = client.chat.completions.create(
            model = use_model,
            messages=[
                {'role': 'system', 'content': string1},
                {'role': 'user', 'content': string2 }],
            temperature=0.5,
            max_tokens=160,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0)
        list_instances.append(gpt_output.choices[0].message.content)

    ground_truth_embedding = client.embeddings.create(
        input=[string3],
        model="text-embedding-3-small")
    self_consistencies = []
    for doctor_response in list_instances:
        response_embedding = client.embeddings.create(
            input=[doctor_response],
            model="text-embedding-3-small")
        cosine_sim = cosine_similarity(np.array(response_embedding.data[0].embedding).reshape(1, -1), np.array(ground_truth_embedding.data[0].embedding).reshape(1, -1))
        
        self_consistencies.append(cosine_sim[0][0])
    #print('List of cosine similarities', self_consistencies)
    output = sum(self_consistencies)/len(self_consistencies)
    #print('Mean cosine similarity', output)
    return {'self_consistency': str(output)}

'''
This function calculates the best perplexities given a user-inputted prompt.
It returns two lists: the best paraphrases and the least perplexities. 
'''
@app.route('/calculate-best-perplexity/', methods = ['GET', 'POST'])
def measure_perplexity():
    print("Entering perplexity endpoint...")
    if request.method == 'POST':
        data = json.loads(request.data)
    else:
        return {"measure_perplexity": "error"}
    
    prompt = data["prompt"]
    isCOT = data["isCOT"]
    
    # Code inspired by betterprompt
    # https://github.com/stjordanis/betterprompt/blob/main/betterprompt/__init__.py
    def calculate_perplexity(prompt: str):
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {'role': 'user', 'content': prompt}],
                logprobs=True,
        )
        word_logprobs = response.choices[0].logprobs.content
        token_logprobs = []
        for probs in word_logprobs:
            token_logprobs.append(probs.logprob)
        perplexity = math.exp(sum(token_logprobs)/len(token_logprobs))
        return perplexity
    
    print("\nOriginal Prompt:", prompt)
    # If Chain-of-thought requested, get COT prompt from openai
    if isCOT:
        # Chain of thought first, then paraphrase
        print("Entering COT Logic...")
        cot_request = "You are given a prompt to an LLM to answer patient questions in a hospital. Your goal is to make the prompt as chain-of-thought prompt. Lets think step by step. Do not remove any valuable information already present within the original prompt. Make sure it is targeted towards the LLM, NOT the user."
        print("\nChain-of-thought Request:", cot_request)
        gpt_response = client.chat.completions.create(
        model='gpt-3.5-turbo-1106',
        messages=[
            {'role': 'user', 'content': cot_request},
            {'role': 'user', 'content': prompt }])
        prompt = gpt_response.choices[0].message.content
        print("\nChain of Thought Prompt:", prompt)

    # Get paraphrases from openai
    num_paraphrases = '10'
    paraphrase_request = "Please paraphrase the following prompt to ChatGPT " + num_paraphrases + " times and make a list. For each of the " + num_paraphrases + " paraphrases, make sure to keep the meaning the same. End each paraphrases with @@. Do not bullet or number each paraphrase in the list. This is so that I can split the sentences easier later."
    print("\nParaphrase Request:", paraphrase_request)
    gpt_response = client.chat.completions.create(
    model='gpt-3.5-turbo-1106',
    messages=[
        {'role': 'user', 'content': paraphrase_request},
        {'role': 'user', 'content': prompt }])
    
    paraphrases = gpt_response.choices[0].message.content
    print('\nGPT Output:', paraphrases)
    #print('GPT OUTPUT', paraphrases)
    # VALIDATION CHECKS ON PARAPHRASE

    # MAKE SURE THERES 5 PARAPHRASES
    paraphrase_list = paraphrases.split('@@')
    paraphrase_list = [x.replace('-', '').strip() for x in paraphrase_list if x != '' and x != '.']
    #print(paraphrase_list)
    if len(paraphrase_list) != int(num_paraphrases):
        return {"measure_perplexity": "error"}
    
    # Get perplexity of each paraphrase
    prompt_score = {}
    for index, paraphrase in enumerate(paraphrase_list):
        perplexity = calculate_perplexity(paraphrase.strip())
        prompt_score[index] = perplexity
    sorted_dict = sorted(prompt_score.items(), key=lambda x: x[1])

    num_paraphrases = 4
    # Get the two paraphrases with the least perplexity
    smallest_keys = [key for key, value in sorted_dict[:num_paraphrases]]
    output_prompts = []
    for prompt_index in smallest_keys:
        output_prompts.append(paraphrase_list[prompt_index])
    if len(output_prompts) < 4:
        return {"measure_perplexity": "error"}
    return {'best_paraphrases': output_prompts, 'least_perplexities': sorted_dict[:num_paraphrases]}


# COSINE SIMILARITY
@app.route('/get_dynamic_fewshot/', methods = ['GET', 'POST'])
def get_dynamic_fewshot():
    print("Entering fewshot endpoint...")
    if request.method == 'POST':
        data = json.loads(request.data)
    else:
        return {"get_dynamic_fewshot": "error"}
    basePrompt = data['string1']
    personalizedExample = data['string2']
    usecase = data['string3']
    print("Base Prompt:", basePrompt)
    print("Personalized Example:", personalizedExample)
    print("Usecase: ", usecase)
    #Get Target Embedding
    basePrompt = usecase + '\n' + basePrompt
    print("Base Prompt to be embedded:", basePrompt)
    prompt_embedding = client.embeddings.create(
        input=[basePrompt],
        model="text-embedding-3-small")
    #Get Groundtruth Embedding List
    allGroundTruths = data['dict']
    embedding_dict = {}
    for gt in allGroundTruths:
        example = gt['question'] + '\n\n' + gt['answer']
        example_embedding = client.embeddings.create(
            input=[example],
            model="text-embedding-3-small")
        cosine_sim = cosine_similarity(np.array(prompt_embedding.data[0].embedding).reshape(1, -1), np.array(example_embedding.data[0].embedding).reshape(1, -1))
        embedding_dict[cosine_sim[0][0]] = gt
    sorted_dict = dict(sorted(embedding_dict.items(), reverse=True))
    # Get the two paraphrases with the least perplexity
    print("Sorted Examples: ", sorted_dict)
    output_prompts = []
    for cosine_sim, example in sorted_dict.items():
        if cosine_sim > 0.4:
            output_prompts.append(example)
            print(example, cosine_sim, '\n')
    print("Selected Examples", output_prompts)
    return output_prompts


# EUCLIDEAN DISTANCE
@app.route('/get_dynamic_fewshot_2/', methods = ['GET', 'POST'])
def get_dynamic_fewshot_2():
    print("Entering fewshot endpoint...")
    if request.method == 'POST':
        data = json.loads(request.data)
    else:
        return {"get_dynamic_fewshot": "error"}
    basePrompt = data['string1']
    personalizedExample = data['string2']
    print("Base Prompt:", basePrompt)
    print("Personalized Example:", personalizedExample)
    #Get Target Embedding
    prompt_embedding = client.embeddings.create(
        input=[basePrompt],
        model="text-embedding-3-small")
    base_embedding = np.array(prompt_embedding.data[0].embedding).reshape(1, -1)
    print("Base Embedding:", base_embedding)
    #Get Groundtruth Embedding List
    allGroundTruths = data['dict']
    examples = []
    embeddings = []
    for gt in allGroundTruths:
        #if gt['question'] != personalizedExample.split("\n\n")[1].split("Question: ")[1]:
        example = gt['question'] + '\n\n' + gt['answer']
        examples.append(gt)
        example_embedding = client.embeddings.create(
            input=[example],
            model="text-embedding-3-small")
        embeddings.append(example_embedding.data[0].embedding)
    # print("All Examples: ", examples)
    # print("All embeddings: ", embeddings)
    knn = KNeighborsClassifier(n_neighbors=5)
    np_array = np.array(embeddings)
    knn.fit(np_array, np.arange(np_array.shape[0]))
    # Get the two paraphrases with the least perplexity
    print(knn)
    distances, indices = knn.kneighbors(base_embedding)
    print("Distances: ", distances)
    print("Indices: ", indices.tolist())
    output_prompts = []
    for idx in indices.tolist()[0]:
        output_prompts.append(examples[idx])
    print("Selected Examples", output_prompts)
    return output_prompts

import random
import numpy as np

# Pre-defined Sperators and formats
CHOSEN_SEPARATOR_LIST = ['', '::: ', ':: ', ': ', ' \n\t', '\n    ', ' : ', ' - ', ' ', '\n ', '\n\t', ':', '::', '- ', '\t']  # sep='' is used rarely, only for enumerations because there is already formatting there
CHOSEN_SPACE_LIST = ['', ' ', '\n', ' \n', ' -- ',  '  ', '; \n', ' || ', ' <sep> ', ' -- ', ', ', ' \n ', ' , ', '\n ', '. ', ' ,  ']  # space='' is used a lot
CHOSEN_SEPARATOR_TEXT_AND_OPTION_LIST = ['', ' ', '  ', '\t']

CHOSEN_SEPARATOR_LIST = [(e, e) for e in CHOSEN_SEPARATOR_LIST]
CHOSEN_SPACE_LIST = [(e, e) for e in CHOSEN_SPACE_LIST]
CHOSEN_SEPARATOR_TEXT_AND_OPTION_LIST = [(e, e) for e in CHOSEN_SEPARATOR_TEXT_AND_OPTION_LIST]

#Lower case vs Upper Case
TEXT_DESCRIPTOR_FN_LIST = [
    (lambda x: x, "lambda x: x"),
    (lambda x: x.title(), "lambda x: x.title()"),
    (lambda x: x.upper(), "lambda x: x.upper()"),
    (lambda x: x.lower(), "lambda x: x.lower()")
]
ITEM_WRAPPER_LIST = [
    (lambda x: f'({x})', "lambda x: f'({x})'"),
    (lambda x: f'{x}.', "lambda x: f'{x}.'"),
    (lambda x: f'{x})', "lambda x: f'{x})'"),
    (lambda x: f'{x} )', "lambda x: f'{x} )'"),
    (lambda x: f'[{x}]', "lambda x: f'[{x}]'"),
    (lambda x: f'<{x}>', "lambda x: f'<{x}>'"),
]

NUMBER_FORMAT_LIST = [
    (lambda x: x + 1, "lambda x: x + 1"),
    (lambda x: chr(ord('A') + x), "lambda x: chr(ord('A') + x)"),
    (lambda x: chr(ord('a') + x), "lambda x: chr(ord('a') + x)"),
    (lambda x: chr(0x215F + x + 1) + ('' if x < 12 else 0 / 0), "lambda x: chr(0x215F + x + 1)"),
]

@app.route('/format_prompt/', methods = ['GET', 'POST'])
def format_prompt():
    print("Entering formatting endpoint...")
    if request.method == 'POST':
        data = json.loads(request.data)
    else:
        return {"measure_perplexity": "error"}
    # Step 1: Read the input prompt
    prompt = data["prompt"]
    print("Prompt being formatted:", prompt)

    # Step 2: Generate random prompt formats from SimplePromptFormat
    def generate_prompt_formats(num_formats=5):
        random_formats = []
        for i in range(num_formats):
            text_descriptor_fn = random.choice(TEXT_DESCRIPTOR_FN_LIST)
            item_wrapper = random.choice(ITEM_WRAPPER_LIST)
            number_format = random.choice(NUMBER_FORMAT_LIST)
            space = random.choice(CHOSEN_SPACE_LIST)[0]
            separator = random.choice(CHOSEN_SEPARATOR_LIST)[0]
            separator_text_and_option = random.choice(CHOSEN_SEPARATOR_TEXT_AND_OPTION_LIST)[0]
            
            options = {
                "text_descriptor_fn": text_descriptor_fn,
                "item_wrapper": item_wrapper,
                "number_format": number_format,
                "space": space,
                "separator": separator,
                "separator_text_and_option": separator_text_and_option
            }
            random_formats.append(options)
        return random_formats

    prompt_formats = generate_prompt_formats()
    print(prompt_formats)

    # Step 3: Apply formats to input prompt
    def apply_formatting_options(initial_prompt, prompt_formats):
        formatted_prompts = []
        for options in prompt_formats:
            #print(options)
            # Apply text_descriptor_fn to the entire prompt
            formatted_prompt = options["text_descriptor_fn"][0](initial_prompt)
            # Split the prompt into items (for demonstration, let's consider lines as items)
            items = formatted_prompt.splitlines()
            # Apply item_wrapper to each item
            wrapped_items = [options["item_wrapper"][0](item) for item in items if item.strip() != ""]
            # Join the items with the chosen separator
            formatted_prompt = options["separator"].join(wrapped_items)
            # Add the chosen space
            formatted_prompt = f"{options['space']}{formatted_prompt}{options['space']}"
            # Apply separator_text_and_option
            formatted_prompt = f"{options['separator_text_and_option']}{formatted_prompt}"
            
            formatted_prompts.append(formatted_prompt)
        
        return formatted_prompts

    # Step 4: Evaluate prompt formats
    def evaluate(formatted_prompts):
        return 0
        
    formatted_prompts = apply_formatting_options(prompt, prompt_formats)
    for i, prompt in enumerate(formatted_prompts):
        print(f"Formatted Prompt {i+1}:\n{prompt}\n")
    
    return formatted_prompts
