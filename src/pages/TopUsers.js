import { ScrollArea, Table, Title, Image, Divider, Text} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../components/AuthProvider';

const TopUsers = () => {
  const [data, setData] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'final_prompts_v2'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const promptCounts = {};
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const username = userData.username;
        if (promptCounts[username]) {
          promptCounts[username]++;
        } else {
          promptCounts[username] = 1;
        }
      });

      // Convert the counts object into an array and sort it
      const sortedUsers = Object.entries(promptCounts)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count);

      // Get the top 200 users
      const topUsers = sortedUsers.slice(0, 200);

      setData(topUsers);
    };
    fetchData();
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      margin: '0 auto',
    }}>
      <ScrollArea
        style={{
          height: '100%',
          width: '100%',
        }}
        type="scroll"
        scrollbarAlwaysVisible={true}
      >
          <Title pl={5} align="center">
          <Divider my="md" />
            <Image src='clinipromptlogo.png' ml={-5} radius={10} height={75} fit={"contain"} />
            <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
              Top Users</Text>
          </Title>
          <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th ta={"center"}>Rank</Table.Th>
              <Table.Th ta={"center"}>Username</Table.Th>
              <Table.Th ta={"center"}>Prompts Created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item, index) => (
              <Table.Tr key={item.username}>
                <Table.Td style={{ textAlign: 'center' }}>{index + 1}</Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>{(item.username === user.uid) ? "Me" : item.username}</Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>{item.count}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}

export default TopUsers;