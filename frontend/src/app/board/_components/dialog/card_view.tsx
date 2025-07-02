import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import MarkdownRenderer from "@/components/markdown";

import { CardOut } from "@/api-client/models/CardOut";
import { CardColumn } from "@/api-client/models/CardColumn";
import { CardInUpdate } from "@/api-client/models/CardInUpdate";
import { LabelColor } from "@/api-client/models/LabelColor";
import { LabelOut } from "@/api-client/models/LabelOut";
import { CardsApi } from "@/api-client/apis/CardsApi";
import { Data, CardView } from "../interfaces";
import { useToast } from "@/hooks/use-toast";

import {
    Plus,
    Square,
    SquareDashed,
    SquareMinus,
    SquarePen,
    SquareX,
    Trash2Icon,
} from "lucide-react";
import { getConfig } from "@/auth/utils";

const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string(),
    column: z.string(),
    labels: z.array(z.string()),
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
                className="font-bold text-lg"
                {...form.register("title")}
                onBlur={(e) => handleBlur(e.target.value)}
                autoFocus
            />
        );
    }
    return (
        <div
            className="text-lg font-bold cursor-pointer hover:text-primary/80 transition-colors"
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
                <div className="flex items-center gap-2">
                    <SquarePen className="w-4 h-4" />
                    <span className="font-bold">Description</span>
                </div>
                <div className="flex flex-col gap-2">
                    <ScrollArea className="h-full">
                        <Textarea
                            className="min-h-[300px] resize-none"
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
            <div className="flex items-center gap-2">
                <SquarePen className="w-4 h-4" />
                <span className="font-bold">Description</span>
            </div>
            <div
                onClick={() => setIsDescriptionEditable(true)}
                className="flex flex-col gap-2 border rounded-md p-4 min-h-[200px] cursor-pointer hover:bg-accent/50 transition-colors"
            >
                <ScrollArea className="h-full">
                    {form.watch("description") ? (
                        <MarkdownRenderer content={form.watch("description")} />
                    ) : (
                        <span className="text-gray-400">Add a more detailed description...</span>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

const Labels = ({ form, labels }: { form: any; labels: LabelOut[] }) => {
    const sortedLabels = labels.sort((a, b) => a.color.localeCompare(b.color));

    const handleLabelChange = (value: string, checked: boolean) => {
        const currentLabels: string[] = form.getValues("labels") || [];
        const newLabels = checked
            ? [...currentLabels, value]
            : currentLabels.filter((label) => label !== value);
        form.setValue("labels", newLabels);
    };

    const currentLabels: string[] = form.watch("labels").sort() || [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-1">
                    {currentLabels.map((labelColor) => {
                        const label = labels.find((l) => l.color === labelColor);
                        return label ? (
                            <div
                                key={label.color}
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ backgroundColor: label.color }}
                            />
                        ) : null;
                    })}
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px] p-2">
                {sortedLabels.map((opt) => (
                    <div key={opt.color} className="flex items-center gap-2 py-1">
                        <div className="flex-none">
                            <Checkbox
                                id={opt.color}
                                checked={currentLabels.includes(opt.color)}
                                onCheckedChange={(checked) =>
                                    handleLabelChange(opt.color, checked as boolean)
                                }
                            />
                        </div>
                        <div
                            className="flex-1 h-7 rounded flex items-center justify-center px-2 cursor-pointer"
                            style={{ backgroundColor: opt.color }}
                            onClick={() =>
                                handleLabelChange(opt.color, !currentLabels.includes(opt.color))
                            }
                        >
                            <span className="text-sm font-bold text-black">{opt.name || "-"}</span>
                        </div>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const Column = ({ form }: { form: any }) => {
    return (
        <Select
            value={form.watch("column")}
            onValueChange={(value) => form.setValue("column", value)}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={CardColumn.Backlog}>
                    <div className="flex items-center gap-2">
                        <SquareDashed className="w-4 h-4" /> Backlog
                    </div>
                </SelectItem>
                <SelectItem value={CardColumn.Todo}>
                    <div className="flex items-center gap-2">
                        <Square className="w-4 h-4" /> Todo
                    </div>
                </SelectItem>
                <SelectItem value={CardColumn.Doing}>
                    <div className="flex items-center gap-2">
                        <SquareMinus className="w-4 h-4" /> Doing
                    </div>
                </SelectItem>
                <SelectItem value={CardColumn.Done}>
                    <div className="flex items-center gap-2">
                        <SquareX className="w-4 h-4" /> Done
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
};

export const ViewDialog = ({
    metadata,
    setData,
    setOpen,
}: {
    metadata: CardView;
    setData: Dispatch<SetStateAction<Data | null>>;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const { toast } = useToast();
    const cardsApi = new CardsApi(getConfig());

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: metadata.card.title,
            description: metadata.card.description,
            column: metadata.card.column,
            labels: metadata.card.labels,
        },
    });

    useEffect(() => {
        form.reset({
            title: metadata.card.title,
            description: metadata.card.description,
            column: metadata.card.column,
            labels: metadata.card.labels,
        });
    }, [metadata, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // with optimistic update

        const patch: CardInUpdate = {
            title: values.title !== metadata.card.title ? values.title : undefined,
            description:
                values.description !== metadata.card.description ? values.description : undefined,
            column:
                values.column !== metadata.card.column ? (values.column as CardColumn) : undefined,
            labels:
                values.labels !== metadata.card.labels
                    ? (values.labels as LabelColor[])
                    : undefined,
        };

        // create a new card with the updated values
        const newCard: CardOut = {
            ...metadata.card,
            title: patch.title ?? metadata.card.title,
            description: patch.description ?? metadata.card.description,
            column: patch.column ?? metadata.card.column,
            labels: patch.labels ?? metadata.card.labels,
        };

        setData(
            (prev) =>
                prev && {
                    ...prev,
                    cards: prev.cards.map((card) =>
                        card.id === metadata.card.id ? newCard : card
                    ),
                }
        );

        // Check if all fields are undefined
        if (Object.values(patch).every((value) => value === undefined)) {
            // Optionally, notify the user that no changes were made
            return;
        }

        try {
            const response = await cardsApi.updateCardApiCardsCardIdPatch({
                cardId: metadata.card.id,
                cardInUpdate: patch,
            });
            setData(
                (prev) =>
                    prev && {
                        ...prev,
                        cards: prev.cards.map((card) =>
                            card.id === metadata.card.id ? response : card
                        ),
                    }
            );
            toast({
                title: "Card updated",
                description: "Card updated successfully",
            });
        } catch (error) {
            // Handle errors and provide user feedback
            // console.error("Failed to update card:", error);
            toast({
                title: "Card update failed",
                description: "Please try again",
                variant: "destructive",
            });
        }
        setOpen(false);
    };

    const handleDelete = async () => {
        try {
            await cardsApi.deleteCardApiCardsCardIdDelete({
                cardId: metadata.card.id,
            });

            setData(
                (prev) =>
                    prev && {
                        ...prev,
                        cards: prev.cards.filter((card) => card.id !== metadata.card.id),
                    }
            );

            toast({
                title: "Card deleted",
                description: "Card was successfully deleted",
            });
            setOpen(false);
        } catch (error) {
            toast({
                title: "Delete failed",
                description: "Failed to delete the card. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <DialogContent className="w-full max-w-2xl max-h-screen overflow-hidden">
            <Form {...form} key={metadata.card.id}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>
                            <Title form={form} />
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <Labels form={form} labels={metadata.board.labels} />
                            <Column form={form} />
                        </div>
                        <Description form={form} />
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
