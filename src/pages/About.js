import React from 'react';
import { Container, Grid, Image, Card, Text, Anchor, Title, Space} from '@mantine/core';

const aboutTeamData = [
  {
    image: 'jason.png',
    description: 'Jason Wang, MEng',
    email: 'jasoncwangai@gmail.com',
    linkedin: 'https://www.linkedin.com/in/jason-c-wang',
    googlescholar: 'https://scholar.google.com/citations?user=7k9FeUkAAAAJ&hl=en'
  },
  {
    image: 'yanjun.jpeg',
    description: 'Yanjun Gao, PhD',
    email: 'ygao@medicine.wisc.edu',
    linkedin: 'https://www.linkedin.com/in/yanjun-gao-a4073b29',
    googlescholar: 'https://scholar.google.com/citations?hl=en&user=GThZXQgAAAAJ'
  },
  {
    image: 'majid.jpeg',
    description: 'Majid Afshar, MD, MSCR',
    email: 'mafshar@medicine.wisc.edu',
    linkedin: 'https://www.linkedin.com/in/majid-afshar-md-mscr-60079380',
    googlescholar: 'https://scholar.google.com/citations?user=bUjIkLAAAAAJ&hl=en'
  },
  {
    image: 'john.png',
    description: 'John Caskey, PhD',
    email: 'jrcaskey@medicine.wisc.edu',
    linkedin: 'https://www.linkedin.com/in/johncaskey1/',
    googlescholar: 'https://www.researchgate.net/scientific-contributions/John-Caskey-2211747279'
  }
];

const AboutPage = () => {
  return (
    <Container size="md">
      <Title pl={5} align="center">
        <Space my="md" />
        <Image src='clinipromptlogo.png' ml={-5} radius="sm" height={75} fit={"contain"} />
        <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
          About Us</Text>
      </Title>
      <Text ta={"center"} fw={500} mt={20}size='lg' variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}> Hosted by UW-Madison Department of Medicine
      </Text>
      <Grid pb={60} grow>
        {aboutTeamData.map((item, index) => (
          <Grid.Col span={10} key={index}>
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
              <Anchor variant="gradient" gradient={{ from: 'blue.9', to: 'cyan' }} fw={500} size='md' href={item.linkedin} target="_blank">
              Linkedin
              </Anchor>
              <Anchor variant="gradient" gradient={{ from: 'blue.9', to: 'cyan' }} fw={500} size='md' href={item.googlescholar} target="_blank">
              Google Scholar
              </Anchor>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutPage;
