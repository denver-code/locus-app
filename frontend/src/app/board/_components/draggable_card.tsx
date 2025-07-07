"use client"

import type React from "react"
import { DisplayCard, AddCard } from "./card"
import type { Data, Metadata } from "./interfaces"
import type { Dispatch, SetStateAction } from "react"
import { cn } from "@/lib/utils"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"


export const DraggableCard = ({
    card,
    board,
    setMetadata,
    data,
    setData,
    className,
    N,
  }: {
    card: any
    board: any
    setMetadata: Dispatch<SetStateAction<Metadata>>
    data: Data
    setData: Dispatch<SetStateAction<Data | null>>
    className?: string
    N?: number
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: `card-${card.id}`,
      data: {
        type: "card",
        card,
      },
    })
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.8 : 1,
      }
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none w-full"
      >
        <DisplayCard
          card={card}
          board={board}
          setMetadata={setMetadata}
          data={data}
          setData={setData}
          className={cn("w-full", className)}
          N={N}
        />
      </div>
    )
}
  