import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bot, Send, X, Sparkles } from 'lucide-react';

export default function CampusAIChat() {
  const { token } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am **CampusAI**. How can I help with your academic schedule or status?' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: userQ })
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Error connecting to CampusAI engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold text-sm">Ask CampusAI</span>
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col h-[500px]">
          <div className="p-4 bg-indigo-600 text-white rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-sm">CampusAI Assistant</h3>
                <p className="text-xs text-indigo-200">Grounded Operations Intelligence</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-75">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[85%] whitespace-pre-line ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400">CampusAI is thinking...</div>}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}