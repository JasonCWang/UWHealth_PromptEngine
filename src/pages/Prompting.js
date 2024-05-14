import React, { useState, useEffect } from "react";

// Google firebase imports
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";

// HTTP request manager import
import axios from 'axios';

// Frontend imports
import { LoadingOverlay, Text } from "@mantine/core";
import { notifications } from '@mantine/notifications';

// Backend imports
import { useAuth } from "../components/AuthProvider";
import PromptInput from "../components/prompt_input/PromptInput";
import PromptEvaluate from "../components/prompt_evaluate/PromptEvaluate";

const Prompting = () => {
  const { user } = useAuth();

  const [name, setName] = useState();
  const [purposeChoice, setPurposeChoice] = useState('');
  const [LLMChoice, setLLMChoice] = useState('');
  const [myPrompt, setMyPrompt] = useState('');
  const [perplexity, setPerplexity] = useState('0');

  const [isCOT, setIsCOT] = useState(false);
  const [isICLearning, setIsICLearning] = useState(false);

  const [potentialPrompts, setPotentialPrompts] = useState([]);

  const [submittedAndLoading, setSubmittedAndLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [personalizedExample, setPersonalizedExample] = useState('')

  // Set prompt values to defaults
  const doneAndRestart = () => {
    setPotentialPrompts([]);
    setPurposeChoice('');
    setLLMChoice('');
    setMyPrompt('');
    setSubmittedAndLoading(false);

    notifications.show({
      color: 'green',
      title: 'Success!',
      message: 'Thank you for contributing to cliniprompt ❤️',
    })
  }

  const handleSubmit = async () => {
    setLoadingButton(true);
    const data = await handlePush();
    if (data == 'error'){
      notifications.show({
        color: "red",
        title: 'ERROR',
        message: 'OpenAI couldn\'t paraphrase the prompt right! Please retry again... 🤥',
      })
    }
    else {
    console.log('Prob with paraphrasing!')
    console.log("DATA FROM PERPLEXITY", data)
    setLLMChoice(LLMChoice);
    console.log("LLM choice", LLMChoice)
    setPurposeChoice(purposeChoice);
    console.log("Purpose Choice", purposeChoice)
    }
    // Set base example to be personalized
    if (purposeChoice == "q/a"){
      setPersonalizedExample('\n\nQuestion: ' + "I have noticed that I'm feeling anxious a lot lately, and it's affecting my sleep and my ability to concentrate at work. What can I do to alleviate my anxiety?" + '\n\nAnswer: ' + "I'm sorry to hear that you're feeling anxious. Anxiety is common, and there are several steps you can take to manage it. Regular physical activity, proper nutrition, getting enough sleep, and practicing relaxation techniques such as meditation or deep breathing can be helpful. If these measures are not enough or if your anxiety is interfering with your daily life, it might be time to seek professional help. Please consider scheduling an appointment with us so we can help you find the right approach to managing your anxiety.");
    }
    else if (purposeChoice == "medication"){
      setPersonalizedExample('\nExample:\n\nQuestion: ' + "I've been taking the albuterol inhaler for my wheezing and it’s helping some, but I'm still experiencing some wheezing and shortness of breath. Should I increase the dose?" + '\n\nAnswer: ' + "I'm sorry to hear that you're still experiencing some wheezing. I see from your medication list that I prescribed it up to every 6 hours as needed but go ahead and increase the frequency to every 4 hours and make sure you take a couple puffs before any big exertional activities. Don’t forget to do your best to avoid any triggers that may be worsening your wheezing. If you are persistently using your albuterol inhaler over next few weeks then let’s schedule an appointment to discuss further.");
    }
    else if (purposeChoice == "paperwork"){
      setPersonalizedExample('\nExample:\n\nQuestion: ' + "I've been feeling under the weather and couldn't attend my shift at work yesterday. Can you please help me with an excuse letter for my employer?" + '\n\nAnswer: ' + "I'm sorry to hear about your health. To provide you with the best possible assistance, could you please provide me with your employer's name, the date you missed work, and a description of your symptoms? This will enable me to create a comprehensive excuse letter for you.");
    }
    else if (purposeChoice == "results"){
      setPersonalizedExample('\nExample:\n\nQuestion: ' + "I received my liver function test results on MyChart and noticed my AST level is near the upper level of the normal range. What should I do?" + '\n\nAnswer: ' + "Hello, I see that your AST level is at the upper end of normal. AST is an enzyme found mainly in the liver. It's important to remember that many factors can affect liver enzyme levels, and yours are still within the normal range and doesn't mean there is a problem. Let's discuss further at your next appointment and we may decide to repeat them again to see how they trend.");
    }
    setLoadingButton(false);

  }

  const handlePush = async () => {
    let trimmedPrompt = myPrompt.trim();
    const best_prompts = await runPerplexityScript(trimmedPrompt);
    if (best_prompts['measure_perplexity'] == 'error'){
      return "error"
    }
    setPerplexity(best_prompts['least_perplexities'])
    setPotentialPrompts(prev => [...prev, {
      message: best_prompts['best_paraphrases'],
      LLM: LLMChoice
    }]);
    return best_prompts;
  };

  const runPerplexityScript = async (prompt) => {
    const endpoint = `http://127.0.0.1:5000/calculate-best-perplexity/`;
    
    console.log("Perplexity Endpoint: " + endpoint);
    console.log("Using Chain of Thought: " + isCOT);
    const jsonData = {'prompt' : prompt, 'isCOT': isCOT}

    try {
      const response = await axios.post(endpoint, jsonData);
      console.log(response);
      return response.data;
    } catch (error) {
      console.error('Error making axios request:', error);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.uid);
      const q = query(
        collection(db, "prompt"),
        where("uid", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(20)
      );

      const unsubscribe = onSnapshot(q, snapshot => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      });

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div style={{ height: "100%", width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {user ?
        <>
          <LoadingOverlay visible={submittedAndLoading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} />
          {
            potentialPrompts.length < 1 ?
              <PromptInput purposeChoice={purposeChoice} setPurposeChoice={setPurposeChoice} LLMChoice={LLMChoice} setLLMChoice={setLLMChoice} myPrompt={myPrompt} setMyPrompt={setMyPrompt} loadingButton={loadingButton} handleSubmit={handleSubmit} setIsICLearning={setIsICLearning} isICLearning={isICLearning} setIsCOT={setIsCOT} />
              :
              <PromptEvaluate username={name} llm={LLMChoice} usecase={purposeChoice} personalizedExample={personalizedExample} setPersonalizedExample={setPersonalizedExample} potentialPrompts={potentialPrompts} perplexities={perplexity} doneAndRestart={doneAndRestart} setIsICLearning={setIsICLearning} isICLearning={isICLearning} isCOT={isCOT} />}
        </>
        :
        <Text
          fw={600}
          size="lg"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'red', deg: 155 }}
          mb={100}
        >
          Please sign in to unlock this functionality!
        </Text>
      }
    </div>
  );
};

export default Prompting;
