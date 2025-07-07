import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { CardsApi } from "@/api-client/apis/CardsApi"
import { getConfig } from "@/auth/utils"
import { STORAGE_KEYS, ALL_COLUMNS } from "../constants"
import { Data } from "@/types/board"
import { CardColumn } from "@/api-client/models/CardColumn"

export const useBoardState = (
  initialData: Data,
  setData: React.Dispatch<React.SetStateAction<Data | null>>
) => {
  const { toast } = useToast()
  const [columnOrder, setColumnOrder] = useState<CardColumn[]>([
    CardColumn.Backlog,
    CardColumn.Todo,
    CardColumn.InProgress,
    CardColumn.Done,
  ])

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEYS.COLUMN_ORDER)
    if (savedOrder) {
      try {
        setColumnOrder(JSON.parse(savedOrder))
      } catch (error) {
        console.error("Failed to parse saved column order:", error)
      }
    }
  }, [])

  const savePositions = (newColumnOrder: CardColumn[], newData: Data) => {
    localStorage.setItem(STORAGE_KEYS.COLUMN_ORDER, JSON.stringify(newColumnOrder))
    const cardPositions: Record<string, { column: CardColumn; position: number }> = {}
    ALL_COLUMNS.forEach(({ column }) => {
      newData.cards
        .filter((card) => card.column === column)
        .forEach((card, index) => {
          cardPositions[card.id] = { column: card.column, position: index }
        })
    })
    localStorage.setItem(STORAGE_KEYS.CARD_POSITIONS, JSON.stringify(cardPositions))
  }

  const getColumnCards = (column: CardColumn) => {
    return initialData.cards
      .filter((card) => card.column === column)
      .sort((a, b) => {
        const savedPositions = localStorage.getItem(STORAGE_KEYS.CARD_POSITIONS)
        if (savedPositions) {
          try {
            const positions = JSON.parse(savedPositions)
            const aPos = positions[a.id]?.position ?? 999
            const bPos = positions[b.id]?.position ?? 999
            return aPos - bPos
          } catch { /* ignore parse error */ }
        }
        return a.id - b.id
      })
  }

  const updateCardStatus = async (cardId: number, newColumn: CardColumn) => {
    const card = initialData.cards.find((c) => c.id === cardId)
    if (!card) return

    const optimisticData = {
      ...initialData,
      cards: initialData.cards.map((c) =>
        c.id === cardId ? { ...c, column: newColumn } : c
      ),
    }
    setData(optimisticData)

    try {
      const cardsApi = new CardsApi(getConfig())
      const response = await cardsApi.updateCardApiCardsCardIdPatch({
        cardId: cardId,
        cardInUpdate: { column: newColumn },
      })

      const finalData = {
        ...initialData,
        cards: initialData.cards.map((c) => (c.id === cardId ? response : c)),
      }
      setData(finalData)
      savePositions(columnOrder, finalData)

      toast({ title: "Card moved", description: `Card moved to ${newColumn}` })
    } catch (error) {
      console.error("Failed to update card status:", error)
      setData(initialData)
      toast({
        title: "Update failed",
        description: "Failed to move card. Please try again.",
        variant: "destructive",
      })
    }
  }

  const orderedColumns = columnOrder
    .map((colType) => ALL_COLUMNS.find((col) => col.column === colType))
    .filter(Boolean) as typeof ALL_COLUMNS

  return {
    columnOrder,
    setColumnOrder,
    orderedColumns,
    getColumnCards,
    updateCardStatus,
  }
}