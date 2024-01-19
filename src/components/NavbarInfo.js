import { useNavigate } from "react-router-dom";
import { Button, Flex, Text } from "@mantine/core";
import { FaAward, FaCrown, FaNotesMedical } from "react-icons/fa";

const NavbarInfo = () => {
  const navigate = useNavigate();

  return (
    <Flex m={40} align={"center"} justify={"center"} direction={"column"}>
      <Text
        fw={600}
        size="lg"
        mb={10}
      >
        What can I do on CliniPrompt?
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaNotesMedical size={14} style={{ right: 10 }} />}
        color="blue"
        size="md"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/prompting')}
      >
        Create Prompts
      </Button>

      <Text
        fw={500}
        size="md"
        mb={10}
      >
        Contribute to medical research by creating and evaluating prompts!
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaAward size={14} style={{ right: 10 }} />}
        color="pink"
        size="md"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/history')}
      >
        Track Your History
      </Button>

      <Text
        fw={500}
        size="md"
      >
        Easily keep track of the prompts that you create!
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaCrown size={14} style={{ right: 10 }} />}
        color="green"
        size="md"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/topusers')}
      >
        See Top Users
      </Button>

      <Text
        fw={500}
        size="md"
        mb={10}
      >
        Compete against other users to see who can create the most prompts!
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaAward size={14} style={{ right: 10 }} />}
        color="yellow"
        size="md"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/leaderboard')}
      >
        View Leaderboard
      </Button>

      <Text
        fw={500}
        size="md"
      >
        See your prompts and how they compare to other users' prompts!
      </Text>

    </Flex >
  );
};

export default NavbarInfo;
