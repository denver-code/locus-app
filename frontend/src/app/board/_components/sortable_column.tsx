"use client"

import type React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { MoreHorizontal} from "lucide-react"
import { AddCard } from "./card"
import { CardColumn } from "@/api-client/models/CardColumn"
import type { Metadata } from "./interfaces"
import type { Dispatch, SetStateAction } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DroppableColumn } from "./drag_components"


export const SortableColumn = ({
  id,
  title,
  children,
  count,
  column,
  boardId,
  setMetadata,
}: {
  id: string
  title: string
  children: React.ReactNode
  count: number
  column: CardColumn
  boardId: number
  setMetadata: Dispatch<SetStateAction<Metadata>>
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: "column",
      column,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  if (count === 0) return null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col min-w-[320px] max-w-[400px] flex-1 bg-zinc-900/50 rounded-lg border border-border"
    >
      <div className="flex items-center justify-between px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          {/* <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div> */}
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <AddCard boardId={boardId} column={column} setMetadata={setMetadata} />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <DroppableColumn id={`column-${column}`} className="flex flex-col gap-2 px-3 pb-4 min-h-[100px]">
          {children}
        </DroppableColumn>
      </ScrollArea>
    </div>
  )
}