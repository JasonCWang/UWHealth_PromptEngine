import React from 'react';
import { Container, Grid, Image, Card, Text, Anchor } from '@mantine/core';
//import { Link } from '@react-email/link';

const aboutTeamData = [
  {
    image: 'jason.png',
    description: 'Jason Wang',
    role: 'Backend Lead',
    email: 'jasoncwang@berkeley.edu'
  },
  {
    image: 'bhada.png',
    description: 'Bhada Yun',
    role: 'Frontend Lead',
    email: 'bhadayun@berkeley.edu'
  },
  {
    image: 'rucha.jpg',
    description: 'Rucha Acholkar',
    role: 'Frontend Member',
    email: 'ruchaacholkar@berkeley.edu'
  },
  {
    image: 'andrew.jpeg',
    description: 'Andrew Tian',
    role: 'Frontend Member',
    email: 'aztian@berkeley.edu'
  },
  {
    image: 'laurap.png',
    description: 'Laura Pei',
    role: 'Backend Member',
    email: 'laur@berkeley.edu'
  },
  {
    image: 'samarth.png',
    description: 'Samarth Ghai',
    role: 'Backend Member',
    email: 'samarth.ghai@berkeley.edu'
  }
  //Add more data as needed
];

const aboutAdvisorData = [
  {
    image: 'majid.jpeg',
    description: 'Majid Afshar, MD, MSCR',
    email: 'mafshar@medicine.wisc.edu'
  },
  {
    image: 'yanjun.jpeg',
    description: 'Yanjun Gao, PhD',
    email: 'ygao@medicine.wisc.edu'
  },
];

const AboutPage = () => {
  return (
    <Container size="md">
      <Text ta={"center"} mt={40} fw={700} size='xl'>About Us</Text>
      <Text ta={"center"} fw={500} size='md'>We are a team of passonate students from University of California, Berkeley excited about enhancing the
        healthcare ecosystem for both professionals and patients.
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
              <Text>{item.role}</Text>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
      <Text ta={"center"} mt={40} fw={700} size='xl'>Meet our Advisors</Text>
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
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
};

export default AboutPage;
