import { Text, ScrollArea, Table, Image, Title, Divider} from '@mantine/core';
import React, { useEffect, useState, useMemo} from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../components/AuthProvider';
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { MantineProvider } from "@mantine/core";

const PromptHistory = () => {
    const [prompts, setPrompts] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPrompts = async () => {
            if (user) {
                const q = query(collection(db, 'final_prompts_v2'), where('username', '==', user.uid), orderBy('timestamp', 'desc'));
                const querySnapshot = await getDocs(q);
                const userPrompts = [];
                querySnapshot.forEach((doc) => {
                    const promptData = doc.data();
                    userPrompts.push(promptData);
                });
                console.log(userPrompts)
                setPrompts(userPrompts);
            }
        };
        fetchPrompts();
    }, [user]);

    const columns = useMemo(
        () => [
          {
            accessorKey: "prompt",
            header: "Prompt",
            muiTableHeadCellProps: { sx: { color: "green" } }, 
            Cell: ({ renderedCellValue }) => <strong>{renderedCellValue}</strong>,
            size: 700
          },
          {
            accessorKey: "examples",
            header: "Examples",
            muiTableHeadCellProps: { sx: { color: "green" } }, 
            Cell: ({ renderedCellValue }) => <strong>{renderedCellValue}</strong>,
            size: 500
          }
        ],
        []
      );

    const table = useMantineReactTable({
        columns,
        data: prompts,
        filterFromLeafRows: true,
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
                Your Prompt History</Text>
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

export default PromptHistory;