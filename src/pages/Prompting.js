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
  const [usecase, setUseCase] = useState('');
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
    setUseCase('');
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
      console.log("Perplexity Dictionary", data)
      console.log("LLM choice", LLMChoice)
      setLLMChoice(LLMChoice);
    }
    // Set base example to be personalized
    setPersonalizedExample("\nQuestion: \n\nAnswer: ");
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
    var endpoint;
    if (window.location.hostname == 'localhost'){
      endpoint = `http://127.0.0.1:5000/calculate-best-perplexity/`;
    }
    else {
      endpoint = `/api/calculate-best-perplexity/`;
    }
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
              <PromptInput usecase={usecase} setUseCase={setUseCase} LLMChoice={LLMChoice} setLLMChoice={setLLMChoice} myPrompt={myPrompt} setMyPrompt={setMyPrompt} loadingButton={loadingButton} handleSubmit={handleSubmit} setIsICLearning={setIsICLearning} isICLearning={isICLearning} setIsCOT={setIsCOT} />
              :
              <PromptEvaluate username={name} llm={LLMChoice} usecase={usecase} personalizedExample={personalizedExample} setPersonalizedExample={setPersonalizedExample} potentialPrompts={potentialPrompts} perplexities={perplexity} doneAndRestart={doneAndRestart} setIsICLearning={setIsICLearning} isICLearning={isICLearning} isCOT={isCOT} />}
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
