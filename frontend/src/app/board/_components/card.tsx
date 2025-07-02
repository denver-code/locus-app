import { CardOut } from "@/api-client/models/CardOut";
import { DialogTrigger } from "@/components/ui/dialog";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { Metadata } from "./interfaces";
import { cn } from "@/lib/utils";
import { BoardOut } from "@/api-client/models/BoardOut";
import { Dispatch } from "react";
import { SetStateAction } from "react";

export function AddCard({
    boardId,
    setMetadata,
    className,
}: {
    boardId: number;
    setMetadata: Dispatch<SetStateAction<Metadata>>;
    className?: string;
}) {
    const classNames = cn(
        "p-4 rounded-lg border border-dashed bg-background items-center justify-center flex hover:bg-accent/50 transition-all duration-200 cursor-pointer",
        className
    );
    return (
        <DialogTrigger>
            <div
                onClick={() => {
                    setMetadata({ type: "card_add", boardId: boardId });
                }}
                className={classNames}
            >
                <PlusIcon className="w-8 h-8 text-foreground" />
            </div>
        </DialogTrigger>
    );
}

export function DisplayCard({
    card,
    board,
    setMetadata,
    className,
    N = 30,
}: {
    card: CardOut;
    board: BoardOut;
    setMetadata: Dispatch<SetStateAction<Metadata>>;
    className?: string;
    N?: number;
}) {
    const classNames = cn(
        "flex flex-col gap-2 p-3 rounded-lg border bg-background hover:bg-accent/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
        className
    );
    return (
        <DialogTrigger>
            <div
                onClick={() => {
                    setMetadata({ type: "card_view", card: card, board: board });
                }}
                className={classNames}
            >
                <div className="flex gap-1.5">
                    {card.labels.sort().map((color) => (
                        <div
                            key={color}
                            className={`w-3 h-3 rounded-full ring-1 ring-black/5`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
                <h3 className="font-semibold text-base tracking-tight leading-snug text-foreground/80 line-clamp-2 antialiased">
                    {card.title.length > N ? card.title.slice(0, N) + "..." : card.title}
                </h3>
            </div>
        </DialogTrigger>
    );
}
