import { SidebarTrigger } from "@/components/ui/sidebar";
import { Metadata } from "./interfaces";
import { BoardOut } from "@/api-client/models/BoardOut";
import { Dispatch, SetStateAction } from "react";
import { Settings2 } from "lucide-react";

export const Header = ({
    board,
    setMetadata,
    setOpen,
}: {
    board: BoardOut;
    setMetadata: Dispatch<SetStateAction<Metadata>>;
    setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
    return (
        <div className="flex items-center border-b bg-gradient-to-r from-background via-card to-background px-3 py-2">
            <SidebarTrigger className="hover:bg-card-foreground/10 rounded-md transition-colors" />
            <div className="flex-1 flex justify-end">
                <button
                    onClick={() => {
                        setMetadata({ type: "board_view", board: board });
                        setOpen(true);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-card-foreground/10 rounded-md transition-all duration-200 border border-transparent hover:border-border/40"
                >
                    <span className="text-base font-semibold text-card-foreground/90">
                        {board.title}
                    </span>
                    <Settings2 className="w-4 h-4 text-muted-foreground" />
                </button>
            </div>
        </div>
    );
};
