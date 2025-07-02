"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthApi } from "@/api-client/apis/AuthApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { getConfig, getToken, setToken } from "@/auth/utils";
import { useRouter } from "next/navigation";
import { ResponseError } from "@/api-client/runtime";

// Add form schema
const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
});

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const authApi = new AuthApi(getConfig());
        try {
            const token = await authApi.loginApiAuthTokensPost({
                username: values.email,
                password: values.password,
            });
            setToken(token);
            router.push("/boards");
        } catch (error) {
            if (error instanceof ResponseError && error.response.status === 401) {
                form.setError("root", { message: "Invalid email or password" });
            } else {
                form.setError("root", { message: "An error occurred while logging in" });
            }
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email and password to log in</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-6"
                        >
                            {form.formState.errors.root && (
                                <div className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive">
                                    {form.formState.errors.root.message}
                                </div>
                            )}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="email">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="user@example.com"
                                                required
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center">
                                            <FormLabel htmlFor="password">Password</FormLabel>
                                            <a
                                                href="#"
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                            >
                                                Forgot your password?
                                            </a>
                                        </div>
                                        <FormControl>
                                            <Input {...field} type="password" required />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                            <div className="mt-4 text-center text-sm">
                                Don't have an account?{" "}
                                <a href="/signup" className="underline underline-offset-4">
                                    Signup
                                </a>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
