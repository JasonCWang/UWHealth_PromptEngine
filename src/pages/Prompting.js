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
  const [numExamples, setNumExamples] = useState('0');
  const [perplexity, setPerplexity] = useState('0');

  const [outputs, setOutputs] = useState([]);

  const [submittedAndLoading, setSubmittedAndLoading] = useState(false);

  // Set prompt values to defaults
  const doneAndRestart = () => {
    setOutputs([]);
    setPurposeChoice('');
    setLLMChoice('');
    setMyPrompt('');
    setNumExamples('0');
    setSubmittedAndLoading(false);

    notifications.show({
      color: 'green',
      title: 'Success!',
      message: 'Thank you for contributing to cliniprompt ❤️',
    })
  }


  const handleSubmit = async () => {
    setSubmittedAndLoading(true);
    const data = await handlePush();
    console.log("DATA FROM PERPLEXITY", data)
    setLLMChoice(LLMChoice);
    console.log("LLM choice", LLMChoice)
    setPurposeChoice(purposeChoice);
    console.log("Purpose Choice", purposeChoice)
    setSubmittedAndLoading(false);
  }

  const handlePush = async () => {
    let trimmedPrompt = myPrompt.trim();
    const best_prompts = await runPerplexityScript(trimmedPrompt);
    setPerplexity(best_prompts['least_perplexities'])
    setOutputs(prev => [...prev, {
      message: best_prompts['best_paraphrases'],
      LLM: LLMChoice
    }]);
    return best_prompts;
  };

  const runPerplexityScript = async (prompt) => {
    const endpoint = `http://127.0.0.1:5000/calculate-best-perplexity/${prompt}`;
    console.log("endpoint: " + endpoint);

    try {
      const response = await axios.get(endpoint);
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
            outputs.length > 0 ?
              <PromptEvaluate username={name} llm={LLMChoice} usecase={purposeChoice} choicePrompts={outputs} numExamples={numExamples} perplexities={perplexity} doneAndRestart={doneAndRestart} />
              :
              <PromptInput purposeChoice={purposeChoice} setPurposeChoice={setPurposeChoice} LLMChoice={LLMChoice} setLLMChoice={setLLMChoice} myPrompt={myPrompt} setMyPrompt={setMyPrompt} numExamples={numExamples} setNumExamples={setNumExamples} handleSubmit={handleSubmit} />
          }
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