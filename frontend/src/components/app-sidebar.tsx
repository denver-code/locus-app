"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { KanbanIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { clearToken } from "@/auth/utils";
import { Configuration, UsersApi } from "@/api-client";
import { useCallback } from "react";
import { useAuthClient } from "@/hooks/use-auth-client";
import { Spinner } from "./ui/spinner";

export function AppSidebar() {
    const router = useRouter();

    const fetchUser = useCallback(async (config: Configuration) => {
        const userApi = new UsersApi(config);
        return await userApi.getMeApiUsersMeGet();
    }, []);

    const { data: user } = useAuthClient(fetchUser);

    const handleLogout = () => {
        clearToken();
        router.push("/login");
    };

    if (user === null) {
        return (
            <Sidebar>
                <div className="flex items-center justify-center h-full">
                    <Spinner />
                </div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="flex flex-col h-full bg-gradient-to-b from-background to-card/40 border-r">
                <SidebarHeader>
                    <div
                        className="w-10 h-10 m-3 flex items-center justify-center hover:bg-card-foreground/10 rounded-lg cursor-pointer transition-colors duration-200"
                        onClick={() => router.push("/boards")}
                    >
                        <KanbanIcon className="w-6 h-6 text-card-foreground/80" />
                    </div>
                </SidebarHeader>
                <SidebarContent className="flex-1" />
                <SidebarFooter className="border-t bg-gradient-to-b from-background/50 to-background">
                    <div className="p-3 flex items-center gap-3">
                        <div
                            className="flex-1 flex items-center gap-3 hover:bg-card-foreground/10 rounded-lg p-2 transition-all duration-200 group cursor-pointer"
                            onClick={() => router.push("/me")}
                        >
                            <div className="w-9 h-9 bg-gradient-to-br from-card to-background rounded-lg flex items-center justify-center border shadow-sm group-hover:border-border/60 transition-colors">
                                <UserIcon className="w-5 h-5 text-card-foreground/80" />
                            </div>
                            <span className="text-sm font-medium text-card-foreground/80">
                                {user?.email?.split("@")[0]}
                            </span>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-9 h-9 bg-destructive/90 hover:bg-destructive text-destructive-foreground shadow-sm"
                            onClick={handleLogout}
                        >
                            <LogOutIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </SidebarFooter>
            </div>
        </Sidebar>
    );
}
