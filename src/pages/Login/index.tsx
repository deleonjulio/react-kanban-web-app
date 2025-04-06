import {
    Anchor,
    Button,
    Checkbox,
    Container,
    Group,
    Paper,
    PasswordInput,
    Text,
    TextInput,
    Title,
  } from '@mantine/core';
import { useMutation } from "@tanstack/react-query"
import { useForm } from '@mantine/form';
import { useNavigate } from "react-router-dom"
import { AxiosError } from "axios"
import { login } from "../../apis"

type Inputs = {
  email: string,
  password: string,
}

export function Login() {
  const navigate = useNavigate()

  const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
          email: '',
          password: '',
      },
      validate: {
          email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
          password: (value) => (value.length < 1 ? 'Required' : null),
      }
  });
  
  const { mutate: loginMutate, isPending: loginIsPending } = useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
        console.log(response)
        navigate('/boards')
    }, onError: (error: AxiosError) => {
        if (error instanceof AxiosError) {
            if(error?.response?.data?.error) {
                form.setFieldError('email', error?.response?.data?.error);
            } else if(error?.response?.data?.message) {
                form.setFieldError('email', error?.response?.data?.message);
            } else {
                form.setFieldError('email', error?.message);
            }
        } else {
            form.setFieldError('email', "Something went wrong");
        }
    },
  })
  return (
    <Container size={420} my={40}>
      <Title ta="center">
        Welcome back!
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor size="sm" component="button">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit((values: Inputs) => loginMutate(values))}>
          <TextInput 
            key={form.key('email')}
            {...form.getInputProps('email')}
            label="Email" 
            size="md"
            disabled={loginIsPending}
          />
          <PasswordInput 
            key={form.key('password')}
            {...form.getInputProps('password')}
            type="password" 
            label="Password" 
            size="md"
            mt="lg" 
            disabled={loginIsPending}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor component="button" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" loading={loginIsPending} size="md" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}