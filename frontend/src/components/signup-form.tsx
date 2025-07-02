"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { UsersApi } from "@/api-client/apis/UsersApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ResponseError } from "@/api-client/runtime";
import { useRouter } from "next/navigation";
import { getConfig } from "@/auth/utils";
import { useState } from "react";
import { Spinner } from "./ui/spinner";

const formSchema = z
    .object({
        email: z.string().email({
            message: "Please enter a valid email address.",
        }),
        password: z.string().min(8, {
            message: "Password must be at least 8 characters.",
        }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

const successTimeout = 3000;

export function SignupForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const [success, setSuccess] = useState(false);

    const router = useRouter();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const usersApi = new UsersApi(getConfig());
        try {
            const response = await usersApi.createUserApiUsersPost({
                userInCreate: {
                    email: values.email,
                    password: values.password,
                },
            });
            setSuccess(true);
            setTimeout(() => {
                router.push("/login");
            }, successTimeout);
        } catch (error) {
            if (error instanceof ResponseError && error.response.status === 409) {
                form.setError("root", { message: "Email already registered" });
            } else {
                form.setError("root", { message: "An error occurred while signing up" });
            }
        }
    }

    if (success) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Signing Up...</CardTitle>
                        <CardDescription>Please wait while we create your account</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 py-6">
                        <Spinner />
                        <p className="text-muted-foreground">
                            You will be redirected to login shortly
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    } else {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Signup</CardTitle>
                        <CardDescription>
                            Enter your email and password to create an account
                        </CardDescription>
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
                                            <FormLabel htmlFor="password">Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Enter password"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel htmlFor="confirmPassword">
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Confirm password"
                                                    required
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">
                                    Signup
                                </Button>
                                <div className="mt-4 text-center text-sm">
                                    Already have an account?{" "}
                                    <a href="/login" className="underline underline-offset-4">
                                        Login
                                    </a>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        );
    }
}
