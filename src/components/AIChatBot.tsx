'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface IMessage {
  sender: 'user' | 'bot';
  text: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<IMessage[]>([
    { sender: 'bot', text: 'Welcome CM. I am your NAGRIK Governance Intelligence Assistant. How can I brief you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const preFilledPrompts = [
    "Show top critical complaints.",
    "Which department is performing poorly?",
    "Complaints in South Delhi?",
    "Highest false closure district?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const updatedMessages: IMessage[] = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setInputValue('');
    setLoading(true);

    try {
      // Format history
      const history = updatedMessages.map(m => ({
        role: m.sender === 'bot' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      const data = await res.json();
      
      if (res.ok && data.response) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: data.error || 'Sorry, I encountered an issue processing that query.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Network error. Failed to connect to NAGRIK AI systems.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="glass-panel w-[380px] sm:w-[400px] h-[520px] flex flex-col overflow-hidden mb-4 rounded-2xl"
          >
            {/* Header */}
            <div className="bg-[#0B3B82]/95 backdrop-blur text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Bot className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide flex items-center gap-1.5">
                    NAGRIK-AI Assistant <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">CM Grievance Intelligence Briefing</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-transparent"
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-[#0B3B82] text-white rounded-tr-none font-bold'
                        : 'glass-card text-slate-800 dark:text-slate-100 border border-border-color rounded-tl-none font-medium whitespace-pre-line'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="glass-card border border-border-color rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    Analyzing Delhi grievances...
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions Overlay if no conversation has started */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-3 bg-transparent">
                <div className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1.5">Common Inquiries:</div>
                <div className="flex flex-col gap-1.5">
                  {preFilledPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs glass-card hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-350 border border-border-color p-2 rounded-lg transition-all shadow-sm font-bold cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="p-3 bg-transparent border-t border-border-color flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Ask NAGRIK AI..."
                disabled={loading}
                className="glass-input flex-1 text-xs rounded-xl px-3.5 py-2"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={loading}
                className="bg-[#0B3B82] hover:bg-[#072a61] disabled:bg-slate-300 text-white p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-[#0B3B82] to-[#1d4ed8] hover:from-[#072a61] hover:to-[#1e3a8a] text-white p-3.5 rounded-full shadow-2xl transition-all hover:scale-105 border-2 border-white dark:border-slate-800 flex items-center gap-1.5 font-bold text-xs cursor-pointer z-50 animate-bounce"
      >
        <MessageSquare className="w-5 h-5" />
        <span>NAGRIK-AI</span>
      </button>
    </div>
  );
}
