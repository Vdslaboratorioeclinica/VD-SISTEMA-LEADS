import React from 'react'
import { Outlet } from 'react-router-dom'

/**
 * Layout Component: wraps the entire viewport.
 * Owns the full-height flex column and provides the dark navy base background.
 */
export default function Layout() {
  return (
    <main className="flex flex-col min-h-screen w-full bg-[#0B1120] text-[#F1F5F9] font-sans antialiased">
      <Outlet />
    </main>
  )
}
