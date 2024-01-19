import { Text, ScrollArea, Table, Image, Title} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../components/AuthProvider';

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
                    <Title size={"lg"} align="center" style={{ margin: '3vh' }}> Prompt History </Title>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th ta={"center"}>Date</Table.Th>
                                <Table.Th ta={"center"}>Prompt</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {prompts.map((item, index) => (
                                <Table.Tr key={index}>
                                    <Table.Td style={{ textAlign: 'center' }}>{new Date(item.timestamp.seconds * 1000).toLocaleDateString()}</Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>{item.prompt}</Table.Td>
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