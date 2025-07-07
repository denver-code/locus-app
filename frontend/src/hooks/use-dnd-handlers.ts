import { useState } from "react"
import { arrayMove } from "@dnd-kit/sortable"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { useToast } from "@/hooks/use-toast"
import { CardColumn } from "@/api-client/models/CardColumn"
import { STORAGE_KEYS } from "../constants"
import { Data, DragItem } from "@/types/board"

interface DndHandlerProps {
  data: Data
  setData: React.Dispatch<React.SetStateAction<Data | null>>
  columnOrder: CardColumn[]
  setColumnOrder: React.Dispatch<React.SetStateAction<CardColumn[]>>
  updateCardStatus: (cardId: number, newColumn: CardColumn) => Promise<void>
  getColumnCards: (column: CardColumn) => any[]
}

export const useDndHandlers = ({
  data,
  setData,
  columnOrder,
  setColumnOrder,
  updateCardStatus,
  getColumnCards,
}: DndHandlerProps) => {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null)
  const { toast } = useToast()

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current
    if (activeData?.type === "card" || activeData?.type === "column") {
      setActiveItem({
        id: active.id as string,
        type: activeData.type,
        data: activeData.card || activeData.column,
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null)
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (active.data.current?.type === "column" && over.data.current?.type === "column") {
      const oldIndex = columnOrder.indexOf(active.data.current.column)
      const newIndex = columnOrder.indexOf(over.data.current.column)
      if (oldIndex !== newIndex) {
        const newColumnOrder = arrayMove(columnOrder, oldIndex, newIndex)
        setColumnOrder(newColumnOrder)
        localStorage.setItem(STORAGE_KEYS.COLUMN_ORDER, JSON.stringify(newColumnOrder))
        toast({ title: "Column order updated" })
      }
      return
    }

    if (active.data.current?.type === "card") {
      const cardId = active.data.current.card.id
      const originalColumn = active.data.current.card.column
      let targetColumn: CardColumn | null = over.data.current?.column || over.data.current?.card?.column


      let targetIndex: number | null = null 

      if (overId.startsWith("column-")) {
        targetColumn = overId.replace("column-", "") as CardColumn
      } else if (overId.startsWith("hidden-column-")) {
        targetColumn = overId.replace("hidden-column-", "") as CardColumn
      } else if (over.data.current?.type === "card") {
        const targetCard = data.cards.find((c) => `card-${c.id}` === overId);
        if (targetCard) {
            targetColumn = targetCard.column;
            const columnCards = getColumnCards(targetCard.column);
            targetIndex = columnCards.findIndex((c) => c.id === targetCard.id);
        }
      }

      if (!targetColumn) return

      if (originalColumn === targetColumn) {
        const columnCards = getColumnCards(targetColumn)
        const oldIndex = columnCards.findIndex((c) => c.id === cardId)
        const newIndex = columnCards.findIndex((c) => c.id === over?.data.current?.card?.id)

        if (oldIndex !== newIndex) {
            const savedPositionsRaw = localStorage.getItem(STORAGE_KEYS.CARD_POSITIONS);
            const allCardPositions = savedPositionsRaw ? JSON.parse(savedPositionsRaw) : {};
            const reorderedCards = arrayMove(columnCards, oldIndex, newIndex)
            reorderedCards.forEach((card, index) => {
                allCardPositions[card.id] = { column: targetColumn, position: index };
            });
            localStorage.setItem(STORAGE_KEYS.CARD_POSITIONS, JSON.stringify(allCardPositions));
            setData((prev) => (prev ? { ...prev, cards: [...prev.cards] } : null));
            toast({ title: "Card reordered" })
        }
      } 
      else {
        updateCardStatus(cardId, targetColumn)
      }
    }
  }

  return { activeItem, handleDragStart, handleDragEnd }
}