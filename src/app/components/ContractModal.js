import React from 'react'

export default function ContractModal({ isOpen, onClose, title, content }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-[#202020] rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-[#404040] sticky top-0 bg-[#202020] z-10 flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#404040] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="prose prose-invert max-w-none">
            {content}
          </div>
        </div>
        
        <div className="p-4 border-t border-[#404040] sticky bottom-0 bg-[#202020]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg font-medium transition-colors"
          >
            Okudum, Onaylıyorum
          </button>
        </div>
      </div>
    </div>
  )
} 