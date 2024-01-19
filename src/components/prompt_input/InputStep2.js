import { Button, Flex, SimpleGrid, Text } from "@mantine/core";
import { usePromptInput } from "./PromptInput";
import InfoPopover from "../InfoPopover";
import { SiOpenai, SiMeta } from "react-icons/si";

const StepTwo = ({ LLMChoice, setLLMChoice }) => {
  const { currentStep, goToNextStep, goToPreviousStep } = usePromptInput();

  const onButtonPress = (option) => {
    setLLMChoice(option);
    goToNextStep();
  }

  return (
    <Flex direction={"column"} align={"center"}>
      <Flex align="center">
        <Text fw={500} align="center" style={{ width: '100%', marginBottom: 10 }}>Which LLM do you want to use?</Text>
        <InfoPopover infoText="This is where you can select different LLMs to test your prompts on." />
      </Flex>
      <SimpleGrid
        cols={{ base: 1 }}
        verticalSpacing={{ base: 'sm' }}
      >
        <Button
          style={{ width: 220, height: 45, marginTop: '3vh' }}
          leftSection={<SiOpenai size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          gradient={{ from: 'lime', to: 'green', deg: 270 }}
          opacity={0.9}
          onClick={() => onButtonPress('GPT-3')}
        >
          GPT-3.5
        </Button>
        <Button
          style={{ width: 220, height: 45 }}
          leftSection={<SiOpenai size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          opacity={0.9}
          gradient={{ from: 'lime', to: 'green', deg: 90 }}
          onClick={() => onButtonPress('GPT-4')}
        >
          GPT-4
        </Button>
        <Button
          style={{ width: 220, height: 45 }}
          leftSection={<SiMeta size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          opacity={0.9}
          gradient={{ from: 'indigo', to: 'cyan', deg: 147 }}
          //onClick={() => onButtonPress('LLaMA')}
        >
          LLaMA (Releasing soon!)
        </Button>
      </SimpleGrid>
    </Flex>
  );
};

export default StepTwo;