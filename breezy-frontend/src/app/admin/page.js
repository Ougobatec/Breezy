"use client";
import { useAuth } from "@/context/AuthContext";
import AdminPanel from "@/components/AdminPanel";
import Layout from "@/components/Layout";

export default function AdminPage() {
    const { user } = useAuth();

    return (
        <Layout>
            <AdminPanel />
        </Layout>
    );
}
