import type React from "react"
import { ALL_COLUMNS } from "../constants"
import { DisplayCard } from "@/app/board/_components/card"
import { Data, DragItem } from "@/types/board"
import { Metadata } from "@/app/board/_components/interfaces"

interface KanbanDragOverlayProps {
  activeItem: DragItem | null
  data: Data
  setMetadata: React.Dispatch<React.SetStateAction<Metadata>>
  setData: React.Dispatch<React.SetStateAction<Data | null>>
}

export const KanbanDragOverlay: React.FC<KanbanDragOverlayProps> = ({
  activeItem,
  data,
  setMetadata,
  setData,
}) => {
  if (!activeItem) return null

  return (
    <>
      {activeItem.type === "card" && (
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
      {activeItem.type === "column" && (
        <div className="min-w-[320px] bg-zinc-900/50 rounded-lg border border-border p-3 shadow-lg opacity-90">
          <div className="text-sm font-medium">
            {ALL_COLUMNS.find((col) => col.column === activeItem.data)?.name}
          </div>
        </div>
      )}
    </>
  )
}