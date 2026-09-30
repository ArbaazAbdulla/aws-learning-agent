import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Lightbulb, 
  Cpu, 
  Terminal, 
  Award, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ChevronRight,
  HelpCircle,
  Download,
  Flame,
  Info
} from 'lucide-react';
import { ChatMessage, TutorMode } from '../types';
import { MarkdownView } from './MarkdownView';

interface ChatTutorProps {
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onConceptLearned: () => void;
}

const PRESET_QUESTIONS = [
  { label: 'IAM Roles vs Policies', prompt: 'Explain the difference between an IAM User, Group, Role, and Policy using a real-world analogy.', mode: 'eli5' as TutorMode, service: 'IAM' },
  { label: 'When to use DynamoDB vs RDS?', prompt: 'When should I choose Amazon DynamoDB (NoSQL) over Amazon RDS (Relational)? Give pros, cons, and realistic examples.', mode: 'standard' as TutorMode, service: 'DynamoDB' },
  { label: 'S3 Security: Prevent Leaks', prompt: 'How do I properly secure an Amazon S3 bucket? Explain Bucket Policies, Block Public Access, and IAM policies.', mode: 'cli' as TutorMode, service: 'S3' },
  { label: 'VPC Subnets & NAT Gateways', prompt: 'How do public subnets, private subnets, Internet Gateways, and NAT Gateways work together? Show the traffic flow.', mode: 'architecture' as TutorMode, service: 'VPC' },
  { label: 'SQS vs SNS vs EventBridge', prompt: 'Explain the difference between Amazon SQS, Amazon SNS, and Amazon EventBridge. When do I use which for decoupling?', mode: 'exam' as TutorMode, service: 'SQS/SNS' },
  { label: 'Serverless REST API Blueprint', prompt: 'How do I build a production-ready serverless REST API using API Gateway, Lambda, and DynamoDB? Provide architecture and sample code.', mode: 'architecture' as TutorMode, service: 'Lambda' },
];

export const ChatTutor: React.FC<ChatTutorProps> = ({ 
  initialPrompt, 
  onClearInitialPrompt,
  onConceptLearned 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('aws_tutor_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        timestamp: Date.now(),
        content: `👋 **Welcome to the AWS Learning Agent!**

I am your interactive AI tutor for mastering **Amazon Web Services (AWS)** and preparing for cloud certifications like **AWS Cloud Practitioner (CLF-C02)** and **Solutions Architect Associate (SAA-C03)**.

### How I can help you:
- 💡 **ELI5 Mode**: Understand complex services (EC2, S3, IAM, VPC, Lambda) through everyday real-world analogies.
- 📐 **Architecture Flow**: Learn how components connect together in multi-tier or serverless architectures.
- 💻 **Hands-On CLI**: Get practical AWS CLI commands and SDK code snippets.
- 🎯 **Exam Traps**: Master tricky keywords, comparison traps, and scenario drills.

Ask me any question below, or click one of the popular high-yield topics to get started!`
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<TutorMode>('standard');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external prompt trigger (e.g. from Roadmap or Architecture)
  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  // Persist messages in localStorage
  useEffect(() => {
    localStorage.setItem('aws_tutor_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      mode: activeMode,
      serviceContext: selectedService !== 'All' ? selectedService : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          mode: activeMode,
          serviceContext: selectedService !== 'All' ? selectedService : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.reply || 'I could not generate a response. Please try asking again.',
        timestamp: Date.now(),
        mode: activeMode,
      };

      setMessages(prev => [...prev, modelMessage]);
      onConceptLearned();
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Unable to reach AI Tutor:** ${error.message || 'Network error'}.
        
Please check your connection or review our **AWS Service Catalog** and **Practice Exam** sections while the service reconnects.`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          timestamp: Date.now(),
          content: 'Conversation cleared! Ask me anything about Amazon Web Services (AWS), architecture design, or certification exam questions.'
        }
      ];
      setMessages(resetMsg);
      localStorage.removeItem('aws_tutor_chat_history');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[*#`_]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const exportConversation = () => {
    const textData = messages.map(m => `[${m.role === 'user' ? 'STUDENT' : 'AWS TUTOR'}] (${new Date(m.timestamp).toLocaleTimeString()})\n${m.content}\n\n`).join('---\n\n');
    const blob = new Blob([textData], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aws-learning-notes-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-6xl mx-auto px-4 py-2">
      {/* Top Controls: Mode Switcher & Service Filter */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-3 shadow-md flex flex-wrap items-center justify-between gap-2">
        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Mode:
          </span>
          {[
            { id: 'standard', label: 'Balanced Tutor', icon: Sparkles },
            { id: 'eli5', label: 'ELI5 Metaphor', icon: Lightbulb },
            { id: 'architecture', label: 'Architecture & Flow', icon: Cpu },
            { id: 'cli', label: 'CLI & Code', icon: Terminal },
            { id: 'exam', label: 'Exam Trap Drill', icon: Award },
          ].map((modeItem) => {
            const Icon = modeItem.icon;
            const isSelected = activeMode === modeItem.id;
            return (
              <button
                key={modeItem.id}
                onClick={() => setActiveMode(modeItem.id as TutorMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{modeItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Service Scope Selector & Actions */}
        <div className="flex items-center gap-2">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-amber-500"
          >
            <option value="All">All AWS Services</option>
            <option value="EC2">Amazon EC2 (Compute)</option>
            <option value="S3">Amazon S3 (Storage)</option>
            <option value="IAM">AWS IAM (Security)</option>
            <option value="Lambda">AWS Lambda (Serverless)</option>
            <option value="VPC">Amazon VPC (Networking)</option>
            <option value="RDS">Amazon RDS (Relational DB)</option>
            <option value="DynamoDB">Amazon DynamoDB (NoSQL)</option>
            <option value="CloudFront">Amazon CloudFront (CDN)</option>
            <option value="Route 53">Amazon Route 53 (DNS)</option>
            <option value="SQS/SNS">SQS & SNS (Messaging)</option>
            <option value="CloudWatch">Amazon CloudWatch (Monitoring)</option>
          </select>

          <button
            onClick={exportConversation}
            title="Export conversation notes"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/70"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={clearChat}
            title="Clear chat"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700/70"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset High-Yield Prompt Chips (when few messages or for inspiration) */}
      {messages.length <= 3 && (
        <div className="mb-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            Popular Student Questions (Click to Ask):
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveMode(q.mode);
                  handleSendMessage(q.prompt);
                }}
                className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/40 text-slate-300 text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all shadow-sm group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                <span>{q.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md mt-1">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-amber-600/90 text-white rounded-br-none border border-amber-500/40'
                    : 'bg-slate-900/95 border border-slate-800 rounded-bl-none text-slate-100'
                }`}
              >
                {/* Message Header info for model responses */}
                {!isUser && (
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-xs text-slate-400">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      AWS Learning Agent
                      {msg.mode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                          {msg.mode}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => speakText(msg.content)}
                      className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800"
                      title={isSpeaking ? 'Stop speaking' : 'Listen to explanation'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                          <span className="text-[10px] text-rose-400">Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Read Aloud</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isUser ? (
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : (
                  <MarkdownView content={msg.content} />
                )}

                <div className="text-[10px] text-slate-500 text-right mt-1.5">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-amber-400 text-xs font-bold mt-1">
                  You
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4 text-slate-950" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-slate-300 text-sm flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs text-slate-400 ml-1">
                AWS Agent is structuring your explanation...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 shadow-lg focus-within:border-amber-500/60 transition-colors">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeMode === 'eli5'
                ? "Ask for an easy analogy: e.g. 'How does Amazon VPC work?'"
                : activeMode === 'cli'
                ? "Ask for CLI/code: e.g. 'How do I upload an encrypted file to S3 with AWS CLI?'"
                : activeMode === 'exam'
                ? "Ask an exam trap: e.g. 'What is the difference between S3 Standard and S3 Glacier?'"
                : "Ask any AWS question (e.g., 'Explain EC2 vs Lambda vs Fargate', 'How does IAM work?')..."
            }
            rows={2}
            className="flex-1 bg-transparent text-slate-100 text-sm placeholder:text-slate-500 resize-none outline-none max-h-32 px-2 py-1"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-lg font-semibold flex items-center justify-center transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-orange-500/20 hover:scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="Send query"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 px-2 text-[11px] text-slate-400 border-t border-slate-800/80 mt-1">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-amber-500" />
            Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-300">Enter</kbd> to send, <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-300">Shift+Enter</kbd> for newline
          </span>
          <span className="text-slate-400 font-mono text-[10px]">Powered by Gemini 3.8 Flash</span>
        </div>
      </div>
    </div>
  );
};
