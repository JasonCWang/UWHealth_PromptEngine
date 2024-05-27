import { Button, Flex, SimpleGrid, Text, Title, Image, Divider, Space} from "@mantine/core";
import { usePromptInput } from "./PromptInput";
import InfoPopover from "../InfoPopover";
import { SiOpenai, SiMeta } from "react-icons/si";
import { FaGoogle } from "react-icons/fa";
import { IconArrowRight } from '@tabler/icons-react';

const StepTwo = ({ LLMChoice, setLLMChoice }) => {
  const { currentStep, goToNextStep, goToPreviousStep } = usePromptInput();

  const onButtonPress = (option) => {
    setLLMChoice(option);
    goToNextStep();
  }

  return (
    <Flex direction={"column"} align={"center"}>
      <Title pl={5} align="center">
        <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
          Create Prompt</Text>
      </Title>
      <Space h="md" />
      <Flex align="center">
        <Text fw={500} align="center" size="xl" style={{ width: '100%', marginBottom: 10 }}>Which LLM do you want to use?</Text>
        <InfoPopover infoText="This is where you can select different LLMs to test your prompts on." />
      </Flex>
      <SimpleGrid
        cols={{ base: 1 }}
        verticalSpacing={{ base: 'sm' }}
      >
        <Button
          style={{ width: 320, height: 60, marginTop: '3vh' }}
          leftSection={<SiOpenai size={25} style={{ right: 10 }} />}
          rightSection={<IconArrowRight size={14} />}
          color="gray"
          variant="gradient"
          size="lg"
          gradient={{ from: 'lime', to: 'green', deg: 270 }}
          opacity={0.9}
          onClick={() => onButtonPress('GPT-3')}
        >
          GPT-3.5
        </Button>
        <Button
          style={{ width: 320, height: 60 }}
          leftSection={<SiOpenai size={25} style={{ right: 10 }} />}
          rightSection={<IconArrowRight size={14} />}
          color="gray"
          variant="gradient"
          size="lg"
          opacity={0.9}
          gradient={{ from: 'green', to: 'lime', deg: 270 }}
          onClick={() => onButtonPress('GPT-4')}
        >
          GPT-4
        </Button>
        <Button
          style={{ width: 320, height: 60 }}
          leftSection={<SiMeta size={25} style={{ right: 10 }} />}
          rightSection={<IconArrowRight size={14} />}
          color="gray"
          variant="gradient"
          size="lg"
          opacity={0.9}
          gradient={{ from: 'indigo', to: 'cyan', deg: 270 }}
          //onClick={() => onButtonPress('LLaMA')}
        >
          LLaMA (Soon!)
        </Button>
        <Button
          style={{ width: 320, height: 60 }}
          leftSection={<FaGoogle size={25} style={{ right: 10 }} />}
          rightSection={<IconArrowRight size={14} />}
          color="gray"
          variant="gradient"
          size="lg"
          gradient={{ from: 'yellow', to: 'red', deg: 270 }}
          opacity={0.9}
          //onClick={() => onButtonPress('Google')}
        >
          Med-PaLM (Soon!)
        </Button>
      </SimpleGrid>
    </Flex>
  );
};

export default StepTwo;