"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  SquareDashedBottomIcon as SquareDashed,
  SquareMinus,
  SquareCheck,
  Circle,
  CheckCircle,
} from "lucide-react"
import type { CardOut } from "@/api-client/models/CardOut"
import { CardColumn } from "@/api-client/models/CardColumn"
import type { CardInUpdate } from "@/api-client/models/CardInUpdate"
import { CardsApi } from "@/api-client/apis/CardsApi"
import { getConfig } from "@/auth/utils"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Data } from "./interfaces"
import type { Dispatch, SetStateAction } from "react"

const statusConfig = {
  [CardColumn.Backlog]: {
    icon: SquareDashed,
    label: "Backlog",
    color: "text-gray-500",
    shortcut: "1",
  },
  [CardColumn.Todo]: {
    icon: Circle,
    label: "Todo",
    color: "text-blue-500",
    shortcut: "2",
  },
  [CardColumn.InProgress]: {
    icon: SquareMinus,
    label: "In Progress",
    color: "text-yellow-500",
    shortcut: "3",
  },
  [CardColumn.Done]: {
    icon: CheckCircle,
    label: "Done",
    color: "text-green-500",
    shortcut: "4",
  },
}

interface CardStatusDropdownProps {
  card: CardOut
  data: Data
  setData: Dispatch<SetStateAction<Data | null>>
  trigger?: React.ReactNode
}

export function CardStatusDropdown({ card, data, setData, trigger }: CardStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const cardsApi = new CardsApi(getConfig())

  const getColumnCount = (column: CardColumn) => {
    return data.cards.filter((c) => c.column === column).length
  }

  const handleStatusChange = async (newColumn: CardColumn) => {
    if (newColumn === card.column) {
      setIsOpen(false)
      return
    }

    // Optimistic update
    const updatedCard: CardOut = {
      ...card,
      column: newColumn,
    }

    setData(
      (prev) =>
        prev && {
          ...prev,
          cards: prev.cards.map((c) => (c.id === card.id ? updatedCard : c)),
        },
    )

    try {
      const patch: CardInUpdate = {
        column: newColumn,
      }

      const response = await cardsApi.updateCardApiCardsCardIdPatch({
        cardId: card.id,
        cardInUpdate: patch,
      })

      setData(
        (prev) =>
          prev && {
            ...prev,
            cards: prev.cards.map((c) => (c.id === card.id ? response : c)),
          },
      )

      toast({
        title: "Status updated",
        description: `Card moved to ${statusConfig[newColumn].label}`,
      })
    } catch (error) {
      // Revert optimistic update on error
      setData(
        (prev) =>
          prev && {
            ...prev,
            cards: prev.cards.map((c) => (c.id === card.id ? card : c)),
          },
      )

      toast({
        title: "Update failed",
        description: "Failed to update card status. Please try again.",
        variant: "destructive",
      })
    }

    setIsOpen(false)
  }

  const currentStatus = statusConfig[card.column]
  const CurrentIcon = currentStatus.icon

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div onClick={(e) => e.stopPropagation()}>
          {trigger || (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 mr-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* <MoreHorizontal className="h-3 w-3" /> */}
              {/* Show current status icon */}
              <CurrentIcon className={cn("h-3 w-3", currentStatus.color)} />
              <span className="sr-only">Change status</span>
             
            </Button>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px] z-50">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
          Change status...
          <span className="float-right text-xs bg-muted px-1 rounded">S</span>
        </div>
        {Object.entries(statusConfig).map(([column, config]) => {
          const Icon = config.icon
          const count = getColumnCount(column as CardColumn)
          const isCurrentStatus = card.column === column

          return (
            <DropdownMenuItem
              key={column}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusChange(column as CardColumn)
              }}
              className="flex items-center justify-between px-2 py-1.5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm">{config.label}</span>
                {isCurrentStatus && <SquareCheck className="h-3 w-3 text-green-500" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{count}</span>
                <span className="text-xs bg-muted px-1 rounded">{config.shortcut}</span>
              </div>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
