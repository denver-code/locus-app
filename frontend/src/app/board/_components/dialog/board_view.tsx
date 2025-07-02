"use client";

import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { BoardOut } from "@/api-client/models/BoardOut";
import { BoardView, Data } from "../interfaces";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SetStateAction, Dispatch, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/markdown";
import { BoardsApi } from "@/api-client/apis/BoardsApi";
import { BoardInUpdate } from "@/api-client/models/BoardInUpdate";
import { useToast } from "@/hooks/use-toast";
import { getConfig } from "@/auth/utils";
import { Trash2Icon, SquarePen } from "lucide-react";
import { LabelColor } from "@/api-client/models/LabelColor";
import { LabelOut } from "@/api-client/models/LabelOut";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    title: z.string().min(4, {
        message: "Title must be at least 4 characters.",
    }),
    description: z.string(),
    labels: z.array(
        z.object({
            color: z.string() as z.ZodType<LabelColor>,
            name: z.string().optional(),
        })
    ),
});

const Title = ({ form }: { form: any }) => {
    const [isTitleEditable, setIsTitleEditable] = useState(false);

    const handleBlur = (value: string) => {
        form.setValue("title", value);
        setIsTitleEditable(false);
    };

    if (isTitleEditable) {
        return (
            <Input
                className="text-lg font-bold tracking-tight"
                {...form.register("title")}
                onBlur={(e) => handleBlur(e.target.value)}
                autoFocus
            />
        );
    }
    return (
        <div
            className="text-lg font-bold tracking-tight hover:text-primary/80 cursor-pointer transition-colors"
            onClick={() => setIsTitleEditable(true)}
        >
            {form.watch("title")}
        </div>
    );
};

const Description = ({ form }: { form: any }) => {
    const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);

    const handleBlur = (value: string) => {
        form.setValue("description", value);
        setIsDescriptionEditable(false);
    };

    if (isDescriptionEditable) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <SquarePen className="w-4 h-4" />
                    <span className="font-bold text-md">Description</span>
                </div>
                <div className="flex flex-col gap-2">
                    <ScrollArea className="h-full">
                        <Textarea
                            className="h-64 resize-none"
                            {...form.register("description")}
                            onBlur={(e) => handleBlur(e.target.value)}
                            autoFocus
                            placeholder="Add a more detailed description..."
                        />
                    </ScrollArea>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <SquarePen className="w-4 h-4" />
                <span className="font-bold">Description</span>
            </div>
            <div
                onClick={() => setIsDescriptionEditable(true)}
                className="flex flex-col gap-2 border rounded-md p-3 min-h-[8rem] hover:bg-accent/50 cursor-pointer transition-colors"
            >
                <ScrollArea className="h-64">
                    {form.watch("description") ? (
                        <MarkdownRenderer content={form.watch("description")} />
                    ) : (
                        <span className="text-muted-foreground italic">
                            Add a more detailed description...
                        </span>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

const Label = ({ label, form, index }: { label: LabelOut; form: any; index: number }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleBlur = (value: string) => {
        const labels = [...form.watch("labels")];
        labels[index] = { ...labels[index], name: value };
        form.setValue("labels", labels);
        setIsEditing(false);
    };

    return (
        <div
            className="flex p-1 rounded-md border items-center justify-center"
            style={{ backgroundColor: label.color }}
        >
            {isEditing ? (
                <Input
                    defaultValue={label.name}
                    onBlur={(e) => handleBlur(e.target.value)}
                    autoFocus
                    className="text-sm"
                />
            ) : (
                <div
                    className="flex items-center justify-center h-full min-w-10 w-full font-bold cursor-pointer text-sm text-white"
                    onClick={() => setIsEditing(true)}
                >
                    {label.name || ""}
                </div>
            )}
        </div>
    );
};

const Labels = ({ form }: { form: any }) => {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-md font-bold">Labels</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {form
                    .watch("labels")
                    .sort((a: LabelOut, b: LabelOut) => a.color > b.color)
                    .map((label: LabelOut, index: number) => (
                        <Label key={label.color} label={label} form={form} index={index} />
                    ))}
            </div>
        </div>
    );
};

export const ViewBoardDialog = ({
    metadata,
    setOpen,
    setData,
}: {
    metadata: BoardView;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setData: Dispatch<SetStateAction<Data | null>>;
}) => {
    const { toast } = useToast();
    const boardsApi = new BoardsApi(getConfig());
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: metadata.board.title,
            description: metadata.board.description,
            labels: metadata.board.labels,
        },
    });

    useEffect(() => {
        form.reset({
            title: metadata.board.title,
            description: metadata.board.description,
            labels: metadata.board.labels,
        });
    }, [metadata, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log(values);
        const patch: BoardInUpdate = {
            title: values.title !== metadata.board.title ? values.title : undefined,
            description:
                values.description !== metadata.board.description ? values.description : undefined,
            labels: values.labels !== metadata.board.labels ? values.labels : undefined,
        };

        if (Object.values(patch).every((value) => value === undefined)) {
            return;
        }

        try {
            const board = await boardsApi.updateBoardApiBoardsBoardIdPatch({
                boardId: metadata.board.id,
                boardInUpdate: patch,
            });

            toast({
                title: "Board updated",
                description: "Board updated successfully",
            });

            setData(
                (prev) =>
                    prev && {
                        ...prev,
                        board: board,
                    }
            );
        } catch (error) {
            toast({
                title: "Update failed",
                description: "Failed to update the board. Please try again.",
                variant: "destructive",
            });
        }
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            await boardsApi.deleteBoardApiBoardsBoardIdDelete({
                boardId: metadata.board.id,
            });

            toast({
                title: "Board deleted",
                description: "Board was successfully deleted",
            });
            setOpen(false);
            router.push("/");
        } catch (error) {
            toast({
                title: "Delete failed",
                description: "Failed to delete the board. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <DialogContent className="w-full max-w-2xl max-h-screen overflow-hidden">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>
                            <Title form={form} />
                        </DialogTitle>
                    </DialogHeader>
                    <div className="h-fit md:w-auto flex flex-col gap-4">
                        <Description form={form} />
                        <Labels form={form} />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="submit" className="font-medium">
                            Save Changes
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-destructive/90 hover:bg-destructive"
                        >
                            <Trash2Icon className="w-4 h-4" />
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};
