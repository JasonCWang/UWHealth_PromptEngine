import React, { useMemo, useEffect, useState } from 'react';
import { Text, ScrollArea, Image, Title, Divider} from '@mantine/core';
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../components/AuthProvider';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { MantineProvider } from "@mantine/core";

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
      console.log(sortedUsers)
      // Get the top 200 users
      const topUsers = sortedUsers.slice(0, 200);

      setData(topUsers);
    };
    fetchData();
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "username",
        header: "Username",
        muiTableHeadCellProps: { sx: { color: "green" } }, 
        Cell: ({ renderedCellValue }) => <strong>{renderedCellValue}</strong>,
        size: 500
      },
      {
        accessorKey: "count",
        header: "Count",
        Header: <i style={{ color: "Black" }}>Number of Prompts Submitted</i>,
        size: 800
      }
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data,
    isFullScreen: false,
    enableRowNumbers: true
  });

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
    <MantineProvider
      theme={{
        colorScheme: "light",
        primaryColor: "blue"
      }}
    >
      <MantineReactTable table={table} />
    </MantineProvider>
    </ScrollArea>
    </div>
  );
}
export default TopUsers;
