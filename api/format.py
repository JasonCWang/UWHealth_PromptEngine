import random
import numpy as np
from grammar_definition import SimplePromptFormat


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

# Step 1: Read the input prompt
with open('critical_care_prompt.txt', 'r') as file:
    initial_prompt = file.read()
#print(initial_prompt)

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
        
        '''
        # Creating a simple format class randomly
        format_instance = SimplePromptFormat(
            text_descriptor=text_descriptor_fn[1],
            separator=separator,
            text_descriptor_fn=text_descriptor_fn[0]
        )
        random_formats.append({
            "format_instance": format_instance,
            "details": {
                "text_descriptor_fn": text_descriptor_fn[1],
                "item_wrapper": item_wrapper[1],
                "space": space,
                "separator": separator,
                "separator_text_and_option": separator_text_and_option
            }
        })
        '''
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

formatted_prompts = apply_formatting_options(initial_prompt, prompt_formats)
for i, prompt in enumerate(formatted_prompts):
    print(f"Formatted Prompt {i+1}:\n{prompt}\n")


# Step 4: Evaluate prompt formats
def evaluate(formatted_prompts):
    return 0    
def match_robust_to_multiple_choice(generation, answer_to_compare):
    """
    We return whether the generation matched with the expected answer.

    This function assumes clean_text has already been run.
    """
    # likewise, if the response says "article" and the right answer is "a"
    if not generation.startswith(answer_to_compare):
        return False

    # if generation starts with answer and they are the same length, they are the same string
    if len(generation) == len(answer_to_compare):
        return True

    # if the generation starts with the correct text, make sure the next char is not text or number
    # otherwise it might be just the first part of a random word (e.g. "a" with "article")
    # or if correct answer is ii, and all answers are i, ii, iii, iv, avoid being overly optimistic!
    return not generation[len(answer_to_compare)].isalpha() and not generation[len(answer_to_compare)].isdigit()


def exact_prefix_matching_scoring(logs):
    accuracy = {
        'right': [],
        'wrong': [],
        'other': [],
        'total': 0
    }
    for entry in logs:
        clean_text = lambda x: x.strip(' .,()\n-><').lower()

        right_answer = entry['entry']['output'][0]
        wrong_answers = [e for e in entry['output_classes'] if e != right_answer]

        entry['right_answer_formatted'] = right_answer
        entry['wrong_answers_formatted'] = wrong_answers

        right_answer = clean_text(right_answer)
        wrong_answers = [clean_text(e) for e in wrong_answers]
        generation = entry['generation']

        clean_generation = clean_text(generation)
        is_right = match_robust_to_multiple_choice(clean_generation, right_answer)
        is_wrong = any(
            match_robust_to_multiple_choice(clean_generation, wrong_answer) for wrong_answer in wrong_answers)

        accuracy['right'].append(is_right)
        accuracy['wrong'].append(is_wrong)
        accuracy['other'].append(not is_wrong and not is_right)
        accuracy['total'] += 1

        if 'output_classes' in entry and len(entry['output_classes']) > 50:
            del entry['output_classes']

    # not changing this since it's called from many classes
    return (sum(accuracy['right']) * 1.0 / max(accuracy['total'], 1),
            sum(accuracy['wrong']) * 1.0 / max(accuracy['total'], 1),
            accuracy['total']), (accuracy, logs)