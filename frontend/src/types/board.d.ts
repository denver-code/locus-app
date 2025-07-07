import type { Card } from "@/api-client/models/Card"
import type { Board } from "@/api-client/models/Board"
import type { CardColumn } from "@/api-client/models/CardColumn"

export interface Data {
  board: Board
  cards: Card[]
}

export interface DragItem {
  id: string
  type: "card" | "column"
  data: any 
}