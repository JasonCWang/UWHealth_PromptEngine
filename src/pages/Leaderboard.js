import { Image, Title, Text, ScrollArea, Table } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../components/AuthProvider';

import { HiOutlineSortAscending, HiOutlineSortDescending } from "react-icons/hi";

const Leaderboard = () => {
  const [data, setLeaderboard] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const q = query(collection(db, 'final_prompts_v2'), orderBy('perplexity', sortOrder));
      const querySnapshot = await getDocs(q);
      const leaderboardData = [];
      querySnapshot.forEach((doc) => {
        leaderboardData.push({ id: doc.id, ...doc.data() });
      });
      console.log(leaderboardData)
      setLeaderboard(leaderboardData);
    };
    fetchData();
  }, [sortOrder]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      margin: '0 auto',
    }}>
      {user ?
        <ScrollArea
          style={{
            height: '100%',
            width: '100%',
          }}
          type="scroll"
          scrollbarAlwaysVisible={true}
        >
          <Title size={"lg"} align="center" style={{ margin: '3vh' }}> Top Prompts </Title>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th ta={"center"}>Rank</Table.Th>
                <Table.Th ta={"center"}>Username</Table.Th>
                <Table.Th ta={"center"}>Prompts</Table.Th>
                <Table.Th ta={"center"} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={toggleSortOrder}>
                  <span>Perplexity</span>
                  {sortOrder === 'asc' ? <HiOutlineSortAscending size={20} style={{ marginLeft: '5px', top: 10, marginTop: 3 }} /> :
                    <HiOutlineSortDescending size={20} style={{ marginLeft: '5px', marginTop: 3 }} />}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((item, index) => (
                <Table.Tr>
                  <Table.Td style={{ textAlign: 'center' }}>{index + 1}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{(item.username === user.uid) ? "Me" : item.username}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{item.prompt}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{item.perplexity}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        :
        <Text
          fw={600}
          size="lg"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'red', deg: 155 }}
        >
          Please sign in to unlock this functionality!
        </Text>
      }
    </div>
  );
}

export default Leaderboard;