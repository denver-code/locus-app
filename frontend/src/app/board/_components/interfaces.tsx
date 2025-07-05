import { CardOut } from "@/api-client/models/CardOut";

import { BoardOut } from "@/api-client/models/BoardOut";
import { CardColumn } from "@/api-client/models";

export interface Data {
    board: BoardOut;
    cards: CardOut[];
}

export interface Default {
    type: "default";
}

export interface CardView {
    type: "card_view";
    card: CardOut;
    board: BoardOut;
}

export interface CardAdd {
    type: "card_add";
    boardId: number;
    column?: CardColumn;
}

export interface BoardView {
    type: "board_view";
    board: BoardOut;
}

export type Metadata = CardView | CardAdd | BoardView | Default;
