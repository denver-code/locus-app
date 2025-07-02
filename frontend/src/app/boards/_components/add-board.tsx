import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddBoard() {
    return (
        <DialogTrigger>
            <div className="group w-64 h-40 rounded-lg border border-dashed bg-gradient-to-br from-card/50 to-background p-4 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-border/60 flex flex-col items-center justify-center gap-2">
                <div className="p-2 rounded-full bg-background border group-hover:border-border/60 transition-colors">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">Create new board</span>
            </div>
        </DialogTrigger>
    );
}
