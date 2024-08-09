import { useNavigate } from "react-router-dom";
import { Button, Flex, Text, Title, Space, Image, Container} from "@mantine/core";
import { FaAward, FaCrown, FaNotesMedical } from "react-icons/fa";

const NavbarInfo = () => {
  const navigate = useNavigate();

  return (
      <Container size="xl" align={"center"}>
      <Title pl={5} align="center">
        <Space my="md" />
        <Image src='clinipromptlogo.png' ml={-5} radius="sm" height={75} fit={"contain"} />
        <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
        What can I do on CliniPrompt?</Text>
      </Title>
      <Space my="md" />
      <Space my="md" />
      <Button
        style={{ width: 220 }}
        leftSection={<FaNotesMedical size={14} style={{ right: 10 }} />}
        color="blue"
        size="lg"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/prompting')}
      >
        Create Prompts
      </Button>

      <Text
        fw={500}
        size="xl"
        mb={10}
      >
        Contribute to medical research by creating and evaluating prompts!
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaAward size={14} style={{ right: 10 }} />}
        color="pink"
        size="lg"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/history')}
      >
        Track History
      </Button>

      <Text
        fw={500}
        size="xl"
      >
        Easily keep track of the prompts that you create!
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaCrown size={14} style={{ right: 10 }} />}
        color="green"
        size="lg"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/topusers')}
      >
        Top Users
      </Button>

      <Text
        fw={500}
        size="xl"
        mb={10}
      >
        Compete against other users to see who can create the most prompts!
      </Text>

      <Button
        style={{ width: 220 }}
        leftSection={<FaAward size={14} style={{ right: 10 }} />}
        color="yellow"
        size="lg"
        variant="subtle"
        opacity={0.9}
        onClick={() => navigate('/leaderboard')}
      >
        View Leaderboard
      </Button>

      <Text
        fw={500}
        size="xl"
      >
        See your prompts and how they compare to other users' prompts!
      </Text>
      </Container>
  );
};

export default NavbarInfo;
