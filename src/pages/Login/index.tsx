import { AxiosError } from "axios"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { login } from "../../apis"
import { Button, Title, Card, Container, TextInput, PasswordInput } from "@mantine/core"
import { useForm } from '@mantine/form';

type Inputs = {
  email: string,
  password: string,
}

export const Login = () => {
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
            navigate('/')
        }, onError: (error: AxiosError) => {
            if (error instanceof AxiosError) {
                console.log(error, 'WHAT')
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

    const onSubmit = (values: Inputs) => {
        loginMutate(values)
    }

    return (
        <div className="bg-stone-50">
            <Container className="flex justify-center items-center h-screen">
                {/* <Head title="Login" /> */}
                <Card shadow="xl" radius="lg" withBorder className="flex justify-between p-8 gap-y-4" style={{width: 500}}>
                    <form onSubmit={form.onSubmit((values: Inputs) => onSubmit(values))}>
                        <div className="mb-4">
                            <Title className="text-gray-700" order={3}>Sign in to your account</Title>
                        </div>
                        <div className="mb-4">
                            <TextInput 
                                key={form.key('email')}
                                {...form.getInputProps('email')}
                                label="Email" 
                                disabled={loginIsPending}
                            />
                        </div>
                        <div className="mb-4">
                            <PasswordInput 
                                key={form.key('password')}
                                {...form.getInputProps('password')}
                                size="md"
                                type="password" 
                                label="Password" 
                                disabled={loginIsPending}
                            />
                        </div>
                        <div className="mb-8">
                            <Button color="cyan" loading={loginIsPending} size="md" fullWidth type="submit">Continue</Button>
                        </div>
                        <div className="flex items-center justify-center">
                            {/* <span className="text-sm pr-1 text-gray-500">Dont have an account?</span><Link label="Sign Up" url="/signup" /> */}
                        </div>
                    </form>
                </Card>
            </Container>
        </div>
    )
}