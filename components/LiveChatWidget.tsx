'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Welcome to Quantovest Capital. How can our support team assist you today?',
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setInput('');

    // Simulated Mobile Admin Response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: 'Thank you for contacting Quantovest. Our mobile support desktop is active. An account executive will respond directly.',
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-[#12161A] border border-[#202722] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-[#1A1F24] p-4 border-b border-[#202722] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center font-semibold text-sm border border-[#22C55E]/30">
                  QC
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-[#12161A] rounded-full"></span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Quantovest Live Desk</h4>
                <p className="text-xs text-[#A8ACB3] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] inline-block"></span> Mobile Sync Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#A8ACB3] hover:text-white transition-colors p-1"
            >
              <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0A0D0C]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#22C55E] text-[#0A0D0C] font-medium rounded-br-none'
                      : 'bg-[#12161A] text-[#FFFFFF] border border-[#202722] rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#A8ACB3] mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-[#12161A] border-t border-[#202722] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-[#0A0D0C] border border-[#202722] rounded-full px-4 py-2 text-xs text-white placeholder-[#A8ACB3] focus:outline-none focus:border-[#22C55E]"
            />
            <button
              type="submit"
              className="bg-[#22C55E] text-[#0A0D0C] w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#16A34A] transition-colors"
            >
              <Icon icon="solar:plain-bold" className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#22C55E] text-[#0A0D0C] p-4 rounded-full shadow-lg hover:shadow-2xl hover:bg-[#16A34A] transition-all flex items-center gap-2 font-medium text-sm group border border-[#22C55E]/30"
        >
          <Icon icon="solar:chat-round-dots-bold" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline font-semibold pr-1">Support</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#0A0D0C]"></span>
        </button>
      )}
    </div>
  );
}
