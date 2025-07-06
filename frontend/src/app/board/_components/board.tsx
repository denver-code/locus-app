"use client"

import type React from "react"

import { useState } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { DisplayCard, AddCard } from "./card"
import { CardColumn } from "@/api-client/models/CardColumn"
import type { Data, Metadata } from "./interfaces"
import type { Dispatch, SetStateAction } from "react"
import { cn } from "@/lib/utils"

const Column = ({
  title,
  children,
  count,
  column,
  boardId,
  setMetadata,
}: {
  title: string
  children: React.ReactNode
  count: number,
  column: CardColumn,
  boardId: number,
  setMetadata: Dispatch<SetStateAction<Metadata>>
}) => {
  if (count === 0) return null

  return (
    <div className="flex flex-col min-w-[320px] max-w-[400px] flex-1 bg-zinc-900/50 rounded-lg border border-border">
      <div className="flex items-center justify-between px-3 py-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h2 className="text-sm font-medium text-foreground">{title}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{count}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <AddCard
                    boardId={boardId}
                    column={column}
                    setMetadata={setMetadata}
                  />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 px-3 pb-4">{children}</div>
      </ScrollArea>
    </div>
  )
}

const HiddenColumnsPanel = ({
  hiddenColumns,
  boardId,
  setMetadata,
}: {
  hiddenColumns: Array<{ name: string; count: number; column: CardColumn }>,
  boardId: number,
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
              <div className="flex items-center justify-between" key={col.column}>
                  <Button
                  key={col.column}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-xs h-8 px-2"
                >
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
                <AddCard
                    boardId={boardId}
                    column={col.column}
                    setMetadata={setMetadata}
                  />
              </div>

            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const BoardColumns = ({
  data,
  setMetadata,
  setData,
}: {
  data: Data
  setMetadata: Dispatch<SetStateAction<Metadata>>
  setData: Dispatch<SetStateAction<Data | null>>
}) => {

  const allColumns = [
    { column: CardColumn.Backlog, name: "Backlog" },
    { column: CardColumn.Todo, name: "Todo" },
    { column: CardColumn.InProgress, name: "In Progress" },
    { column: CardColumn.Done, name: "Done" },
  ]

  const getColumnCount = (column: CardColumn) => {
    return data.cards.filter((card) => card.column === column).length
  }

  // Columns that have 0 cards
  const hiddenColumns = allColumns.filter((col) => getColumnCount(col.column) === 0)
  .map((col) => ({
    name: col.name,
    count: getColumnCount(col.column),
    column: col.column,
  }))



  return (
    <div className="h-full bg-zinc-950/60">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={80} minSize={60}>
          <div className="h-full flex gap-6 p-6 overflow-x-auto">
            {allColumns.map(({ column, name }) => (
              <Column key={column} column={column} title={name} count={getColumnCount(column)} boardId={data.board.id} setMetadata={setMetadata}>
                {/* {column === CardColumn.Backlog && (
                  <AddCard
                    boardId={data.board.id}
                    setMetadata={setMetadata}
                    className="border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 transition-colors bg-card/50 hover:bg-card rounded-lg p-4 min-h-[60px] flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
                  />
                )} */}
                {data.cards
                  .filter((card) => card.column === column)
                  .map((card) => (
                    <DisplayCard
                      key={card.id}
                      card={card}
                      board={data.board}
                      setMetadata={setMetadata}
                      data={data}
                      setData={setData}
                      className="bg-card border border-border hover:border-border/80 transition-all duration-200 rounded-lg p-3 shadow-sm hover:shadow-md"
                      N={120}
                    />
                  ))}
              </Column>
            ))}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <HiddenColumnsPanel hiddenColumns={hiddenColumns} boardId={data.board.id} setMetadata={setMetadata} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
