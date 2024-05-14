import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, SimpleGrid, Title, Text, Button, Container, Image, Divider, Space } from '@mantine/core';
import { createStyles } from "@mantine/styles";

import { useAuth } from "../components/AuthProvider";
import NavbarInfo from "../components/NavbarInfo";

// Clinicians instead of physicians, broaden the application
// Add table of contents and label figures
// Deliminate between steps and split it more clearly
// Introduction to rest of website

export function Readme() {

    const { classes, theme } = useStyles();
  
    const { user } = useAuth();
  
    const goToPage = (route) => {
      setActiveComponent(route);
      navigate(route);
    };
  
    const [activeComponent, setActiveComponent] = useState("/");
    const navigate = useNavigate();
  
    return (
  
      <Container size="md" py="xl">
            <Title pl={5} align="center">
              <Image src='clinipromptlogo.png' ml={-5} radius="sm" height={75} fit={"contain"} />
              <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
                Clinician - How To Guide</Text>
            </Title>
            <Divider my="md" />

            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }} pl={5}>
            Introduction - What is CliniPrompt?
            </Text>
            <Text size="md" pl={5}>
            CliniPrompt is a website and software hosted by the ICU Data Science Lab at UW-Madison. Its goal is to help clinicians leverage Large Language Models (LLMs) as effectively as possible through prompting. Specifically, the goal of Prompting is to determine the best way to phrase a certain question to an LLM to get the most accurate result. In this context, a prompt is simply any context or wording that can be provided to an LLM prior to asking a question. 
            <Space h="md" />
            To this end, CliniPrompt takes in any prompt as input and optimizes it to fit your usecase. CliniPrompt is based on the latest and greatest prompting techniques. In each step of the pipeline, we optimize your input prompt more and more until we get an optimized prompt. If you would rather not create a prompt from scratch, please check out the leaderboard! Pick any optimized prompt that corresponds to your usecase and provide this as context before asking your next question to an LLM. If you would like to create your own prompt, the next sections details step-by-step how our pipeline works!
            </Text>
            <Text fw={700} size="md" td="underline" c="red" align="center" >As always, please use caution when using LLMs and and validate the responses in sensitive scenarios! </Text>
            <Divider my="md" />
            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }} pl={5}>
            Overview - How does CliniPrompt work?
            </Text>
            <Text size="md" pl={5}>
            This section walks you though the CliniPrompt pipeline and describes how to use this tool as optimally as possible!
            <Space h="md" />
            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Step 1: Use-case Choice
            </Text>
            If you are ever confused, please use your mouse to hover over any info buttons along the way! These will provide a little more context to help you. To begin, please go to the tab called "Create Prompt" on your lefthand side. The first question you will be asked is which usecase you intend to use the LLM for. The UI will look something like Figure 1. CliniPrompt currently supports four uses cases: General Q/A, Medication Questions, Paperwork Requests, and Result Inquries. Below are some example questions associated with each use-case. Please take a look at the examples below and pick the use-case that most aligns with your intended purpose.

            <Text size="md" fw={700} pl={5}>General Q/A: (MyChart)</Text>
            I have noticed that I'm feeling anxious a lot lately, and it's affecting my sleep and my ability to concentrate at work. What can I do to alleviate my anxiety?
            <Text size="md" fw={700} pl={5}>Medication</Text>
            I've been taking the albuterol inhaler for my wheezing and it's helping some, but I'm still experiencing some wheezing and shortness of breath. Should I increase the dose?
            <Text size="md" fw={700} pl={5}>Paperwork</Text>
            I've been feeling under the weather and couldn't attend my shift at work yesterday. Can you please help me with an excuse letter for my employer?
            <Text size="md" fw={700} pl={5}>Results</Text>
            I received my liver function test results on MyChart and noticed my AST level is near the upper level of the normal range. What should I do?
            <Image src='prompt_input1.png' radius="lg" h={200} fit={"contain"} />
            <Text fw={700} size="md" c="black" align="center" >Figure 1: LLM Use-case Screen</Text>

            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Step 2: LLM Choice
            </Text>
            Next, you will be asked which LLM you intend on using. Since each LLM behaves so differently, each LLM is prompted differently as well. Models can vary in both syntax and wordings so please choose accordingly here! We will use this LLM to evaluate metrics to determine which prompt produces the most accurate result.

            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Step 3: Prompt Paraphrasing
            </Text>
            In this page, you will provide us with a naive prompt to your given usecase. The screen will look similar to Figure 2. Please phrase this prompt like you are asking the LLM to perform a specific task. For instance, you might tell the LLM they are a doctor or industry expert. Be sure to also emphasize any important aspects you want to include. An example is provided in Figure 3. 
            <Space h="md" />
            Next, you will be provided some questions in the form of checkboxes. These are optional, but please read these questions accurately for your usecase. When you are ready, click the submit button! Afterwards, we will paraphrase your prompt 10 times and pick the 4 best optimized paraphrases.  
            <Text fw={700} size="md" td="underline" c="red">This step may take a couple tries, so please try multiple times!</Text>
            <Image src='prompt_input.png' radius="lg" h={300} fit={"contain"} />
            <Text fw={700} size="md" c="black" align="center" >Figure 2: Prompt Input Screen</Text>
            <Image src='prompt_input_filledin.png'radius="lg" h={300} fit={"contain"} />
            <Text fw={700} size="md" c="black" align="center" marginBottom={30} >Figure 3: Filled in Prompt Input Screen </Text>
            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            <Space h="lg" />
            Step 4: Edit an Example (Optional)
            </Text>
            If you chose to include examples in your prompt, we will provide you with the most related examples to include in your prompt! In this page, you will be shown an example related to your use-case (See Figure 4). Here, please edit the example depending on how you feel the doctor should respond! Add any phrases or formalities you prefer or remove any comments you think are better left out. Afterwards, pick the number of examples you would like to include in your prompt and click the next button. At this point, we will calculate the most related examples and only show you examples that we believe are similar to your tone. This may take a few seconds. 
            <Image src='in_context_example.png'radius="lg" h={300} fit={"contain"} />
            <Text fw={700} size="md" c="black" align="center" >Figure 4: Editable Example</Text>
            <Space h="lg" />
            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Step 5: Choosing Examples (Optional)
            </Text>
            You're almost finished! In this step, simply choose some examples to include in your prompt! You can either approve, reset, or reject each example. Please feel free to edit these examples as much as you like as well!
            <Image src='in_context_example_2.png'radius="lg" h={300} fit={"contain"} />
            <Text fw={700} size="md" c="black" align="center" >Figure 4: Example Swipe System</Text>

            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Step 6: Consistency
            </Text>
            <Space h="md"/>
            After you've chosen your examples, simply click the approve button to run our consistency algorithm. We will run a handful of versions of your prompt on a couple examples to see which one most consistenly picks the best response. 
            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Step 7: Usage & Leaderboard
            </Text>
            Thats it! You will be shown your final optimized prompt as well as a final submit button. To see how your prompt ranks against other users, please feel free to checkout the leaderboard tab! Additionally, to reuse previous prompts that you created, please see the prompt history tab.
            <Text fw={700} size="xl" className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }} align="center" >Thanks so much for contributing to CliniPrompt! </Text>
            </Text>

            <Divider my="md" />
            <Text size="xl" fw={700} className={classes.title} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }} pl={5}>
            Glossary
            </Text>
            <Text size="md" fw={700} pl={5} style={{ width: '100%', marginTop: 10, marginBottom: 10 }}>Prompting:</Text>
            <Text size="md" pl={5} style={{ width: '100%', marginBottom: 10 }}>
            This is the process of providing input to a model in order to receive an output. In the context of large language models, a prompt is typically a question or statement that guides the model on what type of response or information is expected.
            </Text>
            <Text size="md" fw={700} pl={5} style={{ width: '100%', marginBottom: 10 }}>Chain-of-Thought Prompt:</Text>
            <Text size="md" pl={5} style={{ width: '100%', marginBottom: 10 }}>
            This type of prompt encourages a step-by-step explanation of how a model arrives at an answer or conclusion. It simulates the reasoning process humans might use to solve a problem, making it easier for the model to generate detailed, thoughtful responses.
            </Text>
            <Text size="md" fw={700} pl={5} style={{ width: '100%', marginBottom: 10 }}>In-Context Example:</Text>
            <Text size="md" pl={5} style={{ width: '100%', marginBottom: 10 }}>
            This refers to providing examples within the prompt itself to guide the model on how to respond. In-context examples help "teach" the model the desired format or style of response by showing it specific instances of similar tasks.
            </Text>
            <Text size="md" fw={700} pl={5} style={{ width: '100%', marginBottom: 10 }}>Perplexity:</Text>
            <Text size="md" pl={5} style={{ width: '100%', marginBottom: 10 }}>
            In language modeling, perplexity is a measurement of how well a probability distribution or probability model predicts a sample. It is often used to evaluate language models, with lower perplexity indicating a model that predicts the sample more accurately.
            </Text>
            <Text size="md" fw={700} pl={5} style={{ width: '100%', marginBottom: 10 }}>Large Language Model (LLM):</Text>
            <Text size="md" pl={5} style={{ width: '100%', marginBottom: 10 }}>
            This refers to a type of AI model trained on vast amounts of text data. These models are capable of understanding and generating human-like text, and can perform a variety of language-based tasks. They are "large" both in terms of the size of their training data and their architectural complexity.
            </Text>
            <Text size="md" fw={700} pl={5} style={{ width: '100%', marginBottom: 10 }}>Ground Truth:</Text>
            <Text size="md" pl={5} style={{ width: '100%', marginBottom: 10 }}>
            The benchmark or reference point against which the model's predictions are evaluated. The term can also refer to the actual data collected from direct observations, used as a basis for algorithms and analytics.
            </Text>
            <Divider my="md" />
      </Container>
    );
  }
  
  export default Readme;


const useStyles = createStyles((theme) => ({
    title: {
      fontSize: 34,
      fontWeight: 900,
      [theme.fn.smallerThan("sm")]: {
        fontSize: 24
      }
    },
    body: {
        fontSize: 20,
        fontWeight: 900,
        [theme.fn.smallerThan("xs")]: {
          fontSize: 18
        }
      },
    description: {
      maxWidth: 600,
      margin: "auto",
  
      "&::after": {
        content: '""',
        display: "block",
        backgroundColor: theme.fn.primaryColor(),
        width: 45,
        height: 2,
        marginTop: theme.spacing.sm,
        marginLeft: "auto",
        marginRight: "auto"
      }
    },
  
    card: {
      border: `10px solid' 
      ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
        }`
    },
  
    cardTitle: {
      "&::after": {
        content: '""',
        display: "block",
        backgroundColor: theme.fn.primaryColor(),
        width: 45,
        height: 2,
        marginTop: theme.spacing.sm
      }
    }
  }));

// import { collection, getDocs, serverTimestamp, setDoc, doc } from "firebase/firestore";
// import { db } from "../../firebase";

// const data = {
//   'username': username,
//   'usecase': usecase,
//   'llm': llm,
//   'prompt': value,
//   'timestamp': serverTimestamp()
// }
// const docRef = doc(collection(db, "user_submitted_prompts"));
// await setDoc(docRef, data);

// const updateFirebase = async () => {
//   var json = require('./paraphrases_no_exclude_test.jsonl');
//   const data = {
//     'username': username,
//     'usecase': usecase,
//     'llm': llm,
//     'prompt': value,
//     'timestamp': serverTimestamp()
//   }
//   const docRef = doc(collection(db, "user_submitted_prompts"));
//   await setDoc(docRef, data);
// };

{/* <Button
loading={finalLoadingButton}
loaderProps={{ type: 'dots' }}
style={{ width: 400, maxWidth: '800px' }}
align={"center"}
m={20}
mt={10}
onClick={() => updateFirebase()}
variant="gradient"
gradient={{ from: 'yellow', to: 'orange', deg: 90 }}>Approve
</Button> */}