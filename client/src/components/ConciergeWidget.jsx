// client/src/components/ConciergeWidget.jsx
import React, { useState } from 'react';
import api from '../api';

export default function ConciergeWidget({ listingTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hello! I am your AI Concierge for "${listingTitle || 'MyBnB'}". Ask me anything about this property or location.` }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/concierge', { query });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'I encountered an issue connecting to the RAG knowledge base.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-[#FF385C] text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#e00b41] transition flex items-center gap-2 font-semibold">
          ✨ AI Concierge
        </button>
      ) : (
        <div className="w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-[#DDDDDD]">
          <div className="bg-[#FF385C] text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm">MyBnB AI Concierge</h3>
              <p className="text-xs text-rose-100 truncate max-w-[260px]">Grounded in: {listingTitle || 'All Listings'}</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg font-bold" aria-label="Close chat">&times;</button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F7F7] text-sm">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${m.sender === 'user' ? 'bg-[#FF385C] text-white' : 'bg-white text-[#222222] border border-[#DDDDDD] shadow-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-[#717171] text-xs italic">Retrieving database vector context...</div>}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-[#DDDDDD] bg-white flex gap-2">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Ask about rules, amenities..." 
              className="flex-1 border border-[#DDDDDD] rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            />
            <button type="submit" className="bg-[#FF385C] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#e00b41] transition">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}