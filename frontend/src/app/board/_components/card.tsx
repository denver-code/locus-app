import { CardOut } from "@/api-client/models/CardOut";
import { DialogTrigger } from "@/components/ui/dialog";
import { GripVerticalIcon, PlusIcon } from "lucide-react";
import { Data, Metadata } from "./interfaces";
import { cn } from "@/lib/utils";
import { BoardOut } from "@/api-client/models/BoardOut";
import { Dispatch } from "react";
import { SetStateAction } from "react";
import { MoreHorizontal, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { CardColumn } from "@/api-client";
import { CardStatusDropdown } from "./card_status_dropdown";

export function AddCard({
    boardId,
    column,
    setMetadata,
    className,
}: {
    boardId: number;
    column?: CardColumn;
    setMetadata: Dispatch<SetStateAction<Metadata>>;
    className?: string;
}) {
    const classNames = cn(
        className
    );
    return (
        <DialogTrigger>
            <div
                onClick={() => {
                    setMetadata({ type: "card_add", boardId: boardId, column: column  });
                }}
                className={classNames}
            >
                   <Plus className="h-3 w-3" />
            </div>
        </DialogTrigger>
    );
}

export function DisplayCard({
    card,
    board,
    data,
    setData,
    setMetadata,
    className,
    N = 30,
  }: {
    card: CardOut
    board: BoardOut
    data: Data
    setData: Dispatch<SetStateAction<Data | null>>
    setMetadata: Dispatch<SetStateAction<Metadata>>
    className?: string
    N?: number
  }) {
    const classNames = cn(
      "flex flex-col items-start gap-2 p-2 rounded-lg border bg-background hover:bg-accent/50 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md group",
      className,
    )
  
    return (
      <DialogTrigger>
        <div
          onClick={() => {
            setMetadata({ type: "card_view", card: card, board: board })
          }}
          className={classNames}
        >
          <div className="flex justify-between w-full">
            <span className="text-xs text-zinc-500 font-mono justify-end">
              {board.acronym}-{card.id}
            </span>
            <div className="flex gap-1.5">
              {card.labels.sort().map((color) => (
                <div
                  key={color}
                  className={`w-3 h-3 rounded-full ring-1 ring-black/5`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <CardStatusDropdown card={card} data={data} setData={setData} />
            </div>
          </div>
          <h3 className="font-semibold justify-start text-left tracking-tight leading-snug text-foreground/80 line-clamp-2 antialiased">
            {card.title.length > N ? card.title.slice(0, N) + "..." : card.title}
          </h3>
        </div>
      </DialogTrigger>
    )
  }
  