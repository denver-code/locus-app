import { CardColumn } from "@/api-client/models/CardColumn";

interface ColumnInfo {
  column: CardColumn;
  name: string;
}

export const ALL_COLUMNS: ColumnInfo[] = [
  { column: CardColumn.Backlog, name: "Backlog" },
  { column: CardColumn.Todo, name: "Todo" },
  { column: CardColumn.InProgress, name: "In Progress" },
  { column: CardColumn.Done, name: "Done" },
];

export const STORAGE_KEYS = {
  COLUMN_ORDER: "kanban-column-order",
  CARD_POSITIONS: "kanban-card-positions",
};