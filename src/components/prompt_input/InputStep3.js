import { Flex, Text, Textarea, Select, Checkbox, Accordion, Space, Divider} from "@mantine/core";
import InfoPopover from "../InfoPopover";
import { FaNotesMedical, FaCommentMedical, FaHandHoldingMedical } from "react-icons/fa";
import { RiMedicineBottleFill } from "react-icons/ri";

const StepThree = ({ myPrompt, setMyPrompt, usecase, setUseCase, setIsICLearning, isICLearning, setIsCOT, isCOT}) => {
  const prompts = [
    {
      value: 'Patient Q/A',
      description: 'You are a kind, courteous, and sincere primary care provider addressing inquiries from patients submitted electronically. Always aim to offer helpful advice while maintaining safety. Your responses should refrain from mentioning another physician and must avoid any harmful or inappropriate content. Make sure your answers are neutral, inclusive, and optimistic. '
    },
    {
      value: 'Summarization',
      description: 'Act as a medical doctor, and list the top three direct and indirect diagnoses from the input note.'
    },
  ];
  const items = prompts.map((item) => (
    <Accordion.Item key={item.value} value={item.value}>
      <Accordion.Control icon={item.label}>{item.value}</Accordion.Control>
      <Accordion.Panel>{item.description}</Accordion.Panel>
    </Accordion.Item>
  ));
  return (
    <Flex direction={"column"} align={"center"}>
      <Text size="xl" fw={500} align="center" style={{ width: '100%', marginBottom: 20 }} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
      Create Prompt</Text>
      <Text size="lg" fw={600} style={{ width: '100%', marginTop: 20}} align="center" >
        Please write your prompt below<InfoPopover infoText="This is where you can enter in the prompt that will be used to generate text, calculate perplexity, and attach examples." />
      </Text>
        
      <Textarea
        autosize
        miw={{ base: 400, sm: 650 }}
        placeholder="You are a helpful, respectful, and honest primary care provider answering electronically submitted questions from your patients. Always answer as helpfully as possible, while being safe. Your answers should not include refer to another doctor or contain any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. "
        minRows={6}
        maxRows={6}
        value={myPrompt}
        onChange={(event) => setMyPrompt(event.currentTarget.value)}
      />
      <Text size="lg" fw={600} style={{ width: '100%', marginTop: 20}} align="center" >
        Describe your use-case in a couple words<InfoPopover infoText="This is where you can briefly describe your usecase. We will use this information to get the most relevant examples!" />
      </Text>
        
      <Textarea
        autosize
        miw={{ base: 400, sm: 650 }}
        placeholder="Trying to summarize a patient's hospital visit."
        minRows={3}
        maxRows={3}
        value={usecase}
        onChange={(event) => setUseCase(event.currentTarget.value)}
      />
      <Text size="lg" fw={600} style={{ width: '100%', marginTop: 20}} align="center" >
        See examples below <InfoPopover infoText="Use these as reference when creating your own prompt! More examples for different usecases will come soon." />
      
      </Text>
      <Accordion defaultValue="Patient Q/A">
      {items}
      </Accordion>
      <Divider my="md" />

      <Flex mt={15} >
        <Checkbox
        checked={isICLearning}
        color="blue.4"
        iconColor="dark.8"
        size="md"
        label="Would your use-case benefit from examples?"
        description="This options allows you to include examples in your prompt."
        onChange={(event) => setIsICLearning(event.currentTarget.checked)}
        />
      </Flex>
      <Flex mt={15} >
        <Checkbox
        checked={isCOT}
        color="blue.4"
        iconColor="dark.8"
        size="md"
        label="Does your use-case require multiple steps?"
        description="This option prompts the LLMs to solve difficult questions using reasoning."
        onChange={(event) => setIsCOT(event.currentTarget.checked)}
        />
      </Flex>
    </Flex>

  );
};

export default StepThree;
/*
      <Flex align="center" mt={15} >
        <Text fw={500} align="center" style={{ width: '100%', marginBottom: 10, marginTop: '2vh' }}>How many examples would you like to include?</Text>
        <InfoPopover infoText="Examples help the LLM to know how to phrase certain responses. This is called in-context learning." />
      </Flex>
      <Select
        placeholder="0 - 5"
        data={['0', '1', '2', '3', '4', '5']}
        value={numExamples}
        onChange={setNumExamples}
      />

*/