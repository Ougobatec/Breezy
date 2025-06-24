"use client";
import React from "react";
import Publish from "@/components/Publish";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export default function PublishPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
      {/* Header simulé */}
      <Header title="Publier un post" showButtons={false} />
      {/* Publish form */}
      <Publish />
      {/* Bottom navigation */}
      <div className="mt-auto">
        <BottomNav />
      </div>
    </div>
  );
}