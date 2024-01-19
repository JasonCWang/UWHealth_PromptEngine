// import { ref, push } from "firebase/database";
// import { auth, db } from "../firebase";
// import { v4 as uuid } from 'uuid';
// import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
// import { useAuth } from "../components/AuthProvider";
// import { Flex, Text } from "@mantine/core";
// import NavbarInfo from "../components/NavbarInfo";

// const Home = () => {

//   const { user } = useAuth();

//   const handlePush = async () => {
//     const docCode = uuid();
//     const data = {
//       message: "Hello, World!",
//       uid: auth.currentUser.uid,
//     };

//     const docRef = doc(collection(db, "lmfao"), docCode);
//     await setDoc(docRef, data);
//   };

//   return (
//     <Flex align={"center"} justify={"center"} w={"100%"} h={"100vh"} mt={-55}>
//       {user ?
//         <>
//           <NavbarInfo />
//         </>
//         :
//         <Text
//           fw={600}
//           size="lg"
//           variant="gradient"
//           gradient={{ from: 'indigo', to: 'red', deg: 155 }}
//         >
//           Welcome to CliniPrompt! Please sign in to continue.
//         </Text>
//       }
//     </Flex>
//   );
// };

// export default Home;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, SimpleGrid, Title, Text, Button, Container, Image } from '@mantine/core';
import { createStyles } from "@mantine/styles";

import { useAuth } from "../components/AuthProvider";
import NavbarInfo from "../components/NavbarInfo";

export function Homepage() {

  const { classes, theme } = useStyles();

  const { user } = useAuth();

  const goToPage = (route) => {
    setActiveComponent(route);
    navigate(route);
  };

  const [activeComponent, setActiveComponent] = useState("/");
  const navigate = useNavigate();

  const features = data.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      className={classes.card}
      p="xl"
    >

      <Text size="lg" weight={500} className={classes.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text size="sm" color="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (

    <Container size="md" py="xl">
      {user ?
        <>
          <NavbarInfo />
        </>
        :
        <>
          <Title className={classes.title} pl={5} align="center">
            Welcome to
            <Image src='clinipromptlogo.png' ml={-5} radius="sm" height={75} fit={"contain"} />
          </Title>

          <Text
            align="center"
            weight={600}
            mt="md"
          >
            Bridging the gap between the healthcare industry and LLMs
          </Text>

          <SimpleGrid
            cols={3}
            spacing="xl"
            mt={50}
            breakpoints={[{ maxWidth: "md", cols: 1 }]}
          >
            {features}

            <Text> </Text>

            <Button type="submit" size="md" align='center' variant="solid" colorScheme='red'
              onClick={() => goToPage('/login')} >
              Sign In
            </Button>

          </SimpleGrid>
        </>
      }
    </Container>
  );
}

export default Homepage;

const data = [
  {
    title: "Various LLMs",
    description:
      "Our product provides flexibility in providing customers a wide range of diverse LLMs to choose from.",

    variant: "solid",
    colorScheme: "red"
  },
  {
    title: "Database for Prompt Collection",
    description:
      "This product collects prompts over time to improve the recommendations and provide greater efficiency for healthcare workers.",

    variant: "solid",
    colorScheme: "red"
  },
  {
    title: "User Privacy",

    description:
      "Cliniprompt provides secure authentication for all user accounts.",
    variant: "solid",
    colorScheme: "red"
  }
];

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 34,
    fontWeight: 900,
    [theme.fn.smallerThan("sm")]: {
      fontSize: 24
    }
  },

  description: {
    maxWidth: 600,
    margin: "auto",

    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm,
      marginLeft: "auto",
      marginRight: "auto"
    }
  },

  card: {
    border: `10px solid' 
    ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
      }`
  },

  cardTitle: {
    "&::after": {
      content: '""',
      display: "block",
      backgroundColor: theme.fn.primaryColor(),
      width: 45,
      height: 2,
      marginTop: theme.spacing.sm
    }
  }
}));
