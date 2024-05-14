import React from 'react';
import { Container, Grid, Image, Card, Text, Anchor, Title, Divider} from '@mantine/core';

const aboutTeamData = [
  {
    image: 'jason.png',
    description: 'Jason Wang',
    role: 'Software Engineer',
    email: 'jasoncwang@berkeley.edu'
  },

];

const aboutAdvisorData = [
  {
    image: 'majid.jpeg',
    description: 'Majid Afshar, MD, MSCR',
    role: 'Advisor',
    email: 'mafshar@medicine.wisc.edu'
  },
  {
    image: 'yanjun.jpeg',
    description: 'Yanjun Gao, PhD',
    role: 'Advisor',
    email: 'ygao@medicine.wisc.edu'
  },
];

const AboutPage = () => {
  return (
    <Container size="md">
      <Title pl={5} align="center">
        <Divider my="md" />
        <Image src='clinipromptlogo.png' ml={-5} radius="sm" height={75} fit={"contain"} />
        <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
          About Us</Text>
      </Title>
      <Divider my="md" />
      <Text ta={"center"} fw={500} mt={20}size='lg'> Hosted by UW-Madison Department of Medicine
      </Text>
      <Text ta={"center"} fw={500} size='md'> University of Wisconsin School of Medicine and Public Health, Madison, WI
      </Text>
      <Text ta={"center"} mt={40} fw={700} size='xl'>Meet the Team</Text>
      <Grid pb={60} grow>
        {aboutTeamData.map((item, index) => (
          <Grid.Col span={4} key={index}>
            <Card shadow="sm" padding="md" style={{ alignItems: 'center', margin: '5px 0' }}>
              <Image
                src={item.image}
                radius="md"
                alt={`Image ${index + 1}`}
                mah={200}
                w={200}
                fit={"cover"}
              />
              <Text align="center" fw={600} style={{ marginTop: '12px' }}>
                {item.description}
              </Text>
              <Anchor href={`mailto:${item.email}`} target="_blank" underline="hover" align="center">
                {item.email}
              </Anchor>
              <Anchor variant="gradient" gradient={{ from: 'blue.9', to: 'yellow', deg: 1000}} fw={500} size='md' href="https://eecs.berkeley.edu/" target="_blank">
              UC Berkeley
              </Anchor>
              <Anchor variant="gradient" gradient={{ from: 'blue.9', to: 'cyan' }} fw={500} size='md' href="https://www.linkedin.com/in/jason-c-wang/" target="_blank">
              Linkedin
              </Anchor>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Grid pb={60} grow>
        {aboutAdvisorData.map((item, index) => (
          <Grid.Col span={4} key={index}>
            <Card shadow="sm" padding="md" style={{ alignItems: 'center', margin: '5px 0' }}>
              <Image
                src={item.image}
                radius="md"
                alt={`Image ${index + 1}`}
                mah={200}
                w={200}
                fit={"cover"}
              />
              <Text align="center" fw={600} style={{ marginTop: '12px' }}>
                {item.description}
              </Text>
              <Anchor href={`mailto:${item.email}`} target="_blank" underline="hover" align="center">
                {item.email}
              </Anchor>
              <Anchor variant="gradient" gradient={{ from: 'pink', to: 'yellow' }} fw={500} size='md' href="https://www.medicine.wisc.edu/apcc/icu-data-science-research" target="_blank">
              ICU Data Science Lab
              </Anchor>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutPage;
