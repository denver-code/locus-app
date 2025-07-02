"use client";

import { useState, useCallback } from "react";
import { Board } from "./_components/board";
import { AddBoard } from "./_components/add-board";
import { BoardsDialog } from "./_components/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useAuthClient } from "@/hooks/use-auth-client";
import { BoardsApi, Configuration } from "@/api-client";

export default function HomePage() {
    const fetchBoards = useCallback(async (config: Configuration) => {
        const boardsApi = new BoardsApi(config);
        return await boardsApi.listBoardsApiBoardsGet();
    }, []);

    const { data: boards, setData: setBoards } = useAuthClient(fetchBoards);
    const [open, setOpen] = useState(false);

    if (boards === null)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Spinner />
            </div>
        );

    return (
        <BoardsDialog open={open} setOpen={setOpen} setBoards={setBoards}>
            <div className="h-full w-full p-6 bg-gradient-to-b from-background to-background/50">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Your Boards</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage your Kanban boards
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AddBoard />
                    {boards.map((board) => (
                        <Board key={board.id} board={board} />
                    ))}
                </div>
            </div>
        </BoardsDialog>
    );
}
