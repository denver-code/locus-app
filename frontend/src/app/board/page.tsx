"use client";

import { Suspense, useCallback } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BoardsApi } from "@/api-client/apis/BoardsApi";
import { getConfig } from "@/auth/utils";

import { DialogRoot } from "./_components/dialog/dialog";
import { Header } from "./_components/header";
import { RezizableBoard } from "./_components/board";
import { Spinner } from "@/components/ui/spinner";
import { Data, Metadata } from "./_components/interfaces";

import { useToast } from "@/hooks/use-toast";
import { Configuration } from "@/api-client/runtime";
import { useAuthClient } from "@/hooks/use-auth-client";

function BoardContent() {
    const searchParams = useSearchParams();
    const boardId = parseInt(searchParams.get("board_id") || "0");

    const [open, setOpen] = useState(false);
    const [metadata, setMetadata] = useState<Metadata>({ type: "default" });

    const fetchData = useCallback(
        async (config: Configuration) => {
            const boardsApi = new BoardsApi(config);
            const [board, cards] = await Promise.all([
                boardsApi.getBoardApiBoardsBoardIdGet({ boardId: boardId }),
                boardsApi.listCardsApiBoardsBoardIdCardsGet({ boardId: boardId }),
            ]);
            return { board, cards };
        },
        [boardId]
    );

    const { data, setData } = useAuthClient<Data>(fetchData);

    if (!data)
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Spinner />
            </div>
        );
    else {
        return (
            <DialogRoot open={open} setOpen={setOpen} metadata={metadata} setData={setData}>
                <div className="h-full w-full flex flex-col">
                    <Header board={data.board} setMetadata={setMetadata} setOpen={setOpen} />
                    <div className="h-full bg-background">
                        <RezizableBoard data={data} setMetadata={setMetadata} />
                    </div>
                </div>
            </DialogRoot>
        );
    }
}

export default function BoardPage() {
    return (
        <Suspense
            fallback={
                <div className="h-full w-full flex items-center justify-center">
                    <Spinner />
                </div>
            }
        >
            <BoardContent />
        </Suspense>
    );
}
