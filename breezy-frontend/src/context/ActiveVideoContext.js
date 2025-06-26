"use client";

import { createContext, useContext, useState } from "react";

const ActiveVideoContext = createContext();

export function ActiveVideoProvider({ children }) {
  const [activeVideoId, setActiveVideoId] = useState(null);
  return (
    <ActiveVideoContext.Provider value={{ activeVideoId, setActiveVideoId }}>
      {children}
    </ActiveVideoContext.Provider>
  );
}

export function useActiveVideo() {
  return useContext(ActiveVideoContext);
}
