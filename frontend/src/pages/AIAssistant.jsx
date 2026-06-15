import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../App';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Cpu, 
  ArrowRight,
  BookOpen,
  FileText,
  AlertTriangle,
  FolderLock,
  CheckSquare,
  History,
  Info
} from 'lucide-react';

export default function AIAssistant() {
  const { token, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [citations, setCitations] = useState([]);
  const [mode, setMode] = useState('Professional'); // Beginner, Professional, Technical
  const [suggestions, setSuggestions] = useState(null);

  const messagesEndRef = useRef(null);

  const samplePrompts = [
    'Why was AeroSystems FBW supplier replaced?',
    'What was the reason for adopting Titanium on Su-30 mounts?',
    'How was the landing gear hydraulic leak issue solved?',
    'Show details on LCA Tejas Mk2 milestones'
  ];

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Hello ${user?.name}. I am **HAL's BRAIN AI Assistant**. 

I have indexed all active program files, structural issue tickets, decision records, and technical blueprints.

You can ask me questions about:
- Structural faults and applied resolutions.
- Reasoning behind component metal upgrades or design changes.
- Supplier audits and certifications delays.
- Milestones alignments on stealth programs.

*Note: You can switch response modes in the header to simplify language or output technical specifics.*`,
        citations: []
      }
    ]);
  }, [user]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput('');
    setLoading(true);

    // Add user message to log
    setMessages(prev => [...prev, { sender: 'user', text: query }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query, mode })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: data.answer, 
          citations: data.citations 
        }]);
        // Update citations list side bar with latest response citations
        if (data.citations?.length > 0) {
          setCitations(data.citations);
        }
        // Update suggestions
        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } else {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: 'Security Node Error: Failed to retrieve answer context from backend DB.', 
          citations: [] 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'Network Connection Refused: Ensure backend services are running.', 
        citations: [] 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[80vh] flex gap-6 max-w-7xl mx-auto select-none font-sans">
      
      {/* Left Column: Chat Area */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
        
        {/* Chat Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/10 border border-sky-400/20 rounded-lg">
              <Sparkles className="h-4 w-4 text-sky-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider leading-none">HAL's BRAIN Assistant</h3>
              <span className="text-[9px] text-slate-400 font-semibold tracking-wide mt-1 block">RAG Memory Search active</span>
            </div>
          </div>

          {/* AI Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/85">
            {['Beginner', 'Professional', 'Technical'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  mode === m 
                    ? 'bg-white text-sky-550 shadow-sm dark:bg-hal-darkCard dark:text-sky-400' 
                    : 'text-slate-400 hover:text-slate-655 dark:hover:text-slate-350'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread Scrollable */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={idx} 
                className={`flex gap-4 max-w-3xl ${isAI ? '' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Profile Avatar */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${
                  isAI 
                    ? 'bg-sky-500/10 border-sky-400/20 text-sky-400' 
                    : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
                }`}>
                  {isAI ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
                </div>

                {/* Text Balloon */}
                <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                  isAI 
                    ? 'bg-slate-50/50 border-slate-200/50 text-slate-750 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-300' 
                    : 'bg-sky-500 text-slate-950 border-sky-600 font-medium'
                }`}>
                  <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-4 max-w-3xl">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border bg-sky-500/10 border-sky-400/20 text-sky-400 shrink-0">
                <Cpu className="h-4.5 w-4.5 animate-spin" />
              </div>
              <div className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-2xl text-xs text-slate-400 dark:bg-slate-900/40 dark:border-slate-800 animate-pulse">
                Consulting flight computer records and technical archives in {mode} Mode...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts footer panel */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-850 bg-slate-50/20">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block mb-2.5">Suggested Prompts</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="p-2.5 text-left bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/60 text-slate-650 hover:text-slate-900 hover:border-slate-300 transition-all text-[11px] flex justify-between items-center dark:bg-slate-900/40 dark:border-slate-850 dark:text-slate-350 dark:hover:bg-slate-800"
                >
                  <span className="truncate pr-4">{p}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask a question in ${mode} Mode...`}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center justify-center transition-all disabled:opacity-50"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

      </div>

      {/* Right Column: Dynamic Insights Sidebar */}
      <div className="w-80 bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 hidden md:flex flex-col gap-5 overflow-y-auto">
        
        {/* References Section */}
        <div>
          <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-sky-400" />
              <span>References & Citations</span>
            </h4>
          </div>

          <div className="space-y-2 mt-3">
            {citations.length > 0 ? (
              citations.map((cite, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 dark:bg-slate-900/40 dark:border-slate-850"
                >
                  <div className="flex items-center gap-1.5">
                    {cite.type === 'Decision' ? (
                      <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : cite.type === 'Issue' ? (
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                    ) : (
                      <FolderLock className="h-4 w-4 text-sky-400 shrink-0" />
                    )}
                    <span className="text-[9px] uppercase font-bold text-slate-400">{cite.type} Record</span>
                  </div>
                  <h5 className="font-semibold text-slate-750 text-[11px] dark:text-slate-250 leading-tight line-clamp-2">{cite.title}</h5>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-slate-400 py-3 text-center font-light leading-normal">No database citations mapping active.</p>
            )}
          </div>
        </div>

        {/* Dynamic AI Insights Section */}
        {suggestions && (
          <div className="space-y-5 border-t border-slate-100 pt-4 dark:border-slate-850">
            
            {/* Recommended Actions */}
            {suggestions.recommendedActions?.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Recommended Checklist</span>
                </h5>
                <div className="space-y-1.5">
                  {suggestions.recommendedActions.map((action, idx) => (
                    <div key={idx} className="flex gap-2 text-[10.5px] items-start text-slate-650 dark:text-slate-350 leading-tight">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related decisions & Issues */}
            {(suggestions.decisions?.length > 0 || suggestions.issues?.length > 0 || suggestions.documents?.length > 0) && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-sky-450" />
                  <span>Related Entities</span>
                </h5>
                <div className="space-y-1.5 text-[10.5px]">
                  {suggestions.decisions?.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350 truncate">
                      <FileText className="h-3 w-3 text-emerald-450 shrink-0" />
                      <span className="truncate">{d.title}</span>
                    </div>
                  ))}
                  {suggestions.issues?.map((i, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350 truncate">
                      <AlertTriangle className="h-3 w-3 text-red-450 shrink-0" />
                      <span className="truncate">{i.title}</span>
                    </div>
                  ))}
                  {suggestions.documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-350 truncate">
                      <FolderLock className="h-3 w-3 text-sky-455 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Similar Cases */}
            {suggestions.previousCases?.length > 0 && (
              <div className="space-y-2 border-t border-slate-50 pt-3 dark:border-slate-850">
                <h5 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-purple-400" />
                  <span>Previous Cases</span>
                </h5>
                <div className="space-y-2 text-[10px]">
                  {suggestions.previousCases.map((c, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850">
                      <span className="text-[8px] font-mono text-purple-400 uppercase font-bold block">{c.caseId}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mt-0.5 leading-tight">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
