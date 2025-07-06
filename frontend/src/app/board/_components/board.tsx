"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronDown, ChevronRight, GripVertical } from "lucide-react"
import { DisplayCard, AddCard } from "./card"
import { CardColumn } from "@/api-client/models/CardColumn"
import type { Data, Metadata } from "./interfaces"
import type { Dispatch, SetStateAction } from "react"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useDroppable } from "@dnd-kit/core"
import { getConfig } from "@/auth/utils"
import { CardsApi } from "@/api-client/apis/CardsApi"

// Types for drag and drop
type DragItem = {
  id: string
  type: "card" | "column"
  data: any
}

// Local storage keys
const STORAGE_KEYS = {
  COLUMN_ORDER: "kanban-column-order",
  CARD_POSITIONS: "kanban-card-positions",
}

// Draggable Card Component
const DraggableCard = ({
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

// Sortable Column Component
const SortableColumn = ({
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

const HiddenColumnsPanel = ({
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

export const BoardColumns = ({
  data,
  setMetadata,
  setData,
}: {
  data: Data
  setMetadata: Dispatch<SetStateAction<Metadata>>
  setData: Dispatch<SetStateAction<Data | null>>
}) => {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null)
  const [columnOrder, setColumnOrder] = useState([
    CardColumn.Backlog,
    CardColumn.Todo,
    CardColumn.InProgress,
    CardColumn.Done,
  ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for more responsive dragging
      },
    }),
  )

  // Load saved positions from localStorage
  useEffect(() => {
    const savedColumnOrder = localStorage.getItem(STORAGE_KEYS.COLUMN_ORDER)
    if (savedColumnOrder) {
      try {
        setColumnOrder(JSON.parse(savedColumnOrder))
      } catch (error) {
        console.error("Failed to parse saved column order:", error)
      }
    }
  }, [])

  // Save positions to localStorage
  const savePositions = (newColumnOrder: CardColumn[], newData: Data) => {
    localStorage.setItem(STORAGE_KEYS.COLUMN_ORDER, JSON.stringify(newColumnOrder))

    // Create column-specific positions instead of global positions
    const cardPositions: Record<string, { column: CardColumn; position: number }> = {}

    // Group cards by column and assign positions within each column
    allColumns.forEach(({ column }) => {
      const columnCards = newData.cards.filter((card) => card.column === column)
      columnCards.forEach((card, index) => {
        cardPositions[card.id] = {
          column: card.column,
          position: index, // Position within the column, not global
        }
      })
    })

    localStorage.setItem(STORAGE_KEYS.CARD_POSITIONS, JSON.stringify(cardPositions))
  }

  const allColumns = [
    { column: CardColumn.Backlog, name: "Backlog" },
    { column: CardColumn.Todo, name: "Todo" },
    { column: CardColumn.InProgress, name: "In Progress" },
    { column: CardColumn.Done, name: "Done" },
  ]

  const getColumnCount = (column: CardColumn) => {
    return data.cards.filter((card) => card.column === column).length
  }

  const getColumnCards = (column: CardColumn) => {
    return data.cards
      .filter((card) => card.column === column)
      .sort((a, b) => {
        // Try to maintain saved order if available
        const savedPositions = localStorage.getItem(STORAGE_KEYS.CARD_POSITIONS)
        if (savedPositions) {
          try {
            const positions = JSON.parse(savedPositions)
            const aPos = positions[a.id]?.position ?? 999
            const bPos = positions[b.id]?.position ?? 999
            return aPos - bPos
          } catch (error) {
            console.error("Failed to parse saved card positions:", error)
          }
        }
        return a.id - b.id // Fallback to ID order
      })
  }

  // Update card status via API
  const updateCardStatus = async (cardId: number, newColumn: CardColumn) => {
    const card = data.cards.find((c) => c.id === cardId)
    if (!card) return

    // Optimistic update
    const updatedCard = { ...card, column: newColumn }
    const optimisticData = {
      ...data,
      cards: data.cards.map((c) => (c.id === cardId ? updatedCard : c)),
    }

    setData((prev) => prev && optimisticData)

    try {
      const cardsApi = new CardsApi(getConfig())
      const patch = { column: newColumn }
      const response = await cardsApi.updateCardApiCardsCardIdPatch({
        cardId: cardId,
        cardInUpdate: patch,
      })

      const finalData = {
        ...data,
        cards: data.cards.map((c) => (c.id === cardId ? response : c)),
      }

      setData((prev) => prev && finalData)

      // Save positions after successful update
      savePositions(columnOrder, finalData)

      const columnName = allColumns.find((col) => col.column === newColumn)?.name || newColumn
      toast({
        title: "Card moved",
        description: `Card moved to ${columnName}`,
      })
    } catch (error) {
      console.error("Failed to update card status:", error)

      // Revert optimistic update on error
      setData((prev) => prev && data)

      toast({
        title: "Update failed",
        description: "Failed to update card status. Please try again.",
        variant: "destructive",
      })
    }
  }
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current

    if (activeData?.type === "card") {
      setActiveItem({
        id: active.id as string,
        type: "card",
        data: activeData.card,
      })
    } else if (activeData?.type === "column") {
      setActiveItem({
        id: active.id as string,
        type: "column",
        data: activeData.column,
      })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    return

    // const { active, over } = event
    // if (!over) return

    // const activeId = active.id as string
    // const overId = over.id as string

    // // Handle card dragging over columns (including hidden columns)
    // if (activeId.startsWith("card-")) {
    //   let newColumn: CardColumn | null = null

    //   if (overId.startsWith("column-")) {
    //     newColumn = overId.replace("column-", "") as CardColumn
    //   } else if (overId.startsWith("hidden-column-")) {
    //     newColumn = overId.replace("hidden-column-", "") as CardColumn
    //   }

    //   if (newColumn) {
    //     const cardId = Number.parseInt(activeId.replace("card-", ""))
    //     const card = data.cards.find((c) => c.id === cardId)

    //     if (card && card.column !== newColumn) {
    //       // Update card column immediately for visual feedback
    //       setData(
    //         (prev) =>
    //           prev && {
    //             ...prev,
    //             cards: prev.cards.map((c) => (c.id === cardId ? { ...c, column: newColumn } : c)),
    //           },
    //       )
    //     }
    //   }
    // }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle column reordering
    if (activeId.startsWith("column-") && overId.startsWith("column-")) {
      const activeColumn = activeId.replace("column-", "") as CardColumn
      const overColumn = overId.replace("column-", "") as CardColumn

      const oldIndex = columnOrder.indexOf(activeColumn)
      const newIndex = columnOrder.indexOf(overColumn)

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
        setColumnOrder(newColumnOrder)

        // Save column order immediately
        localStorage.setItem(STORAGE_KEYS.COLUMN_ORDER, JSON.stringify(newColumnOrder))

        toast({
          title: "Column order updated",
          description: "Column arrangement has been saved",
        })
      }
      return
    }

    // Handle card movement
    if (activeId.startsWith("card-")) {
      const cardId = Number.parseInt(activeId.replace("card-", ""))
      const card = data.cards.find((c) => c.id === cardId)

      if (!card) return

      let targetColumn: CardColumn | null = null
      let targetIndex: number | null = null

      // Determine target column and position
      if (overId.startsWith("column-")) {
        targetColumn = overId.replace("column-", "") as CardColumn
      } else if (overId.startsWith("hidden-column-")) {
        targetColumn = overId.replace("hidden-column-", "") as CardColumn
      } else if (overId.startsWith("card-")) {
        const targetCardId = Number.parseInt(overId.replace("card-", ""))
        const targetCard = data.cards.find((c) => c.id === targetCardId)
        if (targetCard) {
          targetColumn = targetCard.column
          // Find the index of the target card within its column
          const columnCards = getColumnCards(targetCard.column)
          targetIndex = columnCards.findIndex((c) => c.id === targetCardId)
        }
      }

      if (!targetColumn) return

      // If moving within the same column, handle reordering
      if (card.column === targetColumn && targetIndex !== null) {
        const columnCards = getColumnCards(targetColumn)
        const oldIndex = columnCards.findIndex((c) => c.id === cardId)

        if (oldIndex !== targetIndex && oldIndex !== -1) {
          const reorderedCards = arrayMove(columnCards, oldIndex, targetIndex)

          // --- START OF FIX ---

          // 1. Get current positions from localStorage to avoid overwriting other columns.
          const savedPositionsRaw = localStorage.getItem(STORAGE_KEYS.CARD_POSITIONS);
          const allCardPositions = savedPositionsRaw ? JSON.parse(savedPositionsRaw) : {};

          // 2. Update positions ONLY for the cards in the reordered column.
          reorderedCards.forEach((card, index) => {
            allCardPositions[card.id] = {
              column: targetColumn,
              position: index,
            };
          });

          // 3. Save the updated positions object back.
          localStorage.setItem(STORAGE_KEYS.CARD_POSITIONS, JSON.stringify(allCardPositions));
          
          // 4. Trigger a re-render to reflect the new order from localStorage.
          // Creating a new array reference for `cards` is sufficient.
          setData((prev) => (prev ? { ...prev, cards: [...prev.cards] } : null));

          // --- END OF FIX ---

          toast({
            title: "Card reordered",
            description: "Card position has been updated",
          })
        }
        return
      }

      // Moving to a different column - update status
      if (card.column !== targetColumn) {
        updateCardStatus(cardId, targetColumn)
      }
    }
  }

  // Columns that have 0 cards
  const hiddenColumns = allColumns
    .filter((col) => getColumnCount(col.column) === 0)
    .map((col) => ({
      name: col.name,
      count: getColumnCount(col.column),
      column: col.column,
    }))

  // Order columns based on saved order
  const orderedColumns = columnOrder
    .map((columnType) => allColumns.find((col) => col.column === columnType))
    .filter(Boolean) as typeof allColumns

  return (
    <div className="h-full bg-zinc-950/60">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={80} minSize={60}>
            <div className="h-full flex gap-6 p-6 overflow-x-auto">
              <SortableContext
                items={orderedColumns.map((col) => `column-${col.column}`)}
                strategy={horizontalListSortingStrategy}
              >
                {orderedColumns.map(({ column, name }) => (
                  <SortableColumn
                    key={column}
                    id={`column-${column}`}
                    column={column}
                    title={name}
                    count={getColumnCount(column)}
                    boardId={data.board.id}
                    setMetadata={setMetadata}
                  >
                    <SortableContext
                      items={getColumnCards(column).map((card) => `card-${card.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {getColumnCards(column).map((card) => (
                        <DraggableCard
                          key={card.id}
                          card={card}
                          board={data.board}
                          setMetadata={setMetadata}
                          data={data}
                          setData={setData}
                          className="w-full"
                          // N={120}
                        />
                      ))}
                    </SortableContext>
                  </SortableColumn>
                ))}
              </SortableContext>
            </div>
          </ResizablePanel>

          {hiddenColumns.length > 0 && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                <HiddenColumnsPanel hiddenColumns={hiddenColumns} boardId={data.board.id} setMetadata={setMetadata} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        <DragOverlay className="w-full">
          {activeItem && activeItem.type === "card" && (
            <div className="bg-card border border-border rounded-lg shadow-lg opacity-90">
              <DisplayCard
                card={activeItem.data}
                board={data.board}
                setMetadata={setMetadata}
                data={data}
                setData={setData}
                className="pointer-events-none"
                N={120}
              />
            </div>
          )}
          {activeItem && activeItem.type === "column" && (
            <div className="min-w-[320px] bg-zinc-900/50 rounded-lg border border-border p-3 shadow-lg opacity-90">
              <div className="text-sm font-medium">
                {allColumns.find((col) => col.column === activeItem.data)?.name}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

const DroppableColumn = ({
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

const DroppableHiddenColumn = ({
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
