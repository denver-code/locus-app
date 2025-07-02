"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area-fixed";
import { DisplayCard, AddCard } from "./card";
import { CardColumn } from "@/api-client/models/CardColumn";
import { Data, Metadata } from "./interfaces";
import { Dispatch } from "react";
import { SetStateAction } from "react";

// Take in cards as children
const Column = ({ title, children }: { title: string; children: React.ReactNode }) => {
    return (
        <div className="w-full h-fit max-h-full flex flex-col gap-3 bg-gradient-to-b from-card to-background rounded-lg border shadow-lg transition-all duration-200 hover:shadow-xl">
            <div className="p-3 border-b flex justify-center bg-gradient-to-r from-card-foreground/90 to-card-foreground rounded-t-lg">
                <h2 className="text-lg font-semibold text-card tracking-wide">{title}</h2>
            </div>
            <ScrollArea className="max-h-full flex px-3 pb-3">
                <div className="flex flex-col gap-3">{children}</div>
            </ScrollArea>
        </div>
    );
};

// Take in cards as children
const Backlog = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-full flex flex-col rounded-lg border bg-gradient-to-b from-card to-background m-4 shadow-lg">
            <div className="p-3 border-b bg-gradient-to-r from-card-foreground/90 to-card-foreground rounded-t-lg">
                <h2 className="text-lg font-semibold text-card text-center tracking-wide">
                    BACKLOG
                </h2>
            </div>
            <ScrollArea className="h-fit max-h-full">
                <div className="grid grid-cols-3 gap-5 p-5">{children}</div>
            </ScrollArea>
        </div>
    );
};

export const RezizableBoard = ({
    data,
    setMetadata,
}: {
    data: Data;
    setMetadata: Dispatch<SetStateAction<Metadata>>;
}) => {
    return (
        <ResizablePanelGroup direction="vertical" className="h-full rounded-lg">
            <ResizablePanel
                defaultSize={70}
                minSize={30}
                className="h-full flex gap-6 p-6 bg-gradient-to-b from-background to-background/50"
            >
                {[CardColumn.Todo, CardColumn.Doing, CardColumn.Done].map((columnValue) => (
                    <Column key={columnValue} title={columnValue}>
                        {data.cards
                            .filter((card) => card.column === columnValue)
                            .map((card) => (
                                <DisplayCard
                                    key={card.id}
                                    card={card}
                                    board={data.board}
                                    setMetadata={setMetadata}
                                    className="border-2 border-card-foreground/20 hover:border-card-foreground/40 transition-colors shadow-sm hover:shadow-md"
                                    N={120}
                                />
                            ))}
                    </Column>
                ))}
            </ResizablePanel>

            <ResizableHandle
                withHandle
                className="bg-gradient-to-r from-border/50 via-border to-border/50"
            />

            <ResizablePanel className="h-full bg-gradient-to-b from-background/50 to-background">
                <Backlog>
                    <AddCard
                        boardId={data.board.id}
                        setMetadata={setMetadata}
                        className="border-2 border-card-foreground/20 hover:border-card-foreground/40 transition-colors shadow-sm hover:shadow-md h-full min-h-16"
                    />
                    {data.cards
                        .filter((card) => card.column === CardColumn.Backlog)
                        .map((card) => (
                            <DisplayCard
                                key={card.id}
                                card={card}
                                board={data.board}
                                setMetadata={setMetadata}
                                className="border-2 border-card-foreground/20 hover:border-card-foreground/40 transition-colors shadow-sm hover:shadow-md h-full min-h-16"
                                N={70}
                            />
                        ))}
                </Backlog>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};
