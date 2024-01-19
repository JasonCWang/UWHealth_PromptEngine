import { useState } from "react";
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Text, Paper, Group, PaperProps, Button, Anchor, Stack, Flex, Container } from '@mantine/core';

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Auth() {
    const navigate = useNavigate();

    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");

    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            institution: '',
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length < 6 ? 'Password should include at least 6 characters' : null),
        },
    });

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, form.values.email, form.values.password);
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRegister = async () => {
        if (form.values.password !== form.values.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, form.values.email, form.values.password);
            console.log("User Profile: ", { name: form.values.name, institution: form.values.institution });
            setIsRegistering(false);
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Container justify={"center"} style={{ width: 400, alignSelf: 'center', marginBottom: 40 }}>
            <Text ta={"center"} size="lg" fw={500}>{isRegistering ? "Create New Account" : "Sign In To Account"}</Text>

            <form onSubmit={isRegistering ? form.onSubmit(handleRegister) : form.onSubmit(handleLogin)}>
                <Stack>
                    {isRegistering && (
                        <>
                            <TextInput
                                label="Name (Optional)"
                                placeholder="Your name"
                                value={form.values.name}
                                onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
                                radius="md"
                            />
                            <TextInput
                                label="Institution (Optional)"
                                placeholder="Your institution"
                                value={form.values.institution}
                                onChange={(event) => form.setFieldValue('institution', event.currentTarget.value)}
                                radius="md"
                            />
                        </>
                    )}

                    <TextInput
                        required
                        label="Email"
                        placeholder="me@email.com"
                        value={form.values.email}
                        onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
                        error={form.errors.email && 'Invalid email'}
                        radius="md"
                    />

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
                        error={form.errors.password && 'Password should include at least 6 characters'}
                        radius="md"
                    />

                    {isRegistering && (
                        <PasswordInput
                            required
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={form.values.confirmPassword}
                            onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
                            error={form.errors.password && 'Passwords do not match.'}
                            radius="md"
                        />
                    )}

                    <Button type="submit" radius="xl">{isRegistering ? 'Register' : 'Login'}</Button>
                </Stack>
            </form>

            <Flex mt={10} align={"center"} justify={"center"}>
                <Anchor size="md" component="button" onClick={() => setIsRegistering(prev => !prev)}>
                    {isRegistering
                        ? "Already have an account? Login"
                        : "Don't have an account? Register"}
                </Anchor>
            </Flex>

            {error && <Text ta={"center"} mt="xs" color="red">{error}</Text>}
        </Container>
    );
}