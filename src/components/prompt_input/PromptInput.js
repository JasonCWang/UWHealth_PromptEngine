import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Flex, Divider} from "@mantine/core";
import { FaArrowLeft } from "react-icons/fa";
import InputStep1 from './InputStep1';
import InputStep2 from './InputStep2';
import InputStep3 from './InputStep3';

const PromptInputContext = createContext();

export const usePromptInput = () => useContext(PromptInputContext);

const PromptInputProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // New state for tracking direction

  const goToNextStep = () => {
    setCurrentStep((step) => step + 1);
    setDirection(1); // Set direction to 1 for forward
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => step - 1);
    setDirection(-1); // Set direction to -1 for backward
  };

  const value = {
    currentStep,
    direction,
    goToNextStep,
    goToPreviousStep,
  };

  return (
    <PromptInputContext.Provider value={value}>
      {children}
    </PromptInputContext.Provider>
  );
};

const PromptInputContent = ({ steps, handleSubmit, loadingButton}) => {
  const { currentStep, goToNextStep, goToPreviousStep } = usePromptInput();

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <StepContainer steps={steps} />
      
      <Flex mt={550} align={"center"} justify={"center"} justifyContent="space-between">
        {currentStep > 0 && (
          <Button
            style={{ width: 130 }}
            leftSection={<FaArrowLeft size={14} />}
            onClick={goToPreviousStep}
            variant="subtle"
            color='gray'
          >
            Previous
          </Button>
        )}

      </Flex>
      <Flex mt={{ base: 20, sm: 20 }} align={"center"} justify={"center"} justifyContent="space-between">
        {currentStep === 1 && (
          <Button
            loading={loadingButton}
            loaderProps={{ type: 'dots' }}
            style={{ width: '50%', maxWidth: '300px' }}
            onClick={() => handleSubmit()}
            variant="gradient"
            gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
          >
            Submit
          </Button>
        )}
      </Flex>
      <Divider my="md" />
    </div>
  );
};

const StepContainer = ({ steps }) => {
  const { currentStep, direction } = usePromptInput();
  const StepComponent = steps[currentStep];

  const variants = {
    initial: direction > 0 ? { opacity: 0, x: 200 } : { opacity: 0, x: -200 },
    animate: { opacity: 1, x: 0 },
    exit: direction > 0 ? { opacity: 0, x: 200 } : { opacity: 0, x: -200 },
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '60%' }}>
      <AnimatePresence>
        <motion.div
          key={currentStep}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.25 }}
          style={{ position: 'absolute', width: '100%', top: 140 }}
        >
          {StepComponent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const PromptInput = ({ usecase, setUseCase, LLMChoice, setLLMChoice, myPrompt, setMyPrompt, loadingButton, handleSubmit, setIsICLearning, isICLearning, setIsCOT, isCOT}) => {
  const steps = [
    //<InputStep1 purposeChoice={purposeChoice} setPurposeChoice={setPurposeChoice} />,
    <InputStep2 LLMChoice={LLMChoice} setLLMChoice={setLLMChoice} />,
    <InputStep3 myPrompt={myPrompt} setMyPrompt={setMyPrompt} usecase={usecase} setUseCase={setUseCase} setIsICLearning={setIsICLearning} isICLearning={isICLearning} setIsCOT={setIsCOT} isCOT={isCOT}/>,
  ];

  return (
    <PromptInputProvider>
      <PromptInputContent steps={steps} handleSubmit={handleSubmit} loadingButton={loadingButton}/>
    </PromptInputProvider>
  );
};

export default PromptInput;