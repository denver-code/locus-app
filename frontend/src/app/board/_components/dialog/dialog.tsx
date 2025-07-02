import { Dialog } from "@/components/ui/dialog";
import { DefaultDialog } from "./default";
import { AddCardForm } from "./card_add";
import { ViewDialog } from "./card_view";
import { ViewBoardDialog } from "./board_view";
import { Data, Metadata } from "../interfaces";
import { SetStateAction } from "react";
import { Dispatch } from "react";

const DialogContentSwitch = ({
    metadata,
    setOpen,
    setData,
}: {
    metadata: Metadata;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setData: Dispatch<SetStateAction<Data | null>>;
}) => {
    switch (metadata.type) {
        case "card_add":
            return <AddCardForm metadata={metadata} setOpen={setOpen} setData={setData} />;
        case "card_view":
            return <ViewDialog metadata={metadata} setOpen={setOpen} setData={setData} />;
        case "board_view":
            return <ViewBoardDialog metadata={metadata} setOpen={setOpen} setData={setData} />;
        default:
            return <DefaultDialog />;
    }
};

export const DialogRoot = ({
    open,
    setOpen,
    setData,
    metadata,
    children,
}: {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    setData: Dispatch<SetStateAction<Data | null>>;
    metadata: Metadata;
    children: React.ReactNode;
}) => {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {children}
            <DialogContentSwitch metadata={metadata} setOpen={setOpen} setData={setData} />
        </Dialog>
    );
};
