"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"
import { AddCard } from "./card"
import { CardColumn } from "@/api-client/models/CardColumn"
import type { Metadata } from "./interfaces"
import type { Dispatch, SetStateAction } from "react"
import { cn } from "@/lib/utils"
import { DroppableHiddenColumn } from "./drag_components"



export const HiddenColumnsPanel = ({
  hiddenColumns,
  boardId,
  setMetadata,
}: {
  hiddenColumns: Array<{ name: string; count: number; column: CardColumn }>
  boardId: number
  setMetadata: Dispatch<SetStateAction<Metadata>>
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="min-w-[240px] border-l border-border bg-card/50">
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-start gap-2 text-sm font-medium"
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          Hidden columns
        </Button>
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {hiddenColumns.map((col) => (
              <DroppableHiddenColumn key={col.column} column={col.column}>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs h-8 px-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          col.column === CardColumn.InProgress && "bg-yellow-500",
                          col.column === CardColumn.Done && "bg-green-500",
                          col.column === CardColumn.Backlog && "bg-gray-500",
                          col.column === CardColumn.Todo && "bg-blue-500",
                        )}
                      ></div>
                      <span className="text-muted-foreground">{col.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{col.count}</span>
                  </Button>
                  <AddCard boardId={boardId} column={col.column} setMetadata={setMetadata} />
                </div>
              </DroppableHiddenColumn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}