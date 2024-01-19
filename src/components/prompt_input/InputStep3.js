import { Flex, Text, Textarea, Select } from "@mantine/core";
import InfoPopover from "../InfoPopover";

const StepThree = ({ myPrompt, setMyPrompt, numExamples, setNumExamples }) => {
  return (
    <Flex direction={"column"} align={"center"}>

      <Flex align="center">
        <Text fw={500} align="center" style={{ width: '100%', marginBottom: 10 }}>Enter your prompt below</Text>
        <InfoPopover infoText="This is where you can enter in the prompt that will be used to generate text, calculate perplexity, and attach examples." />
      </Flex>

      <Textarea
        autosize
        mr='30'
        miw={{ base: 400, sm: 650 }}
        placeholder="You are a helpful, respectful, and honest primary care provider answering electronically submitted questions from your patients. Always answer as helpfully as possible, while being safe. Your answers should not include refer to another doctor or contain any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.  Respond to <User Message> starting with a formal salutation and use the additional patient data from the electronic health record delimited by [ ]. Here are examples delimited by || for a general response, medication response, result response, and paperwork response. "
        minRows={7}
        maxRows={7}
        value={myPrompt}
        onChange={(event) => setMyPrompt(event.currentTarget.value)}
      />
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
    </Flex>

  );
};

export default StepThree;