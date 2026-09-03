/* 404 Page - Displays when a user attempts to access a non-existent route - translate to the language of the user */
import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1120] text-[#F1F5F9] px-4">
      <div className="text-center max-w-md rounded-2xl bg-[#111A2C] border border-[#243352] p-8 shadow-xl">
        <h1 className="text-5xl font-bold text-[#10B981] mb-2">404</h1>
        <h2 className="text-xl font-semibold mb-2">Página não encontrada</h2>
        <p className="text-sm text-[#94A3B8] mb-6">A rota solicitada não existe ou foi movida.</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Voltar ao início
        </a>
      </div>
    </div>
  )
}

export default NotFound
