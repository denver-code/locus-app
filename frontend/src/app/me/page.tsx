"use client";

import { AccountForm } from "./_components/account-form";

export default function MePage() {
    return (
        <div className="h-full w-full flex flex-col items-center p-8">
            <div className="max-w-[800px] w-full space-y-6">
                <div>
                    <h2 className="text-2xl font-bold">Account Settings</h2>
                    <p className="text-muted-foreground">Update your email and password</p>
                </div>
                <div className="border rounded-lg p-6">
                    <AccountForm />
                </div>
            </div>
        </div>
    );
}
