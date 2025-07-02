import { BoardOut } from "@/api-client/models/BoardOut";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export const Board = ({ board, className }: { board: BoardOut; className?: string }) => {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/board?board_id=${board.id}`)}
            className={`group w-64 h-40 rounded-lg border bg-gradient-to-br from-card to-background p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-border/60 ${className}`}
        >
            <div className="h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-card-foreground/90 group-hover:text-card-foreground">
                        {board.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-end justify-between">
                    <div className="flex -space-x-2">{/* Placeholder for user avatars */}</div>
                    <span className="text-xs text-muted-foreground">
                        Created {new Date(board.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
