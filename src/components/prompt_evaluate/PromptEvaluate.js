import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Flex, LoadingOverlay, Text, Textarea } from "@mantine/core";
import InfoPopover from '../InfoPopover';
import { collection, getDocs, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import axios from 'axios';

const PromptEvaluateContext = createContext();

export const usePromptEvaluate = () => useContext(PromptEvaluateContext);

const PromptOutputStep = ({ output, onApprove, onReject, onCustom }) => {
  return (
    <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
      <Text fw={600} align="center" style={{ width: '100%', marginBottom: 10 }}>In-context Learning</Text>
      <Textarea
        autosize
        miw={{ base: 400, sm: 650 }}
        mb={30}
        minRows={15}
        maxRows={15}
        readOnly
        autoFocus={false}
        value={output}
        styles={{
          root: {
            border: 0,
            borderColor: 'blue'
          }
        }}
      />

      <Flex align="center">
        <Text fw={500} align="center" style={{ width: '100%', marginBottom: 10 }}>Save this example?</Text>
        <InfoPopover infoText="Clicking accept will add this example to your prompt!" />
      </Flex>
      <Flex justify="center">
        <Button
          style={{ width: 140, marginRight: 7 }}
          variant="gradient"
          color="green"
          onClick={onApprove}
          gradient={{ from: 'green', to: 'lime', deg: 82 }}
        >
          Approve
        </Button>
        <Button
          style={{ width: 140, marginLeft: 7 }}
          variant="gradient"
          color="red"
          onClick={onReject}
          gradient={{ from: 'pink', to: 'red', deg: 276 }}
        >
          Reject
        </Button>
      </Flex>
      <Text fw={500} align="center" style={{ width: '100%', marginTop: 20 }}>Make your own examples!</Text>
      <Button
        style={{ width: 200, marginLeft: 7, margin: 10 }}
        variant="gradient"
        color="red"
        onClick={onCustom}
        gradient={{ from: 'orange', to: 'yellow', deg: 276 }}
      >
        (In-Progress)
      </Button>
    </Flex>
  );
};

const PromptEvaluateProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToNextStep = () => {
    setCurrentStep((step) => step + 1);
    setDirection(1);
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => step - 1);
    setDirection(-1);
  };

  const value = {
    currentStep,
    direction,
    goToNextStep,
    goToPreviousStep,
  };

  return (
    <PromptEvaluateContext.Provider value={value}>
      {children}
    </PromptEvaluateContext.Provider>
  );
};

const PromptEvaluateContent = ({ username, llm, usecase, choicePrompts, numExamples, perplexities, doneAndRestart }) => {
  const { currentStep, goToNextStep, goToPreviousStep } = usePromptEvaluate();
  const [chosenExamples, setChosenExamples] = useState(0);

  const currentOutput = choicePrompts[currentStep]?.message;

  const [compiledPrompt, setCompiledPrompt] = useState([currentOutput]);
  const [groundTruths, setGroundTruths] = useState([]);
  const [consistencyData, setConsistencyData] = useState([]);
  const [submittedAndLoading, setSubmittedAndLoading] = useState(false);
  const [optimalPrompt, setOptimalPrompt] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  var totalExamples = groundTruths.length;
  const currentExample = '\n\nExample:\n\nPatient: ' + groundTruths[currentStep]?.patient + '\n\nDoctor: ' + groundTruths[currentStep]?.doctor;

  const handleApprove = () => {
    // Logic to save the approved prompt output
    setChosenExamples(chosenExamples + 1);
    setCompiledPrompt([
      ...compiledPrompt,
      currentExample
    ])
    goToNextStep();
  };

  const handleReject = () => {
    // Logic to discard the rejected prompt output
    goToNextStep();
  };

  const handleCustom = () => {
    console.log('in progress')
  };

  const fetchGT = async () => {
    await getDocs(collection(db, "general_gt"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }));
        setGroundTruths(newData);
        console.log('IN CONTEXT EXAMPLES DATASET:', newData);
      })
  };

  const fetchConsistencyData = async () => {
    await getDocs(collection(db, "self_consistency"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }));
        setConsistencyData(newData);
        console.log('GROUND TRUTH DATASET:', newData);
      })
  };

  const handleSubmit = async () => {
    setSubmittedAndLoading(true);
    const data = await handlePush();
    setSubmitted(true);
    setOptimalPrompt(data);
    console.log('SELF-CONSISTENCY', data);
    setSubmittedAndLoading(false);
  };

  const finalSubmit = async () => {
    setSubmittedAndLoading(true);
    const parsed_prompt = optimalPrompt.split('Example:\n\n')
    const final_prompt = parsed_prompt[0]
    const examples_list = parsed_prompt.slice(1)
    console.log('FINAL PROMPT', optimalPrompt)
    const data = {
      'username': username,
      'usecase': usecase,
      'llm': llm,
      'prompt': final_prompt,
      'examples': examples_list,
      'perplexity': perplexities[0][1],
      'timestamp': serverTimestamp()
    };
    const docRef = doc(collection(db, "final_prompts_v2"));
    await setDoc(docRef, data);
    console.log("FINISHED")
    setSubmittedAndLoading(false);

    doneAndRestart();
  };

  const handlePush = async () => {
    // compiledPrompt[1-6]
    const delay = ms => new Promise(res => setTimeout(res, ms));
    var prompt1 = compiledPrompt[0][0]
    var prompt2 = compiledPrompt[0][1]
    console.log('Current Prompts', compiledPrompt)
    for (let i = 1; i < compiledPrompt.length; i++) {
      prompt1 += compiledPrompt[i]
      prompt2 += compiledPrompt[i]
    }
    console.log('FULL PROMPT1', prompt1)
    console.log('FULL PROMPT2', prompt2)
    var self_consistency_1 = []
    var self_consistency_2 = []
    const iterations = 1 // Limit to 1 GT for now (Wait for faster turbo model)
    for (let i = 0; i < iterations; i++) {
      const consistency_1 = await runSelfConsistencyScript(prompt1, consistencyData[i]?.patient, consistencyData[i]?.doctor, llm)
      self_consistency_1.push(consistency_1['self_consistency']);
      const consistency_2 = await runSelfConsistencyScript(prompt2, consistencyData[i]?.patient, consistencyData[i]?.doctor, llm)
      self_consistency_2.push(consistency_2['self_consistency']);
    }
    console.log('CONSISTENCIES 1', self_consistency_1)
    console.log('CONSISTENCIES 2', self_consistency_2)

    var mean1 = eval(self_consistency_1.join('+')) / self_consistency_1.length
    var mean2 = eval(self_consistency_2.join('+')) / self_consistency_2.length
    if (mean1 > mean2) {
      return prompt1
    }
    else {
      return prompt2
    }
  };



  const runSelfConsistencyScript = async (string1, string2, string3, llm) => {
    const endpoint = 'http://127.0.0.1:5000/calculate-cosine-similarity/'
    const jsonData = { 'string1': string1, 'string2': string2, 'string3': string3 , 'llm': llm }

    try {
      const response = await axios.post(endpoint, jsonData);
      return response.data;
    } catch (error) {
      console.error('Error making axios request:', error);
    }
  };

  useEffect(() => {
    fetchGT();
    fetchConsistencyData();
  }, [])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {submitted ?
        <Flex w={"100%"} align={"center"} direction={"column"}>
          <Text mt={20} ta={"center"} fw={600} size='md' c={"gray.8"}>The Final Prompt</Text>
          <Text mt={25} size={"md"} fw={500} ta={"center"} c={"gray.8"}>Generated using {llm} for {usecase}</Text>
          <Textarea
            autosize
            m={20}
            mt={5}
            mb={10}
            style={{ width: '100%', minWidth: '400px', maxWidth: '800px' }}
            minRows={5}
            maxRows={15}
            readOnly
            autoFocus={false}
            value={optimalPrompt}
          />
          <Button
            style={{ width: '100%', maxWidth: '800px' }}
            align={"center"}
            m={20}
            mt={10}
            onClick={finalSubmit}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
          >
            Approve and Submit
          </Button>
        </Flex>
        :
        <>
          {chosenExamples < numExamples ?
            <>
              <Text mt={25} size={"md"} fw={500} ta={"center"} c={"gray.8"}>Example {currentStep + 1} out of {totalExamples} Total Examples</Text>
              <Text mb={-40} size={"md"} fw={500} ta={"center"} c={"gray.6"}>{chosenExamples} out of {numExamples} Examples Chosen</Text>
              <StepContainer key={currentStep}>
                <PromptOutputStep
                  output={currentExample}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCustom={handleCustom}
                />
              </StepContainer>
            </>
            :
            <Flex w={"100%"} align={"center"} direction={"column"}>
              <LoadingOverlay visible={submittedAndLoading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} />
              {compiledPrompt.map((item, index) => {
                return (
                  <Flex w={"100%"} align={"center"} direction={"column"} key={index}>
                    {index === 0 ?
                      <Flex mt={15} align="center">
                        <Text ta={"center"} fw={600} size='md' c={"gray.8"} style={{ width: '100%', marginBottom: 8 }}>Potential Prompt</Text>
                        <InfoPopover infoText="NOTE: This may not be the prompt chosen! These are just some potential paraphrases!" />
                      </Flex>
                      :
                      <Text ta={"center"} fw={600} size='md' c={"gray.8"}>Example {index}</Text>
                    }
                    <Textarea
                      autosize
                      m={20}
                      mt={5}
                      mb={10}
                      style={{ width: '100%', minWidth: '400px', maxWidth: '800px' }}
                      minRows={5}
                      maxRows={15}
                      readOnly
                      autoFocus={false}
                      value={item}
                    />
                  </Flex>
                )
              })}
              <Button
                style={{ width: 400, maxWidth: '800px' }}
                align={"center"}
                m={20}
                mt={10}
                onClick={() => handleSubmit()}
                variant="gradient"
                gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
              >
                Approve and Submit
              </Button>
              <InfoPopover infoText="Your prompt and examples will be run against our ground truth dataset for self-consistency!" />
            </Flex>
          }
        </>
      }
    </div>
  );
};

const StepContainer = ({ children, key }) => {
  const { currentStep, direction } = usePromptEvaluate();

  const variants = {
    initial: direction > 0 ? { opacity: 0, x: 200 } : { opacity: 0, x: -200 },
    animate: { opacity: 1, x: 0 },
    exit: direction > 0 ? { opacity: 0, x: 200 } : { opacity: 0, x: -200 },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <AnimatePresence>
        <motion.div
          key={currentStep}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
          style={{ position: 'absolute', width: '100%', top: 60 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PromptEvaluate = ({ username, llm, usecase, choicePrompts, numExamples, perplexities, doneAndRestart }) => {
  return (
    <PromptEvaluateProvider>
      <PromptEvaluateContent username={username} llm={llm} usecase={usecase} choicePrompts={choicePrompts} numExamples={numExamples} perplexities={perplexities} doneAndRestart={doneAndRestart} />
    </PromptEvaluateProvider>
  );
};

export default PromptEvaluate;