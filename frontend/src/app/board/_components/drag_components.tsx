"use client"

import type React from "react"
import { CardColumn } from "@/api-client/models/CardColumn"
import { cn } from "@/lib/utils"
import { useDroppable } from "@dnd-kit/core"

// Types for drag and drop
export type DragItem = {
  id: string
  type: "card" | "column"
  data: any
}

export const DroppableColumn = ({
    id,
    children,
    className,
  }: {
    id: string
    children: React.ReactNode
    className?: string
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id,
    })
  
    return (
      <div ref={setNodeRef} className={cn(className, isOver && "bg-muted/20 border-primary/50")}>
        {children}
      </div>
    )
  }



export const DroppableHiddenColumn = ({
    column,
    children,
  }: {
    column: CardColumn
    children: React.ReactNode
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: `hidden-column-${column}`,
    })
  
    return (
      <div
        ref={setNodeRef}
        className={cn("rounded p-1 transition-colors", isOver && "bg-primary/10 border border-primary/30")}
      >
        {children}
      </div>
    )
  }
  