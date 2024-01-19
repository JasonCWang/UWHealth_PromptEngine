# CliniPrompt

Cliniprompt is a project in conjunction with UW-Madison and UC-Berkeley! We are trying to create a unified, easy-to-use prompt engineering tool that allows anyone to create optimal prompts for their own usecase.

## Local Setup

### Download this repository

Run ```git clone https://github.com/KaluJo/cliniprompt-public``` or use Github Desktop to download the repository to your desired location. 

Run `cd CliniPrompt` to enter the repository. 

### Install necessary packages

Run ```npm install```. This should install all necessary packages, which are listed under `package.json`.

### Configure APIs

To successfully run CliniPrompt, you need a valid OpenAI API key as well as a configured Firebase project. 

After obtaining an OpenAI API key, please copy and paste it into the `### OPENAI API KEY ###` field in the api/api.py folder.

After configuring a Firebase project, please update the `firebaseConfig` data within the firebase.js file in /src.

Note: If the project needs to be hosted, these will need to be configured as environment variables.

### Run code

Run ```npm start```. This terminal session will be your local react server. 

Open a new terminal session. 

Run `cd api` to navigate to the `api` directory. 

Run ```flask run```. This terminal session will be the flask server. 

Now, you can experiment with the app on http://localhost:3000/!

## Documentation

### Frontend

#### UI Framework

CliniPrompt uses a UI component library called [Mantine](https://mantine.dev/). This powerful library streamlines the development process, giving access to useful components such as "NavLink" for navbar links and beautifully styled buttons.

#### Pages

The frontend is separated into separate components. For example, the Navbar.js file contains the component that renders the navbar used to navigate between different sections of the app. 

The main functionality of the app—prompt creation—is separated into two components, PromptInput.js and PromptEvaluate.js. PromptInput helps select the use-case, LLM, starter prompt, and # of examples. After selection, we move to PromptEvaluate, where the user can approve or reject various examples and evaluate the final prompt. In the end, the prompt is added to the database.

#### Abstraction & Generalization

This project is intended to function as a generalizable open-source project for crowdsourcing prompt data. If you would like to use this project for a use-case apart from hospital/clinical setting, you can do so! However, this will require changing some of the ground-truth examples to better fit your specific use-case.

### Backend

The backend of CliniPrompt can be separated into three main sections: user authentification, data storage, and prompt evaluations. Below are more details regarding our implementation of each.

#### User Auth

When a user signs into CliniPrompt, we assign a unique user id per user. This opens the functionality of the rest of the tabs. We store the account information in google firebase as future reference. Please check Auth.js, Home.js, and HomeLogin.js for our auth implementation. 

#### Data Storage

We store a variety of databases in Cliniprompt. These databases can be categorized into our prompt database, in-context exemplars database, and self-consistency database. Within the prompt creator pipeline, we store a variety of information related to each prompt. Below is the schema we chose to implement this information. We push information to the firebase only during user account setup and when the final prompt is finalized. This simplifies our overhead and load when it comes to calls to our data. 

##### Prompt DB Schema:
naive_prompt - String
final_prompt - String
timestamp - Timestamp
uid - String
examples - Int : String
LLM - String
Usecase - String
Perplexity - Number
Self-consistency - Number

##### In-context Exemplars DB Schema:
doctor - String
patient - String
Creator-prompt - String (If applicable)

##### Self-consistency DB Schema:
doctor - String (Hand-chosen Exemplars)
patient - String (Hand-chosen Exemplars)

#### Prompt Evaluations 

Prompt evaluations are the backbone of the backend implementation of CliniPrompt. During version one of CliniPrompt, we narrowed down our focus to perplexity and self-consistency, both proven propt evaluation metrics. Please see related work for more information. As OpenAI API deprecated many functionalities related to log probabilities and other metrics, we chose to utilize legacy API calls through a backend implemented in python. Here, we develop scripts to quickly calculate metrics using LLMs such as GPT-3.5-Turbo, GPT-4, and LLaMA. Our simple-to-follow implementation can be found under CliniPrompt/api/api.py. In order to integrate our python scripts into our JavaScript project, we chose to utilize flask. Specifically, axios helps us send HTTP calls and POST commands allow us to retrieve the given information from our frontend. This code can be found in CliniPrompt/src/pages/Prompting.js and CliniPrompt/src/components/prompt_evaluate/PrommptEvaluate.js. 

## Related Work

Wang, Xuezhi, et al. "Self-consistency improves chain of thought reasoning in language models." arXiv preprint arXiv:2203.11171 (2022).

Gonen, Hila, et al. "Demystifying prompts in language models via perplexity estimation." arXiv preprint arXiv:2212.04037 (2022).
