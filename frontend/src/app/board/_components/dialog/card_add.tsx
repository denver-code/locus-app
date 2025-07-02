import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BoardsApi } from "@/api-client/apis/BoardsApi";
import { getConfig } from "@/auth/utils";
import { CardAdd, Data } from "../interfaces";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Dispatch, SetStateAction } from "react";
import { Trash2Icon } from "lucide-react";

export const AddCardForm = ({
    metadata,
    setData,
    setOpen,
}: {
    metadata: CardAdd;
    setData: Dispatch<SetStateAction<Data | null>>;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    const { toast } = useToast();
    const boardApi = new BoardsApi(getConfig());

    // Define the form schema
    const formSchema = z.object({
        title: z.string().min(1, { message: "Title is required" }),
    });

    // Create the form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
        },
    });

    // Handle form submission
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await boardApi.createCardsApiBoardsBoardIdCardsPost({
                boardId: metadata.boardId,
                cardInCreate: [
                    {
                        title: values.title,
                    },
                ],
            });

            // Update the state with the actual response
            setData(
                (prev) =>
                    prev && {
                        ...prev,
                        cards: [...prev.cards, response[0]],
                    }
            );

            toast({
                title: "Card created",
                description: "Card created successfully",
            });
            setOpen(false);
        } catch (error) {
            console.error("Failed to create card:", error);
            toast({
                title: "Failed to create card",
                description: "Please try again",
            });
        }
    };

    return (
        <DialogContent className="sm:max-w-[500px]">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Add New Card</DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Create a new card by entering a title below.
                        </DialogDescription>
                    </DialogHeader>

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Card Title</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter card title..."
                                        {...field}
                                        className="w-full focus-visible:ring-black"
                                        autoFocus
                                    />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500">
                                    Give your card a clear and descriptive title.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit" className="bg-black hover:bg-gray-800">
                            Create Card
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};
