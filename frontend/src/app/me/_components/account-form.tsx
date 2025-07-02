"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UsersApi } from "@/api-client/apis/UsersApi";
import { getConfig } from "@/auth/utils";

const formSchema = z
    .object({
        email: z.string().email({ message: "Invalid email address" }),
        newPassword: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" })
            .optional()
            .or(z.literal("")),
        confirmPassword: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.newPassword && data.newPassword.length > 0) {
                return data.newPassword === data.confirmPassword;
            }
            return true;
        },
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

export const AccountForm = () => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const usersApi = new UsersApi(getConfig());
            await usersApi.updateUserApiUsersMePatch({
                userInUpdate: {
                    email: values.email,
                    password: values.newPassword || undefined,
                },
            });
            form.reset();
        } catch (error) {
            form.setError("root", {
                message: "Failed to update account. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {form.formState.errors.root && (
                    <FormMessage className="text-red-500">
                        {form.formState.errors.root.message}
                    </FormMessage>
                )}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" placeholder="Enter new email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password (Optional)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        placeholder="Enter new password"
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
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="password"
                                        placeholder="Confirm new password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Account"}
                </Button>
            </form>
        </Form>
    );
};
