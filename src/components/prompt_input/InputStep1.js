import { Button, Flex, SimpleGrid, Text, Title } from "@mantine/core";
import { usePromptInput } from "./PromptInput";
import InfoPopover from "../InfoPopover";
import { FaNotesMedical, FaCommentMedical, FaHandHoldingMedical, FaBookMedical } from "react-icons/fa";

const StepOne = ({ purposeChoice, setPurposeChoice }) => {
  const { currentStep, goToNextStep, goToPreviousStep } = usePromptInput();

  const onButtonPress = (option) => {
    setPurposeChoice(option);
    goToNextStep();
  }

  return (
    <Flex direction={"column"} align={"center"}>
      <Flex align="center">
        <Text fw={500} style={{ width: '100%', marginBottom: 10 }}>What are you using this for?</Text>
        <InfoPopover infoText="This is where you select the use-case for which you are creating prompts for" />
      </Flex>

      <SimpleGrid
        cols={{ base: 1, sm: 2 }}
        spacing={{ base: 3, sm: 'md' }}
        verticalSpacing={{ base: 'sm', sm: 'md' }}
      >
        <Button
          style={{ width: 200, height: 45, marginTop: '3vh' }}
          leftSection={<FaNotesMedical size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 147 }}
          opacity={0.9}
          onClick={() => onButtonPress('Q/A')}
        >
          Q/A (MyChart)
        </Button>
        <Button
          style={{ width: 200, height: 45, marginTop: '3vh' }}
          leftSection={<FaBookMedical size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          opacity={0.9}
          gradient={{ from: 'lime', to: 'cyan', deg: 90 }}
          onClick={() => onButtonPress('Summarization')}
        >
          Summarization
        </Button>
        <Button
          style={{ width: 200, height: 45 }}
          leftSection={<FaHandHoldingMedical size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          opacity={0.9}
          gradient={{ from: 'grape', to: 'pink', deg: 276 }}
          onClick={() => onButtonPress('Simplification')}
        >
          Simplification
        </Button>
        <Button
          style={{ width: 200, height: 45 }}
          leftSection={<FaCommentMedical size={14} style={{ right: 10 }} />}
          color="gray"
          variant="gradient"
          opacity={0.9}
          gradient={{ from: 'yellow', to: 'red', deg: 348 }}
          onClick={() => onButtonPress('Conversation')}
        >
          Conversation
        </Button>
      </SimpleGrid>
    </Flex>
  );
};

export default StepOne;