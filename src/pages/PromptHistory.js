import { Text, ScrollArea, Table, Image, Title, Divider} from '@mantine/core';
import React, { useEffect, useState, useMemo} from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../components/AuthProvider';
import {
    MantineReactTable,
    useMantineReactTable,
  } from 'mantine-react-table';
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
    /*
    const columns = useMemo(
        () => [
          {
            accessorKey: 'timestamp.seconds', //access nested data with dot notation
            header: 'Date',
          },
          {
            accessorKey: 'prompt',
            header: 'Prompt',
          },
        ],
        [],
      );
    const table = useMantineReactTable({
        columns,
        prompts, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
      });
    */
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
            <Title pl={5} align="center">
            <Divider my="md" />
              <Image src='clinipromptlogo.png' ml={-5} radius={10} height={75} fit={"contain"} />
              <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'blue.9', to: 'red.9', deg: 90 }}>
                Your Prompt History</Text>
            </Title>
            <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th ta={"center"}>Date</Table.Th>
                                <Table.Th ta={"center"}>Prompt</Table.Th>
                                <Table.Th ta={"center"}>Example</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {prompts.map((item, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td style={{ textAlign: 'center' }}>{new Date(item.timestamp.seconds * 1000).toLocaleDateString()}</Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>{item.prompt}</Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>{item.examples[0]}</Table.Td>
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
                    Please sign in to view your prompt history!
                </Text>
            }
        </div>
    );
}

export default PromptHistory;