import React, { useState, useEffect, createContext, useContext } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, Button, Flex, LoadingOverlay, Text, Textarea, Select, Accordion, Space } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import InfoPopover from '../InfoPopover';
import { collection, getDocs, serverTimestamp, setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import axios from 'axios';
import { FaPencilAlt } from "react-icons/fa";

const PromptEvaluate = ({ username, llm, usecase, personalizedExample, setPersonalizedExample, potentialPrompts, perplexities, doneAndRestart, setIsICLearning, isICLearning }) => {
  const [numExamples, setNumExamples] = useState('0');
  const [temp, setTemp] = useState(false);
  const handleEditing = (value) => {
    setPersonalizedExample(value)
  }
  return (
    <div style={{ height: "100%", width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      {
        temp == false ?
          <PotentialPrompts potentialPrompts={potentialPrompts} temp={temp} setTemp={setTemp} />
          :
          isICLearning == true ?
            <DetermineNumberExamples potentialPrompts={potentialPrompts} personalizedExample={personalizedExample} handleEditing={handleEditing} numExamples={numExamples} setNumExamples={setNumExamples} setIsICLearning={setIsICLearning} />
            :
            <PromptEvaluateProvider>
              <PromptEvaluateContent username={username} llm={llm} usecase={usecase} potentialPrompts={potentialPrompts} numExamples={numExamples} perplexities={perplexities} doneAndRestart={doneAndRestart} personalizedExample={personalizedExample} isICLearning={isICLearning} />
            </PromptEvaluateProvider>
      }
    </div>
  );
};

export default PromptEvaluate;

// Logic for UI/UX
const PromptEvaluateContent = ({ username, llm, usecase, potentialPrompts, numExamples, perplexities, doneAndRestart, personalizedExample}) => {
  // Functions to step through GT
  const { currentStep, goToNextStep, goToPreviousStep } = usePromptEvaluate();
  // Keep track of accepted examples
  const [chosenExamples, setChosenExamples] = useState(0);
  // All potential paraphrases from original prompt
  const currentOutput = potentialPrompts[0]?.message;
  // console.log(currentOutput)
  // Keep track of current optimal prompt
  const [compiledPrompt, setCompiledPrompt] = useState([currentOutput]);

  const [submittedAndLoading, setSubmittedAndLoading] = useState(false);

  // Variable for final chosen prompt
  const [optimalPrompt, setOptimalPrompt] = useState(null);

  // Flag to help with final submission
  const [submitted, setSubmitted] = useState(false);

  // Flag to help with custom example
  const [createdExample, setCreatedExample] = useState(false);

  const [groundTruths, setGroundTruths] = useState([]);
  const [totalNumExamples, setTotalNumExamples] = useState('[Calculating...]');

  // Variables for editable examples
  var [isEdited, setEdited] = useState(false);
  var currentExample = '\nExample:\n\nQuestion: ' + groundTruths[currentStep]?.question + '\n\nAnswer: ' + groundTruths[currentStep]?.answer;
  var [value, setCustomPrompt] = useState('\nExample:\n\nQuestion: ' + groundTruths[currentStep]?.question + '\n\nAnswer: ' + groundTruths[currentStep]?.answer);

  // Variable for user submitted example
  var [userExample, setUserExample] = useState("\nInput: \n\nOutput: ");
  const handleCustomPrompt = (value) => {
    setCustomPrompt(value)
    setEdited(true)
  }
  const [finalLoadingButton, setFinalLoadingButton] = useState(false);

  /*

  const [consistencyData, setConsistencyData] = useState([]);
  // Code to fetch data from Firebase 
  const fetchConsistencyData = async () => {
    await getDocs(collection(db, "self_consistency"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }));
        setConsistencyData(newData);
        console.log('SELF CONSISTENCY DATASET:', newData);
      })
  };
  */

  const runDynamicFewShotScript = async (basePrompt, personalizedExample, groundTruths, usecase) => {
    var endpoint;
    if (window.location.hostname == 'localhost') {
      endpoint = 'http://127.0.0.1:5000/get_dynamic_fewshot/'
    }
    else {
      endpoint = '/api/get_dynamic_fewshot/'
    }
    const jsonData = { 'string1': basePrompt, 'string2': personalizedExample, 'string3': usecase, 'dict': groundTruths }

    try {
      const response = await axios.post(endpoint, jsonData);
      return response.data;
    } catch (error) {
      console.error('Error making axios request:', error);
    }
  };
  const fetchAllGT = async () => {
    await getDocs(collection(db, "general_gt"))
      .then((querySnapshot) => {
        const allGroundTruths = querySnapshot.docs
          .map((doc) => ({ ...doc.data(), id: doc.id }));
        setGroundTruths(allGroundTruths);
        console.log("Done w/ Async!")
      })
  };

  const fetchChosenGT = async () => {
    // DYNAMIC FEW-SHOT LOGIC
    // Append personalized example with least perplexity prompt
    // ## Could replace praphrase 0 with optimal perplexity prompt ##
    console.log("Usecase", usecase)
    console.log("POTENTIAL PROMPTS", potentialPrompts)
    const basePrompt = potentialPrompts[0].message[0] + "\nExamples:\n\n"+ personalizedExample
    console.log("BASE PROMPT", basePrompt)
    console.log("All GT", groundTruths)
    const chosenGroundTruths = await runDynamicFewShotScript(basePrompt, personalizedExample, groundTruths, usecase)
    console.log("Chosen GT", chosenGroundTruths)
    setGroundTruths(chosenGroundTruths);
    var currentExample = '\nExample:\n\nQuestion: ' + chosenGroundTruths[currentStep]?.question + '\n\nAnswer: ' + chosenGroundTruths[currentStep]?.answer;
    setCustomPrompt(currentExample)
    setTotalNumExamples(chosenGroundTruths.length)
    return chosenGroundTruths
  };

  // Define Hook and Obtain GT Once in beginning
  useEffect(() => {
    fetchAllGT();
  }, [])

  /*
  HANDLE STEP LOGIC
  */
  const handleApprove = async () => {
    setChosenExamples(chosenExamples + 1);
    console.log("IS EDITED?", isEdited)
    if (isEdited == true) {
      const data = {
        'username': username,
        'usecase': usecase,
        'llm': llm,
        'example': value,
        'timestamp': serverTimestamp()
      }
      const docRef = doc(collection(db, "user_submitted_examples"));
      await setDoc(docRef, data);
    }
    setCompiledPrompt([
      ...compiledPrompt,
      value
    ])
    currentExample = '\nExample:\n\nQuestion: ' + groundTruths[currentStep]?.question + '\n\nAnswer: ' + groundTruths[currentStep]?.answer;
    console.log(currentExample)
    setCustomPrompt(currentExample)
    goToNextStep();
  };

  const handleReject = async () => {
    currentExample = '\nExample:\n\nQuestion: ' + groundTruths[currentStep]?.question + '\n\nAnswer: ' + groundTruths[currentStep]?.answer;
    console.log(currentExample)
    setCustomPrompt(currentExample)
    goToNextStep();
  };

  const handlePrevious = () => {
    if (currentStep != 0) {
      goToPreviousStep();
    }
  };

  const handleReset = async () => {
    currentExample = '\nExample:\n\nQuestion: ' + groundTruths[currentStep - 1]?.question + '\n\nAnswer: ' + groundTruths[currentStep - 1]?.answer;
    console.log(currentExample)
    setCustomPrompt(currentExample)
  };
  const addExample = async () => {
    setChosenExamples(chosenExamples + 1);
    console.log(userExample)
    const data = {
      'username': username,
      'usecase': usecase,
      'llm': llm,
      'example': userExample,
      'timestamp': serverTimestamp()
    }
    const docRef = doc(collection(db, "user_submitted_examples"));
    await setDoc(docRef, data);
    setCompiledPrompt([
      ...compiledPrompt,
      userExample
    ])
    setUserExample("\nInput: \n\nOutput: ")
  };
  
  /*

  Button Logic

  */

  // Step 2 Logic
  const runConsistencyLogic = async () => {
    setFinalLoadingButton(true);
    const data = await runComparePrompts();
    setSubmitted(true);
    setOptimalPrompt(data);
    console.log('Best Prompt:', data);
    setFinalLoadingButton(false);
  };

  const runComparePrompts = async () => {
    var prompts = []
    var means = []
    for (let i =0; i < compiledPrompt[0].length; i++) {
      var prompt = compiledPrompt[0][i]
      console.log('Prompt being evaluated...\n', prompt)
      // Append all examples to the prompt
      for (let i = 1; i < compiledPrompt.length; i++) {
        if (i == 1){
          prompt += "\nExamples:\n\n"
        }
        prompt += compiledPrompt[i]
      }
      console.log('Full Prompt...\n', prompt)
      prompts.push(prompt)
      var self_consistency = []
      const iterations = 1 // Limit to 1 GT for now (Wait for faster turbo model)
      for (let i = 0; i < iterations; i++) {
        var consistency = await runSelfConsistencyScript(prompt, llm)
        self_consistency.push(consistency['self_consistency']);
      }
      console.log('Self Consistencies... \n', self_consistency)
      var mean = eval(self_consistency.join('+')) / self_consistency.length
      means.push(mean)
    }
    const max = Math.max.apply(Math, means);
    const index = means.indexOf(max);
    return prompts[index]
  };

  const runSelfConsistencyScript = async (prompt, llm) => {
    var endpoint;
    if (window.location.hostname == 'localhost') {
      endpoint = 'http://127.0.0.1:5000/calculate-cosine-similarity/'
    }
    else {
      endpoint = '/api/calculate-cosine-similarity/'
    }
    const jsonData = { 'prompt': prompt, 'llm': llm }

    try {
      const response = await axios.post(endpoint, jsonData);
      return response.data;
    } catch (error) {
      console.error('Error making axios request:', error);
    }
  };

  const runFormattingScript = async (prompt) => {
    var endpoint;
    if (window.location.hostname == 'localhost') {
      endpoint = 'http://127.0.0.1:5000/format_prompt/';
    }
    else {
      endpoint = '/api/format_prompt/';
    }
    const jsonData = { 'prompt': prompt }

    try {
      const response = await axios.post(endpoint, jsonData);
      return response.data;
    } catch (error) {
      console.error('Error making axios request:', error);
    }
  };

  const handleFormatting = async () => {
    const best_prompts = await runFormattingScript(optimalPrompt);
    setOptimalPrompt(best_prompts[0])
  };

  // Step 3 Logic
  const runFinalSubmit = async () => {
    setSubmittedAndLoading(true);
    const parsed_prompt = optimalPrompt.split('\n\nExamples:\n\n')
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

  const handleUserExample = (example) => {
    setUserExample(example)
  }
  return (
    currentStep == 0 ?
      <ExplanationPage goToNextStep={goToNextStep} fetchChosenGT={fetchChosenGT} />
      :
      submitted == false ?
        chosenExamples < numExamples ?
          totalNumExamples == 0 || currentStep > totalNumExamples ?
            createdExample == false ?
              <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
                <Text size="xl" fw={500} align="center" style={{ width: '100%', marginBottom: 20 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
                  Create Examples</Text>
                <Text align="center" fw={500} style={{ width: '100%', marginBottom: 10 }}>Unfortunately, there were no more matching examples in our database... 🤥</Text>
                <Text align="center" fw={500} style={{ width: '100%', marginBottom: 10 }}>Would you like to include your own example?</Text>
                <Flex justify="center">
                  <Button
                    style={{ width: 140, marginLeft: 7 }}
                    variant="gradient"
                    color="green"
                    onClick={() => setCreatedExample(true)}
                    gradient={{ from: 'green', to: 'lime', deg: 276 }}>Yes
                  </Button>
                  <Button
                    style={{ width: 140, marginLeft: 7 }}
                    variant="gradient"
                    color="red"
                    onClick={() => setChosenExamples(5)}
                    gradient={{ from: 'pink', to: 'red', deg: 276 }}>No
                  </Button>
                </Flex>
              </Flex>
              :
              <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
                <Text size="xl" fw={500} align="center" style={{ width: '100%', marginBottom: 20 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
                  Create Examples</Text>
                <Text size="lg" fw={600} style={{ width: '100%', marginTop: 20 }} align="center" >
                  Please provide an example input and output below:<InfoPopover infoText="This is where you can provide an example of what your usecase might look like!" />
                </Text>
                <Text mt={10} mb={5} size={"md"} fw={500} ta={"center"} c={"gray.7"}>{chosenExamples} out of {numExamples} Potential Examples Created</Text>
                <Textarea
                  autosize
                  mb={10}
                  miw={{ base: 400, sm: 650 }}
                  minRows={20}
                  maxRows={14}
                  value={userExample}
                  onChange={(event) => handleUserExample(event.currentTarget.value)}
                  withAsterisk
                />
                <Flex justify="center">
                  <Button
                    style={{ width: 200, marginLeft: 7 }}
                    variant="gradient"
                    color="green"
                    onClick={() => addExample()}
                    gradient={{ from: 'green', to: 'lime', deg: 276 }}>Add example
                  </Button>
                  <Button
                    style={{ width: 200, marginLeft: 7 }}
                    variant="gradient"
                    color="red"
                    onClick={() => setChosenExamples(5)}
                    gradient={{ from: 'pink', to: 'red', deg: 276 }}>Done with examples
                  </Button>
                </Flex>
              </Flex>
            :
            <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
              <Text fw={600} size="xl" align="center" variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }} style={{ width: '100%', marginTop: 30, marginBottom: 10 }}>Picking Examples</Text>
              <Text mt={25} size={"md"} fw={500} ta={"center"} c={"gray.8"}>Example {currentStep} out of {totalNumExamples} Total Examples</Text>
              <Text mt={25} size={"md"} fw={500} ta={"center"} c={"gray.7"}>{chosenExamples} out of {numExamples} Examples Chosen</Text>
              <Text mt={25} size={"md"} fw={500} ta={"center"} c={"gray.6"}>Generating for {llm} </Text>
              <StepContainer key={currentStep}>
                <ApprovalUI
                  value={value}
                  onApprove={handleApprove}
                  onReset={handleReset}
                  onReject={handleReject}
                  onCustomPrompt={handleCustomPrompt}
                  onPrevious={handlePrevious}
                />
              </StepContainer>
            </Flex>
          :
          // When all examples are chosen, move to next approval screen
          <Flex w={"100%"} align={"center"} direction={"column"}>
            <LoadingOverlay visible={submittedAndLoading} zIndex={1000} overlayProps={{ radius: "xl", blur: 2 }} />
            <Text size="xl" fw={500} align="center" style={{ width: '100%', marginBottom: 20 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Chosen Examples</Text>
            {compiledPrompt.map((item, index) => {
              return (
                <Flex w={"100%"} align={"center"} direction={"column"} key={index}>
                  {index === 0 ?
                    <Flex w={"100%"} align={"center"} direction={"column"}>
                      <Text mt={20} ta={"center"} fw={600} size='md' c={"gray.8"}>If you created examples, they will be listed here!</Text>
                    </Flex>
                    :
                    <Flex w={"100%"} align={"center"} direction={"column"}>
                      <Text ta={"center"} fw={600} size='md' c={"gray.8"}>Example {index}</Text>
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
                        value={item} />
                    </Flex>
                  }
                </Flex>)
            })}
            <Flex w={"100%"} align={"center"} direction={"column"}>
              <Text mt={20} ta={"center"} fw={600} size='md' c={"gray.8"}>
                Click the button below to continue!
                <InfoPopover infoText="Next, your prompt and examples will be tested to see which provide the best outcome the most often!" /></Text>
            </Flex>
            <Button
              loading={finalLoadingButton}
              loaderProps={{ type: 'dots' }}
              style={{ width: 200, maxWidth: '800px' }}
              align={"center"}
              m={20}
              mt={10}
              onClick={() => runConsistencyLogic()}
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange', deg: 90 }}>Next
            </Button>
          </Flex>
        :
        // Final screen
        <Flex w={"100%"} align={"center"} direction={"column"}>
          <Text size="xl" fw={500} align="center" style={{ width: '100%', marginBottom: 20 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
            Create Prompt</Text>
          <Text mt={20} ta={"center"} fw={600} size='xl'>Optimized Prompt for {llm}</Text>
          <Text ta={"center"} fw={500} size='lg' c={"black"}>We have now completed our prompt engineering pipeline! </Text>
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
          <Text ta={"center"} fw={500} size='md' c={"black"}>Please copy and paste your prompt above or consider submitting it to CliniPrompt!</Text>
          <Text ta={"center"} fw={500} size='md' c={"black"}>If you choose to submit, you can see all your optimized prompts in the Prompt History tab on the right!</Text>
          <Button
            style={{ width: '100%', maxWidth: '250px' }}
            align={"center"}
            m={20}
            mt={10}
            onClick={runFinalSubmit}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}>Submit to CliniPrompt
          </Button>
          <Text mt={200} size={"md"} fw={500} ta={"center"} c={"gray"}>If you are not using GPT 3.5 or above, formatting may matter. Please consider reformatting your prompt using the button below!</Text>
          <Button
            style={{ width: '75%', maxWidth: '250px' }}
            align={"center"}
            onClick={handleFormatting}
            variant="gradient"
            gradient={{ from: 'green', to: 'blue', deg: 90 }}>Re-Format
          </Button>
        </Flex>
  );
};

// Stepping Logic Container
const StepContainer = ({ children }) => {
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

// UI Component for displaying potential prompts
const PotentialPrompts = ({ potentialPrompts, temp, setTemp }) => {
  return (
    <Flex direction={"column"} align="center">
      <Text size="xl" fw={600} align="center" style={{ width: '100%', marginBottom: 5 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
        Potential Optimal Prompts</Text>
      <Text size="md" c="grey" fw={400} style={{ width: '100%' }} align="center" >
        Here are the best paraphrased versions of the prompt you just provided! </Text>
      <Text size="md" c="grey" fw={400} style={{ width: '100%' }} align="center" >
        We will pick one of these prompts as the optimized prompt later.</Text>
      <Text ta={"center"} fw={600} style={{ width: '100%', marginTop: 20 }} size='md'>Prompt 1</Text>
      <Textarea
        autosize
        style={{ width: '100%', minWidth: '400px', maxWidth: '800px' }}
        readOnly
        autoFocus={false}
        value={potentialPrompts[0].message[0]} />
      <Text ta={"center"} fw={600} style={{ width: '100%', marginTop: 20 }} size='md'>Prompt 2</Text>
      <Textarea
        autosize
        style={{ width: '100%', minWidth: '400px', maxWidth: '800px' }}
        readOnly
        autoFocus={false}
        value={potentialPrompts[0].message[1]} />
      <Text ta={"center"} fw={600} style={{ width: '100%', marginTop: 20 }} size='md'>Prompt 3</Text>
      <Textarea
        autosize
        style={{ width: '100%', minWidth: '400px', maxWidth: '800px' }}
        readOnly
        autoFocus={false}
        value={potentialPrompts[0].message[2]} />
      <Text ta={"center"} fw={600} style={{ width: '100%', marginTop: 20 }} size='md'>Prompt 4</Text>
      <Textarea
        autosize
        style={{ width: '100%', minWidth: '400px', maxWidth: '800px' }}
        readOnly
        autoFocus={false}
        value={potentialPrompts[0].message[3]} />

      <Button
        loaderProps={{ type: 'dots' }}
        style={{ width: '50%', maxWidth: '300px' }}
        align={"center"}
        m={20}
        mt={50}
        variant="gradient"
        gradient={{ from: 'red', to: 'orange', deg: 90 }}
        onClick={() => setTemp(true)}>Next
      </Button>
    </Flex>
  );
};

// UI Components for swipe system
const ApprovalUI = ({ value, onApprove, onReject, onReset, onCustomPrompt, onPrevious }) => {
  const [opened, { close, open }] = useDisclosure(false);
  return (
    <Flex direction="column" align="center" justify="center" style={{ height: '100%' }}>
      <Textarea
        autosize
        miw={{ base: 400, sm: 650 }}
        mb={30}
        minRows={15}
        maxRows={15}
        value={value}
        onChange={(event) => onCustomPrompt(event.currentTarget.value)}
        styles={{
          root: {
            border: 0,
            borderColor: 'blue'
          }
        }} />
      <Flex align="center">
        <Text fw={500} align="center" style={{ width: '100%', marginBottom: 10 }}>Add this example?</Text>
      </Flex>
      <Flex justify="center">
        <Button
          style={{ width: 140, marginLeft: 7 }}
          variant="gradient"
          color="green"
          onClick={onApprove}
          gradient={{ from: 'green', to: 'lime', deg: 276 }}>Approve
        </Button>
        <Button onMouseEnter={open} onMouseLeave={close}
          style={{ width: 140, marginLeft: 7 }}
          variant="gradient"
          color="red"
          onClick={onReset}
          gradient={{ from: 'orange', to: 'yellow', deg: 276 }}>Reset
        </Button>
        <Button
          style={{ width: 140, marginLeft: 7 }}
          variant="gradient"
          color="red"
          onClick={onReject}
          gradient={{ from: 'pink', to: 'red', deg: 276 }}>Reject
        </Button>
      </Flex>
      <Button
        style={{ width: 130, margin: 100 }}
        leftSection={<FaArrowLeft size={14} />}
        onClick={onPrevious}
        variant="subtle"
        color='gray'>Previous
      </Button>
    </Flex>
  );
};

const PromptEvaluateContext = createContext();
export const usePromptEvaluate = () => useContext(PromptEvaluateContext);

// Set up stepping logic
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

// Set up dynamic fewshot
const DetermineNumberExamples = ({ personalizedExample, handleEditing, numExamples, setNumExamples, setIsICLearning }) => {
  const handleSubmit = async (personalizedExample, numExamples) => {
    if (numExamples == 0) {
      notifications.show({
        color: "red",
        title: 'ERROR',
        message: 'Please choose a number of examples! 🤥',
      })
    }
    else {
      handleEditing(personalizedExample);
      setNumExamples(numExamples);
      // Set ICLearning Flag to be false to move on to next step
      setIsICLearning(false);
    }
  }

  return (
    <Flex direction={"column"} align={"center"}><Space h="md" />
      <Text size="xl" fw={500} align="center" style={{ width: '100%', marginBottom: 5}} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
        Create Example<InfoPopover infoText="We will use this to search through our examples database!" /></Text>
        <Text size="lg" fw={600} style={{ width: '100%', marginTop: 20 }} align="center" >
        1. Please provide an example of your usecase below:<InfoPopover infoText="This is where you can provide an example of what your usecase might look like!" /></Text>
      <Textarea
        autosize
        mr='30'
        miw={{ base: 400, sm: 650 }}
        minRows={20}
        maxRows={14}
        value={personalizedExample}
        withAsterisk
        onChange={(event) => handleEditing(event.currentTarget.value)}
      />
      <Text size="sm" c="grey" fw={600} style={{ width: '100%'}} align="center" >
        If you need some guidance, here is an example: </Text>
      <Text size="sm" c="grey" fw={400} style={{ width: '100%', marginBottom: 5}} align="center" >
          Input:  <Text style={{ width: '75%'}} size="sm" fs="italic">
          I've had a sore throat for the past four days, and it's making it hard for me to talk or swallow. Any ideas?</Text></Text>
      <Text size="sm" c="grey" fw={400} style={{ width: '100%'}} align="center" >
        Output: <Text style={{ width: '75%'}} size="sm" fs="italic">Sorry to hear you are experiencing a sore throat. For relief, try over-the-counter lozenges or pain relievers, drinking warm liquids such as tea with honey, and salt water gargling. However, if your symptoms persist or worsen after a week or if you develop a fever, it may be time to consult with your healthcare provider to determine if it could be a bacterial infection or something more serious.</Text>
      </Text>
      <Space my="xl" />
      <Text size="lg" fw={600} style={{ width: '100%', marginTop: 20, marginBottom: 5}} align="center" >
      2. How many examples would you like to include? <InfoPopover infoText="This is where you can provide an example of what your usecase might look like!" /></Text>
      <Select
        placeholder="1 - 5"
        data={['1', '2', '3', '4', '5']}
        value={numExamples}
        onChange={setNumExamples}
      />
      <Button
        style={{ width: '25%', maxWidth: '600px' }}
        align={"center"}
        m={20}
        mt={50}
        variant="gradient"
        gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
        onClick={() => handleSubmit(personalizedExample, numExamples)}
      >
        Submit
      </Button>
    </Flex>
  );
};

// Set up dynamic fewshot
const ExplanationPage = ({ goToNextStep, fetchChosenGT }) => {
  const [loading, setLoading] = useState(false);
  const handleLetsGo = async () => {
    setLoading(true)
    await fetchChosenGT();
    setLoading(false)
    goToNextStep();
  }
  return (
    <Flex direction={"column"} align={"center"}>
      <Text size="xl" fw={500} align="center" style={{ width: '100%', marginTop: 20, marginBottom: 5 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
       Picking Examples<InfoPopover infoText="Examples help the LLM to know how to phrase certain responses. This is called in-context learning." /></Text>
      <Text size="lg" fw={600} style={{ width: '100%' }} align="center" >
        Here is how it will work...
      </Text>
      <Flex direction={"column"} align={"center"}>
        <Text style={{ width: '100%', marginBottom: 10 }}>In this section, you will pick examples to include in your prompt!</Text>
        <Text style={{ width: '100%', marginBottom: 10 }}>For each example, please select one of the following actions:</Text>
        <Text
          variant="gradient"
          fw={900}
          gradient={{ from: 'green.9', to: 'lime.9', deg: 90 }}
          style={{ width: '50%', marginBottom: 10 }}
        >
          Approve:
          <Text
            style={{ width: '100%', marginBottom: 10 }}
          >Adds this example to your prompt!</Text>
        </Text>

        <Text
          variant="gradient"
          fw={900}
          gradient={{ from: 'orange.9', to: 'yellow.9', deg: 90 }}
          style={{ width: '50%', marginBottom: 10 }}
        >Reset:
          <Text
            style={{ width: '100%', marginBottom: 10 }}
          >Resets your changes!</Text>
        </Text>

        <Text
          variant="gradient"
          fw={900}
          gradient={{ from: 'pink', to: 'red', deg: 90 }}
          style={{ width: '50%', marginBottom: 10 }}
        >Reject:
          <Text
            style={{ width: '100%', marginBottom: 10 }}
          >Skips to our next custom example!</Text>
        </Text>

        <Text style={{ width: '100%', marginBottom: 10 }}>Lastly, for each example, you can edit them to make them personalized!</Text>
        <Text style={{ width: '100%', marginBottom: 10 }}>We'll keep going until you approve the right number of examples.</Text>
        <Text style={{ width: '100%', marginBottom: 10 }}>If we cannot find any good examples in our database, well skip this part.</Text>
      </Flex>
      <Button
        loading={loading}
        loaderProps={{ type: 'dots' }}
        style={{ width: '25%', maxWidth: '600px' }}
        align={"center"}
        m={20}
        mt={50}
        variant="gradient"
        gradient={{ from: 'red', to: 'orange', deg: 90 }}
        onClick={() => handleLetsGo()}>Lets go!
      </Button>
    </Flex>
  );
};
