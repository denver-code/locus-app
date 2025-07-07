"use client"

import type React from "react"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import type { Data, Metadata } from "./interfaces"
import { useBoardState } from "@/hooks/use-board-state"
import { useDndHandlers } from "@/hooks/use-dnd-handlers"
import { SortableColumn } from "./sortable-column"
import { DraggableCard } from "./draggable-card"
import { HiddenColumnsPanel } from "./hidden-columns-panel"
import { KanbanDragOverlay } from "@/components/kanban-drag-overlay"
import { ALL_COLUMNS } from "@/constants"


export const BoardColumns = ({
  data,
  setMetadata,
  setData,
}: {
  data: Data
  setMetadata: React.Dispatch<React.SetStateAction<Metadata>>
  setData: React.Dispatch<React.SetStateAction<Data | null>>
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    })
  )

  const {
    columnOrder,
    setColumnOrder,
    orderedColumns,
    getColumnCards,
    updateCardStatus,
  } = useBoardState(data, setData)

  const { activeItem, handleDragStart, handleDragEnd } = useDndHandlers({
    data,
    setData,
    columnOrder,
    setColumnOrder,
    updateCardStatus,
    getColumnCards,
  })

  const hiddenColumns = ALL_COLUMNS
    .filter((col) => getColumnCards(col.column).length === 0)
    .map((col) => ({
      name: col.name,
      column: col.column,
      count: 0, 
    }));

  return (
    <div className="h-full bg-zinc-950/60">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={80} minSize={60}>
            <div className="h-full flex gap-6 p-6 overflow-x-auto">
              <SortableContext
                items={orderedColumns.map((col) => `column-${col.column}`)}
                strategy={horizontalListSortingStrategy}
              >
                {orderedColumns
                  .filter((col) => getColumnCards(col.column).length > 0)
                  .map(({ column, name }) => (
                    <SortableColumn
                      key={column}
                      id={`column-${column}`}
                      column={column}
                      title={name}
                      count={getColumnCards(column).length}
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
                <HiddenColumnsPanel
                  hiddenColumns={hiddenColumns}
                  boardId={data.board.id}
                  setMetadata={setMetadata}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>

        <DragOverlay>
          <KanbanDragOverlay
            activeItem={activeItem}
            data={data}
            setMetadata={setMetadata}
            setData={setData}
          />
        </DragOverlay>
      </DndContext>
    </div>
  )
}