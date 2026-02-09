"use client";

import React from "react";
import AdminRegistration from "./admin.registration";

type UserSelectPageProps = {
    onSuccess?: () => void;
};

const UserSelectPage: React.FC<UserSelectPageProps> = ({ onSuccess }) => {
    const selectedUserType = "admin";

    return (
        <div className="flex flex-col">
            <main className="flex items-start justify-start p-4">
                <div className="w-full overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex flex-col justify-center px-1 py-1 w-full">
                            <div className="space-y-6">
                                <AdminRegistration userType={selectedUserType} onSuccess={onSuccess} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserSelectPage;
