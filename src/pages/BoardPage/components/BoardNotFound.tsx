import { useNavigate } from 'react-router-dom';
import { Button, Container, Group, Text, Title } from '@mantine/core';

export function BoardNotFound() {
    const navigate = useNavigate();
    return (
        <Container p="xl">
            <Title>404</Title>
            <Title>Board not found.</Title>
                <Text c="dimmed" size="lg">
                    Unfortunately, this page isn’t available. The board may have been deleted, or the URL might be incorrect.
                </Text>
            <Group justify="center">
                <Button variant="subtle" size="md" onClick={() => navigate('/')}>
                    Take me back to home page
                </Button>
            </Group>
        </Container>
    );
}