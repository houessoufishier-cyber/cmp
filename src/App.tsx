/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  MessageSquare, 
  BookOpen, 
  Compass,
  Calendar, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Send, 
  Zap, 
  X,
  Menu,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Lightbulb,
  CheckCircle2,
  Coins,
  MapPin,
  Timer,
  ShoppingBag,
  Plus,
  Phone,
  Tag,
  Store,
  Search,
  Quote,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Sparkles,
  Heart,
  HeartOff,
  Bell,
  Trophy,
  Award,
  Medal,
  Star,
  User,
  Trash2,
  HelpCircle,
  Info,
  RefreshCw,
  CreditCard,
  GripVertical,
  Camera,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Download,
  Printer,
  Share2,
  PlayCircle,
  Youtube,
  Globe,
  Play
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateResponseStream, generateProResponseStream, generateMorningPlug, verifyMarketImage, verifyStudentId, generateConcoursStrategy } from './services/geminiService';
import { cn } from './lib/utils';
import { Toaster, toast } from 'sonner';
import { translations, Language } from './translations';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  Timestamp,
  User as FirebaseUser,
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  serverTimestamp,
  limit,
  getDocFromServer,
  storage,
  ref,
  uploadBytes,
  getDownloadURL
} from './firebase';
import axios from 'axios';
import { jsPDF } from "jspdf";
import { GCE_VERIFIED_ARCHIVE } from './data/gceData';


interface University {
  id: string;
  name: string;
  shortName: string;
  location: string;
  description: string;
  faculties: string[];
  requirements: string[];
  admissionLink: string;
  tuition: string;
  image: string;
  color: string;
}

interface AdmissionDeadline {
  id: string;
  uniName: string;
  deadline: string;
  description: string;
  type: 'Cameroon' | 'International';
  link: string;
}

interface HouseListing {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  isPaid: boolean;
  createdAt: string;
  status: 'active' | 'sold' | 'hidden';
}

interface Conversation {
  id: string;
  listingId: string;
  participants: string[];
  lastMessage: string;
  lastTimestamp: string;
  lastSenderId?: string;
  listingTitle: string;
  studentId: string;
  landlordId: string;
  studentName: string;
  landlordName: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: any;
}

interface MasteryBadge {
  id: string;
  subject: string;
  level: 'O' | 'A';
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  dateEarned: Date;
}

const HomeScreen = React.memo(({ user, setActiveTab, setPlannerView, hasPaid, t, language }: { user: FirebaseUser | null, setActiveTab: (tab: any) => void, setPlannerView: (view: any) => void, hasPaid: boolean, t: any, language: Language }) => {
  const [quote, setQuote] = useState("Education is the most powerful weapon you can use to change the world. — Nelson Mandela");
  const [newsIndex, setNewsIndex] = useState(0);
  
  const news = [
    { title: t.home.news1, date: "Aug 31, 2026", color: "bg-neon-green" },
    { title: t.home.news2, date: language === 'en' ? "Coming Soon" : "Bientôt disponible", color: "bg-neon-pink" },
    { title: t.home.news3, date: language === 'en' ? "Today" : "Aujourd'hui", color: "bg-neon-blue text-white" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % news.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden brutal-border bg-white p-6 md:p-10">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, #007A5E, #CE1126, #FCD116)'
        }} />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          {/* Animated Flag */}
          <motion.div 
            animate={{ 
              rotate: [0, 1, -1, 0],
              y: [0, -2, 2, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-12 brutal-border-sm flex overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="flex-1 bg-[#007A5E]" />
            <div className="flex-1 bg-[#CE1126] flex items-center justify-center">
              <Star size={12} fill="#FCD116" className="text-[#FCD116]" />
            </div>
            <div className="flex-1 bg-[#FCD116]" />
          </motion.div>

          {/* Typing Animation */}
          <div className="h-10 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.h2 
                key={newsIndex % 2}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-lg md:text-xl font-black uppercase italic tracking-tighter"
              >
                {t.home.welcomeStudent}
              </motion.h2>
            </AnimatePresence>
          </div>

          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-brutal-black">
            {t.home.heroTitle} <span className="text-neon-blue underline decoration-brutal-black decoration-4">{user?.displayName?.split(' ')[0] || t.home.heroSubtitle}</span>! 👊
          </h1>
        </div>
      </section>

      {/* User Guide Banner */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-border bg-neon-pink p-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group cursor-pointer"
        onClick={() => setActiveTab('guide')}
      >
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="bg-white p-4 brutal-border rotate-[-6deg] group-hover:rotate-0 transition-transform">
            <Info size={32} className="text-neon-pink" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-none">{t.home.guideTitle}</h3>
            <p className="text-xs font-black uppercase tracking-widest text-white/80 mt-1">{t.home.guideSubtitle}</p>
          </div>
        </div>
        <button className="brutal-btn bg-white text-neon-pink px-8 py-3 font-black uppercase italic tracking-tighter group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-none transition-all relative z-10">
          {t.home.openGuide}
        </button>
      </motion.section>

      {/* Profile Snapshot */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="brutal-border bg-white p-6 flex items-center gap-6 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-neon-blue/10 rounded-full blur-2xl" />
          <div className="w-16 h-16 brutal-border bg-neon-blue flex items-center justify-center text-2xl font-black text-white shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
            ) : (
              user?.displayName?.charAt(0) || 'C'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black uppercase italic truncate">{user?.displayName || 'Campus User'}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 truncate">University of Buea 🇨🇲</span>
            </div>
            <div className={cn(
              "mt-2 inline-block px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm",
              hasPaid ? "bg-neon-green text-brutal-black" : "bg-gray-200 text-gray-500"
            )}>
              {hasPaid ? t.home.premiumMember : t.home.freeMember}
            </div>
          </div>
        </motion.div>

        <div className="brutal-border bg-white p-6 border-l-[12px] border-l-neon-green flex flex-col justify-center italic font-medium text-sm md:text-base">
          <Quote size={20} className="text-neon-green mb-2 opacity-20" />
          <p>"{quote}"</p>
        </div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-40">{t.home.quickAccess}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: 'universities', label: t.nav.universities, icon: <GraduationCap />, color: 'bg-neon-blue text-white' },
            { id: 'market', label: t.nav.market, icon: <ShoppingBag />, color: 'bg-[#CE1126] text-white' },
            { id: 'saved', label: t.nav.saved, icon: <Heart />, color: 'bg-neon-pink text-white' },
            { id: 'faq', label: "Need a Plug?", icon: <Zap />, color: 'bg-purple-600 text-white' },
            { id: 'gce', label: t.nav.gce, icon: <BookOpen />, color: 'bg-[#007A5E] text-white' },
            { id: 'planner', view: 'timetable', label: t.home.examPlanner, icon: <Calendar />, color: 'bg-teal-500 text-white' },
            { id: 'compass', label: t.nav.concours, icon: <Compass />, color: 'bg-[#FCD116] text-brutal-black' },
            { id: 'housing', label: t.nav.housing, icon: <Home />, color: 'bg-[#1A3C6E] text-white' }
          ].map((module) => (
            <motion.button
              key={module.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(module.id);
                if (module.view) setPlannerView(module.view);
              }}
              className={cn(
                "brutal-border p-4 flex flex-col items-center justify-center gap-3 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                module.color
              )}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                {React.cloneElement(module.icon as React.ReactElement<any>, { size: 20 })}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-tight">{module.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Mastery Hubs */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Discovery & Mastery Hubs</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('homework')}
            className="brutal-border bg-white p-6 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3">
              <Zap size={24} className="text-brand-green group-hover:scale-125 transition-transform" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xl font-black uppercase italic tracking-tighter text-brand-green">{t.hubs.homework.title}</h5>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight italic">{t.hubs.homework.subtitle}</p>
            </div>
            <div className="bg-gray-50 brutal-border-sm p-3 text-[9px] font-black uppercase tracking-widest text-center group-hover:bg-brand-green group-hover:text-white transition-colors">
              Solve Now
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('cbt')}
            className="brutal-border bg-white p-6 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3">
              <Timer size={24} className="text-brand-gold group-hover:scale-125 transition-transform" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xl font-black uppercase italic tracking-tighter text-brand-gold">{t.hubs.cbt.title}</h5>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight italic">{t.hubs.cbt.subtitle}</p>
            </div>
            <div className="bg-gray-50 brutal-border-sm p-3 text-[9px] font-black uppercase tracking-widest text-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
              Start Quiz
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('lessons')}
            className="brutal-border bg-white p-6 flex flex-col justify-between space-y-4 cursor-pointer relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3">
              <PlayCircle size={24} className="text-brand-navy group-hover:scale-125 transition-transform" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xl font-black uppercase italic tracking-tighter text-brand-navy">{t.hubs.lessons.title}</h5>
              <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight italic">{t.hubs.lessons.subtitle}</p>
            </div>
            <div className="bg-gray-50 brutal-border-sm p-3 text-[9px] font-black uppercase tracking-widest text-center group-hover:bg-brand-navy group-hover:text-white transition-colors">
              Watch Lessons
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Feed */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t.home.newsTitle}</h4>
        <div className="relative h-40 brutal-border overflow-hidden bg-brutal-black">
          <AnimatePresence mode="wait">
            <motion.div
              key={newsIndex}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className={cn("absolute inset-0 p-6 flex flex-col justify-center", news[newsIndex].color)}
            >
              <h5 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-2">{news[newsIndex].title}</h5>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{news[newsIndex].date}</p>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {news.map((_, i) => (
              <div key={i} className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                i === newsIndex ? "bg-white w-4" : "bg-white/30"
              )} />
            ))}
          </div>
        </div>
      </section>

      {/* Hot in Campus */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t.home.hotTitle}</h4>
          <button onClick={() => setActiveTab('market')} className="text-[10px] font-black uppercase underline">{t.home.viewAll}</button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ x: 5 }}
              onClick={() => setActiveTab('market')}
              className="brutal-border-sm bg-white p-3 flex items-center gap-4 cursor-pointer"
            >
              <div className="w-12 h-12 bg-gray-100 brutal-border-sm overflow-hidden shrink-0">
                <img src={`https://picsum.photos/seed/item${i}/100/100`} alt="Item" className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-black uppercase text-xs truncate">Student Laptop - Core i7</h5>
                <p className="text-[8px] font-bold text-gray-400">Molyko, Buea • 150,000 XAF</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Greeting */}
      <footer className="mt-12 bg-[#1A3C6E] text-white p-6 brutal-border flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-neon-yellow" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-white p-2 brutal-border-sm rotate-3">
            <span className="text-xl">🇨🇲</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
            {t.home.madeWith}
          </p>
        </div>
        <div className="text-xs font-black italic tracking-tighter text-neon-yellow relative z-10">
          CAMPUSPLUG © 2026
        </div>
      </footer>
    </div>
  );
});

const AIStudyAssistantScreen = React.memo(({ user, hasPaid, t, language }: { user: FirebaseUser | null, hasPaid: boolean, t: any, language: Language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sessionUsage, setSessionUsage] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSessionUsage(prev => prev + 1);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const systemPrompt = `You are CampBot — the AI study assistant for CampusPlug, built for Cameroonian university and GCE students. You:
- Answer academic questions in ${language === 'en' ? 'English' : 'French'} (match the student's language automatically)
- Know the GCE O/L and A/L Cameroon syllabus
- Know the Licence/Master programs at University of Yaoundé
- Give step-by-step explanations like a patient tutor
- Use simple language appropriate for ages 16–28
- Encourage students with positive affirmations
- Never give answers without explaining the method
- For essay questions: give structure + example paragraphs
- For math: show full working step by step
Keep responses concise but complete. Be warm and motivating — like a brilliant older sibling who loves to teach.`;

      let fullResponse = "";
      const response = await generateResponseStream(text, history, undefined, undefined, undefined, systemPrompt);
      for await (const chunk of response) {
        const text = chunk.text;
        fullResponse += text;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [...prev.slice(0, -1), { ...last, content: fullResponse }];
          } else {
            return [...prev, { id: 'bot-' + Date.now(), role: 'assistant', content: fullResponse, timestamp: new Date() }];
          }
        });
      }
    } catch (error) {
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts = [
    t.hubs.assistant.starter1,
    t.hubs.assistant.starter2,
    t.hubs.assistant.starter3,
    t.hubs.assistant.starter4
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto brutal-border bg-white overflow-hidden">
      <div className="bg-brand-navy p-4 flex items-center justify-between border-b-4 border-brutal-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold rounded-full brutal-border-sm flex items-center justify-center rotate-3 overflow-hidden">
            <Zap size={20} className="text-brand-navy" fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase italic tracking-tighter text-white leading-none">CampBot AI</h3>
            <p className="text-[10px] font-black uppercase text-brand-gold mt-1 tracking-widest">{t.hubs.assistant.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "px-2 py-1 text-[8px] font-black uppercase brutal-border-sm",
            hasPaid ? "bg-brand-green text-white" : "bg-brand-gold text-brand-navy"
          )}>
            {hasPaid ? "PREMIUM" : `${10 - sessionUsage} FREE REMAINING`}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center space-y-6 text-center px-6">
            <div className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center brutal-border-sm rotate-6">
              <MessageSquare size={48} className="text-brand-navy" />
            </div>
            <div>
              <h4 className="text-xl font-black uppercase italic tracking-tighter">{t.home.welcome} {user?.displayName?.split(' ')[0] || "Scholar"}!</h4>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase">How can CampBot plug you today?</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              {starterPrompts.map((prompt, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="brutal-border-sm bg-white p-3 text-[10px] font-black uppercase italic hover:bg-brand-gold transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <motion.div 
            key={m.id}
            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-4 brutal-border-sm text-sm font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
              m.role === 'user' ? "bg-brand-navy text-white" : "bg-white text-brutal-black"
            )}>
              <div className="markdown-body text-inherit">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase mt-1 opacity-40">
              {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-brand-navy">
            <RefreshCw size={14} className="animate-spin" />
            <span className="text-[10px] font-black uppercase italic tracking-widest">CampBot is thinking...</span>
          </div>
        )}
      </div>

      <PremiumGate hasPaid={hasPaid} freeLimit={10} usageCount={sessionUsage} onUpgrade={() => {}} t={t}>
        <div className="p-4 bg-white border-t-4 border-brutal-black">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="flex-1 brutal-border-sm p-3 text-sm font-black outline-none focus:ring-4 focus:ring-brand-gold"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="brutal-btn bg-brand-gold text-brand-navy px-6"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </PremiumGate>
    </div>
  );
});

const HomeworkSolverScreen = React.memo(({ hasPaid, t, language }: { hasPaid: boolean, t: any, language: Language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setImageMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const solveHomework = async () => {
    if (!question.trim() && !image) return;
    setIsLoading(true);
    setAnswer(null);

    try {
      const systemPrompt = `You are a helpful academic tutor for Cameroonian university and GCE students. Answer clearly, step by step, in ${language === 'en' ? 'English' : 'French'}. Always explain the WHY behind the answer, not just the result. For math: show full working step by step. Be warm and motivating.`;
      let fullText = question || "Please solve the problem in this image.";
      
      const imageData = image ? {
        data: image.split(',')[1],
        mimeType: imageMime || 'image/jpeg'
      } : undefined;

      const response = await generateResponseStream(fullText, [], undefined, imageData, undefined, systemPrompt);
      for await (const chunk of response) {
        const text = chunk.text;
        setAnswer(prev => (prev || '') + text);
      }
      
      setUsageCount(prev => prev + 1);
    } catch (error) {
      console.error("Gemini Error:", error);
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="brutal-border bg-white p-6 md:p-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="bg-brand-navy p-3 brutal-border-sm rotate-[-3deg]">
            <HelpCircle size={32} className="text-white" />
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{t.hubs.homework.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">{t.hubs.homework.subtitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleImageUpload}
          />
          
          <div className="relative">
            <textarea 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full h-40 brutal-border p-4 text-sm font-black outline-none focus:ring-4 focus:ring-brand-green bg-gray-50 italic"
              placeholder={t.hubs.homework.placeholder}
            />
            {image && (
              <div className="absolute top-2 right-2 group">
                <img src={image} alt="Preview" className="w-20 h-20 object-cover brutal-border-sm" />
                <button 
                  onClick={() => { setImage(null); setImageMime(null); }}
                  className="absolute -top-2 -right-2 bg-neon-pink text-white p-1 rounded-full brutal-border-sm"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 brutal-btn bg-white text-brand-navy py-4 text-xs"
            >
              <Camera size={18} />
              {image ? "Change Photo" : t.hubs.homework.snapPhoto}
            </button>
            <button 
              onClick={solveHomework}
              disabled={isLoading || (!question.trim() && !image)}
              className="flex-[2] brutal-btn bg-brand-green text-white py-4 text-xs flex items-center justify-center gap-2 shadow-[8px_8px_0px_0px_#1A3C6E]"
            >
              <Zap size={18} className={cn(isLoading && "animate-spin")} />
              {t.hubs.homework.askGemini}
            </button>
          </div>
        </div>
      </div>

      <PremiumGate hasPaid={hasPaid} freeLimit={3} usageCount={usageCount} onUpgrade={() => {}} t={t}>
        {answer && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="brutal-border bg-white p-6 md:p-10 space-y-6 border-l-[12px] border-l-brand-green"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-black uppercase italic tracking-tighter text-brand-green">AI Solution & Step-by-Step</h4>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(answer);
                  toast.success("Solution copied!");
                }}
                className="p-2 brutal-border-sm bg-gray-100"
              >
                <Download size={16} />
              </button>
            </div>
            <div className="markdown-body p-4 bg-gray-50 brutal-border-sm italic">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
            <div className="flex justify-center pt-4">
              <button className="brutal-btn bg-brand-navy text-white px-8 py-4">
                <User size={18} />
                {t.hubs.homework.askHuman}
              </button>
            </div>
          </motion.div>
        )}
      </PremiumGate>
    </div>
  );
});

const CBTEngine = React.memo(({ hasPaid, t, language }: { hasPaid: boolean, t: any, language: Language }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mock data for demo, in real app would fetch from Firestore /pastQuestions
    const mockQuestions = [
      {
        id: '1',
        question: language === 'en' ? 'What is the powerhouse of the cell?' : 'Quelle est la centrale énergétique de la cellule ?',
        options: language === 'en' ? ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi'] : ['Noyau', 'Mitochondrie', 'Ribosome', 'Appareil de Golgi'],
        correctAnswer: 1,
        explanation: language === 'en' ? 'Mitochondria generate most of the chemical energy needed to power the cell.' : 'Les mitochondries génèrent la majeure partie de l\'énergie chimique nécessaire au fonctionnement de la cellule.'
      },
      {
        id: '2',
        question: language === 'en' ? 'Who is the president of Cameroon?' : 'Qui est le président du Cameroun ?',
        options: ['Paul Biya', 'Maurice Kamto', 'Ni John Fru Ndi', 'Joshua Osih'],
        correctAnswer: 0,
        explanation: 'Paul Biya has been the President of Cameroon since 6 November 1982.'
      }
    ];
    setQuestions(mockQuestions);
  }, [language]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished]);

  const handleFinish = () => {
    let finalScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) finalScore++;
    });
    setScore(finalScore);
    setIsFinished(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFinished) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="max-w-2xl mx-auto brutal-border bg-white p-8 space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full brutal-border-sm flex items-center justify-center bg-brand-gold rotate-6">
            <Trophy size={40} className="text-brand-navy" />
          </div>
        </div>
        <div>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t.hubs.cbt.score}: {score}/{questions.length}</h3>
          <p className="text-lg font-bold text-gray-500 uppercase mt-2">{percentage}% Mastery</p>
        </div>

        <div className="space-y-4 text-left">
          {questions.map((q, idx) => (
            <div key={idx} className={cn(
              "p-4 brutal-border-sm",
              answers[idx] === q.correctAnswer ? "bg-brand-green/10" : "bg-red-50"
            )}>
              <p className="font-black text-sm uppercase leading-tight">{q.question}</p>
              <p className="text-xs mt-2">
                <span className="font-black uppercase">Your choice:</span> {q.options[answers[idx] ?? -1] || 'None'}
              </p>
              {answers[idx] !== q.correctAnswer && (
                <p className="text-xs text-red-600 mt-1">
                  <span className="font-black uppercase">Correct:</span> {q.options[q.correctAnswer]}
                </p>
              )}
              <div className="mt-3 p-3 bg-white/50 text-[10px] italic border-t border-dashed border-brutal-black/10">
                {q.explanation}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={() => { setIsFinished(false); setCurrentIdx(0); setAnswers({}); setTimeLeft(30 * 60); }} className="flex-1 brutal-btn bg-white">
            <RefreshCw size={18} />
            {t.hubs.cbt.tryAgain}
          </button>
          <button className="flex-1 brutal-btn bg-brand-navy text-white">
            <Share2 size={18} />
            {t.hubs.cbt.shareScore}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-brand-gold p-3 brutal-border-sm">
            <Timer size={32} className="text-brand-navy" />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{t.hubs.cbt.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">{t.hubs.cbt.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[8px] font-black uppercase opacity-40">{t.hubs.cbt.timer}</p>
            <p className={cn("text-2xl font-black font-mono", timeLeft < 300 ? "text-red-500 animate-pulse" : "text-brand-navy")}>{formatTime(timeLeft)}</p>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase opacity-40">Progress</p>
            <p className="text-2xl font-black">{currentIdx + 1}/{questions.length}</p>
          </div>
        </div>
      </div>

      <div className="brutal-border bg-white overflow-hidden">
        <div className="bg-brand-navy text-white p-6 md:p-10">
          <h4 className="text-xl md:text-2xl font-black uppercase italic italic tracking-tighter leading-relaxed">
            {questions[currentIdx]?.question}
          </h4>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentIdx]?.options.map((option: string, i: number) => (
            <button 
              key={i}
              onClick={() => setAnswers({...answers, [currentIdx]: i})}
              className={cn(
                "p-4 brutal-border-sm text-left text-xs font-black uppercase tracking-widest transition-all",
                answers[currentIdx] === i ? "bg-brand-gold translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-6 h-6 brutal-border-sm flex items-center justify-center text-[10px]",
                  answers[currentIdx] === i ? "bg-brand-navy text-white" : "bg-gray-100"
                )}>
                  {String.fromCharCode(65 + i)}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t-2 border-brutal-black flex justify-between">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="brutal-btn bg-white disabled:opacity-50"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          {currentIdx === questions.length - 1 ? (
            <button onClick={handleFinish} className="brutal-btn bg-brand-green text-white">
              <CheckCircle size={18} />
              {t.common.finish}
            </button>
          ) : (
            <button onClick={() => setCurrentIdx(prev => prev + 1)} className="brutal-btn bg-brand-navy text-white">
              Next
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const VideoLessonsScreen = React.memo(({ hasPaid, t, language }: { hasPaid: boolean, t: any, language: Language }) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Literature', 'History'];

  useEffect(() => {
    // Mock library
    setLessons([
      { id: '1', title: 'Calculus: Differentiation Rules', subject: 'Mathematics', duration: '12:45', youtubeId: 'WvUv_S04D48', isFree: true, thumbnail: 'https://picsum.photos/seed/math1/400/225' },
      { id: '2', title: 'Newton\'s Laws of Motion', subject: 'Physics', duration: '15:20', youtubeId: 'kKKM8Y-u7ds', isFree: false, thumbnail: 'https://picsum.photos/seed/phys1/400/225' },
      { id: '3', title: 'Organic Chemistry: Alkanes', subject: 'Chemistry', duration: '10:10', youtubeId: '2z3_9zR3IeM', isFree: true, thumbnail: 'https://picsum.photos/seed/chem1/400/225' },
      { id: '4', title: 'Cell Structure & Function', subject: 'Biology', duration: '18:30', youtubeId: '8IlzKri08t0', isFree: false, thumbnail: 'https://picsum.photos/seed/bio1/400/225' },
    ]);
  }, []);

  const filteredLessons = filter === 'All' ? lessons : lessons.filter(l => l.subject === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="brutal-border bg-brand-navy p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 rotate-12 bg-white w-64 h-64 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="sticker bg-brand-gold text-brand-navy border-none shadow-none">ULesson Inspired 🔌</div>
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{t.hubs.lessons.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">{t.hubs.lessons.subtitle}</p>
          </div>
          <div className="flex gap-4">
            <div className="brutal-border-sm bg-white/10 p-4 text-center">
              <p className="text-2xl font-black">250+</p>
              <p className="text-[8px] font-black uppercase opacity-60">Videos</p>
            </div>
            <div className="brutal-border-sm bg-brand-gold p-4 text-center text-brand-navy">
              <p className="text-2xl font-black">4.9</p>
              <p className="text-[8px] font-black uppercase opacity-60">Rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-4 custom-scrollbar">
        {subjects.map(s => (
          <button 
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-6 py-3 brutal-border-sm text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
              filter === s ? "bg-brand-green text-white" : "bg-white hover:bg-gray-50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLessons.map((lesson) => (
          <motion.div 
            key={lesson.id}
            whileHover={{ y: -6 }}
            className="group brutal-border bg-white overflow-hidden flex flex-col cursor-pointer"
          >
            <div className="aspect-video relative overflow-hidden bg-gray-100">
              <img src={lesson.thumbnail} alt={lesson.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" loading="lazy" />
              {!lesson.isFree && !hasPaid && (
                <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[2px] flex items-center justify-center p-6 text-center">
                  <div className="brutal-border-sm bg-white p-2 text-[10px] font-black uppercase rotate-[-3deg]">
                    <Zap size={14} className="inline mr-1 text-brand-gold fill-current" />
                    Premium Only
                  </div>
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-brutal-black text-white px-2 py-1 text-[8px] font-black brutal-border-sm">
                {lesson.duration}
              </div>
              <div className="absolute top-2 left-2 px-2 py-1 bg-brand-gold text-brand-navy text-[8px] font-black uppercase brutal-border-sm">
                {lesson.subject}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <h5 className="text-lg font-black uppercase italic leading-tight group-hover:text-brand-green transition-colors">{lesson.title}</h5>
              
              <div className="flex gap-2">
                <button className="flex-1 brutal-btn bg-brand-navy text-white py-2 text-[10px]">
                  <ArrowRight size={14} />
                  Watch
                </button>
                <button className="brutal-btn bg-white p-2">
                  <Download size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

const FlashcardScreen = React.memo(({ hasPaid, t, language }: { hasPaid: boolean, t: any, language: Language }) => {
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<any | null>(null);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);

  useEffect(() => {
    setDecks([
      { 
        id: '1', 
        name: 'GCE Biology: Cells', 
        cardCount: 15, 
        cards: [
          { front: 'What is the function of Mitochondria?', back: 'ATP production (energy)' },
          { front: 'Definition of Mitosis', back: 'Cell division resulting in two identical daughter cells' },
          { front: 'Who discovered the cell?', back: 'Robert Hooke (1665)' }
        ] 
      },
      { 
        id: '2', 
        name: 'Law 101: Legal Systems', 
        cardCount: 12, 
        cards: [
          { front: 'Common Law', back: 'Legal system based on judicial decisions (precedents)' },
          { front: 'Civil Law', back: 'Legal system based on written codes' }
        ] 
      },
    ]);
  }, []);

  if (isStudyMode && selectedDeck) {
    const card = selectedDeck.cards[currentCardIdx];
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <button onClick={() => setIsStudyMode(false)} className="text-xs font-black uppercase underline">
            <ArrowLeft size={14} className="inline mr-1" />
            Back to Decks
          </button>
          <div className="text-xs font-black uppercase opacity-40">
            Card {currentCardIdx + 1} of {selectedDeck.cards.length}
          </div>
        </div>

        <motion.div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative h-96 w-full cursor-pointer perspective-1000"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <div className="absolute inset-0 brutal-border bg-white p-12 flex flex-col items-center justify-center text-center backface-hidden">
            <div className="sticker bg-brand-gold text-brand-navy mb-6">QUESTION</div>
            <h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight italic">
              {card.front}
            </h4>
            <p className="mt-8 text-[8px] font-black uppercase opacity-40 animate-pulse">Click to Flip</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 brutal-border bg-brand-navy p-12 flex flex-col items-center justify-center text-center backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
            <div className="sticker bg-brand-green text-white mb-6">ANSWER</div>
            <h4 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight text-white italic">
              {card.back}
            </h4>
            <p className="mt-8 text-[8px] font-black uppercase text-brand-gold">Click to Flip Back</p>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <button 
            disabled={currentCardIdx === 0}
            onClick={() => { setCurrentCardIdx(prev => prev - 1); setIsFlipped(false); }}
            className="flex-1 brutal-btn bg-white"
          >
            Previous
          </button>
          <button 
            onClick={() => {
              if (currentCardIdx === selectedDeck.cards.length - 1) {
                setIsStudyMode(false);
                toast.success("Deck Completed!");
              } else {
                setCurrentCardIdx(prev => prev + 1);
                setIsFlipped(false);
              }
            }}
            className="flex-1 brutal-btn bg-brand-navy text-white text-xs"
          >
            {currentCardIdx === selectedDeck.cards.length - 1 ? 'Finish' : 'Next Card'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t.hubs.flashcards.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">{t.hubs.flashcards.subtitle}</p>
        </div>
        <button className="brutal-btn bg-brand-gold text-brand-navy px-8 py-4">
          <Plus size={18} />
          Create Deck
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="brutal-border bg-gray-50 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-4 hover:bg-white transition-colors cursor-pointer group">
          <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center brutal-border-sm rotate-6 group-hover:rotate-12 transition-transform">
            <Sparkles size={24} className="text-brand-gold" />
          </div>
          <h4 className="text-lg font-black uppercase italic tracking-tighter">AI Deck Generator</h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Paste your notes and Gemini will build the cards</p>
          <button className="brutal-btn bg-brand-navy text-white px-6 py-2 text-[10px]">Generate Now</button>
        </div>

        {decks.map(deck => (
          <motion.div 
            key={deck.id}
            whileHover={{ rotate: 1 }}
            className="brutal-border bg-white p-8 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-2">
              <div className="sticker bg-neon-purple text-white">{deck.cardCount} Cards</div>
              <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{deck.name}</h4>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full brutal-border-sm bg-gray-100 flex items-center justify-center text-[8px] font-black">
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-[8px] font-black uppercase opacity-40">150 students studying</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setSelectedDeck(deck); setCurrentCardIdx(0); setIsStudyMode(true); }}
                className="flex-1 brutal-btn bg-brand-navy text-white py-3 text-[10px]"
              >
                <Zap size={14} fill="currentColor" />
                Study
              </button>
              <button className="brutal-btn bg-white p-3">
                <Share2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

const YouTubeDiscoveryScreen = React.memo(({ t }: { t: any }) => {
  const [videos, setVideos] = useState<any[]>([]);
  
  useEffect(() => {
    setVideos([
      { id: '1', title: 'Organic Chemistry Roadmap', channel: 'The Organic Chemistry Tutor', views: '2.5M', thumbnail: 'https://picsum.photos/seed/yt1/600/340', url: '#' },
      { id: '2', title: 'Physics: Forces and Motion', channel: 'CrashCourse', views: '1.2M', thumbnail: 'https://picsum.photos/seed/yt2/600/340', url: '#' },
      { id: '3', title: 'Biology: Genetics 101', channel: 'Amoeba Sisters', views: '800K', thumbnail: 'https://picsum.photos/seed/yt3/600/340', url: '#' },
      { id: '4', title: 'Economics: Supply and Demand', channel: 'Khan Academy', views: '3M', thumbnail: 'https://picsum.photos/seed/yt4/600/340', url: '#' },
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-red-600 p-3 brutal-border-sm rotate-[-2deg]">
          <Youtube size={32} className="text-white" />
        </div>
        <div>
          <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{t.hubs.youtube.title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">{t.hubs.youtube.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {videos.map(v => (
          <motion.div key={v.id} whileHover={{ y: -5 }} className="brutal-border bg-white overflow-hidden group">
            <div className="aspect-video relative">
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
              <div className="absolute inset-0 bg-transparent group-hover:bg-red-600/10 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center brutal-border-sm opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                  <Play size={32} fill="white" className="text-white ml-1" />
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h4 className="text-xl font-black uppercase italic tracking-tighter leading-tight">{v.title}</h4>
              <div className="flex justify-between items-center text-[10px] font-black uppercase opacity-60">
                <span>{v.channel}</span>
                <span>{v.views} views</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

const CourseDiscoveryScreen = React.memo(({ t }: { t: any }) => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    setCourses([
      { id: '1', title: 'Data Science Specialization', provider: 'Coursera (Johns Hopkins)', price: 'Free / Cert Paid', reviews: '4.8', link: '#' },
      { id: '2', title: 'Introduction to Computer Science (CS50)', provider: 'edX (Harvard)', price: 'Free', reviews: '4.9', link: '#' },
      { id: '3', title: 'Full Stack Web Development', provider: 'Udemy (Angela Yu)', price: '$12.99', reviews: '4.7', link: '#' },
      { id: '4', title: 'Entrepreneurships in Africa', provider: 'FutureLearn', price: 'Free', reviews: '4.6', link: '#' },
    ]);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="brutal-border bg-brand-green p-8 md:p-12 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 rotate-12 bg-white w-64 h-64 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="sticker bg-brand-gold text-brand-navy border-none shadow-none">Global Learning 🌎</div>
            <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{t.hubs.courses.title}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold">{t.hubs.courses.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {courses.map(course => (
          <div key={course.id} className="brutal-border bg-white p-8 space-y-6 hover:rotate-1 transition-transform">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 brutal-border-sm">{course.provider}</span>
                <div className="flex items-center gap-1 text-brand-gold">
                  <Star size={14} fill="currentColor" />
                  <span className="text-[10px] font-black uppercase">{course.reviews}</span>
                </div>
              </div>
              <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none pt-2">{course.title}</h4>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-brand-green" />
              <span className="text-xs font-black uppercase">{course.price}</span>
            </div>

            <button className="w-full brutal-btn bg-brand-navy text-white py-4 font-black uppercase tracking-widest text-xs">
              Go to Course Site
              <ArrowRight size={18} className="inline ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

const universities: University[] = [
  {
    id: 'ub',
    name: 'University of Buea',
    shortName: 'UB',
    location: 'Buea, SW Region',
    description: 'The Place to Be. Known for its Anglo-Saxon tradition and academic excellence.',
    faculties: ['Arts', 'Education', 'Engineering & Technology', 'Health Sciences', 'Science', 'Social & Management Sciences', 'Agriculture & Veterinary Medicine'],
    requirements: ['GCE O-Level (5 papers including English)', 'GCE A-Level (2 papers)', 'Specific subject requirements per faculty'],
    admissionLink: 'https://ubuea.cm/admissions/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/ubuea/800/400',
    color: 'bg-neon-blue'
  },
  {
    id: 'uba',
    name: 'University of Bamenda',
    shortName: 'UBa',
    location: 'Bambili, NW Region',
    description: 'The University of the Future. Strong focus on professional and technical education.',
    faculties: ['COLTECH', 'HTTC', 'HTTTC', 'Health Sciences', 'Science', 'Arts', 'Economics & Management Sciences', 'Law & Political Science'],
    requirements: ['GCE O-Level (5 papers)', 'GCE A-Level (2 papers)', 'Competitive entrance exams for professional schools'],
    admissionLink: 'https://uniba.cm/admissions',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/ubamenda/800/400',
    color: 'bg-neon-pink'
  },
  {
    id: 'uyi',
    name: 'University of Yaounde I',
    shortName: 'UYI',
    location: 'Ngoa-Ekelle, Yaounde',
    description: 'The Mother University. Excellence in basic sciences, arts, and humanities.',
    faculties: ['Science', 'Arts, Letters & Human Sciences', 'Medicine & Biomedical Sciences (FMSB)', 'Polytechnic (ENSPY)', 'HTTC (ENS)'],
    requirements: ['Baccalauréat or GCE A-Level', 'Entrance exams for professional schools (Polytech, FMSB)', 'Application via the MINESUP portal'],
    admissionLink: 'https://www.uy1.uninet.cm/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/uy1/800/400',
    color: 'bg-neon-green'
  },
  {
    id: 'ud',
    name: 'University of Douala',
    shortName: 'UD',
    location: 'Douala, Littoral Region',
    description: 'Strategic academic hub in the economic capital.',
    faculties: ['Industrial Engineering (ENSET)', 'Medicine & Pharmaceutical Sciences', 'ESSEC (Business)', 'Science', 'Law & Political Science', 'Arts & Humanities'],
    requirements: ['GCE A-Level or Baccalauréat', 'Competitive exams for ESSEC, ENSET, and Medicine', 'Online registration required'],
    admissionLink: 'https://www.univ-douala.com/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/udouala/800/400',
    color: 'bg-neon-yellow'
  },
  {
    id: 'uds',
    name: 'University of Dschang',
    shortName: 'UDs',
    location: 'Dschang, West Region',
    description: 'Renowned for Agriculture and collective excellence.',
    faculties: ['Agronomy & Agricultural Sciences (FASA)', 'Science', 'Arts & Humanities', 'Law & Political Science', 'Economics & Management'],
    requirements: ['GCE A-Level/Bac', 'FASA requires competitive entrance exam', 'General admission via dossier'],
    admissionLink: 'https://www.univ-dschang.org/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/udschang/800/400',
    color: 'bg-neon-purple'
  },
  {
    id: 'un',
    name: 'University of Ngaoundéré',
    shortName: 'UN',
    location: 'Ngaoundéré, Adamawa Region',
    description: 'A center of excellence in the heart of the Adamawa. Strong in science and technology.',
    faculties: ['Science', 'Arts & Humanities', 'Law & Political Science', 'Economics & Management', 'ENSAI (Industrial Engineering)', 'IUT'],
    requirements: ['Baccalauréat or GCE A-Level', 'Competitive entrance for ENSAI and IUT', 'Online registration'],
    admissionLink: 'https://www.univ-ndere.cm/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/ndere/800/400',
    color: 'bg-orange-500'
  },
  {
    id: 'uma',
    name: 'University of Maroua',
    shortName: 'UMa',
    location: 'Maroua, Far North Region',
    description: 'Promoting peace and development through education. Home to the prestigious ENS Maroua.',
    faculties: ['ENS (Teacher Training)', 'Higher Institute of the Sahel (ISS)', 'Science', 'Arts & Humanities', 'Law & Political Science'],
    requirements: ['Baccalauréat or GCE A-Level', 'ENS requires competitive entrance exam', 'ISS admission via Concours'],
    admissionLink: 'https://www.univ-maroua.cm/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/maroua/800/400',
    color: 'bg-red-500'
  },
  {
    id: 'oxford',
    name: 'University of Oxford',
    shortName: 'Oxford',
    location: 'Oxford, United Kingdom',
    description: 'The oldest university in the English-speaking world. A global leader in research and education.',
    faculties: ['Humanities', 'Mathematical, Physical & Life Sciences', 'Medical Sciences', 'Social Sciences'],
    requirements: ['GCE A-Level: A*A*A - AAA', 'IELTS 7.5+', 'Specific admissions tests (e.g., PAT, MAT, LNAT)', 'Interview'],
    admissionLink: 'https://www.ox.ac.uk/admissions/undergraduate',
    tuition: '£9,250 (Home) / £33,050 - £48,620 (International) per year',
    image: 'https://picsum.photos/seed/oxford/800/400',
    color: 'bg-indigo-900'
  },
  {
    id: 'harvard',
    name: 'Harvard University',
    shortName: 'Harvard',
    location: 'Cambridge, MA, USA',
    description: 'Ivy League excellence. One of the most prestigious universities globally.',
    faculties: ['Harvard College (Undergraduate)', 'Medical School', 'Law School', 'Business School', 'Engineering & Applied Sciences'],
    requirements: ['SAT/ACT (Optional but recommended)', 'High School GPA (Top of class)', 'Extracurriculars & Essays', 'Financial aid available for international students'],
    admissionLink: 'https://college.harvard.edu/admissions',
    tuition: '$54,269 (Tuition) / $82,950 (Total Cost) per year',
    image: 'https://picsum.photos/seed/harvard/800/400',
    color: 'bg-red-800'
  },
  {
    id: 'utoronto',
    name: 'University of Toronto',
    shortName: 'UofT',
    location: 'Toronto, Canada',
    description: 'Canada\'s top-ranked university. Diverse and research-intensive.',
    faculties: ['Arts & Science', 'Applied Science & Engineering', 'Architecture, Landscape & Design', 'Music', 'Kinesiology & Physical Education'],
    requirements: ['GCE A-Level: Minimum 3 papers', 'English Proficiency (IELTS/TOEFL)', 'Strong academic record'],
    admissionLink: 'https://future.utoronto.ca/apply/',
    tuition: 'CAD 6,590 (Domestic) / CAD 60,510 (International) per year',
    image: 'https://picsum.photos/seed/utoronto/800/400',
    color: 'bg-blue-900'
  },
  {
    id: 'uyii',
    name: 'University of Yaounde II',
    shortName: 'UYII',
    location: 'Soa, Yaounde',
    description: 'Specialized in Law, Economics, and Political Science. The hub for social sciences.',
    faculties: ['Law & Political Science', 'Economics & Management', 'IRIC (International Relations)', 'ASMAC (Journalism)'],
    requirements: ['Baccalauréat or GCE A-Level', 'Entrance exams for IRIC and ASMAC', 'Online application'],
    admissionLink: 'https://www.univ-yaounde2.org/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/uy2/800/400',
    color: 'bg-indigo-600'
  },
  {
    id: 'ubt',
    name: 'University of Bertoua',
    shortName: 'UBt',
    location: 'Bertoua, East Region',
    description: 'The rising star of the East. Focused on mining, forestry, and local development.',
    faculties: ['Science', 'Arts & Humanities', 'Law & Political Science', 'Economics & Management', 'Higher Institute of Mining'],
    requirements: ['Baccalauréat or GCE A-Level', 'Competitive entrance for professional schools', 'General admission via dossier'],
    admissionLink: 'https://www.univ-bertoua.cm/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/bertoua/800/400',
    color: 'bg-yellow-600'
  },
  {
    id: 'ueb',
    name: 'University of Ebolowa',
    shortName: 'UEb',
    location: 'Ebolowa, South Region',
    description: 'Excellence in the South. Strong focus on agriculture and industrial technology.',
    faculties: ['Science', 'Arts & Humanities', 'Law & Political Science', 'Agriculture & Forestry', 'Higher Institute of Technology'],
    requirements: ['Baccalauréat or GCE A-Level', 'Entrance exams for technical institutes', 'Application via dossier'],
    admissionLink: 'https://www.univ-ebolowa.cm/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/ebolowa/800/400',
    color: 'bg-emerald-600'
  },
  {
    id: 'uga',
    name: 'University of Garoua',
    shortName: 'UGa',
    location: 'Garoua, North Region',
    description: 'A new beacon of knowledge in the North. Excellence in medicine and veterinary sciences.',
    faculties: ['Medicine & Biomedical Sciences', 'Veterinary Medicine', 'Science', 'Arts & Humanities', 'Law & Political Science'],
    requirements: ['Baccalauréat or GCE A-Level', 'Entrance exams for Medicine and Vet schools', 'Online registration'],
    admissionLink: 'https://www.univ-garoua.cm/',
    tuition: '50,000 XAF (Registration) + Faculty Fees',
    image: 'https://picsum.photos/seed/garoua/800/400',
    color: 'bg-sky-600'
  }
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
}

interface MarketItem {
  id: string;
  title: string;
  price: string;
  description: string;
  category: string;
  seller: string;
  contact: string;
  image: string;
  date: string;
  isVerified?: boolean;
  studentIdImage?: string;
}

interface Exam {
  id: string;
  title: string;
  date: string;
  subjects: string[];
}

interface ExamNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'exam' | 'deadline' | 'tip';
  read: boolean;
}

interface SavedRecommendation {
  id: string;
  type: 'career' | 'university' | 'general';
  title: string;
  content: string;
  timestamp: Date;
}

interface UserProfile {
  name: string;
  academicHistory: string;
  desiredField: string;
  preferredUniversities: string;
  careerInterests: string;
}

interface PaymentRecord {
  id: string;
  plan: string;
  amount: string;
  duration: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        if (parsedError.error && parsedError.error.includes("Missing or insufficient permissions")) {
          errorMessage = "You don't have permission to perform this action. Please check your account status.";
        } else if (parsedError.error && parsedError.error.includes("offline")) {
          errorMessage = "You are currently offline. Please check your internet connection.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full brutal-border bg-white p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-600" size={40} />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">System Error</h2>
            <p className="text-gray-600 font-medium">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full brutal-btn py-4 bg-neon-pink text-white font-black uppercase italic"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const FREE_LIMIT = 50;

const PremiumGate = ({ 
  hasPaid, 
  freeLimit, 
  usageCount, 
  onUpgrade, 
  t, 
  children 
}: { 
  hasPaid: boolean, 
  freeLimit: number, 
  usageCount: number, 
  onUpgrade: () => void, 
  t: any, 
  children: React.ReactNode 
}) => {
  const isLocked = !hasPaid && usageCount >= freeLimit;

  return (
    <div className="relative">
      {children}
      {isLocked && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6 premium-blur border-4 border-dashed border-brand-navy rounded-3xl">
          <div className="brutal-border bg-white p-8 text-center space-y-6 max-w-sm">
            <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center mx-auto brutal-border-sm rotate-3">
              <Zap className="text-brand-navy" size={32} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">
              {t.common.premiumAccess}
            </h3>
            <p className="text-sm font-bold text-gray-500 uppercase">
              {usageCount}/{freeLimit} {t.common.freeMember} {t.common.status}
            </p>
            <button 
              onClick={onUpgrade}
              className="w-full brutal-btn bg-neon-pink text-white py-4 font-black uppercase tracking-widest hover:rotate-1"
            >
              {t.common.upgradeToPro}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const handleFirestoreError = (error: any, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

interface RefreshIndicatorProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPulling = useRef(false);

  const PULL_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const distance = Math.min(diff * 0.4, PULL_THRESHOLD + 20);
      setPullDistance(distance);
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-y-auto custom-scrollbar"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50 overflow-hidden"
        style={{ height: pullDistance }}
        animate={{ height: isRefreshing ? PULL_THRESHOLD : pullDistance }}
      >
        <div className={cn(
          "bg-neon-yellow brutal-border-sm p-2 flex items-center gap-2 text-[10px] font-black uppercase italic transition-opacity",
          pullDistance > 20 || isRefreshing ? "opacity-100" : "opacity-0"
        )}>
          <RefreshCw 
            size={14} 
            className={cn(isRefreshing && "animate-spin")} 
            style={{ transform: !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined }}
          />
          {isRefreshing ? "Refreshing..." : pullDistance >= PULL_THRESHOLD ? "Release to Refresh" : "Pull to Refresh"}
        </div>
      </motion.div>
      <motion.div
        animate={{ y: isRefreshing ? PULL_THRESHOLD : pullDistance }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default function App() {
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    chat: [],
    chat_general: [],
    chat_gce: [],
    chat_career: [],
    chat_hustle: [],
    planner: [],
    hustle: [],
    housing: [],
    gce: [],
    compass: [],
    market: [],
    universities: [],
    saved: []
  });
  const [chatSection, setChatSection] = useState<'general' | 'gce' | 'career' | 'hustle'>('general');
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [morningPlug, setMorningPlug] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [hasPaid, setHasPaid] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentNumber, setPaymentNumber] = useState('652778067');
  const [selectedPlan, setSelectedPlan] = useState<'30_DAYS' | 'ACADEMIC_YEAR'>('30_DAYS');
  const [paymentType, setPaymentType] = useState<'UPGRADE' | 'MARKET_POST' | 'HOUSING_POST' | 'ITEM_PURCHASE'>('UPGRADE');
  const [pendingMarketItem, setPendingMarketItem] = useState<MarketItem | null>(null);
  const [pendingHousingListing, setPendingHousingListing] = useState<any>(null);
  const [purchasingItem, setPurchasingItem] = useState<MarketItem | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'planner' | 'hustle' | 'housing' | 'gce' | 'compass' | 'market' | 'universities' | 'saved' | 'profile' | 'faq' | 'guide' | 'homework' | 'cbt' | 'lessons' | 'flashcards' | 'youtube' | 'courses' | 'assistant'>('home');
  const [language, setLanguage] = useState<Language>('en');
  const t = translations[language];
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [debug, setDebug] = useState(false);
  const [plannerView, setPlannerView] = useState<'timetable' | 'tips' | 'concours' | 'reading'>('timetable');
  const [gceLevel, setGceLevel] = useState<'O' | 'A'>('A');
  const [gceStream, setGceStream] = useState<'General' | 'Technical'>('General');
  const [gceYear, setGceYear] = useState('2024');
  const [gceSubject, setGceSubject] = useState('');
  const [gcePaperType, setGcePaperType] = useState('Paper 1 (MCQs)');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  
  // GCE Viewer State
  const [isViewingGce, setIsViewingGce] = useState(false);
  const [gceViewerContent, setGceViewerContent] = useState<string | null>(null);
  const [isGceViewerLoading, setIsGceViewerLoading] = useState(false);
  const [gceViewerTitle, setGceViewerTitle] = useState('');
  const [gceViewerType, setGceViewerType] = useState<'paper' | 'solution'>('paper');

  const O_LEVEL_SUBJECTS = [
    'Mathematics', 'English Language', 'French', 'Biology', 'Chemistry', 'Physics', 
    'Geography', 'History', 'Economics', 'Commerce', 'Accounts', 'Food & Nutrition', 
    'Home Economics', 'Computer Science', 'Literature in English', 'Religious Studies', 
    'Citizenship Education', 'Logic', 'Additional Mathematics', 'Special Bilingual Education French', 'Geology', 'Human Biology'
  ].sort();

  const O_LEVEL_TECHNICAL_SUBJECTS = [
    'Building Construction', 'Electrical Technology', 'Woodwork Technology', 
    'Metalwork Technology', 'Motor Vehicle Mechanics', 'Engineering Drawing', 
    'Building Drawing', 'Workshop Technology', 'Secretarial Studies', 
    'Accounting', 'Commerce', 'Economic Geography', 'Information Technology'
  ].sort();

  const A_LEVEL_SUBJECTS = [
    'Pure Mathematics with Mechanics', 'Pure Mathematics with Statistics', 'Further Mathematics', 
    'Biology', 'Chemistry', 'Physics', 'Geography', 'History', 'Economics', 
    'Computer Science', 'Philosophy', 'Religious Studies', 'Literature in English', 
    'French', 'Geology', 'ICT', 'Food Science', 'Accounting', 'Business Management', 'Law', 'Special Bilingual Education French'
  ].sort();

  const A_LEVEL_TECHNICAL_SUBJECTS = [
    'Applied Mechanics', 'Structural Mechanics', 'Building Construction', 
    'Electrical Power', 'Electronics', 'Surveying', 'Woodwork', 
    'Machine Tools', 'Thermodynamics', 'Fluid Mechanics', 'Digital Electronics',
    'Financial Accounting', 'Cost Accounting', 'Business Management', 'Law',
    'Information Technology'
  ].sort();

  const currentYear = new Date().getFullYear();
  const GCE_YEARS = Array.from(
    { length: currentYear - 2015 + 1 }, 
    (_, i) => (currentYear - i).toString()
  );

  const [hustleLocation, setHustleLocation] = useState('');
  const [hustleCapital, setHustleCapital] = useState('');
  const [hustleTime, setHustleTime] = useState('');
  const [compassSearch, setCompassSearch] = useState('');
  const [uniSearch, setUniSearch] = useState('');
  const [selectedUniIds, setSelectedUniIds] = useState<string[]>([]);
  const [uniView, setUniView] = useState<'list' | 'compare' | 'calendar'>('list');
  const [isComparing, setIsComparing] = useState(false); // Keep for compatibility if needed, but we'll use uniView
  const [deadlines, setDeadlines] = useState<AdmissionDeadline[]>([
    {
      id: '1',
      uniName: 'University of Buea',
      deadline: '2026-08-31',
      description: 'General Undergraduate Admission Deadline',
      type: 'Cameroon',
      link: 'https://ubuea.cm/admissions/'
    },
    {
      id: '2',
      uniName: 'University of Bamenda',
      deadline: '2026-09-15',
      description: 'Undergraduate and Professional Schools Deadline',
      type: 'Cameroon',
      link: 'https://uniba.cm/admissions'
    },
    {
      id: '3',
      uniName: 'University of Oxford',
      deadline: '2026-10-15',
      description: 'UCAS Application Deadline for 2027 Entry',
      type: 'International',
      link: 'https://www.ox.ac.uk/admissions/undergraduate'
    },
    {
      id: '4',
      uniName: 'Harvard University',
      deadline: '2027-01-01',
      description: 'Regular Decision Application Deadline',
      type: 'International',
      link: 'https://college.harvard.edu/admissions'
    }
  ]);
  const [isAddingDeadline, setIsAddingDeadline] = useState(false);
  const [newDeadline, setNewDeadline] = useState({ uniName: '', deadline: '', description: '', type: 'Cameroon' as 'Cameroon' | 'International', link: '' });
  const [savedCareers, setSavedCareers] = useState<string[]>(() => {
    const saved = localStorage.getItem('campusplug_saved_careers');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedUnis, setSavedUnis] = useState<string[]>(() => {
    const saved = localStorage.getItem('campusplug_saved_unis');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>(() => {
    const saved = localStorage.getItem('campusplug_saved_recs');
    return saved ? JSON.parse(saved) : [];
  });
  const [exams, setExams] = useState<Exam[]>([]);
  const [studyTimetable, setStudyTimetable] = useState<string | null>(null);
  const [isGeneratingTimetable, setIsGeneratingTimetable] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', date: '', subjects: '' });
  const [weakSubjects, setWeakSubjects] = useState(() => localStorage.getItem('campusplug_weak_subjects') || '');
  const [preferredStudyTime, setPreferredStudyTime] = useState<'morning' | 'afternoon' | 'evening' | 'flexible'>(() => (localStorage.getItem('campusplug_study_time') as any) || 'flexible');
  const [gceMastery, setGceMastery] = useState<{
    solvedCounts: Record<string, number>;
    badges: MasteryBadge[];
  }>(() => {
    const saved = localStorage.getItem('campusplug_gce_mastery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          solvedCounts: parsed.solvedCounts || {},
          badges: (parsed.badges || []).map((b: any) => ({ ...b, dateEarned: new Date(b.dateEarned) }))
        };
      } catch (e) {
        return { solvedCounts: {}, badges: [] };
      }
    }
    return { solvedCounts: {}, badges: [] };
  });

  const [showBadgeNotification, setShowBadgeNotification] = useState<MasteryBadge | null>(null);

  // Housing State
  const [housingView, setHousingView] = useState<'browse' | 'post' | 'chats' | 'my-listings'>('browse');
  const [listings, setListings] = useState<HouseListing[]>([]);
  const [isPostingHouse, setIsPostingHouse] = useState(false);
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    images: [] as string[]
  });
  const [selectedListing, setSelectedListing] = useState<HouseListing | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isPayingListingFee, setIsPayingListingFee] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const activeConversationRef = useRef<Conversation | null>(null);
  const activeTabRef = useRef<string>('home');
  const housingViewRef = useRef<string>('browse');

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    housingViewRef.current = housingView;
  }, [housingView]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('campusplug_gce_mastery', JSON.stringify(gceMastery));
  }, [gceMastery]);

  const trackGCESolution = (subject: string, level: 'O' | 'A') => {
    const key = `${level}_${subject}`;
    setGceMastery(prev => {
      const newCounts = { ...prev.solvedCounts, [key]: (prev.solvedCounts[key] || 0) + 1 };
      const currentCount = newCounts[key];
      const newBadges = [...prev.badges];
      
      const tiers: { count: number; tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' }[] = [
        { count: 3, tier: 'Bronze' },
        { count: 7, tier: 'Silver' },
        { count: 15, tier: 'Gold' },
        { count: 30, tier: 'Platinum' }
      ];

      let earnedBadge: MasteryBadge | null = null;
      tiers.forEach(t => {
        if (currentCount === t.count) {
          const badgeId = `${key}_${t.tier}`;
          if (!newBadges.find(b => b.id === badgeId)) {
            earnedBadge = {
              id: badgeId,
              subject,
              level,
              tier: t.tier,
              dateEarned: new Date()
            };
            newBadges.push(earnedBadge);
          }
        }
      });

      if (earnedBadge) {
        setShowBadgeNotification(earnedBadge);
        setTimeout(() => setShowBadgeNotification(null), 5000);
      }

      return { solvedCounts: newCounts, badges: newBadges };
    });
  };
  const [notifications, setNotifications] = useState<ExamNotification[]>([
    {
      id: '1',
      title: 'GCE A-Level Exam Alert',
      message: 'The GCE A-Level exams are starting in 45 days. Time to switch to "Intensive Mode" in your timetable!',
      date: '2026-03-29',
      type: 'exam',
      read: false
    },
    {
      id: '2',
      title: 'Mock Exams Approaching',
      message: 'Regional mock exams are scheduled for next month. Adjust your focus to past papers.',
      date: '2026-03-28',
      type: 'exam',
      read: true
    }
  ]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    academicHistory: '',
    desiredField: '',
    preferredUniversities: '',
    careerInterests: ''
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([
    {
      id: 'PAY-12345',
      plan: '30 Days Premium',
      amount: '2000 XAF',
      duration: '30 Days',
      date: '2026-03-01',
      status: 'Completed'
    },
    {
      id: 'PAY-67890',
      plan: 'Academic Year',
      amount: '15000 XAF',
      duration: '1 Year',
      date: '2025-09-15',
      status: 'Completed'
    }
  ]);
  const [profileView, setProfileView] = useState<'details' | 'history' | 'mastery'>('details');
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>('default');

  // Reading Timetable State
  const [studySubjects, setStudySubjects] = useState<string[]>([]);
  const [newStudySubject, setNewStudySubject] = useState('');
  const [studyDuration, setStudyDuration] = useState('4'); // Default 4 hours
  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null);
  const [smartTimetableData, setSmartTimetableData] = useState<any>(null);

  const updateDaySessions = (dayIndex: number, newSessions: any[]) => {
    if (!generatedTimetable) return;
    const newSchedule = [...generatedTimetable.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], sessions: newSessions };
    setGeneratedTimetable({ ...generatedTimetable, schedule: newSchedule });
  };

  const updateSmartDaySessions = (dayIndex: number, newSessions: any[]) => {
    if (!smartTimetableData) return;
    const newSchedule = [...smartTimetableData.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], sessions: newSessions };
    setSmartTimetableData({ ...smartTimetableData, schedule: newSchedule });
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationsPermission(permission);
    if (permission === 'granted') {
      toast.success("Desktop notifications enabled!");
    }
  };

  const checkUpcomingExams = () => {
    if (exams.length === 0) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const shownReminders = JSON.parse(localStorage.getItem('campusplug_shown_reminders') || '{}');
    const newShownReminders = { ...shownReminders };
    let hasNewReminder = false;

    exams.forEach(exam => {
      const examDate = new Date(exam.date);
      const diffTime = examDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Thresholds: 7 days, 3 days, 1 day, 0 days (today)
      const thresholds = [7, 3, 1, 0];
      thresholds.forEach(threshold => {
        if (diffDays === threshold) {
          const reminderKey = `${exam.id}_${threshold}`;
          if (!shownReminders[reminderKey]) {
            const message = threshold === 0 
              ? `TODAY: ${exam.title} is happening today! Good luck, on est ensemble! 🔌`
              : `REMINDER: ${exam.title} is in ${threshold} day${threshold > 1 ? 's' : ''}. Keep studying!`;
            
            // In-app toast
            toast(message, {
              icon: <Zap className="text-neon-pink" size={16} />,
              duration: 10000,
            });

            // Desktop notification
            if (notificationsPermission === 'granted') {
              new Notification("CampusPlug Exam Alert", {
                body: message,
                icon: "/favicon.ico" // Assuming there's one, or just omit
              });
            }

            // Add to in-app notifications list
            const id = `rem_${Date.now()}_${exam.id}`;
            const newNotif: ExamNotification = {
              id,
              title: threshold === 0 ? "EXAM TODAY!" : "Upcoming Exam Reminder",
              message,
              date: today,
              type: 'exam',
              read: false
            };
            setNotifications(prev => [newNotif, ...prev]);
            
            newShownReminders[reminderKey] = true;
            hasNewReminder = true;
          }
        }
      });
    });

    if (hasNewReminder) {
      localStorage.setItem('campusplug_shown_reminders', JSON.stringify(newShownReminders));
    }
  };

  useEffect(() => {
    // Check on mount and when exams change
    if (isAuthReady) {
      checkUpcomingExams();
    }
    
    // Periodic check every hour
    const interval = setInterval(checkUpcomingExams, 3600000);
    return () => clearInterval(interval);
  }, [exams, isAuthReady, notificationsPermission]);

  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isPostingMarketItem, setIsPostingMarketItem] = useState(false);
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const [isVerifyingID, setIsVerifyingID] = useState(false);
  const [activeConcours, setActiveConcours] = useState<string | null>(null);
  const [concoursStrategy, setConcoursStrategy] = useState<any>(null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [imageVerificationError, setImageVerificationError] = useState<string | null>(null);
  const [idVerificationError, setIdVerificationError] = useState<string | null>(null);
  const [marketPaymentStep, setMarketPaymentStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [newMarketItem, setNewMarketItem] = useState({
    title: '',
    price: '',
    description: '',
    category: 'General',
    seller: '',
    contact: '',
    image: 'https://picsum.photos/seed/market/400/300',
    isVerified: false,
    studentIdImage: ''
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (debug) {
      document.body.classList.add('debug-mode');
    } else {
      document.body.classList.remove('debug-mode');
    }
  }, [debug]);

  useEffect(() => {
    // Load usage from local storage
    const storedDate = localStorage.getItem('campusplug_date');
    const today = new Date().toDateString();
    
    if (storedDate !== today) {
      localStorage.setItem('campusplug_date', today);
      localStorage.setItem('campusplug_usage', '0');
      setUsageCount(0);
    } else {
      const count = parseInt(localStorage.getItem('campusplug_usage') || '0');
      setUsageCount(count);
    }

    // Load saved items
    const storedNotifications = localStorage.getItem('campusplug_notifications');
    const storedMessages = localStorage.getItem('campusplug_messages');
    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);
      // Convert string timestamps back to Date objects
      Object.keys(parsed).forEach(key => {
        parsed[key] = parsed[key].map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      });
      setMessages(parsed);
    }
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));

    const storedExams = localStorage.getItem('campusplug_exams');
    const storedTimetable = localStorage.getItem('campusplug_timetable');
    const storedSmartTimetableData = localStorage.getItem('campusplug_smart_timetable_data');
    const storedWeakSubjects = localStorage.getItem('campusplug_weak_subjects');
    const storedStudyTime = localStorage.getItem('campusplug_study_time');
    const storedProfile = localStorage.getItem('campusplug_profile');
    const storedHistory = localStorage.getItem('campusplug_payment_history');
    if (storedExams) setExams(JSON.parse(storedExams));
    if (storedTimetable) setStudyTimetable(storedTimetable);
    if (storedSmartTimetableData) setSmartTimetableData(JSON.parse(storedSmartTimetableData));
    if (storedWeakSubjects) setWeakSubjects(storedWeakSubjects);
    if (storedStudyTime) setPreferredStudyTime(storedStudyTime as any);
    if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    if (storedHistory) setPaymentHistory(JSON.parse(storedHistory));

    const storedStudySubjects = localStorage.getItem('campusplug_study_subjects');
    const storedStudyDuration = localStorage.getItem('campusplug_study_duration');
    const storedGeneratedTimetable = localStorage.getItem('campusplug_generated_timetable');
    if (storedStudySubjects) setStudySubjects(JSON.parse(storedStudySubjects));
    if (storedStudyDuration) setStudyDuration(storedStudyDuration);
    if (storedGeneratedTimetable) setGeneratedTimetable(JSON.parse(storedGeneratedTimetable));

    // Generate Morning Plug
    const fetchMorningPlug = async () => {
      try {
        const plug = await generateMorningPlug();
        setMorningPlug(plug);
      } catch (error) {
        console.error("Failed to fetch morning plug", error);
      }
    };
    fetchMorningPlug();

    // Responsive Sidebar
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  useEffect(() => {
    localStorage.setItem('campusplug_saved_recs', JSON.stringify(savedRecommendations));
  }, [savedRecommendations]);

  useEffect(() => {
    localStorage.setItem('campusplug_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    if (studyTimetable) {
      localStorage.setItem('campusplug_timetable', studyTimetable);
    }
    if (smartTimetableData) {
      localStorage.setItem('campusplug_smart_timetable_data', JSON.stringify(smartTimetableData));
    }
  }, [studyTimetable, smartTimetableData]);

  useEffect(() => {
    localStorage.setItem('campusplug_weak_subjects', weakSubjects);
  }, [weakSubjects]);

  useEffect(() => {
    localStorage.setItem('campusplug_study_time', preferredStudyTime);
  }, [preferredStudyTime]);

  useEffect(() => {
    localStorage.setItem('campusplug_profile', JSON.stringify(userProfile));
    localStorage.setItem('campusplug_payment_history', JSON.stringify(paymentHistory));
  }, [userProfile, paymentHistory]);

  useEffect(() => {
    localStorage.setItem('campusplug_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('campusplug_study_subjects', JSON.stringify(studySubjects));
  }, [studySubjects]);

  useEffect(() => {
    localStorage.setItem('campusplug_study_duration', studyDuration);
  }, [studyDuration]);

  useEffect(() => {
    if (generatedTimetable) {
      localStorage.setItem('campusplug_generated_timetable', JSON.stringify(generatedTimetable));
    }
  }, [generatedTimetable]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      setSelectedImage({
        data: base64String,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    localStorage.setItem('campusplug_messages', JSON.stringify(messages));
  }, [messages]);

  const handleGenerateConcoursStrategy = async (concoursName: string) => {
    setActiveConcours(concoursName);
    setIsGeneratingStrategy(true);
    setConcoursStrategy(null);

    try {
      const result = await generateConcoursStrategy(concoursName);
      setConcoursStrategy(result);
    } catch (error) {
      console.error("Error generating concours strategy:", error);
      toast.error("Failed to generate strategy. Try again, on est ensemble!");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    if (usageCount >= FREE_LIMIT && !hasPaid) {
      setPaymentType('UPGRADE');
      setShowPaywall(true);
      return;
    }

    const currentTabKey = `chat_${chatSection}`;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
      image: selectedImage?.data
    };

    setMessages(prev => ({
      ...prev,
      [currentTabKey]: [...(prev[currentTabKey] || []), userMessage]
    }));
    
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const currentSectionMessages = messages[currentTabKey] || [];
      const history = [
        ...currentSectionMessages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
      ];
      
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      setMessages(prev => ({
        ...prev,
        [currentTabKey]: [...(prev[currentTabKey] || []), assistantMessage]
      }));
      
      const response = await generateResponseStream(textToSend, history, userProfile, currentImage || undefined);
      let fullResponse = '';

      for await (const chunk of response) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setMessages(prev => ({
          ...prev,
          [currentTabKey]: (prev[currentTabKey] || []).map(m => 
            m.id === assistantMessageId ? { ...m, content: fullResponse } : m
          )
        }));
      }

      if (!fullResponse) {
        setMessages(prev => ({
          ...prev,
          [currentTabKey]: (prev[currentTabKey] || []).map(m => 
            m.id === assistantMessageId ? { ...m, content: "I'm having a bit of trouble connecting to the network. Try again, on est ensemble!" } : m
          )
        }));
      }
      
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      localStorage.setItem('campusplug_usage', newCount.toString());
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => ({
        ...prev,
        [currentTabKey]: [...(prev[currentTabKey] || []), {
          id: Date.now().toString(),
          role: 'assistant',
          content: "The network is acting up. Let's try that again, on est ensemble!",
          timestamp: new Date()
        }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGceRequest = async (type: 'paper' | 'solution') => {
    if (!gceSubject) {
      toast.error("Which subject are we tackling today?", {
        className: 'brutal-border bg-neon-pink text-white font-black uppercase italic',
      });
      return;
    }

    const title = `${gceLevel} Level ${gceStream} ${gceSubject} ${gcePaperType} (${gceYear})`;
    setGceViewerTitle(title);
    setGceViewerType(type);
    setIsViewingGce(true);
    setIsGceViewerLoading(true);
    setGceViewerContent('');

    const isPaper1 = gcePaperType.includes('Paper 1');

    // Check if we have verified data for this specific request
    const verifiedQuestions = GCE_VERIFIED_ARCHIVE.filter(q => 
      q.year === gceYear && 
      q.level === gceLevel && 
      q.subject === gceSubject && 
      (isPaper1 ? q.paperType.includes('Paper 1') : !q.paperType.includes('Paper 1'))
    );

    if (verifiedQuestions.length > 0) {
      setIsGceViewerLoading(false);
      let content = verifiedQuestions.map(q => {
        if (type === 'paper') {
          const text = language === 'en' ? q.question_en : q.question_fr;
          let qText = `### Question ${q.questionNumber}\n${text}\n\n`;
          const options = language === 'en' ? q.options_en : q.options_fr;
          if (options) {
            qText += options.map((opt, i) => `**${String.fromCharCode(65 + i)}**) ${opt}`).join('    ') + '\n\n';
          }
          return qText;
        } else {
          const explanation = language === 'en' ? q.explanation_en : q.explanation_fr;
          return `### Solution to Question ${q.questionNumber}\n**Correct Answer:** ${q.correctAnswer || 'N/A'}\n\n**Detailed Logic:**\n${explanation}\n\n**Official Mark Scheme Breakdown:**\n${q.markScheme}\n\n--- \n\n`;
        }
      }).join('\n');

      setGceViewerContent(content);
      return;
    }

    const prompt = type === 'paper' 
      ? `VERBATIM TRANSCRIPT REQUEST - OFFICIAL CAMEROON GCE BOARD (CGCEBOARD.COM) ARCHIVES.
         
         TASK: You are to act as a 1:1 Digital Mirror. Your sole objective is to provide an EXACT, WORD-FOR-WORD, AND FULL-LENGTH transcription of the official Cameroon GCE ${gceLevel} Level ${gceStream} Education ${gceSubject} ${gcePaperType} from the year ${gceYear}, exactly as archived on the official Board website or verified past paper repositories.
         
         STRICT ARCHIVE PROTOCOLS: 
         - MANDATORY GOOGLE SEARCH: Before writing, use the SEARCH tool to find the official .pdf or .doc transcript from cgceboard.com or cameroongceboard.cm. Look for the EXACT string of the ${gceYear} paper.
         - ZERO TOLERANCE FOR SUMMARIZATION: You are forbidden from omitting a single punctuation mark, instruction, or question. 
         - COMPLETENESS: For Paper 1, you MUST list all 50 questions. For Paper 2/3, you MUST list every subsection.
         - FIDELITY: If the original paper has specific formatting, numbering (e.g., 1.1, 1.2), or mark allocations, replicate them exactly.
         - NO "LLM LAZINESS": Do not use phrases like "rest of the questions are similar". You must type out the entire paper in its historical entirety.
         - Ensure nomenclature follows the Board's standards (e.g., 'Advanced Level', 'Paper 2').`
      : `OFFICIAL MARKING RUBRIC RECONSTRUCTION - VERIFIED ARCHIVES.
         
         TASK: Provide the COMPLETE AND VERBATIM official marking scheme/solution key for the Cameroon GCE ${gceLevel} Level ${gceStream} Education ${gceSubject} ${gcePaperType} from the year ${gceYear}.
         
         STRICT ARCHIVE PROTOCOLS:
         - MANDATORY GOOGLE SEARCH: Find the official board-issued 'Examiner's Marking Guide' or official transcript for the ${gceYear} session.
         - FIDELITY: The marking scheme must match the official GCE Board rubric exactly. Show the detailed 'Mark Breakdown' (e.g., 1mk for formula, 2mks for logic).
         - FULL DOCUMENT: Provide solutions for EVERY single question and part in the paper. No exclusions.
         - RIGOR: Use the professional, academic language expected by the Cameroon GCE Board markers.`;

    try {
      if (type === 'solution') {
        trackGCESolution(gceSubject, gceLevel);
      }

      // Use the Pro model with search grounding for maximum accuracy on official past papers
      const stream = await generateProResponseStream(prompt, [], userProfile, [
        { googleSearch: {} }
      ]);
      let fullContent = '';
      
      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        fullContent += chunkText;
        setGceViewerContent(fullContent);
      }
    } catch (error) {
      console.error("GCE Generation error:", error);
      toast.error("Failed to fetch the content. Please try again!");
      setIsViewingGce(false);
    } finally {
      setIsGceViewerLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;

      // Add Header Brand
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generated by CampusPlug - Cameroon's #1 Student Hub", margin, 15);
      doc.setTextColor(0, 0, 0);

      // Add Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(gceViewerTitle, contentWidth);
      doc.text(titleLines, margin, 30);
      
      let y = 30 + (titleLines.length * 10);

      // Add Type Subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.text(gceViewerType === 'paper' ? 'Official Past Paper Content' : 'Official Verified Solutions', margin, y);
      y += 15;

      // Add Content
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      // Basic markdown cleaning for PDF 
      const cleanContent = gceViewerContent
        .replace(/### /g, 'QUESTION: ')
        .replace(/\*\*/g, '')
        .replace(/---/g, '____________________________________________________');

      const splitText = doc.splitTextToSize(cleanContent, contentWidth);
      
      // Page wrapping logic
      const pageHeight = doc.internal.pageSize.getHeight();
      for (let i = 0; i < splitText.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(splitText[i], margin, y);
        y += 7;
      }

      // Save the PDF
      const fileName = `${gceViewerTitle.replace(/\s+/g, '_')}_${gceViewerType}.pdf`;
      doc.save(fileName);
      
      toast.success("PDF Downloaded successfully!", {
        className: 'brutal-border bg-neon-green text-brutal-black font-black uppercase italic',
      });
    } catch (error) {
      console.error("PDF Download error:", error);
      toast.error("Failed to generate PDF. On est ensemble, try the Print button!");
    }
  };

  const handlePayment = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    if (!paymentNumber || paymentNumber.length < 9) {
      setPaymentError("Enter a valid MoMo/OM number (9 digits)");
      return;
    }
    
    let formattedNumber = paymentNumber.trim().replace(/\s+/g, '');
    
    // Auto-prefix with 237 if it's a 9-digit number starting with 6
    if (/^6[0-9]{8}$/.test(formattedNumber)) {
      formattedNumber = '237' + formattedNumber;
    }
    
    // Basic validation for Cameroon mobile numbers (12 digits starting with 2376)
    if (!formattedNumber || !/^2376[0-9]{8}$/.test(formattedNumber)) {
      setPaymentError("Please enter a valid Cameroon phone number (e.g., 670000000 or 237670000000)");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStep('processing');
    if (paymentType === 'MARKET_POST') setMarketPaymentStep('processing');
    setPaymentError(null);
    
    try {
      let amount = 0;
      let metadata = {};

      if (paymentType === 'UPGRADE') {
        amount = selectedPlan === '30_DAYS' ? 1000 : 7000;
      } else if (paymentType === 'MARKET_POST') {
        amount = 200;
      } else if (paymentType === 'HOUSING_POST') {
        amount = 2000;
      } else if (paymentType === 'ITEM_PURCHASE' && purchasingItem) {
        amount = parseInt(purchasingItem.price.replace(/[^0-9]/g, '')) || 0;
        metadata = { itemTitle: purchasingItem.title, itemId: purchasingItem.id };
      }

      if (amount <= 0) throw new Error("Invalid payment amount");

      const response = await axios.post('/api/pay/collect', {
        phoneNumber: formattedNumber,
        amount: amount,
        userId: user.uid,
        plan: paymentType === 'UPGRADE' ? selectedPlan : undefined,
        type: paymentType,
        metadata
      });

      if (response.data.reference) {
        setPaymentReference(response.data.reference);
        startPolling(response.data.reference);
      } else {
        throw new Error("Payment initiation failed: No reference received");
      }
    } catch (error: any) {
      console.error("Payment Error:", error);
      setPaymentError(error.response?.data?.error || error.message || "Payment failed to start");
      setPaymentStep('idle');
      setIsProcessingPayment(false);
    }
  };

  const startPolling = (reference: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 120 seconds (5s intervals)
    
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        const response = await axios.get(`/api/pay/status/${reference}?userId=${user?.uid}`);
        const status = response.data.status;

        if (status === 'SUCCESSFUL') {
          clearInterval(pollInterval);
          setPaymentStep('success');
          setIsProcessingPayment(false);
          setPaymentReference(null);
          
          if (paymentType === 'UPGRADE') {
            setHasPaid(true);
            const newRecord: PaymentRecord = {
              id: reference,
              plan: selectedPlan === '30_DAYS' ? '1 Month GCE Pro' : 'Academic Year GCE Pro',
              amount: selectedPlan === '30_DAYS' ? '1000 XAF' : '7000 XAF',
              duration: selectedPlan === '30_DAYS' ? '30 Days' : '1 Year',
              date: new Date().toISOString().split('T')[0],
              status: 'Completed'
            };
            setPaymentHistory(prev => [newRecord, ...prev]);
            
            const updatedProfile = { ...userProfile, isPremium: true };
            setUserProfile(updatedProfile);
            
            if (user) {
              const userRef = doc(db, 'users', user.uid);
              updateDoc(userRef, {
                isPremium: true,
                premiumExpiry: selectedPlan === '30_DAYS' 
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: serverTimestamp()
              }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
            }
          } else if (paymentType === 'MARKET_POST' && pendingMarketItem) {
            const item: MarketItem = {
              ...pendingMarketItem,
              id: reference, // Use payment reference as ID
              date: new Date().toISOString().split('T')[0]
            };
            setMarketItems(prev => [item, ...prev]);
            setPendingMarketItem(null);
            setMarketPaymentStep('success');
            setShowPaywall(false);
          } else if (paymentType === 'HOUSING_POST' && pendingHousingListing) {
            try {
              await addDoc(collection(db, 'listings'), {
                ...pendingHousingListing,
                isPaid: true,
                createdAt: new Date().toISOString()
              });
              toast.success("House posted successfully!");
              setNewListing({ title: '', description: '', price: '', location: '', images: [] });
              setHousingView('browse');
              setPendingHousingListing(null);
              setIsPayingListingFee(false);
              setShowPaywall(false);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, 'listings');
              setIsPayingListingFee(false);
              setShowPaywall(false);
            }
          } else if (paymentType === 'ITEM_PURCHASE' && purchasingItem) {
            toast.success(`Purchase of ${purchasingItem.title} successful!`, {
              className: 'brutal-border bg-neon-green text-brutal-black font-black uppercase italic',
            });
            setPurchasingItem(null);
            setShowPaywall(false);
          }
        } else if (status === 'FAILED') {
          clearInterval(pollInterval);
          setPaymentError("Payment failed. Please try again.");
          setPaymentStep('idle');
          if (paymentType === 'MARKET_POST') setMarketPaymentStep('idle');
          if (paymentType === 'HOUSING_POST') setIsPayingListingFee(false);
          setIsProcessingPayment(false);
          setPaymentReference(null);
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setPaymentError("Payment timed out. If you were debited, your account will be updated shortly.");
          setPaymentStep('idle');
          if (paymentType === 'MARKET_POST') setMarketPaymentStep('idle');
          if (paymentType === 'HOUSING_POST') setIsPayingListingFee(false);
          setIsProcessingPayment(false);
          setPaymentReference(null);
        }
      } catch (error) {
        console.error("Polling Error:", error);
      }
    }, 5000);
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test_connection', 'connection'));
        console.log("Firebase connection successful");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
          toast.error("Database connection failed. Please check your internet or configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthReady(true);

      if (firebaseUser) {
        // Sync with Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const path = `users/${firebaseUser.uid}`;
        
        try {
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            try {
              await setDoc(userRef, {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                isPremium: false,
                usageCount: 0,
                updatedAt: Timestamp.now()
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, path);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, path);
        }

        // Listen for real-time updates (e.g., premium status)
        onSnapshot(userRef, (snapshot) => {
          const data = snapshot.data();
          if (data) {
            setHasPaid(data.isPremium || false);
            setUsageCount(data.usageCount || 0);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        });
      } else {
        setHasPaid(false);
        setUsageCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleSaveCareer = (careerName: string) => {
    setSavedCareers(prev => {
      const isSaved = prev.includes(careerName);
      const next = isSaved ? prev.filter(c => c !== careerName) : [...prev, careerName];
      localStorage.setItem('campusplug_saved_careers', JSON.stringify(next));
      return next;
    });
  };

  const toggleSaveUni = (uniId: string) => {
    setSavedUnis(prev => {
      const isSaved = prev.includes(uniId);
      const next = isSaved ? prev.filter(u => u !== uniId) : [...prev, uniId];
      localStorage.setItem('campusplug_saved_unis', JSON.stringify(next));
      return next;
    });
  };

  const saveRecommendation = (title: string, content: string, type: 'career' | 'university' | 'general') => {
    const newRec: SavedRecommendation = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      content,
      timestamp: new Date()
    };
    setSavedRecommendations(prev => [...prev, newRec]);
    alert("Saved to your path! Check the 'Saved' tab.");
  };

  const removeRecommendation = (id: string) => {
    setSavedRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('campusplug_notifications', JSON.stringify(next));
      return next;
    });
  };

  const addExamNotification = () => {
    if (!newExam.title || !newExam.date) return;
    
    const id = Date.now().toString();
    const newNotif: ExamNotification = {
      id,
      title: newExam.title,
      message: `Upcoming Exam: ${newExam.title} on ${newExam.date}. Adjust your timetable now!`,
      date: new Date().toISOString().split('T')[0],
      type: 'exam',
      read: false
    };

    const newExamObj: Exam = {
      id,
      title: newExam.title,
      date: newExam.date,
      subjects: newExam.subjects.split(',').map(s => s.trim()).filter(s => s !== '')
    };

    setNotifications(prev => {
      const next = [newNotif, ...prev];
      localStorage.setItem('campusplug_notifications', JSON.stringify(next));
      return next;
    });

    setExams(prev => [...prev, newExamObj]);
    
    setNewExam({ title: '', date: '', subjects: '' });
    setIsAddingExam(false);
  };

  const removeExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const generateTimetable = async (feedback?: string) => {
    if (exams.length === 0) {
      alert("Add some exams first!");
      return;
    }
    
    setIsGeneratingTimetable(true);
    try {
      const examContext = exams.map(e => `${e.title} on ${e.date} (Subjects: ${e.subjects.join(', ')})`).join('\n');
      const personalizationContext = `
[PERSONALIZATION]
Weak Subjects: ${weakSubjects || 'None specified'}
Preferred Study Time: ${preferredStudyTime}
Daily Study Duration: ${studyDuration} hours
`;
      const prompt = feedback 
        ? `Here is my current study timetable: ${JSON.stringify(smartTimetableData)}. My feedback/progress: ${feedback}. ${personalizationContext} Please adapt the timetable accordingly. 
        Return the response in JSON format with the following structure:
        {
          "weeklyGoal": "A short motivational goal for the week",
          "schedule": [
            {
              "day": "Monday",
              "sessions": [
                { "time": "08:00 - 09:30", "subject": "Subject Name", "topic": "Suggested Topic", "tip": "Study tip" }
              ]
            }
          ]
        }`
        : `Generate a personalized, dynamic study timetable for the following exams:\n${examContext}\n${personalizationContext}\nInclude specific study blocks, breaks, and focus on the listed subjects, especially the weak ones. Respect the preferred study time if possible. 
        Return the response in JSON format with the following structure:
        {
          "weeklyGoal": "A short motivational goal for the week",
          "schedule": [
            {
              "day": "Monday",
              "sessions": [
                { "time": "08:00 - 09:30", "subject": "Subject Name", "topic": "Suggested Topic", "tip": "Study tip" }
              ]
            }
          ]
        }`;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.schedule) {
        data.schedule = data.schedule.map((day: any) => ({
          ...day,
          sessions: day.sessions.map((session: any, idx: number) => ({
            ...session,
            id: `smart-${day.day}-${idx}-${Date.now()}`
          }))
        }));
      }
      setSmartTimetableData(data);
      setStudyTimetable("JSON_MODE");
    } catch (error) {
      console.error("Error generating timetable:", error);
      alert("Failed to generate timetable. Try again!");
    } finally {
      setIsGeneratingTimetable(false);
    }
  };

  // Housing Logic
  useEffect(() => {
    if (!user) return;
    
    // Fetch listings
    const listingsQuery = query(collection(db, 'listings'), where('status', '==', 'active'), orderBy('createdAt', 'desc'));
    const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
      const fetchedListings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HouseListing));
      setListings(fetchedListings);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'listings');
    });

    // Fetch conversations
    const conversationsQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid), orderBy('lastTimestamp', 'desc'));
    const unsubscribeConversations = onSnapshot(conversationsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const conv = { id: change.doc.id, ...change.doc.data() } as Conversation;
          const isNewMessage = conv.lastSenderId && conv.lastSenderId !== user.uid;
          const isViewingThisChat = activeTabRef.current === 'housing' && 
                                   housingViewRef.current === 'chats' && 
                                   activeConversationRef.current?.id === conv.id;

          if (isNewMessage && !isViewingThisChat) {
            const senderName = user.uid === conv.studentId ? conv.landlordName : conv.studentName;
            toast(`New message from ${senderName}`, {
              description: conv.lastMessage,
              action: {
                label: "View",
                onClick: () => {
                  setActiveTab('housing');
                  setHousingView('chats');
                  setActiveConversation(conv);
                }
              }
            });
          }
        }
      });
      const fetchedConversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(fetchedConversations);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'conversations');
    });

    return () => {
      unsubscribeListings();
      unsubscribeConversations();
    };
  }, [user]);

  useEffect(() => {
    if (!activeConversation) {
      setChatMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, `conversations/${activeConversation.id}/messages`),
      orderBy('timestamp', 'asc')
    );
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setChatMessages(fetchedMessages);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `conversations/${activeConversation.id}/messages`);
    });

    return () => unsubscribeMessages();
  }, [activeConversation]);

  const handleListingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!user) {
      toast.error("Log in first to upload images!");
      return;
    }

    setIsUploadingImages(true);
    const uploadedUrls: string[] = [...newListing.images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Basic validation
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image!`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)!`);
          continue;
        }

        const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
      }
      setNewListing({ ...newListing, images: uploadedUrls });
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Try again.");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const postListing = async () => {
    if (!user) {
      toast.error("Log in first, boss!");
      return;
    }
    if (!newListing.title || !newListing.price || !newListing.location) {
      toast.error("Fill all required fields!");
      return;
    }

    setPaymentType('HOUSING_POST');
    setPendingHousingListing({
      ownerId: user.uid,
      ownerName: user.displayName || 'Landlord',
      title: newListing.title,
      description: newListing.description,
      price: parseFloat(newListing.price),
      location: newListing.location,
      images: newListing.images,
      status: 'active'
    });
    
    setShowPaywall(true);
  };

  const startConversation = async (listing: HouseListing) => {
    if (!user) {
      toast.error("Log in to chat with the landlord!");
      return;
    }
    if (user.uid === listing.ownerId) {
      toast.error("You can't chat with yourself, boss!");
      return;
    }

    // Check if conversation already exists
    const existing = conversations.find(c => c.listingId === listing.id && c.participants.includes(user.uid));
    if (existing) {
      setActiveConversation(existing);
      setHousingView('chats');
      return;
    }

    try {
      const conversationData = {
        listingId: listing.id,
        listingTitle: listing.title,
        participants: [user.uid, listing.ownerId],
        studentId: user.uid,
        landlordId: listing.ownerId,
        studentName: user.displayName || 'Student',
        landlordName: listing.ownerName || 'Landlord',
        lastMessage: 'Started a conversation',
        lastTimestamp: new Date().toISOString(),
        lastSenderId: user.uid
      };

      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      setActiveConversation({ id: docRef.id, ...conversationData } as Conversation);
      setHousingView('chats');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'conversations');
    }
  };

  const sendMessage = async () => {
    if (!user || !activeConversation || !newMessage.trim()) return;

    try {
      const messageData = {
        senderId: user.uid,
        message: newMessage.trim(),
        timestamp: serverTimestamp()
      };

      await addDoc(collection(db, `conversations/${activeConversation.id}/messages`), messageData);
      
      // Update conversation last message
      await setDoc(doc(db, 'conversations', activeConversation.id), {
        lastMessage: newMessage.trim(),
        lastTimestamp: new Date().toISOString(),
        lastSenderId: user.uid
      }, { merge: true });

      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `conversations/${activeConversation.id}`);
    }
  };

  // Reading Timetable Logic
  const generateReadingTimetable = async () => {
    if (!navigator.onLine) {
      toast.error("You're offline, boss! Connect to the internet to use the AI.");
      return;
    }

    if (studySubjects.length === 0) {
      toast.error("Add some subjects first, boss!");
      return;
    }

    setIsGeneratingTimetable(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const examsInfo = exams.length > 0 
        ? `Upcoming Exams: ${exams.map(e => `${e.title} on ${e.date} (Subjects: ${e.subjects.join(', ')})`).join('; ')}.`
        : "No specific upcoming exams scheduled yet.";

      const prompt = `Generate a detailed weekly reading timetable for a student.
      Weak Subjects (Focus Areas): ${studySubjects.join(', ')}.
      The student can study for ${studyDuration} hours per day. 
      ${examsInfo}
      
      Return the response in JSON format with the following structure:
      {
        "weeklyGoal": "A short motivational goal for the week, considering upcoming exams if any",
        "schedule": [
          {
            "day": "Monday",
            "sessions": [
              { 
                "time": "08:00 - 09:30", 
                "subject": "Subject Name", 
                "topic": "Suggested Topic", 
                "tip": "Study tip",
                "resources": ["Resource 1", "Resource 2"]
              }
            ]
          }
        ]
      }
      Ensure the subjects are balanced across the week, prioritizing weak subjects and upcoming exam topics. Include short breaks. Focus on the Cameroon GCE context if applicable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.schedule) {
        data.schedule = data.schedule.map((day: any) => ({
          ...day,
          sessions: day.sessions.map((session: any, idx: number) => ({
            ...session,
            id: `${day.day}-${idx}-${Date.now()}`
          }))
        }));
      }
      setGeneratedTimetable(data);
      toast.success("Timetable generated! Time to get plugged.");
    } catch (error) {
      console.error("Error generating timetable:", error);
      toast.error("Failed to generate timetable. Try again!");
    } finally {
      setIsGeneratingTimetable(false);
    }
  };

  const addStudySubject = () => {
    if (newStudySubject.trim() && !studySubjects.includes(newStudySubject.trim())) {
      setStudySubjects([...studySubjects, newStudySubject.trim()]);
      setNewStudySubject('');
    }
  };

  const removeStudySubject = (subject: string) => {
    setStudySubjects(studySubjects.filter(s => s !== subject));
  };

  const quickPlugs = [
    { icon: <BookOpen size={18} />, label: "GCE Solutions", prompt: "I need solutions for GCE A-Level Further Math Paper 2 from the last 5 years." },
    { icon: <Calendar size={18} />, label: "Study Planner", prompt: "Help me create a study timetable. I'm struggling with Physics and Chemistry." },
    { icon: <Briefcase size={18} />, label: "Side Hustle", prompt: "I am a University of Yaoundé 1 student with 5,000 XAF capital and 2 hours of free time daily. Plug me into a business idea I can start today." },
    { icon: <Home size={18} />, label: "Housing Tips", prompt: "What should I look for when renting a mini-cité in Molyko, Buea?" },
  ];

  const housingTips = [
    "Never pay 'visit fees' before seeing the room. Real agents don't do that.",
    "Ensure the mini-cité has a functional borehole. Water is life in Molyko/Bambili!",
    "Check the distance to the main gate. You don't want to trek 30 mins for an 8am class.",
    "Verify the light situation. Ask neighbors if the 'poteau' is stable.",
    "Check for lease safety. Always get a signed receipt for your caution and rent."
  ];

  const CAREER_COMPASS_DATA = [
    {
      category: "Medical & Health Sciences",
      fields: [
        { 
          name: "Medicine & Surgery", 
          series: "S1/S2 (Bio, Chem, Phys/Math)", 
          career: "Medical Doctor / Surgeon", 
          uni: "Cameroon: CUSS (UY1), UB, UBa; Abroad: Harvard (USA), Heidelberg (Germany), McGill (Canada)",
          requirements: "Cameroon: Pass in Concours. GCE A-Level: 3 papers (Bio, Chem, Phys/Math) with Grade C or better. BACC: Average 12/20+."
        },
        { 
          name: "Nursing", 
          series: "S1/S2/S3", 
          career: "Registered Nurse / Nurse Practitioner", 
          uni: "Cameroon: UB, UBa, CUIB; Abroad: University of Toronto (Canada), NYU (USA)",
          requirements: "GCE A-Level: 2 papers (Bio, Chem/Phys). O-Level: 5 papers (Eng, Math, Bio required)."
        },
        { 
          name: "Pharmacy", 
          series: "S1/S2", 
          career: "Pharmacist / Clinical Researcher", 
          uni: "Cameroon: UDM, UB; Abroad: ETH Zurich (Switzerland), Monash (Australia)",
          requirements: "GCE A-Level: 3 papers (Chem, Bio, Math/Phys). High grades in Chemistry required."
        },
        { 
          name: "Medical Lab Science", 
          series: "S1/S2/S3", 
          career: "Lab Scientist / Pathologist", 
          uni: "Cameroon: UB, UBa; Abroad: Johns Hopkins (USA), UBC (Canada)",
          requirements: "GCE A-Level: 2 papers (Bio, Chem). O-Level: 5 papers including Math and Science."
        }
      ]
    },
    {
      category: "Engineering & Technology",
      fields: [
        { 
          name: "Software Engineering", 
          series: "S1 (Math, Phys, CS)", 
          career: "Software Developer / AI Engineer", 
          uni: "Cameroon: FET (UB), ENSPY (UY1), CUIB; Abroad: MIT (USA), TU Munich (Germany), Waterloo (Canada)",
          requirements: "Cameroon: ENSPY Concours or UB FET Entrance. GCE A-Level: Math & Phys (Grade C+). BACC C/D/TI."
        },
        { 
          name: "Civil Engineering", 
          series: "S1 (Math, Phys)", 
          career: "Civil Engineer / Urban Planner", 
          uni: "Cameroon: FET (UB), ENSPY (UY1), UBa; Abroad: ETH Zurich (Switzerland), Georgia Tech (USA)",
          requirements: "GCE A-Level: Math, Phys, and Chem/Further Math. Strong background in Mechanics."
        },
        { 
          name: "Electrical Engineering", 
          series: "S1 (Math, Phys)", 
          career: "Electrical Engineer / Power Systems Expert", 
          uni: "Cameroon: FET (UB), ENSPY (UY1); Abroad: Stanford (USA), TU Delft (Netherlands)",
          requirements: "GCE A-Level: Math & Phys required. O-Level: 5 papers including Eng & Math."
        },
        { 
          name: "Mechanical Engineering", 
          series: "S1 (Math, Phys)", 
          career: "Mechanical Engineer / Robotics Specialist", 
          uni: "Cameroon: FET (UB), ENSPY (UY1); Abroad: Imperial College (UK), RWTH Aachen (Germany)",
          requirements: "GCE A-Level: Math & Phys. Technical Drawing at O-Level is an advantage."
        }
      ]
    },
    {
      category: "Business & Management",
      fields: [
        { 
          name: "Accounting", 
          series: "Arts/S3 (Math, Econ)", 
          career: "Chartered Accountant / Auditor", 
          uni: "Cameroon: FSG (UY2), UB, UBa; Abroad: LSE (UK), Rotman (Canada), Wharton (USA)",
          requirements: "GCE A-Level: 2 papers (Econ, Math/Acc). O-Level: Math & Eng (Grade C+)."
        },
        { 
          name: "Marketing", 
          series: "Arts/S3", 
          career: "Marketing Manager / Brand Strategist", 
          uni: "Cameroon: UB, UBa; Abroad: HEC Paris (France), Kellogg (USA)",
          requirements: "GCE A-Level: 2 papers. O-Level: 5 papers including Eng."
        },
        { 
          name: "Human Resource Mgmt", 
          series: "Arts/S3", 
          career: "HR Manager / Talent Acquisition", 
          uni: "Cameroon: UB, UBa; Abroad: Cornell (USA), INSEAD (France/Singapore)",
          requirements: "GCE A-Level: 2 papers. Strong communication skills required."
        },
        { 
          name: "Banking & Finance", 
          series: "Arts/S3 (Math, Econ)", 
          career: "Banker / Financial Analyst / Investment Manager", 
          uni: "Cameroon: UB, UBa; Abroad: NYU Stern (USA), Oxford (UK)",
          requirements: "GCE A-Level: 2 papers including Econ or Math. O-Level: Math required."
        }
      ]
    },
    {
      category: "Arts, Law & Social Sciences",
      fields: [
        { 
          name: "Law", 
          series: "Arts (Lit, Hist, Govt)", 
          career: "Lawyer / Magistrate / Legal Consultant", 
          uni: "Cameroon: FSJP (UY2), UB, UBa; Abroad: Yale (USA), Sorbonne (France), Osgoode Hall (Canada)",
          requirements: "GCE A-Level: 2 papers (Lit, Hist/Govt). O-Level: Eng (Grade B+). BACC A4."
        },
        { 
          name: "Journalism & Mass Comm", 
          series: "Arts", 
          career: "Journalist / PR Specialist / Media Consultant", 
          uni: "Cameroon: ASMAC (UY2), UB; Abroad: Columbia (USA), Cardiff (UK)",
          requirements: "GCE A-Level: 2 papers. O-Level: Eng (Grade B+). Entrance exam for ASMAC."
        },
        { 
          name: "Political Science", 
          series: "Arts", 
          career: "Political Analyst / Diplomat / Policy Advisor", 
          uni: "Cameroon: UB, UBa, UY2; Abroad: Sciences Po (France), Georgetown (USA)",
          requirements: "GCE A-Level: 2 papers including Hist or Govt."
        },
        { 
          name: "Sociology", 
          series: "Arts", 
          career: "Social Worker / Researcher / Community Planner", 
          uni: "Cameroon: UB, UY1; Abroad: UC Berkeley (USA), University of Amsterdam (Netherlands)",
          requirements: "GCE A-Level: 2 papers. O-Level: 5 papers."
        }
      ]
    },
    {
      category: "Agriculture & Environmental Sciences",
      fields: [
        { 
          name: "Agricultural Engineering", 
          series: "S1/S2 (Bio, Math, Phys)", 
          career: "Agro-Industrial Engineer / Farm Manager", 
          uni: "Cameroon: FASA (Dschang), UBa (Bambili); Abroad: Wageningen (Netherlands), UC Davis (USA)",
          requirements: "GCE A-Level: Bio & Chem/Math. FASA Entrance exam is highly competitive."
        },
        { 
          name: "Environmental Science", 
          series: "S1/S2 (Bio, Geog, Chem)", 
          career: "Environmental Consultant / Conservationist", 
          uni: "Cameroon: UB, UY1; Abroad: Oxford (UK), Yale (USA), UBC (Canada)",
          requirements: "GCE A-Level: 2 papers including Bio or Geog. Passion for sustainability."
        },
        { 
          name: "Food Science & Technology", 
          series: "S1/S2 (Bio, Chem)", 
          career: "Food Quality Controller / Product Developer", 
          uni: "Cameroon: ENSAI (Ngaoundéré), UB; Abroad: Cornell (USA), Reading (UK)",
          requirements: "GCE A-Level: Chem & Bio. Strong interest in biochemistry and nutrition."
        }
      ]
    },
    {
      category: "Architecture & Creative Arts",
      fields: [
        { 
          name: "Architecture", 
          series: "S1 (Math, Phys, Art)", 
          career: "Architect / Urban Designer", 
          uni: "Cameroon: ESSAL (Yaoundé), COLTECH (UBa); Abroad: AA School (UK), Delft (Netherlands), GSD Harvard (USA)",
          requirements: "GCE A-Level: Math & Phys. Portfolio of drawings often required for abroad."
        },
        { 
          name: "Graphic Design & Multimedia", 
          series: "Any (Art/CS advantage)", 
          career: "Creative Director / UI/UX Designer", 
          uni: "Cameroon: CUIB, NAB (Buea); Abroad: RISD (USA), UAL (UK)",
          requirements: "GCE A-Level: 2 papers. Strong portfolio and digital skills."
        }
      ]
    },
    {
      category: "Education & Specialized Fields",
      fields: [
        { 
          name: "Secondary Education (DIPES II)", 
          series: "Any (Subject specific)", 
          career: "High School Teacher / Education Administrator", 
          uni: "Cameroon: ENS (Yaoundé, Bambili, Maroua); Abroad: UCL IE (UK), Stanford GSE (USA)",
          requirements: "GCE A-Level: 2 papers in the subject you wish to teach. ENS Concours required."
        },
        { 
          name: "Cyber Security", 
          series: "S1 (Math, CS)", 
          career: "Ethical Hacker / Security Analyst", 
          uni: "Cameroon: SUP'PTIC, CUIB; Abroad: Carnegie Mellon (USA), RHUL (UK)",
          requirements: "GCE A-Level: Math & CS. Certifications like CompTIA+ are a plus."
        }
      ]
    },
    {
      category: "Emerging & Global Fields",
      fields: [
        { 
          name: "Data Science", 
          series: "S1 (Math, CS)", 
          career: "Data Scientist / Big Data Analyst", 
          uni: "Cameroon: CUIB, UB (via CS); Abroad: Stanford (USA), TU Munich (Germany)",
          requirements: "GCE A-Level: Math & CS/Phys. Strong logic and math skills."
        },
        { 
          name: "Renewable Energy", 
          series: "S1 (Phys, Math)", 
          career: "Sustainability Consultant / Energy Engineer", 
          uni: "Cameroon: ENSPY (UY1); Abroad: KTH Royal (Sweden), UC Berkeley (USA)",
          requirements: "GCE A-Level: Math & Phys. Interest in environmental tech."
        },
        { 
          name: "International Relations", 
          series: "Arts (Hist, Lit)", 
          career: "Diplomat / International NGO Worker", 
          uni: "Cameroon: IRIC (UY2); Abroad: Geneva Graduate Institute (Switzerland), Fletcher School (USA)",
          requirements: "GCE A-Level: 2 papers. O-Level: Eng & French (Grade B+). IRIC Concours required."
        }
      ]
    }
  ];

  const chatTabKey = `chat_${chatSection}`;

  const handleRefresh = async () => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Perform tab-specific refresh actions
      switch (activeTab) {
        case 'planner':
          // Re-fetch morning plug
          const plug = await generateMorningPlug();
          setMorningPlug(plug);
          toast.success("Timetable & Tips updated!");
          break;
        case 'hustle':
          toast.success("Business ideas refreshed!");
          break;
        case 'market':
          // In a real app, we'd re-fetch market items from Firestore
          toast.success("Marketplace updated!");
          break;
        case 'universities':
          toast.success("Admission deadlines updated!");
          break;
        default:
          toast.success("Content refreshed!");
      }
    } catch (error) {
      console.error("Refresh failed:", error);
      toast.error("Failed to refresh. Try again!");
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-[100dvh] bg-[#F0F0F0] overflow-hidden font-body selection:bg-neon-pink selection:text-white relative">
        <Toaster position="top-center" richColors />
      {/* Decorative Stickers */}
      <div className="fixed top-20 right-10 pointer-events-none z-0 opacity-20 hidden lg:block">
        <div className="sticker bg-neon-yellow -rotate-12 mb-4">#STUDENTLIFE</div>
        <div className="sticker bg-neon-pink rotate-6 mb-4">{language === 'en' ? "WE ARE TOGETHER" : "ON EST ENSEMBLE"}</div>
        <div className="sticker bg-neon-blue -rotate-3">THE PLUG 🔌</div>
      </div>

      {/* Sticky Quick Actions (Desktop) */}
      <div className="fixed bottom-8 right-8 z-50 hidden lg:flex flex-col gap-4">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="brutal-btn bg-neon-yellow p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          title={t.common.backToTop}
        >
          <ArrowUp size={24} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('faq')}
          className="brutal-btn bg-neon-green p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          title={t.common.aiMentor}
        >
          <MessageSquare size={24} />
        </motion.button>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-brutal-black z-40 flex justify-around items-center h-16 px-2 shadow-[0_-4px_0_0_rgba(0,0,0,1)]">
        {[
          { id: 'home', icon: <Home size={20} />, label: t.nav.home, color: 'text-neon-blue' },
          { id: 'planner', icon: <Calendar size={20} />, label: t.planner.title, color: 'text-neon-green' },
          { id: 'gce', icon: <BookOpen size={20} />, label: t.nav.gce, color: 'text-neon-blue' },
          { id: 'market', icon: <ShoppingBag size={20} />, label: t.nav.market, color: 'text-neon-yellow' },
          { id: 'more', icon: <Menu size={20} />, label: t.common.more, color: 'text-brutal-black' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'more') {
                setIsSidebarOpen(true);
              } else {
                setActiveTab(item.id as any);
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-90 relative",
              activeTab === (item.id as any) ? `${item.color} bg-gray-50` : "text-gray-400"
            )}
          >
            {item.icon}
            <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
            {activeTab === (item.id as any) && item.id !== 'more' && (
              <motion.div 
                layoutId="activeTabMobile"
                className="absolute bottom-0 w-8 h-1 bg-current"
              />
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-brutal-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-72 border-r-3 border-brutal-black bg-white flex flex-col z-50 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b-3 border-brutal-black bg-neon-green relative overflow-hidden group">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white brutal-border-sm hover:bg-brutal-black hover:text-white transition-all lg:hidden z-10"
          >
            <X size={24} />
          </button>
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-brutal-black/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Campus<br/>Plug</h1>
          <div className="mt-2 inline-block bg-brutal-black text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">
            VERIFIED PLUG 🔌
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 mt-4 custom-scrollbar">
          <button 
            onClick={() => {
              setActiveTab('home');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'home' ? "bg-neon-blue text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-blue/20"
            )}
          >
            <Home size={18} />
            {t.nav.home}
          </button>
          <button 
            onClick={() => {
              setActiveTab('planner');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'planner' ? "bg-neon-green translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-green/20"
            )}
          >
            <Calendar size={18} />
            {t.planner.title}
          </button>
          <button 
            onClick={() => {
              setActiveTab('market');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'market' ? "bg-neon-yellow translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-yellow/20"
            )}
          >
            <ShoppingBag size={18} />
            {t.nav.market}
          </button>
          <button 
            onClick={() => {
              setActiveTab('universities');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'universities' ? "bg-neon-green translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-green/20"
            )}
          >
            <GraduationCap size={18} />
            {t.nav.universities}
          </button>
          <button 
            onClick={() => {
              setActiveTab('hustle');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'hustle' ? "bg-orange-400 translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-orange-400/20"
            )}
          >
            <Briefcase size={18} />
            {t.hustle.title}
          </button>

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-4">Study Hubs</p>
          </div>

          <button 
            onClick={() => {
              setActiveTab('assistant');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm shadow-[4px_4px_0px_0px_rgba(26,60,110,1)]",
              activeTab === 'assistant' ? "bg-brand-navy text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-brand-navy/10"
            )}
          >
            <Sparkles size={18} className="text-brand-gold" />
            {t.hubs.assistant.title}
          </button>

          <button 
            onClick={() => {
              setActiveTab('homework');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm shadow-[4px_4px_0px_0px_rgba(0,128,0,1)]",
              activeTab === 'homework' ? "bg-brand-green text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-brand-green/10"
            )}
          >
            <HelpCircle size={18} />
            {t.hubs.homework.title}
          </button>

          <button 
            onClick={() => {
              setActiveTab('cbt');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm shadow-[4px_4px_0px_0px_rgba(252,209,22,1)]",
              activeTab === 'cbt' ? "bg-brand-gold text-brand-navy translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-brand-gold/10"
            )}
          >
            <Timer size={18} />
            {t.hubs.cbt.title}
          </button>

          <button 
            onClick={() => {
              setActiveTab('lessons');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'lessons' ? "bg-brand-navy text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-brand-navy/10"
            )}
          >
            <PlayCircle size={18} />
            {t.hubs.lessons.title}
          </button>

          <button 
            onClick={() => {
              setActiveTab('flashcards');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'flashcards' ? "bg-neon-purple text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-purple/10"
            )}
          >
            <CreditCard size={18} />
            {t.hubs.flashcards.title}
          </button>

          <button 
            onClick={() => {
              setActiveTab('youtube');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'youtube' ? "bg-red-600 text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-red-600/10"
            )}
          >
            <Youtube size={18} />
            {t.hubs.youtube.title}
          </button>

          <button 
            onClick={() => {
              setActiveTab('courses');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'courses' ? "bg-brand-green text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-brand-green/10"
            )}
          >
            <Globe size={18} />
            {t.hubs.courses.title}
          </button>
          <button 
            onClick={() => {
              setActiveTab('profile');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'profile' ? "bg-neon-blue text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-blue/20"
            )}
          >
            <User size={18} />
            {t.nav.profile}
          </button>
          <button 
            onClick={() => {
              setActiveTab('saved');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'saved' ? "bg-neon-pink text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-pink/20"
            )}
          >
            <Heart size={18} />
            {t.nav.saved}
          </button>
          <button 
            onClick={() => {
              setActiveTab('guide');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'guide' ? "bg-neon-pink text-white translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-pink/20"
            )}
          >
            <Info size={18} />
            {t.nav.guide}
          </button>
          <button 
            onClick={() => {
              setActiveTab('faq');
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-4 font-black uppercase text-xs transition-all brutal-border-sm",
              activeTab === 'faq' ? "bg-neon-yellow translate-x-1 translate-y-1 shadow-none" : "bg-white hover:bg-neon-yellow/20"
            )}
          >
            <HelpCircle size={18} />
            {t.mentor.title}
          </button>
        </div>

        <div className="p-4 border-t-3 border-brutal-black space-y-2">
          <button 
            onClick={() => setDebug(!debug)}
            className={cn(
              "w-full flex items-center justify-between p-3 text-[10px] font-black uppercase tracking-widest brutal-border-sm transition-all",
              debug ? "bg-red-500 text-white" : "bg-white text-gray-400"
            )}
          >
            <span>{t.common.debugLayout}</span>
            <Zap size={14} fill={debug ? "currentColor" : "none"} />
          </button>
          <div className="flex items-center justify-between px-2">
            <span className="text-[8px] font-black uppercase opacity-40">v2.4.0-brutal</span>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-neon-pink rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="h-16 md:h-20 border-b-3 border-brutal-black bg-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 brutal-border-sm transition-all active:scale-95 lg:hidden"
            >
              <Menu size={20} className="md:w-6 md:h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 md:w-3 md:h-3 rounded-full animate-pulse",
                activeTab === 'market' ? "bg-neon-yellow" : "bg-neon-green"
              )} />
              <h2 className="font-black uppercase italic tracking-tighter text-sm md:text-xl truncate max-w-[100px] xs:max-w-[150px] md:max-w-none">
                {activeTab === 'home' && t.nav.home}
                {activeTab === 'planner' && t.planner.title}
                {activeTab === 'hustle' && t.hustle.title}
                {activeTab === 'housing' && t.nav.housing}
                {activeTab === 'gce' && t.nav.gce}
                {activeTab === 'compass' && t.nav.concours}
                {activeTab === 'market' && t.nav.market}
                {activeTab === 'universities' && t.nav.universities}
                {activeTab === 'saved' && t.nav.saved}
                {activeTab === 'profile' && t.nav.profile}
                {activeTab === 'faq' && t.mentor.title}
                {activeTab === 'guide' && t.nav.guide}
                {activeTab === 'assistant' && t.hubs.assistant.title}
                {activeTab === 'homework' && t.hubs.homework.title}
                {activeTab === 'cbt' && t.hubs.cbt.title}
                {activeTab === 'lessons' && t.hubs.lessons.title}
                {activeTab === 'flashcards' && t.hubs.flashcards.title}
                {activeTab === 'youtube' && t.hubs.youtube.title}
                {activeTab === 'courses' && t.hubs.courses.title}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center brutal-border-sm bg-gray-100 p-1">
              <button 
                onClick={() => setLanguage('en')}
                className={cn(
                  "px-2 py-1 text-[10px] font-black uppercase transition-all",
                  language === 'en' ? "bg-brutal-black text-white" : "hover:bg-gray-200"
                )}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('fr')}
                className={cn(
                  "px-2 py-1 text-[10px] font-black uppercase transition-all",
                  language === 'fr' ? "bg-brutal-black text-white" : "hover:bg-gray-200"
                )}
              >
                FR
              </button>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="p-2 brutal-border-sm bg-neon-yellow hover:bg-neon-yellow/80 transition-all active:scale-95"
              title="Refresh App"
            >
              <RefreshCw size={18} className="md:w-5 md:h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-brutal-black text-white px-2 md:px-3 py-1 brutal-border-sm text-[10px] md:text-xs font-black uppercase italic">
              <Zap size={12} className="text-neon-yellow" />
              <span className="hidden md:inline">{t.common.status}:</span> {t.common.active}
            </div>
            <button 
              onClick={() => {
                setPaymentType('UPGRADE');
                setShowPaywall(true);
              }}
              className="brutal-btn bg-neon-pink text-white text-[10px] md:text-xs py-1.5 md:py-2 px-3 md:px-4"
            >
              {hasPaid ? t.common.premium : t.common.upgrade}
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden bg-[#F0F0F0]">
          <RefreshIndicator onRefresh={handleRefresh}>
            <div className="p-4 md:p-8 pb-60 lg:pb-20 scroll-smooth">
              <div className="max-w-7xl mx-auto">
                {activeTab === 'home' && (
                  <HomeScreen user={user} setActiveTab={setActiveTab} setPlannerView={setPlannerView} hasPaid={hasPaid} t={t} language={language} />
                )}
                {activeTab === 'assistant' && (
                  <AIStudyAssistantScreen user={user} hasPaid={hasPaid} t={t} language={language} />
                )}
                {activeTab === 'homework' && (
                  <HomeworkSolverScreen hasPaid={hasPaid} t={t} language={language} />
                )}
                {activeTab === 'cbt' && (
                  <CBTEngine hasPaid={hasPaid} t={t} language={language} />
                )}
                {activeTab === 'lessons' && (
                  <VideoLessonsScreen hasPaid={hasPaid} t={t} language={language} />
                )}
                {activeTab === 'flashcards' && (
                  <FlashcardScreen hasPaid={hasPaid} t={t} language={language} />
                )}
                {activeTab === 'youtube' && (
                  <YouTubeDiscoveryScreen t={t} />
                )}
                {activeTab === 'courses' && (
                  <CourseDiscoveryScreen t={t} />
                )}
                {activeTab === 'universities' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto mb-8 space-y-8"
            >
              <div className="brutal-border bg-white p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 hidden md:block">
                  <div className="sticker bg-neon-green text-brutal-black rotate-12">OFFICIAL LINKS</div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-brutal-black text-white p-3 rotate-[-3deg]">
                      <GraduationCap size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{t.uni.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">{t.uni.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setUniView(uniView === 'calendar' ? 'list' : 'calendar')}
                        className={cn(
                          "brutal-btn px-6 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                          uniView === 'calendar' ? "bg-neon-purple text-white" : "bg-white text-brutal-black"
                        )}
                      >
                        <Calendar size={16} />
                        {uniView === 'calendar' ? "Back to List" : "Admissions Calendar"}
                      </button>
                      {selectedUniIds.length > 0 && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setUniView(uniView === 'compare' ? 'list' : 'compare')}
                            className={cn(
                              "brutal-btn px-6 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                              uniView === 'compare' ? "bg-neon-pink text-white" : "bg-neon-blue text-white"
                            )}
                          >
                            {uniView === 'compare' ? (
                              <>
                                <ArrowLeft size={16} />
                                Back to List
                              </>
                            ) : (
                              <>
                                <Zap size={16} />
                                Compare ({selectedUniIds.length})
                              </>
                            )}
                          </button>
                          {uniView !== 'compare' && (
                            <button 
                              onClick={() => setSelectedUniIds([])}
                              className="brutal-btn bg-white px-4 py-4 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                              title="Clear Selection"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {uniView === 'list' && (
                      <div className="relative w-full md:w-96">
                        <input 
                          type="text" 
                          placeholder="Search universities or locations..." 
                          value={uniSearch}
                          onChange={(e) => setUniSearch(e.target.value)}
                          className="w-full brutal-border p-4 pl-12 text-sm font-black focus:ring-4 focus:ring-neon-green outline-none bg-gray-50/50"
                        />
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brutal-black opacity-40" />
                      </div>
                    )}
                  </div>
                </div>

                {uniView === 'calendar' ? (
                  <div className="relative z-10 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">Key Admission Deadlines</h4>
                      <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => setIsAddingDeadline(true)}
                          className="flex-1 md:flex-none brutal-btn bg-neon-yellow px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Add Deadline
                        </button>
                        <button 
                          onClick={() => handleSend("What are the current admission deadlines for major Cameroonian universities and international universities for the 2026/2027 academic year? Please provide a list.")}
                          className="flex-1 md:flex-none brutal-btn bg-brutal-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          <Sparkles size={16} className="text-neon-yellow" />
                          Ask AI for Updates
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {deadlines.map((d) => (
                        <motion.div 
                          key={d.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="brutal-border bg-white p-6 space-y-4 relative group hover:rotate-1 transition-transform"
                        >
                          <div className="flex justify-between items-start">
                            <div className={cn(
                              "px-2 py-1 text-[8px] font-black uppercase tracking-widest brutal-border-sm",
                              d.type === 'Cameroon' ? "bg-neon-green" : "bg-neon-blue text-white"
                            )}>
                              {d.type}
                            </div>
                            <button 
                              onClick={() => setDeadlines(prev => prev.filter(item => item.id !== d.id))}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500 hover:text-white transition-all"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          <div>
                            <h5 className="text-xl font-black uppercase italic leading-tight">{d.uniName}</h5>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{d.description}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-gray-50 p-3 brutal-border-sm">
                            <Timer size={18} className="text-neon-pink" />
                            <div>
                              <p className="text-[8px] font-black uppercase opacity-40">Deadline</p>
                              <p className="text-sm font-black">{new Date(d.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <a 
                            href={d.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block brutal-btn bg-white text-center py-2 text-[10px] font-black uppercase tracking-widest hover:bg-brutal-black hover:text-white transition-all"
                          >
                            Official Portal
                          </a>
                        </motion.div>
                      ))}
                    </div>

                    {isAddingDeadline && (
                      <div className="fixed inset-0 bg-brutal-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="max-w-md w-full bg-white brutal-border p-8 space-y-6"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="text-2xl font-black uppercase italic tracking-tighter">Add Deadline</h4>
                            <button onClick={() => setIsAddingDeadline(false)}><X size={24} /></button>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">University Name</label>
                              <input 
                                type="text" 
                                value={newDeadline.uniName}
                                onChange={(e) => setNewDeadline({...newDeadline, uniName: e.target.value})}
                                className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-purple"
                                placeholder="e.g. University of Yaounde I"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Deadline Date</label>
                              <input 
                                type="date" 
                                value={newDeadline.deadline}
                                onChange={(e) => setNewDeadline({...newDeadline, deadline: e.target.value})}
                                className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-purple"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                              <input 
                                type="text" 
                                value={newDeadline.description}
                                onChange={(e) => setNewDeadline({...newDeadline, description: e.target.value})}
                                className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-purple"
                                placeholder="e.g. Undergraduate Admission"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Type</label>
                                <select 
                                  value={newDeadline.type}
                                  onChange={(e) => setNewDeadline({...newDeadline, type: e.target.value as 'Cameroon' | 'International'})}
                                  className="w-full brutal-border p-3 text-sm font-black outline-none appearance-none"
                                >
                                  <option value="Cameroon">Cameroon</option>
                                  <option value="International">International</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Portal Link</label>
                                <input 
                                  type="text" 
                                  value={newDeadline.link}
                                  onChange={(e) => setNewDeadline({...newDeadline, link: e.target.value})}
                                  className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-purple"
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              if (!newDeadline.uniName || !newDeadline.deadline) return;
                              setDeadlines([{ ...newDeadline, id: Date.now().toString() }, ...deadlines]);
                              setIsAddingDeadline(false);
                              setNewDeadline({ uniName: '', deadline: '', description: '', type: 'Cameroon', link: '' });
                            }}
                            className="w-full brutal-btn bg-neon-purple text-white py-4 font-black uppercase tracking-widest"
                          >
                            {t.common.saveDeadline}
                          </button>
                        </motion.div>
                      </div>
                    )}
                  </div>
                ) : uniView === 'compare' ? (
                  <div className="relative z-10 overflow-x-auto pb-8 custom-scrollbar">
                    <div className="min-w-[800px] grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] gap-4">
                      {/* Header Column */}
                      <div className="space-y-4 pt-[180px]">
                        <div className="h-20 flex items-center font-black uppercase text-xs tracking-widest text-gray-400 border-b-2 border-brutal-black/10">Location</div>
                        <div className="h-32 flex items-center font-black uppercase text-xs tracking-widest text-gray-400 border-b-2 border-brutal-black/10">Faculties</div>
                        <div className="h-40 flex items-center font-black uppercase text-xs tracking-widest text-gray-400 border-b-2 border-brutal-black/10">Requirements</div>
                        <div className="h-24 flex items-center font-black uppercase text-xs tracking-widest text-gray-400 border-b-2 border-brutal-black/10">Tuition</div>
                      </div>

                      {/* Uni Columns */}
                      {universities.filter(u => selectedUniIds.includes(u.id)).map((uni) => (
                        <div key={uni.id} className="brutal-border bg-white overflow-hidden flex flex-col">
                          <div className="aspect-video relative border-b-2 border-brutal-black">
                            <img src={uni.image} alt={uni.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                            <div className={cn("absolute inset-0 opacity-20", uni.color)} />
                            <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                              <h4 className="text-2xl font-black uppercase italic leading-none drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]">{uni.name}</h4>
                            </div>
                            <button 
                              onClick={() => setSelectedUniIds(prev => prev.filter(id => id !== uni.id))}
                              className="absolute top-2 right-2 p-1 bg-white brutal-border-sm hover:bg-red-500 hover:text-white transition-colors"
                              title="Remove from Compare"
                            >
                              <X size={16} />
                            </button>
                            <button 
                              onClick={() => toggleSaveUni(uni.id)}
                              className={cn(
                                "absolute top-2 left-2 p-1 brutal-border-sm transition-all hover:scale-110",
                                savedUnis.includes(uni.id) ? "bg-neon-pink text-white" : "bg-white text-gray-400"
                              )}
                              title={savedUnis.includes(uni.id) ? "Remove from Saved" : "Save University"}
                            >
                              <Heart size={16} fill={savedUnis.includes(uni.id) ? "currentColor" : "none"} />
                            </button>
                          </div>
                          
                          <div className="p-4 space-y-4 flex-1">
                            <div className="h-20 flex items-center text-sm font-black uppercase italic border-b-2 border-brutal-black/10">{uni.location}</div>
                            
                            <div className="h-32 overflow-y-auto custom-scrollbar border-b-2 border-brutal-black/10 py-2">
                              <ul className="space-y-1">
                                {uni.faculties.map((f, i) => (
                                  <li key={i} className="text-[10px] font-black uppercase flex items-center gap-2">
                                    <div className="w-1 h-1 bg-brutal-black rounded-full" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="h-40 overflow-y-auto custom-scrollbar border-b-2 border-brutal-black/10 py-2">
                              <ul className="space-y-2">
                                {uni.requirements.map((r, i) => (
                                  <li key={i} className="text-[10px] font-bold text-gray-600 leading-tight flex items-start gap-2">
                                    <CheckCircle2 size={12} className="text-neon-green shrink-0 mt-0.5" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="h-24 flex items-center text-[11px] font-black uppercase italic leading-tight border-b-2 border-brutal-black/10">{uni.tuition}</div>
                            
                            <div className="pt-4">
                              <a 
                                href={uni.admissionLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full block brutal-btn bg-neon-yellow text-center py-3 text-[10px] font-black uppercase tracking-widest hover:bg-brutal-black hover:text-white transition-all"
                              >
                                {t.common.applyNow}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 md:gap-8 relative z-10">
                    {universities.filter(u => 
                      u.name.toLowerCase().includes(uniSearch.toLowerCase()) || 
                      u.shortName.toLowerCase().includes(uniSearch.toLowerCase()) ||
                      u.location.toLowerCase().includes(uniSearch.toLowerCase())
                    ).map((uni, idx) => (
                      <motion.div 
                        key={uni.id}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cn(
                          "brutal-border bg-white overflow-hidden group hover:rotate-1 transition-transform relative",
                          selectedUniIds.includes(uni.id) && "ring-4 ring-neon-blue"
                        )}
                      >
                        <div className="aspect-video relative overflow-hidden border-b-2 border-brutal-black">
                          <img 
                            src={uni.image} 
                            alt={uni.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className={cn("absolute top-4 left-4 text-white px-3 py-1 font-black text-xl brutal-border-sm rotate-[-5deg]", uni.color)}>
                            {uni.shortName}
                          </div>
                          <div className="absolute bottom-4 right-4 bg-brutal-black text-white px-3 py-1 text-[10px] font-black uppercase brutal-border-sm">
                            {uni.location}
                          </div>
                          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUniIds(prev => 
                                  prev.includes(uni.id) ? prev.filter(id => id !== uni.id) : [...prev, uni.id]
                                );
                              }}
                              className={cn(
                                "p-2 brutal-border-sm transition-all hover:scale-110 flex items-center gap-2",
                                selectedUniIds.includes(uni.id) ? "bg-neon-blue text-white" : "bg-white text-gray-400"
                              )}
                              title={selectedUniIds.includes(uni.id) ? "Remove from Compare" : "Add to Compare"}
                            >
                              <Zap size={16} fill={selectedUniIds.includes(uni.id) ? "currentColor" : "none"} />
                              {selectedUniIds.includes(uni.id) && <span className="text-[10px] font-black uppercase">Selected</span>}
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveUni(uni.id);
                              }}
                              className={cn(
                                "p-2 brutal-border-sm transition-all hover:scale-110",
                                savedUnis.includes(uni.id) ? "bg-neon-pink text-white" : "bg-white text-gray-400"
                              )}
                            >
                              <Heart size={16} fill={savedUnis.includes(uni.id) ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-6 space-y-6">
                          <div>
                            <h4 className="text-2xl font-black uppercase italic leading-none mb-2 group-hover:text-neon-blue transition-colors">{uni.name}</h4>
                            <p className="text-xs font-bold text-gray-500 leading-tight">{uni.description}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-neon-pink flex items-center gap-2">
                                <Zap size={14} />
                                {t.common.whatTheyOffer}
                              </h5>
                              <ul className="space-y-1">
                                {uni.faculties.slice(0, 4).map((f, i) => (
                                  <li key={i} className="text-[11px] font-black uppercase flex items-center gap-2">
                                    <div className="w-1 h-1 bg-brutal-black rounded-full" />
                                    {f}
                                  </li>
                                ))}
                                {uni.faculties.length > 4 && (
                                  <li className="text-[10px] font-bold text-gray-400 italic">{t.common.moreFaculties.replace('{count}', (uni.faculties.length - 4).toString())}</li>
                                )}
                              </ul>
                            </div>
                            <div className="space-y-3">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-neon-blue flex items-center gap-2">
                                <ShieldCheck size={14} />
                                {t.common.admissionReq}
                              </h5>
                              <ul className="space-y-1">
                                {uni.requirements.map((r, i) => (
                                  <li key={i} className="text-[10px] font-bold text-gray-600 leading-tight flex items-start gap-2">
                                    <CheckCircle2 size={12} className="text-neon-green shrink-0 mt-0.5" />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-4 border-t-2 border-brutal-black flex flex-col sm:flex-row gap-3">
                            <a 
                              href={uni.admissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 brutal-btn bg-neon-yellow text-center py-3 text-xs font-black uppercase tracking-widest hover:bg-brutal-black hover:text-white transition-all"
                            >
                              Apply Online
                            </a>
                            <button 
                              onClick={() => handleSend(`Tell me more about the admission process for ${uni.name}. What are the specific deadlines and documents needed for the next academic year?`)}
                              className="flex-1 brutal-btn bg-white text-center py-3 text-xs font-black uppercase tracking-widest hover:bg-neon-blue hover:text-white transition-all"
                            >
                              Get Plugged Info
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="mt-12 bg-brutal-black text-white p-6 md:p-8 brutal-border rotate-[-1deg]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-neon-yellow text-brutal-black p-2 rotate-12">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">Official Admission Portals</h4>
                      <p className="text-[10px] font-bold text-neon-yellow uppercase tracking-widest italic">Direct links for current academic cycle</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {universities.filter(u => ['ub', 'uba', 'uyi', 'uyii', 'ud', 'uds', 'un', 'uma', 'ubt', 'ueb', 'uga'].includes(u.id)).map((uni) => (
                      <a 
                        key={uni.id}
                        href={uni.admissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 brutal-border-sm border-white/20 transition-all group"
                      >
                        <div>
                          <p className="text-xs font-black uppercase italic">{uni.name}</p>
                          <p className="text-[9px] font-bold text-gray-400 group-hover:text-neon-yellow transition-colors">{uni.admissionLink}</p>
                        </div>
                        <ArrowUp className="rotate-45 shrink-0 text-neon-yellow" size={16} />
                      </a>
                    ))}
                  </div>
                </div>

                <div className="mt-12 bg-brutal-black text-white p-6 md:p-8 brutal-border rotate-[-1deg]">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-neon-yellow text-brutal-black p-2 rotate-12">
                      <AlertTriangle size={24} />
                    </div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">General Admission Tips</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <span className="text-neon-pink font-black text-2xl">01</span>
                      <p className="text-xs font-bold leading-tight opacity-80">Most state universities open their online portals between July and September. Stay alert!</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-neon-blue font-black text-2xl">02</span>
                      <p className="text-xs font-bold leading-tight opacity-80">Professional schools (Polytech, FMSB, ENS) require competitive entrance exams (Concours). Prep starts now.</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-neon-green font-black text-2xl">03</span>
                      <p className="text-xs font-bold leading-tight opacity-80">Certified copies of your GCE results/Baccalauréat and birth certificate are mandatory for all applications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'saved' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto mb-8 space-y-12"
            >
              {/* Saved Universities */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-neon-green text-brutal-black p-2 rotate-[-3deg] brutal-border-sm">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.saved.unis}</h3>
                  <div className="h-[2px] flex-1 bg-brutal-black/10" />
                </div>
                
                {savedUnis.length === 0 ? (
                  <div className="brutal-border bg-white p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto opacity-30">
                      <GraduationCap size={32} />
                    </div>
                    <p className="font-black uppercase text-gray-400 tracking-widest">{t.saved.noUnis}</p>
                    <button 
                      onClick={() => setActiveTab('universities')}
                      className="text-neon-blue font-black uppercase text-xs underline underline-offset-4"
                    >
                      {t.saved.exploreUnis}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-8">
                    {universities.filter(u => savedUnis.includes(u.id)).map((uni, idx) => (
                      <motion.div 
                        key={uni.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="brutal-border bg-white overflow-hidden group hover:rotate-1 transition-transform"
                      >
                        <div className="aspect-video relative overflow-hidden border-b-2 border-brutal-black">
                          <img 
                            src={uni.image} 
                            alt={uni.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className={cn("absolute top-4 left-4 text-white px-3 py-1 font-black text-xl brutal-border-sm rotate-[-5deg]", uni.color)}>
                            {uni.shortName}
                          </div>
                          <button 
                            onClick={() => toggleSaveUni(uni.id)}
                            className="absolute top-4 right-4 p-2 bg-neon-pink text-white brutal-border-sm transition-all hover:scale-110 z-10"
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                        </div>
                        <div className="p-6">
                          <h4 className="text-xl font-black uppercase italic mb-2">{uni.name}</h4>
                          <p className="text-xs font-bold text-gray-500 mb-4">{uni.location}</p>
                          <button 
                            onClick={() => setActiveTab('universities')}
                            className="w-full py-3 bg-brutal-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-neon-blue transition-all brutal-border-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Careers */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-neon-yellow text-brutal-black p-2 rotate-[3deg] brutal-border-sm">
                    <Compass size={24} />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.saved.careers}</h3>
                  <div className="h-[2px] flex-1 bg-brutal-black/10" />
                </div>

                {savedCareers.length === 0 ? (
                  <div className="brutal-border bg-white p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto opacity-30">
                      <Compass size={32} />
                    </div>
                    <p className="font-black uppercase text-gray-400 tracking-widest">{t.saved.noCareers}</p>
                    <button 
                      onClick={() => setActiveTab('compass')}
                      className="text-neon-blue font-black uppercase text-xs underline underline-offset-4"
                    >
                      {t.saved.exploreCareers}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 md:gap-6">
                    {CAREER_COMPASS_DATA.flatMap(cat => cat.fields)
                      .filter(f => savedCareers.includes(f.name))
                      .map((field, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="brutal-border p-6 bg-white hover:bg-neon-yellow/5 transition-all group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <h5 className="text-xl font-black uppercase italic leading-tight group-hover:text-neon-blue transition-colors">{field.name}</h5>
                              <button 
                                onClick={() => toggleSaveCareer(field.name)}
                                className="p-2 bg-neon-pink text-white brutal-border-sm transition-all hover:scale-110"
                              >
                                <Heart size={14} fill="currentColor" />
                              </button>
                            </div>
                            <div className="space-y-2 text-xs">
                              <p className="font-black uppercase text-[9px] opacity-40 tracking-widest">Career Outcome</p>
                              <p className="font-black text-brutal-black">{field.career}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveTab('compass')}
                            className="mt-6 w-full py-3 bg-brutal-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-neon-yellow hover:text-brutal-black transition-all brutal-border-sm"
                          >
                            View Path
                          </button>
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>

              {/* Saved AI Recommendations */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-neon-pink text-white p-2 rotate-[-2deg] brutal-border-sm">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.saved.aiRecs}</h3>
                  <div className="h-[2px] flex-1 bg-brutal-black/10" />
                </div>

                {savedRecommendations.length === 0 ? (
                  <div className="brutal-border bg-white p-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto opacity-30">
                      <Sparkles size={32} />
                    </div>
                    <p className="font-black uppercase text-gray-400 tracking-widest">{t.saved.noAiRecs}</p>
                    <button 
                      onClick={() => {
                        setChatSection('career');
                        setIsChatOpen(true);
                      }}
                      className="text-neon-blue font-black uppercase text-xs underline underline-offset-4"
                    >
                      {t.saved.talkAi}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4 md:gap-8">
                    {savedRecommendations.map((rec, idx) => (
                      <motion.div 
                        key={rec.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="brutal-border p-6 bg-white hover:rotate-1 transition-transform relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="sticker bg-brutal-black text-white text-[8px] mb-2">{t.saved.aiSavedPath}</div>
                            <h4 className="text-xl font-black uppercase italic leading-tight">{rec.title}</h4>
                          </div>
                          <button 
                            onClick={() => removeRecommendation(rec.id)}
                            className="p-2 bg-red-500 text-white brutal-border-sm hover:scale-110 transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="markdown-body text-xs max-h-48 overflow-y-auto custom-scrollbar p-4 bg-gray-50 brutal-border-sm">
                          <ReactMarkdown>{rec.content}</ReactMarkdown>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase opacity-40">Saved on {new Date(rec.timestamp).toLocaleDateString()}</span>
                          <button 
                            onClick={() => {
                              setChatSection('career');
                              setIsChatOpen(true);
                              handleSend(`Let's pick up where we left off with this path: ${rec.title}`);
                            }}
                            className="text-[10px] font-black uppercase text-neon-blue hover:underline"
                          >
                            Resume Chat
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'market' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto mb-8 space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-brutal-black text-white p-2 rotate-[-3deg]">
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">{t.market.title}</h3>
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{t.market.subtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPostingMarketItem(true)}
                  className="brutal-btn bg-neon-yellow flex items-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <Plus size={20} />
                  {t.market.postItem} (200 XAF)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 md:gap-8">
                {marketItems.filter(item => item.category !== 'Housing').length > 0 ? (
                  marketItems.filter(item => item.category !== 'Housing').map((item, idx) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="brutal-border bg-white overflow-hidden group relative hover:rotate-1 transition-transform"
                    >
                      <div className="aspect-square relative overflow-hidden border-b-2 border-brutal-black">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-neon-pink text-white px-2 py-1 text-[10px] font-black uppercase brutal-border-sm rotate-[-5deg]">
                          {item.category}
                        </div>
                        <div className="absolute bottom-3 right-3 bg-brutal-black text-neon-yellow px-3 py-1 font-black text-lg brutal-border-sm rotate-[3deg]">
                          {item.price}
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <h4 className="font-black uppercase text-xl leading-none mb-1 group-hover:text-neon-blue transition-colors">{item.title}</h4>
                          <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-tight">{item.description}</p>
                        </div>
                        
                        <div className="pt-4 border-t-2 border-brutal-black flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-neon-purple brutal-border-sm flex items-center justify-center text-xs font-black text-white rotate-[5deg]">
                              {item.seller.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-tighter">
                              <div className="flex items-center gap-1">
                                <p className="leading-none text-brutal-black">{item.seller}</p>
                                {item.isVerified && (
                                  <ShieldCheck size={12} className="text-neon-blue fill-neon-blue/20" />
                                )}
                              </div>
                              <p className="opacity-40">{item.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <a 
                              href={`tel:${item.contact}`}
                              className="w-10 h-10 flex items-center justify-center bg-brutal-black text-white hover:bg-neon-green hover:text-brutal-black transition-all brutal-border-sm hover:rotate-12"
                            >
                              <Phone size={18} />
                            </a>
                            <button 
                              onClick={() => {
                                setPurchasingItem(item);
                                setPaymentType('ITEM_PURCHASE');
                                setShowPaywall(true);
                              }}
                              className="h-10 px-3 flex items-center justify-center bg-neon-green text-brutal-black font-black text-[10px] uppercase hover:bg-brutal-black hover:text-white transition-all brutal-border-sm"
                            >
                              BUY NOW
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center brutal-border bg-white space-y-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto opacity-30">
                      <ShoppingBag size={40} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black uppercase text-xl italic tracking-tighter">No items listed yet!</p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Be the first to post a product and start selling.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'gce' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <div className="brutal-border bg-white p-4 md:p-8 space-y-8 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl" />
                
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className="bg-brutal-black text-white p-3 rotate-3">
                    <BookOpen size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.gce.title}</h3>
                    <div className="sticker bg-neon-green text-brutal-black text-[8px] mt-1">FREE - ON EST ENSEMBLE</div>
                  </div>
                </div>
                
                <p className="font-black text-xl leading-tight relative z-10">{t.gce.subtitle}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.common.selectLevel}</label>
                    <div className="flex flex-wrap gap-3">
                      {['O', 'A'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setGceLevel(l as 'O' | 'A')}
                          className={cn(
                            "flex-1 py-3 brutal-border font-black transition-all",
                            gceLevel === l ? "bg-neon-blue text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                          )}
                        >
                          {l} {t.common.level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.gce.selectYear}</label>
                    <div className="relative group">
                      <select 
                        value={gceYear}
                        onChange={(e) => setGceYear(e.target.value)}
                        className={cn(
                          "w-full brutal-border p-3 font-black focus:ring-4 focus:ring-neon-blue outline-none appearance-none bg-white transition-all",
                          gceYear ? "border-neon-pink bg-neon-pink/5" : ""
                        )}
                      >
                        {GCE_YEARS.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.gce.selectPaper}</label>
                    <div className="relative group">
                      <select 
                        value={gcePaperType}
                        onChange={(e) => setGcePaperType(e.target.value)}
                        className={cn(
                          "w-full brutal-border p-3 font-black focus:ring-4 focus:ring-neon-blue outline-none appearance-none bg-white transition-all",
                          gcePaperType ? "border-neon-green bg-neon-green/5" : ""
                        )}
                      >
                        {['Paper 1 (MCQs)', 'Paper 2 (Structured)', 'Paper 3 (Practical)'].map(p => (
                          <option key={p} value={p}>
                            {p === 'Paper 1 (MCQs)' && t.common.paper1}
                            {p === 'Paper 2 (Structured)' && t.common.paper2}
                            {p === 'Paper 3 (Practical)' && t.common.paper3}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={16} className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.gce.selectStream}</label>
                    <div className="flex gap-2">
                      {['General', 'Technical'].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setGceStream(s as 'General' | 'Technical');
                            setGceSubject('');
                          }}
                          className={cn(
                            "flex-1 py-3 brutal-border text-xs font-black transition-all",
                            gceStream === s ? "bg-neon-yellow text-brutal-black -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                          )}
                        >
                          {s === 'General' ? t.gce.generalEducation : t.gce.technicalEducation}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.gce.selectSubject}</label>
                  <div className="relative">
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder={t.common.searchSubject} 
                        value={gceSubject || subjectSearch}
                        onFocus={() => setIsSubjectDropdownOpen(true)}
                        onChange={(e) => {
                          setSubjectSearch(e.target.value);
                          setGceSubject('');
                          setIsSubjectDropdownOpen(true);
                        }}
                        className={cn(
                          "w-full brutal-border p-3 font-black focus:ring-4 focus:ring-neon-blue outline-none bg-white transition-all",
                          gceSubject ? "border-neon-blue bg-neon-blue/5" : ""
                        )}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                    </div>

                    {isSubjectDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white brutal-border max-h-60 overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {(gceLevel === 'O' 
                           ? (gceStream === 'General' ? O_LEVEL_SUBJECTS : O_LEVEL_TECHNICAL_SUBJECTS)
                           : (gceStream === 'General' ? A_LEVEL_SUBJECTS : A_LEVEL_TECHNICAL_SUBJECTS))
                          .filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase()))
                          .map(s => (
                            <button
                              key={s}
                              onClick={() => {
                                setGceSubject(s);
                                setSubjectSearch('');
                                setIsSubjectDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left p-3 font-black hover:bg-neon-blue hover:text-white transition-colors border-b brutal-border-sm last:border-0",
                                gceSubject === s ? "bg-neon-blue/10 text-neon-blue" : ""
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        {(gceLevel === 'O' 
                           ? (gceStream === 'General' ? O_LEVEL_SUBJECTS : O_LEVEL_TECHNICAL_SUBJECTS)
                           : (gceStream === 'General' ? A_LEVEL_SUBJECTS : A_LEVEL_TECHNICAL_SUBJECTS))
                          .filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).length === 0 && (
                            <div className="p-4 text-center text-gray-400 font-black italic">No subjects found</div>
                          )}
                      </div>
                    )}
                    
                    {isSubjectDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsSubjectDropdownOpen(false)}
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(gceLevel === 'O' 
                      ? (gceStream === 'General' ? ['Mathematics', 'English Language', 'Biology', 'Physics', 'Chemistry'] : ['Electrical Technology', 'Building Construction', 'Accounting']) 
                      : (gceStream === 'General' ? ['Further Mathematics', 'Physics', 'Biology', 'Economics', 'History', 'Computer Science'] : ['Applied Mechanics', 'Electrical Power', 'Structural Mechanics'])
                    ).map(s => (
                        <button 
                          key={s}
                          onClick={() => {
                            setGceSubject(s);
                            setSubjectSearch('');
                            setIsSubjectDropdownOpen(false);
                          }}
                          className={cn(
                            "text-[9px] font-black uppercase px-2 py-1 brutal-border-sm transition-all",
                            gceSubject === s ? "bg-neon-blue text-white scale-105 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-gray-100 hover:bg-neon-blue/20"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 bg-neon-yellow/10 p-4 brutal-border-sm border-neon-yellow border-dashed flex items-start gap-4 animate-pulse hover:animate-none group transition-all cursor-default">
                      <div className="bg-neon-yellow p-2 brutal-border-sm group-hover:rotate-12 transition-transform">
                        <Zap size={20} className="text-brutal-black" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase italic tracking-tighter text-brutal-black">GCE Archive Sync Status: 100% COMPLETE</p>
                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Paper 1 (MCQs) and Paper 2 solutions are now fully operational for all subjects in {gceLevel} Level.</p>
                      </div>
                    </div>
                  </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => handleGceRequest('paper')}
                className="w-full brutal-btn bg-white text-lg sm:text-xl py-5 hover:bg-neon-pink hover:text-white group relative overflow-hidden"
              >
                <span className="flex items-center justify-center gap-3">
                  VIEW PAST PAPER
                  <BookOpen size={24} className="group-hover:animate-bounce" />
                </span>
              </button>

              <button 
                onClick={() => handleGceRequest('solution')}
                className="w-full brutal-btn bg-neon-green text-lg sm:text-xl py-5 hover:bg-neon-blue hover:text-white group relative overflow-hidden"
              >
                <span className="flex items-center justify-center gap-3">
                  GET STEP-BY-STEP SOLUTION
                  <Zap size={24} className="group-hover:animate-pulse" />
                </span>
              </button>
            </div>

                {/* Mastery Badges Section */}
                {gceMastery.badges.length > 0 && (
                  <div className="relative z-10 bg-white brutal-border p-4 mt-4">
                    <h4 className="font-black uppercase text-xs mb-3 flex items-center gap-2">
                      <Trophy size={14} className="text-neon-yellow" />
                      Your Mastery Badges
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {gceMastery.badges.slice(-5).map(badge => (
                        <div key={badge.id} className="flex items-center gap-2 bg-gray-100 brutal-border-sm p-2 animate-in fade-in slide-in-from-bottom-2">
                          <div className={cn(
                            "p-1 rounded-full",
                            badge.tier === 'Bronze' ? "bg-orange-100 text-orange-600" :
                            badge.tier === 'Silver' ? "bg-gray-200 text-gray-600" :
                            badge.tier === 'Gold' ? "bg-yellow-100 text-yellow-600" :
                            "bg-purple-100 text-purple-600"
                          )}>
                            {badge.tier === 'Bronze' ? <Medal size={16} /> :
                             badge.tier === 'Silver' ? <Award size={16} /> :
                             badge.tier === 'Gold' ? <Trophy size={16} /> :
                             <Star size={16} />}
                          </div>
                          <div>
                            <div className="text-[8px] font-black uppercase leading-none">{badge.tier} Master</div>
                            <div className="text-[10px] font-bold leading-none">{badge.subject} ({badge.level})</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-brutal-black text-white p-6 brutal-border rotate-[-1deg]">
                  <h4 className="font-black uppercase text-sm mb-4 flex items-center gap-2 text-neon-yellow">
                    <Zap size={18} />
                    Exam-Winning Techniques
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-neon-pink text-white flex items-center justify-center font-black text-xs shrink-0">01</div>
                      <p className="text-xs font-bold leading-tight">Read the entire question paper before starting. Scan for the "easy wins" first.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-neon-blue text-white flex items-center justify-center font-black text-xs shrink-0">02</div>
                      <p className="text-xs font-bold leading-tight">Manage your time: allocate minutes based on marks. Don't over-write on 2-mark questions.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-neon-green text-brutal-black flex items-center justify-center font-black text-xs shrink-0">03</div>
                      <p className="text-xs font-bold leading-tight">Use clear diagrams for Science subjects. A good sketch can save 100 words.</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 bg-neon-yellow text-brutal-black flex items-center justify-center font-black text-xs shrink-0">04</div>
                      <p className="text-xs font-bold leading-tight">Keywords are everything. GCE markers look for specific terminology in your answers.</p>
                    </div>
                  </div>
                </div>

                {/* Complete Archive Explorer */}
                <div className="space-y-6 pt-8 border-t-4 border-brutal-black">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">Official GCE Archive Explorer</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Complete Orderly Repository: 2015 — 2024</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="sticker bg-neon-pink text-white">5,000+ PAPERS</div>
                      <div className="sticker bg-neon-green text-brutal-black">VERIFIED SOLUTIONS</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 brutal-border p-6 space-y-8">
                    <div className="space-y-4">
                      <h5 className="font-black uppercase text-xs">Browse by Year (Orderly Collection)</h5>
                      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2">
                        {GCE_YEARS.map(year => (
                          <button 
                            key={year}
                            onClick={() => setGceYear(year)}
                            className={cn(
                              "py-2 brutal-border-sm text-[10px] font-black transition-all",
                              gceYear === year ? "bg-neon-pink text-white -translate-y-1" : "bg-white hover:bg-neon-pink/10"
                            )}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-black uppercase text-xs">GCE Master Library (Subjects)</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(gceLevel === 'O' 
                          ? (gceStream === 'General' ? O_LEVEL_SUBJECTS : O_LEVEL_TECHNICAL_SUBJECTS)
                          : (gceStream === 'General' ? A_LEVEL_SUBJECTS : A_LEVEL_TECHNICAL_SUBJECTS))
                          .slice(0, 15).map(subject => (
                          <button 
                            key={subject}
                            onClick={() => setGceSubject(subject)}
                            className={cn(
                              "p-3 text-left brutal-border-sm text-[10px] font-black uppercase tracking-tight flex items-center justify-between group transition-all",
                              gceSubject === subject ? "bg-neon-blue text-white" : "bg-white hover:bg-neon-blue/5"
                            )}
                          >
                            <span className="truncate mr-2">{subject}</span>
                            <ArrowRight size={12} className={cn("shrink-0 transition-transform", gceSubject === subject ? "translate-x-1" : "group-hover:translate-x-1")} />
                          </button>
                        ))}
                        <button 
                          onClick={() => setIsSubjectDropdownOpen(true)}
                          className="p-3 text-left brutal-border-sm text-[10px] font-black uppercase tracking-tight bg-brutal-black text-white hover:bg-neon-blue transition-colors flex items-center justify-center gap-2"
                        >
                          <Search size={12} />
                          Search Full Library
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {activeTab === 'compass' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto mb-8 space-y-8"
            >
              <div className="brutal-border bg-white p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-yellow/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-brutal-black text-white p-3 rotate-[-5deg]">
                      <Compass size={32} />
                    </div>
                    <div>
                      <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Career Compass</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Your future, mapped out.</p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-96">
                    <input 
                      type="text" 
                      placeholder="Search fields, series, or careers..." 
                      value={compassSearch}
                      onChange={(e) => setCompassSearch(e.target.value)}
                      className="w-full brutal-border p-4 pl-12 text-sm font-black focus:ring-4 focus:ring-neon-yellow outline-none bg-gray-50/50"
                    />
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-brutal-black opacity-40" />
                  </div>
                </div>

                <div className="space-y-16 relative z-10">
                  {CAREER_COMPASS_DATA.map((cat, idx) => {
                    const filteredFields = cat.fields.filter(f => 
                      f.name.toLowerCase().includes(compassSearch.toLowerCase()) ||
                      f.career.toLowerCase().includes(compassSearch.toLowerCase()) ||
                      f.series.toLowerCase().includes(compassSearch.toLowerCase())
                    );

                    if (filteredFields.length === 0) return null;

                    return (
                      <div key={idx} className="space-y-6">
                        <div className="flex items-center gap-4">
                          <h4 className="text-2xl font-black uppercase bg-neon-yellow inline-block px-4 py-1 brutal-border rotate-[-1deg]">{cat.category}</h4>
                          <div className="h-[2px] flex-1 bg-brutal-black/10" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredFields.map((field, fIdx) => (
                            <motion.div 
                              key={fIdx} 
                              whileHover={{ y: -5, rotate: 1 }}
                              className="brutal-border p-6 bg-white hover:bg-neon-yellow/5 transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex justify-between items-start mb-4">
                                  <h5 className="text-xl font-black uppercase italic leading-tight group-hover:text-neon-blue transition-colors">{field.name}</h5>
                                  <div className="flex flex-col items-end gap-2">
                                    <div className="sticker bg-brutal-black text-white text-[8px]">{idx + 1}.{fIdx + 1}</div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSaveCareer(field.name);
                                      }}
                                      className={cn(
                                        "p-2 brutal-border-sm transition-all hover:scale-110",
                                        savedCareers.includes(field.name) ? "bg-neon-pink text-white" : "bg-white text-gray-400"
                                      )}
                                    >
                                      <Heart size={14} fill={savedCareers.includes(field.name) ? "currentColor" : "none"} />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-4 text-xs">
                                  <div className="flex items-start gap-3">
                                    <div className="bg-neon-pink text-white p-1.5 brutal-border-sm rotate-3"><BookOpen size={14} /></div>
                                    <div>
                                      <span className="font-black uppercase text-[9px] block opacity-40 tracking-widest">{t.common.bestSeries}</span>
                                      <span className="font-black text-brutal-black">{field.series}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <div className="bg-neon-blue text-white p-1.5 brutal-border-sm -rotate-3"><Briefcase size={14} /></div>
                                    <div>
                                      <span className="font-black uppercase text-[9px] block opacity-40 tracking-widest">{t.common.careerOutcome}</span>
                                      <span className="font-black text-brutal-black">{field.career}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <div className="bg-neon-purple text-white p-1.5 brutal-border-sm rotate-6"><Home size={14} /></div>
                                    <div>
                                      <span className="font-black uppercase text-[9px] block opacity-40 tracking-widest">{t.common.topUnis}</span>
                                      <span className="font-bold text-gray-600 leading-relaxed">{field.uni}</span>
                                    </div>
                                  </div>
                                  {field.requirements && (
                                    <div className="mt-4 p-3 bg-neon-green/10 brutal-border border-dashed border-brutal-black/20">
                                      <div className="flex items-center gap-2 mb-1">
                                        <ShieldCheck size={12} className="text-neon-green" />
                                        <span className="font-black uppercase text-[9px] tracking-widest">{t.common.requirements}</span>
                                      </div>
                                      <p className="font-bold text-[10px] leading-tight text-gray-700">{field.requirements}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleSend(`Tell me more about studying ${field.name}. What are the job prospects in Cameroon vs abroad, and what's the typical salary?`)}
                                className="mt-6 w-full py-3 bg-brutal-black text-white font-black uppercase text-[10px] tracking-widest hover:bg-neon-yellow hover:text-brutal-black transition-all brutal-border-sm"
                              >
                                {t.common.explorePath}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'planner' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto mb-8 space-y-8 px-2 sm:px-0"
            >
              {/* Planner Header Card */}
              <div className="brutal-border bg-white p-4 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 hidden md:block">
                  <div className="sticker bg-neon-blue text-white rotate-12">AI POWERED</div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-brutal-black text-white p-3 rotate-[-3deg]">
                      <Calendar size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">{t.planner.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Smart Academic Management</p>
                    </div>
                  </div>
                </div>

                {/* Planner Navigation - Scrollable Tab Bar with Fade Hint */}
                <div className="relative group/tabs">
                  <div className="flex flex-nowrap overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x relative z-10">
                    <button 
                      onClick={() => setPlannerView('timetable')}
                      className={cn(
                        "flex-1 min-w-[120px] sm:min-w-[140px] p-3 sm:p-6 brutal-border font-black uppercase italic flex flex-col items-center justify-center gap-2 md:gap-3 transition-all shrink-0 snap-start",
                        plannerView === 'timetable' ? "bg-neon-blue text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <Clock size={18} className="sm:w-8 sm:h-8" />
                      <span className="text-[10px] sm:text-sm">Smart Timetable</span>
                    </button>
                    <button 
                      onClick={() => setPlannerView('tips')}
                      className={cn(
                        "flex-1 min-w-[120px] sm:min-w-[140px] p-3 sm:p-6 brutal-border font-black uppercase italic flex flex-col items-center justify-center gap-2 md:gap-3 transition-all shrink-0 snap-start",
                        plannerView === 'tips' ? "bg-neon-pink text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <Lightbulb size={18} className="sm:w-8 sm:h-8" />
                      <span className="text-[10px] sm:text-sm">Mastery Tips</span>
                    </button>
                    <button 
                      onClick={() => setPlannerView('concours')}
                      className={cn(
                        "flex-1 min-w-[120px] sm:min-w-[140px] p-3 sm:p-6 brutal-border font-black uppercase italic flex flex-col items-center justify-center gap-2 md:gap-3 transition-all shrink-0 snap-start",
                        plannerView === 'concours' ? "bg-neon-yellow text-brutal-black -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <Trophy size={18} className="sm:w-8 sm:h-8" />
                      <span className="text-[10px] sm:text-sm">Concours</span>
                    </button>
                    <button 
                      onClick={() => setPlannerView('reading')}
                      className={cn(
                        "flex-1 min-w-[120px] sm:min-w-[140px] p-3 sm:p-6 brutal-border font-black uppercase italic flex flex-col items-center justify-center gap-2 md:gap-3 transition-all shrink-0 snap-start",
                        plannerView === 'reading' ? "bg-neon-green text-brutal-black -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <Timer size={18} className="sm:w-8 sm:h-8" />
                      <span className="text-[10px] sm:text-sm">AI Timetable</span>
                    </button>
                  </div>
                  {/* Fade Gradient Hint - Always visible to hint at more content */}
                  <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />
                </div>
              </div>

              {/* Quick Access Grid (Mobile Only) */}
              <div className="lg:hidden grid grid-cols-3 gap-2">
                {[
                  { id: 'universities', label: t.nav.universities, icon: <GraduationCap size={16} />, color: 'bg-neon-green' },
                  { id: 'hustle', label: t.nav.market, icon: <DollarSign size={16} />, color: 'bg-orange-400' },
                  { id: 'housing', label: t.nav.housing, icon: <Home size={16} />, color: 'bg-indigo-400' },
                  { id: 'saved', label: t.nav.saved, icon: <Heart size={16} />, color: 'bg-neon-pink' },
                  { id: 'profile', label: t.nav.profile, icon: <User size={16} />, color: 'bg-neon-blue' },
                  { id: 'faq', label: t.mentor.title, icon: <HelpCircle size={16} />, color: 'bg-neon-yellow' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className="flex flex-col items-center justify-center gap-2 p-3 brutal-border bg-white active:scale-95 transition-all"
                  >
                    <div className={cn("p-2 brutal-border-sm text-white rotate-[-5deg]", item.color)}>
                      {item.icon}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Morning Plug */}
              {morningPlug && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="claude-card p-4 sm:p-6 bg-white relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 sm:p-4">
                    <Sparkles size={20} className="text-claude-accent/20 group-hover:text-claude-accent transition-colors sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-claude-bg p-2 sm:p-3 rounded-xl sm:rounded-2xl text-claude-accent shrink-0">
                      <Quote size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-400">Morning Plug</h4>
                      <p className="text-sm sm:text-base font-medium text-gray-700 italic leading-relaxed">"{morningPlug}"</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Exam Period Notifications */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.3em] text-gray-400 flex items-center gap-2">
                    <Bell size={14} className="text-neon-pink" />
                    {t.common.examAlerts}
                  </h4>
                  <div className="flex items-center gap-2">
                    {notifications.some(n => !n.read) && (
                      <div className="bg-neon-pink text-white text-[8px] font-black px-2 py-0.5 brutal-border-sm animate-pulse">
                        {notifications.filter(n => !n.read).length} {t.common.new}
                      </div>
                    )}
                    <button 
                      onClick={() => setIsAddingExam(!isAddingExam)}
                      className="brutal-border-sm bg-white p-1 hover:bg-neon-pink hover:text-white transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isAddingExam && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="brutal-border bg-white p-4 mb-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400">Exam Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. GCE Biology Paper 1" 
                              value={newExam.title}
                              onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                              className="w-full brutal-border-sm p-3 text-xs font-black outline-none focus:ring-2 focus:ring-neon-pink bg-gray-50/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black uppercase tracking-widest text-gray-400">Exam Date</label>
                            <input 
                              type="date" 
                              value={newExam.date}
                              onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                              className="w-full brutal-border-sm p-3 text-xs font-black outline-none focus:ring-2 focus:ring-neon-pink bg-gray-50/50"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[8px] font-black uppercase tracking-widest text-gray-400">Subjects to Focus On</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Genetics, Cell Biology" 
                            value={newExam.subjects}
                            onChange={(e) => setNewExam({ ...newExam, subjects: e.target.value })}
                            className="w-full brutal-border-sm p-3 text-xs font-black outline-none focus:ring-2 focus:ring-neon-pink bg-gray-50/50"
                          />
                        </div>
                        <button 
                          onClick={addExamNotification}
                          className="w-full brutal-btn bg-neon-pink text-white py-2 text-xs"
                        >
                          ADD EXAM & SET ALERT
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="grid grid-cols-1 gap-4">
                  {exams.map((exam) => (
                    <motion.div 
                      key={exam.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="brutal-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="p-2 brutal-border-sm rotate-[-5deg] shrink-0 bg-neon-pink text-white">
                          <Calendar size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black uppercase text-xs sm:text-sm leading-none mb-1 break-words">{exam.title}</h5>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-600 leading-tight break-words">Date: {exam.date}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {exam.subjects.map((s, i) => (
                              <span key={i} className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest bg-gray-100 px-2 py-0.5 brutal-border-sm break-words">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeExam(exam.id)}
                        className="text-[10px] font-black uppercase text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ))}
                  
                  {notifications.filter(n => n.type !== 'exam' || !exams.find(e => e.id === n.id)).map((notif) => (
                    <motion.div 
                      key={notif.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className={cn(
                        "brutal-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all",
                        notif.read ? "bg-white opacity-60" : "bg-neon-pink/5 border-neon-pink"
                      )}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={cn(
                          "p-2 brutal-border-sm rotate-[-5deg] shrink-0",
                          notif.type === 'exam' ? "bg-neon-pink text-white" : "bg-neon-yellow text-brutal-black"
                        )}>
                          <AlertTriangle size={18} className="sm:w-5 sm:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black uppercase text-xs sm:text-sm leading-none mb-1 break-words">{notif.title}</h5>
                          <p className="text-[10px] sm:text-xs font-bold text-gray-600 leading-tight break-words">{notif.message}</p>
                          <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest mt-2 opacity-40">{notif.date}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!notif.read && (
                          <button 
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="text-[10px] font-black uppercase underline underline-offset-4 hover:text-neon-pink transition-colors"
                          >
                            Dismiss
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            setPlannerView('timetable');
                            handleSend(`The ${notif.title} is coming up. My current timetable needs an update. Help me switch to an intensive study mode for my weak subjects.`);
                          }}
                          className="brutal-btn bg-brutal-black text-white text-[10px] px-4 py-2 hover:bg-neon-pink transition-all"
                        >
                          ADJUST TIMETABLE
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {plannerView === 'timetable' && (
                <div className="space-y-8">
                  <div className="brutal-border bg-white p-5 sm:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="sticker bg-neon-yellow text-brutal-black rotate-12">SMART MODE</div>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 mb-6">
                      <div className="bg-brutal-black text-white p-2 sm:p-3 rotate-[-3deg] shrink-0">
                        <Clock size={24} className="sm:w-7 sm:h-7" />
                      </div>
                      <h3 className="text-xl sm:text-3xl font-black uppercase italic leading-tight text-center sm:text-left break-words">The Plug's Smart Timetable</h3>
                    </div>
                    
                      {exams.length === 0 ? (
                        <div className="text-center py-12 space-y-4">
                          <p className="font-black text-lg opacity-40">Add your exams above to generate a personalized timetable!</p>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-end mb-4">
                            <button 
                              onClick={checkUpcomingExams}
                              className="text-[10px] font-black uppercase flex items-center gap-2 hover:text-neon-blue transition-colors"
                            >
                              <Zap size={12} />
                              Check for reminders
                            </button>
                          </div>
                          <p className="font-black text-lg mb-6 leading-tight">Based on your {exams.length} upcoming exams, I'll generate a schedule that actually works.</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                              <Zap size={14} className="text-neon-yellow" />
                              Weak Subjects (Need more focus)
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Further Math, Organic Chemistry" 
                              value={weakSubjects}
                              onChange={(e) => setWeakSubjects(e.target.value)}
                              className="w-full brutal-border-sm p-3 text-xs font-black outline-none focus:ring-2 focus:ring-neon-blue bg-gray-50/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                              <Clock size={14} className="text-neon-blue" />
                              Preferred Study Time
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {['morning', 'afternoon', 'evening', 'flexible'].map((time) => (
                                <button
                                  key={time}
                                  onClick={() => setPreferredStudyTime(time as any)}
                                  className={cn(
                                    "flex-1 min-w-[80px] p-2 text-[9px] sm:text-[10px] font-black uppercase brutal-border-sm transition-all",
                                    preferredStudyTime === time ? "bg-neon-blue text-white" : "bg-white hover:bg-gray-50"
                                  )}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                              <Timer size={14} className="text-neon-green" />
                              Daily Study Duration (Hours)
                            </label>
                            <div className="flex items-center gap-4">
                              <input 
                                type="range" 
                                min="1" 
                                max="12" 
                                step="1"
                                value={studyDuration}
                                onChange={(e) => setStudyDuration(e.target.value)}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-neon-green"
                              />
                              <div className="brutal-border-sm bg-brutal-black text-white px-4 py-1 font-black text-sm min-w-[50px] text-center">
                                {studyDuration}h
                              </div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => generateTimetable()}
                          disabled={isGeneratingTimetable}
                          className={cn(
                            "w-full brutal-btn bg-neon-blue text-white py-5 text-lg sm:text-xl flex items-center justify-center gap-4",
                            isGeneratingTimetable && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isGeneratingTimetable ? (
                            <>
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                              GENERATING...
                            </>
                          ) : (
                            "GENERATE MY SCHEDULE"
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {studyTimetable && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="claude-card p-4 sm:p-10 space-y-8 sm:space-y-10 bg-white"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 pb-4 sm:pb-6 gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="bg-claude-accent text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shrink-0">
                            <Calendar size={20} className="sm:w-7 sm:h-7" />
                          </div>
                          <div>
                            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Your Personalized Plan</h4>
                            <p className="text-[11px] sm:text-sm text-gray-500 font-medium">Crafted by AI Career Architect</p>
                          </div>
                        </div>
                        <div className="bg-claude-bg text-claude-accent px-3 py-1 rounded-full text-[9px] sm:text-[11px] font-bold uppercase tracking-widest border border-claude-accent/10">AI GENERATED</div>
                      </div>
                      
                      <div className="overflow-x-auto custom-scrollbar">
                        <div className="markdown-body">
                          {studyTimetable === "JSON_MODE" && smartTimetableData ? (
                            <div className="space-y-12">
                              <div className="bg-claude-bg p-4 sm:p-6 rounded-3xl border border-black/5">
                                <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2">Weekly Goal</h4>
                                <p className="text-base sm:text-xl font-bold text-gray-800 leading-tight">"{smartTimetableData.weeklyGoal}"</p>
                              </div>

                              <div className="space-y-10">
                                {smartTimetableData.schedule.map((day: any, dIdx: number) => (
                                  <div key={dIdx} className="space-y-4">
                                    <h5 className="font-bold text-lg text-gray-900 flex items-center gap-3">
                                      <span className="w-2 h-8 bg-claude-accent rounded-full" />
                                      {day.day}
                                    </h5>
                                    <Reorder.Group axis="y" values={day.sessions} onReorder={(newSessions) => updateSmartDaySessions(dIdx, newSessions)} className="space-y-3 sm:space-y-4">
                                      {day.sessions.map((session: any) => (
                                        <Reorder.Item 
                                          key={session.id} 
                                          value={session} 
                                          className="bg-white border border-gray-100 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-claude-accent/20 transition-all cursor-grab active:cursor-grabbing group"
                                        >
                                          <div className="flex flex-col gap-2 mb-3">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <GripVertical size={14} className="text-gray-300 group-hover:text-claude-accent transition-colors" />
                                                <span className="text-[10px] font-bold bg-brutal-black text-white px-2 py-0.5 rounded-full">{session.time}</span>
                                              </div>
                                              <span className="text-[10px] font-bold uppercase tracking-wider text-claude-accent bg-claude-accent/5 px-2 py-0.5 rounded-full">{session.subject}</span>
                                            </div>
                                            <p className="text-sm sm:text-base font-bold text-gray-800 break-words">{session.topic}</p>
                                          </div>
                                          <div className="flex items-start gap-2 text-[11px] sm:text-sm font-medium text-gray-500 bg-gray-50 p-3 rounded-xl">
                                            <Zap size={12} className="text-claude-accent shrink-0 mt-0.5 sm:w-3.5 sm:h-3.5" />
                                            <span className="italic leading-relaxed break-words">{session.tip}</span>
                                          </div>
                                        </Reorder.Item>
                                      ))}
                                    </Reorder.Group>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <ReactMarkdown>{studyTimetable}</ReactMarkdown>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">How is it going? Adapt your plan:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            onClick={() => generateTimetable("I'm finding it hard to stick to the morning sessions. Can we move more study blocks to the afternoon?")}
                            className="brutal-btn bg-white text-xs py-3 hover:bg-neon-yellow transition-all"
                          >
                            Too hard in the morning
                          </button>
                          <button 
                            onClick={() => generateTimetable("I've mastered the basics of one subject. Let's focus more on past papers for the weak ones.")}
                            className="brutal-btn bg-white text-xs py-3 hover:bg-neon-green transition-all"
                          >
                            Focus on past papers
                          </button>
                          <button 
                            onClick={() => {
                              const feedback = prompt("Tell The Plug what needs to change (e.g. 'I need more breaks', 'Add more Physics'):");
                              if (feedback) generateTimetable(feedback);
                            }}
                            className="brutal-btn bg-brutal-black text-white text-xs py-3 col-span-full"
                          >
                            Custom Feedback / Progress Update
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {plannerView === 'tips' && (
                <div className="brutal-border bg-white p-5 sm:p-8 overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-brutal-black text-white p-3 rotate-3">
                      <Lightbulb size={28} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase italic break-words">GCE Mastery & Study Notes</h3>
                  </div>
                  <p className="font-black text-lg mb-8 break-words">Access simplified notes and "exam-winning" techniques for the Cameroon GCE.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { text: "How to tackle GCE Biology Paper 2", color: "bg-neon-green" },
                      { text: "Simplified Chemistry Organic Notes", color: "bg-neon-yellow" },
                      { text: "Physics Practical Hacks", color: "bg-neon-blue" },
                      { text: "Literature in English: Plot Summaries", color: "bg-neon-pink" }
                    ].map((tip, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSend(`Give me mastery tips for: ${tip.text}`)}
                        className={cn(
                          "flex items-center gap-4 p-5 brutal-border border-dashed transition-all text-left group",
                          "bg-white hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        )}
                      >
                        <div className={cn("w-10 h-10 shrink-0 flex items-center justify-center brutal-border-sm", tip.color)}>
                          <CheckCircle2 size={20} className="text-brutal-black" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-tight group-hover:text-neon-blue">{tip.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {plannerView === 'concours' && (
                <div className="brutal-border bg-white p-5 sm:p-8 overflow-hidden">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-brutal-black text-white p-3 rotate-[-2deg]">
                      <Trophy size={28} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase italic break-words">Concours Corner</h3>
                  </div>
                  <p className="font-black text-lg mb-8 break-words">Strategies for Cameroon's most competitive university entrance exams.</p>
                  
                  {activeConcours && (
                    <div className="mb-8 p-4 sm:p-6 brutal-border bg-gray-50 relative">
                      <button 
                        onClick={() => {
                          setActiveConcours(null);
                          setConcoursStrategy(null);
                        }}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-200 brutal-border-sm"
                      >
                        <X size={20} />
                      </button>

                      {isGeneratingStrategy ? (
                        <div className="flex flex-col items-center justify-center py-16 space-y-6">
                          <div className="w-16 h-16 border-4 border-gray-100 border-t-claude-accent rounded-full animate-spin" />
                          <p className="font-bold text-gray-400 animate-pulse tracking-tight">The Plug is crafting your strategy...</p>
                        </div>
                      ) : concoursStrategy ? (
                        <div className="space-y-8 sm:space-y-12">
                          <div className="border-b border-black/5 pb-8 overflow-hidden">
                            <h4 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words">{concoursStrategy.title}</h4>
                            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-2xl break-words">{concoursStrategy.overview}</p>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
                            <div className="space-y-8 sm:space-y-10">
                              <div className="space-y-6">
                                <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-3">
                                  <Zap size={18} className="text-claude-accent" />
                                  Core Strategy
                                </h5>
                                <ul className="space-y-4">
                                  {concoursStrategy.strategy.map((s: string, i: number) => (
                                    <li key={i} className="text-sm sm:text-[15px] font-medium text-gray-700 flex gap-3 leading-relaxed break-words">
                                      <span className="w-1.5 h-1.5 bg-claude-accent rounded-full mt-2 shrink-0" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-6">
                                <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-3">
                                  <Clock size={18} className="text-claude-accent" />
                                  12-Week Timeline
                                </h5>
                                <div className="space-y-4">
                                  {concoursStrategy.timeline.map((t: any, i: number) => (
                                    <div key={i} className="p-4 sm:p-5 bg-claude-bg rounded-2xl border border-black/5 hover:border-claude-accent/20 transition-all overflow-hidden">
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-claude-accent mb-2 break-words">{t.week}</div>
                                      <div className="text-base font-bold text-gray-900 mb-2 break-words">{t.focus}</div>
                                      <ul className="space-y-1.5">
                                        {t.tasks.map((task: string, j: number) => (
                                          <li key={j} className="text-sm text-gray-500 font-medium flex gap-2 break-words">
                                            <span className="text-gray-300 shrink-0">•</span>
                                            {task}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-8 sm:space-y-10">
                              <div className="space-y-6">
                                <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-3">
                                  <BookOpen size={18} className="text-claude-accent" />
                                  Sample Past Questions
                                </h5>
                                <div className="space-y-5">
                                  {concoursStrategy.qa.map((item: any, i: number) => (
                                    <div key={i} className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4 overflow-hidden">
                                      <p className="text-sm sm:text-[15px] font-bold text-gray-900 leading-relaxed break-words">Q{i+1}: {item.question}</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {item.options.map((opt: string, j: number) => (
                                          <div key={j} className="text-xs sm:text-sm font-medium p-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-600 break-words">
                                            {opt}
                                          </div>
                                        ))}
                                      </div>
                                      <details className="group">
                                        <summary className="text-[11px] font-bold uppercase tracking-widest cursor-pointer text-gray-400 hover:text-claude-accent flex items-center gap-2 transition-colors">
                                          View Answer <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <div className="mt-4 p-4 bg-claude-bg rounded-xl border border-claude-accent/10 overflow-hidden">
                                          <div className="text-[11px] font-bold uppercase tracking-widest text-claude-accent mb-2 break-words">Correct Answer: {item.answer}</div>
                                          <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed italic break-words">{item.explanation}</p>
                                        </div>
                                      </details>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                <h5 className="font-bold text-sm uppercase tracking-widest text-gray-400 flex items-center gap-3">
                                  <AlertTriangle size={18} className="text-claude-accent" />
                                  Exam Day Tips
                                </h5>
                                <ul className="space-y-4">
                                  {concoursStrategy.examDayTips.map((tip: string, i: number) => (
                                    <li key={i} className="text-sm sm:text-[15px] font-medium text-gray-700 flex gap-3 leading-relaxed break-words">
                                      <span className="w-1.5 h-1.5 bg-claude-accent rounded-full mt-2 shrink-0" />
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="p-4 bg-neon-pink/5 brutal-border border-neon-pink">
                        <h4 className="font-black uppercase text-xs sm:text-sm mb-2 flex flex-wrap items-center gap-2">
                          <Zap size={14} className="text-neon-pink sm:w-4 sm:h-4" />
                          Medicine (CUSS, UB, UBa)
                        </h4>
                        <ul className="text-[10px] sm:text-xs font-bold space-y-2 text-gray-600">
                          <li>• Focus: Biology (60%), Chemistry (20%), Physics (10%), General Knowledge (10%).</li>
                          <li>• Strategy: Master MCQ speed. You have roughly 45 seconds per question.</li>
                          <li>• Resource: "Le Guide du Concours" & Past Papers from the last 10 years.</li>
                        </ul>
                        <button 
                          onClick={() => handleGenerateConcoursStrategy("Medicine Concours (CUSS/UB/UBa)")}
                          className="mt-4 text-[9px] sm:text-[10px] font-black uppercase underline hover:text-neon-pink"
                        >
                          Get Full Strategy
                        </button>
                      </div>

                      <div className="p-4 bg-neon-blue/5 brutal-border border-neon-blue">
                        <h4 className="font-black uppercase text-xs sm:text-sm mb-2 flex flex-wrap items-center gap-2">
                          <Zap size={14} className="text-neon-blue sm:w-4 sm:h-4" />
                          Engineering (Polytech, FET, NAHPI)
                        </h4>
                        <ul className="text-[10px] sm:text-xs font-bold space-y-2 text-gray-600">
                          <li>• Focus: Mathematics (Analysis & Algebra), Physics (Mechanics & Electricity).</li>
                          <li>• Strategy: Practice complex problem-solving. Speed is secondary to accuracy here.</li>
                          <li>• Resource: Advanced Level Further Math textbooks & Polytech Past Questions.</li>
                        </ul>
                        <button 
                          onClick={() => handleGenerateConcoursStrategy("Engineering Concours (Polytech/FET/NAHPI)")}
                          className="mt-4 text-[9px] sm:text-[10px] font-black uppercase underline hover:text-neon-blue"
                        >
                          Get Full Strategy
                        </button>
                      </div>

                      <div className="p-4 bg-neon-green/5 brutal-border border-neon-green">
                        <h4 className="font-black uppercase text-xs sm:text-sm mb-2 flex flex-wrap items-center gap-2">
                          <Zap size={14} className="text-neon-green sm:w-4 sm:h-4" />
                          Nursing (ENSPD, ENSPB, UB)
                        </h4>
                        <ul className="text-[10px] sm:text-xs font-bold space-y-2 text-gray-600">
                          <li>• Focus: Biology, Chemistry, English, and General Knowledge.</li>
                          <li>• Strategy: Focus on human anatomy and basic medical ethics.</li>
                          <li>• Resource: Biology A-Level notes and previous Nursing Concours papers.</li>
                        </ul>
                        <button 
                          onClick={() => handleGenerateConcoursStrategy("Nursing Concours (ENSPD/ENSPB)")}
                          className="mt-4 text-[9px] sm:text-[10px] font-black uppercase underline hover:text-neon-green"
                        >
                          Get Full Strategy
                        </button>
                      </div>

                      <div className="p-4 bg-neon-yellow/5 brutal-border border-neon-yellow">
                        <h4 className="font-black uppercase text-xs sm:text-sm mb-2 flex flex-wrap items-center gap-2">
                          <Zap size={14} className="text-neon-yellow sm:w-4 sm:h-4" />
                          Journalism (ASMAC / ESSTIC)
                        </h4>
                        <ul className="text-[10px] sm:text-xs font-bold space-y-2 text-gray-600">
                          <li>• Focus: General Culture, Language (French/English), and Writing Skills.</li>
                          <li>• Strategy: Read daily news. Practice writing essays on social issues.</li>
                          <li>• Resource: Newspapers (Cameroon Tribune), Current Affairs apps.</li>
                        </ul>
                        <button 
                          onClick={() => handleGenerateConcoursStrategy("Journalism Concours (ASMAC/ESSTIC)")}
                          className="mt-4 text-[9px] sm:text-[10px] font-black uppercase underline hover:text-neon-yellow"
                        >
                          Get Full Strategy
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">General Concours Tips</h4>
                      { [
                        "Start preparing at least 3 months before the exam date.",
                        "Join a 'Prep Class' if possible, but don't rely solely on them.",
                        "Master the art of elimination for MCQs.",
                        "Stay updated on current affairs for the General Knowledge section.",
                        "Practice under timed conditions to build exam stamina."
                      ].map((tip, i) => (
                        <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 brutal-border-sm">
                          <div className="mt-1 w-2 h-2 bg-neon-yellow brutal-border-sm shrink-0" />
                          <p className="text-[10px] sm:text-xs font-bold leading-tight">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {plannerView === 'reading' && (
                <div className="brutal-border bg-white p-4 sm:p-8 space-y-6 sm:space-y-8 relative overflow-hidden">
                  <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-neon-green/10 rounded-full blur-3xl" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 relative z-10">
                    <div className="bg-brutal-black text-white p-2 sm:p-3 rotate-[-3deg] shrink-0">
                      <Clock size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase italic leading-tight">AI Reading Timetable Generator</h3>
                      <div className="sticker bg-neon-green text-brutal-black text-[8px] mt-1">SMART SCHEDULING</div>
                    </div>
                  </div>

                  <p className="font-black text-base sm:text-lg leading-tight relative z-10">Input your subjects and daily study hours. Our AI will craft the perfect reading schedule for you.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
                    <div className="space-y-6 sm:space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Weak Subjects (Focus Areas)</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="text" 
                            placeholder={t.common.egPureMath} 
                            value={newStudySubject}
                            onChange={(e) => setNewStudySubject(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addStudySubject()}
                            className="w-full sm:flex-1 brutal-border p-3 text-xs sm:text-sm font-black outline-none focus:ring-4 focus:ring-neon-green bg-gray-50/50"
                          />
                          <button 
                            onClick={addStudySubject}
                            className="w-full sm:w-auto brutal-btn bg-brutal-black text-white px-6 py-3 sm:py-0 text-xs sm:text-sm"
                          >
                            ADD
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {studySubjects.map(s => (
                            <div key={s} className="flex items-center gap-2 bg-neon-green/10 brutal-border-sm px-3 py-1">
                              <span className="text-[10px] font-black uppercase">{s}</span>
                              <button onClick={() => removeStudySubject(s)} className="text-red-500 hover:scale-110">
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {studySubjects.length === 0 && (
                            <p className="text-[10px] font-bold text-gray-400 italic">No subjects added yet...</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Daily Study Duration (Hours)</label>
                        <div className="flex items-center gap-4">
                          <input 
                            type="range" 
                            min="1" 
                            max="12" 
                            step="1"
                            value={studyDuration}
                            onChange={(e) => setStudyDuration(e.target.value)}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-neon-green"
                          />
                          <div className="brutal-border bg-brutal-black text-white px-4 py-2 font-black text-xl min-w-[60px] text-center">
                            {studyDuration}h
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={generateReadingTimetable}
                          disabled={isGeneratingTimetable}
                          className={cn(
                            "flex-1 brutal-btn bg-neon-green text-lg sm:text-xl py-4 sm:py-5 group relative",
                            isGeneratingTimetable && "opacity-70 cursor-not-allowed"
                          )}
                        >
                          <span className="flex items-center justify-center gap-3 relative z-10">
                            {isGeneratingTimetable ? "CALCULATING..." : "GENERATE MY TIMETABLE"}
                            {!isGeneratingTimetable && <Zap size={20} className="group-hover:animate-pulse sm:w-6 sm:h-6" />}
                          </span>
                          {isGeneratingTimetable && (
                            <motion.div 
                              className="absolute inset-0 bg-neon-blue/20"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            />
                          )}
                        </button>
                        {generatedTimetable && (
                          <button 
                            onClick={() => setGeneratedTimetable(null)}
                            className="w-full sm:w-auto brutal-btn bg-red-500 text-white px-6 py-3 sm:py-0 hover:bg-red-600 transition-colors flex items-center justify-center"
                            title="Clear Timetable"
                          >
                            <Trash2 size={20} className="sm:w-6 sm:h-6" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Generated Schedule</label>
                      <div className="brutal-border bg-gray-50 p-4 sm:p-6 min-h-[300px]">
                        {!generatedTimetable ? (
                          <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <Clock size={40} className="sm:w-12 sm:h-12" />
                            <p className="font-black uppercase text-[10px] sm:text-xs tracking-widest">Your timetable will appear here</p>
                          </div>
                        ) : (
                          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-brutal-black text-white p-3 sm:p-4 brutal-border rotate-1">
                              <h4 className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-neon-yellow mb-1">Weekly Goal</h4>
                              <p className="text-xs sm:text-base font-bold italic leading-tight">"{generatedTimetable.weeklyGoal}"</p>
                            </div>

                            <div className="space-y-6">
                              {generatedTimetable.schedule.map((day: any, dIdx: number) => (
                                <div key={dIdx} className="space-y-3">
                                  <h5 className="font-black uppercase text-[11px] sm:text-sm border-b-2 border-brutal-black pb-1 inline-block">{day.day}</h5>
                                  <Reorder.Group axis="y" values={day.sessions} onReorder={(newSessions) => updateDaySessions(dIdx, newSessions)} className="space-y-3">
                                    {day.sessions.map((session: any) => (
                                      <Reorder.Item 
                                        key={session.id} 
                                        value={session} 
                                        className="bg-white brutal-border-sm p-3 sm:p-4 space-y-2 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-grab active:cursor-grabbing overflow-hidden"
                                      >
                                        <div className="flex flex-col gap-1 min-w-0">
                                          <div className="flex justify-between items-center gap-2">
                                            <div className="flex items-center gap-2 shrink-0">
                                              <GripVertical size={12} className="text-gray-300 sm:w-3.5 sm:h-3.5" />
                                              <span className="text-[9px] sm:text-[10px] font-black bg-neon-blue text-white px-2 py-0.5 whitespace-nowrap">{session.time}</span>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase text-neon-pink truncate">{session.subject}</span>
                                          </div>
                                          <p className="text-xs sm:text-sm font-black leading-tight break-words">{session.topic}</p>
                                        </div>
                                        <div className="flex items-start gap-2 text-[9px] sm:text-[10px] font-bold text-gray-500 italic leading-tight break-words">
                                          <Zap size={10} className="text-neon-yellow shrink-0 mt-0.5" />
                                          {session.tip}
                                        </div>
                                        {session.resources && session.resources.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {session.resources.map((res: string, rIdx: number) => (
                                              <span key={rIdx} className="text-[8px] font-black bg-gray-100 px-1.5 py-0.5 brutal-border-sm">
                                                {res}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </Reorder.Item>
                                    ))}
                                  </Reorder.Group>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'hustle' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-8"
            >
              <div className="brutal-border bg-white p-4 md:p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-neon-purple" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-brutal-black text-white p-3 rotate-[-5deg]">
                    <Briefcase size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">Student-Preneur Idea Generator</h3>
                    <div className="sticker bg-neon-purple text-white text-[8px] mt-1">GET THE BAG</div>
                  </div>
                </div>
                
                <p className="font-black text-xl leading-tight">Plug me into your situation, and I'll find the perfect side hustle for you.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <MapPin size={14} className="text-neon-purple" />
                      Location
                    </label>
                    <input 
                      type="text" 
                      placeholder={t.common.egMolyko} 
                      value={hustleLocation}
                      onChange={(e) => setHustleLocation(e.target.value)}
                      className="w-full brutal-border p-4 text-sm font-black focus:ring-4 focus:ring-neon-purple outline-none bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <Coins size={14} className="text-neon-purple" />
                      {t.common.capital}
                    </label>
                    <input 
                      type="text" 
                      placeholder={t.common.egCapital} 
                      value={hustleCapital}
                      onChange={(e) => setHustleCapital(e.target.value)}
                      className="w-full brutal-border p-4 text-sm font-black focus:ring-4 focus:ring-neon-purple outline-none bg-gray-50/50"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <Timer size={14} className="text-neon-purple" />
                      {t.common.freeTime}
                    </label>
                    <input 
                      type="text" 
                      placeholder={t.common.egFreeTime} 
                      value={hustleTime}
                      onChange={(e) => setHustleTime(e.target.value)}
                      className="w-full brutal-border p-4 text-sm font-black focus:ring-4 focus:ring-neon-purple outline-none bg-gray-50/50"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!hustleLocation || !hustleCapital || !hustleTime) {
                      toast.error(t.common.fillAllFields, {
                        className: 'brutal-border bg-neon-pink text-white font-black uppercase italic',
                      });
                      return;
                    }
                    handleSend(`I am a student in ${hustleLocation} with ${hustleCapital} XAF capital and ${hustleTime} of free time daily. Plug me into a business idea I can start today.`);
                  }}
                  className="w-full brutal-btn bg-neon-purple text-white text-lg sm:text-xl py-5 hover:bg-brutal-black transition-all"
                >
                  {t.common.generateIdea}
                </button>

                <div className="bg-neon-purple/5 p-6 brutal-border border-dashed border-brutal-black/30 flex items-start gap-4">
                  <div className="bg-brutal-black text-neon-purple p-2 brutal-border-sm rotate-12 shrink-0">
                    <Zap size={24} />
                  </div>
                  <p className="text-sm font-black uppercase leading-tight text-brutal-black/80">
                    {t.common.plugTip}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'housing' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto mb-8 space-y-6"
            >
              {/* Housing Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t.housing.title}</h2>
                  <p className="font-black text-gray-400 uppercase tracking-tight mt-1">{t.housing.subtitle}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setHousingView('browse')}
                    className={cn(
                      "flex-1 md:flex-none brutal-btn px-4 py-2 text-xs font-black uppercase",
                      housingView === 'browse' ? "bg-neon-blue text-white" : "bg-white"
                    )}
                  >
                    {t.housing.findHouse}
                  </button>
                  <button 
                    onClick={() => setHousingView('post')}
                    className={cn(
                      "flex-1 md:flex-none brutal-btn px-4 py-2 text-xs font-black uppercase",
                      housingView === 'post' ? "bg-neon-green text-brutal-black" : "bg-white"
                    )}
                  >
                    {t.housing.postHouse}
                  </button>
                  <button 
                    onClick={() => setHousingView('my-listings')}
                    className={cn(
                      "flex-1 md:flex-none brutal-btn px-4 py-2 text-xs font-black uppercase",
                      housingView === 'my-listings' ? "bg-neon-yellow text-brutal-black" : "bg-white"
                    )}
                  >
                    {t.housing.myListings}
                  </button>
                  <button 
                    onClick={() => setHousingView('chats')}
                    className={cn(
                      "flex-1 md:flex-none brutal-btn px-4 py-2 text-xs font-black uppercase relative",
                      housingView === 'chats' ? "bg-neon-pink text-white" : "bg-white"
                    )}
                  >
                    {t.housing.chats}
                    {conversations.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full brutal-border-sm">
                        {conversations.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {housingView === 'browse' && (
                <div className="space-y-6">
                  {/* Anti-Scam Banner */}
                  <div className="brutal-border bg-neon-yellow p-4 flex items-center gap-4 rotate-[-1deg]">
                    <AlertTriangle size={24} className="shrink-0" />
                    <p className="text-xs font-black uppercase leading-tight">
                      {t.common.antiScamAlert}
                    </p>
                  </div>

                  {/* Listings Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.length === 0 ? (
                      <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                        <Home size={64} className="mx-auto" />
                        <p className="font-black uppercase text-xl">{t.common.noListings}</p>
                      </div>
                    ) : (
                      listings.map((listing) => (
                        <motion.div 
                          key={listing.id}
                          whileHover={{ y: -5 }}
                          className="brutal-border bg-white overflow-hidden flex flex-col"
                        >
                          <div className="h-48 bg-gray-200 relative">
                            {listing.images && listing.images.length > 0 ? (
                              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={48} />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-brutal-black text-neon-green px-3 py-1 font-black text-sm brutal-border-sm">
                              {listing.price.toLocaleString()} XAF
                            </div>
                          </div>
                          <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                              <h3 className="font-black uppercase text-lg leading-tight truncate pr-2">{listing.title}</h3>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin size={14} />
                              <span className="text-[10px] font-bold uppercase">{listing.location}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 flex-1">{listing.description}</p>
                            <div className="pt-2 flex gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setActiveImageIndex(0);
                                }}
                                className="flex-1 brutal-btn bg-white text-[10px] font-black py-2"
                              >
                                {t.common.details}
                              </button>
                              <button 
                                onClick={() => startConversation(listing)}
                                className="flex-1 brutal-btn bg-neon-blue text-white text-[10px] font-black py-2"
                              >
                                {t.common.chatNow}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {housingView === 'post' && (
                <div className="max-w-2xl mx-auto">
                  <div className="brutal-border bg-white p-6 md:p-10 space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.common.postHouseTitle}</h3>
                      <p className="text-sm font-bold text-gray-400 uppercase">{t.common.postHouseDesc}</p>
                    </div>

                    <div className="bg-neon-blue/10 p-4 brutal-border border-dashed border-neon-blue flex items-center gap-4">
                      <Coins size={32} className="text-neon-blue" />
                      <div>
                        <p className="text-xs font-black uppercase">{t.common.listingFee}</p>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">{t.common.listingFeeDesc}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">House Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Modern Mini-Cité near UB Gate"
                          value={newListing.title}
                          onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                          className="w-full brutal-border p-4 font-black outline-none focus:ring-4 focus:ring-neon-green"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (XAF/Month)</label>
                          <input 
                            type="number" 
                            placeholder="e.g. 25000"
                            value={newListing.price}
                            onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                            className="w-full brutal-border p-4 font-black outline-none focus:ring-4 focus:ring-neon-green"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Molyko, Buea"
                            value={newListing.location}
                            onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                            className="w-full brutal-border p-4 font-black outline-none focus:ring-4 focus:ring-neon-green"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detailed Description</label>
                        <textarea 
                          rows={4}
                          placeholder="Describe the room, water situation, light, security, etc."
                          value={newListing.description}
                          onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                          className="w-full brutal-border p-4 font-black outline-none focus:ring-4 focus:ring-neon-green resize-none"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center justify-between">
                          <span>House Pictures (Max 5MB per image)</span>
                          <span className={cn("text-[8px]", newListing.images.length >= 5 ? "text-red-500" : "text-neon-green")}>
                            {newListing.images.length}/5 Images
                          </span>
                        </label>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {newListing.images.map((url, idx) => (
                            <div key={idx} className="relative aspect-square brutal-border overflow-hidden group">
                              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <button 
                                onClick={() => setNewListing({ ...newListing, images: newListing.images.filter((_, i) => i !== idx) })}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          {newListing.images.length < 5 && (
                            <label className={cn(
                              "aspect-square brutal-border border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors",
                              isUploadingImages && "opacity-50 cursor-not-allowed"
                            )}>
                              <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={handleListingImageUpload}
                                disabled={isUploadingImages}
                                className="hidden"
                              />
                              {isUploadingImages ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-green" />
                              ) : (
                                <>
                                  <Plus size={24} className="text-gray-400" />
                                  <span className="text-[8px] font-black uppercase text-gray-400">Add Photo</span>
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">MoMo/OM Number for Payment</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 6XXXXXXXX"
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          className="w-full brutal-border p-4 font-black outline-none focus:ring-4 focus:ring-neon-green"
                        />
                      </div>

                      <button 
                        onClick={postListing}
                        disabled={isPayingListingFee}
                        className={cn(
                          "w-full brutal-btn bg-neon-green text-xl py-5 font-black uppercase italic group relative overflow-hidden",
                          isPayingListingFee && "opacity-70 cursor-not-allowed"
                        )}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {isPayingListingFee ? "PROCESSING PAYMENT..." : "PAY 2000 XAF & POST"}
                          {!isPayingListingFee && <Zap size={24} />}
                        </span>
                        {isPayingListingFee && (
                          <motion.div 
                            className="absolute inset-0 bg-white/20"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {housingView === 'my-listings' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">My Listings</h3>
                    <div className="bg-neon-yellow text-brutal-black px-3 py-1 text-[10px] font-black brutal-border-sm">
                      {listings.filter(l => l.ownerId === user?.uid).length} LISTINGS
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.filter(l => l.ownerId === user?.uid).length === 0 ? (
                      <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                        <Plus size={64} className="mx-auto" />
                        <p className="font-black uppercase text-xl">You haven't posted any houses yet.</p>
                        <button 
                          onClick={() => setHousingView('post')}
                          className="brutal-btn bg-neon-green px-6 py-2 text-xs font-black uppercase"
                        >
                          Post Your First House
                        </button>
                      </div>
                    ) : (
                      listings.filter(l => l.ownerId === user?.uid).map((listing) => (
                        <div 
                          key={listing.id}
                          className="brutal-border bg-white overflow-hidden flex flex-col"
                        >
                          <div className="h-48 bg-gray-200 relative">
                            {listing.images && listing.images.length > 0 ? (
                              <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={48} />
                              </div>
                            )}
                            <div className="absolute top-2 right-2 bg-brutal-black text-neon-green px-3 py-1 font-black text-sm brutal-border-sm">
                              {listing.price.toLocaleString()} XAF
                            </div>
                          </div>
                          <div className="p-4 space-y-3 flex-1 flex flex-col">
                            <h3 className="font-black uppercase text-lg leading-tight truncate">{listing.title}</h3>
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin size={14} />
                              <span className="text-[10px] font-bold uppercase">{listing.location}</span>
                            </div>
                            <div className="pt-2 flex gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedListing(listing);
                                  setActiveImageIndex(0);
                                }}
                                className="flex-1 brutal-btn bg-white text-[10px] font-black py-2"
                              >
                                VIEW
                              </button>
                              <button 
                                onClick={() => setHousingView('chats')}
                                className="flex-1 brutal-btn bg-neon-pink text-white text-[10px] font-black py-2"
                              >
                                CHATS
                              </button>
                              <button 
                                onClick={() => {
                                  // Mark as sold logic could go here
                                  toast.success("Listing updated!");
                                }}
                                className="flex-1 brutal-btn bg-brutal-black text-white text-[10px] font-black py-2"
                              >
                                MANAGE
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {housingView === 'chats' && (
                <div className="grid grid-cols-1 md:grid-cols-3 brutal-border bg-white h-[calc(100dvh-250px)] md:h-[600px] overflow-hidden">
                  {/* Conversations List */}
                  <div className={cn("border-r-4 border-brutal-black overflow-y-auto", activeConversation && "hidden md:block")}>
                    <div className="p-4 border-b-4 border-brutal-black bg-gray-50">
                      <h3 className="font-black uppercase text-sm">Messages</h3>
                    </div>
                    {conversations.length === 0 ? (
                      <div className="p-8 text-center opacity-30 space-y-2">
                        <MessageSquare size={32} className="mx-auto" />
                        <p className="text-[10px] font-black uppercase">No chats yet</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <button 
                          key={conv.id}
                          onClick={() => setActiveConversation(conv)}
                          className={cn(
                            "w-full p-4 text-left border-b-2 border-gray-100 hover:bg-gray-50 transition-colors",
                            activeConversation?.id === conv.id && "bg-neon-blue/10 border-l-4 border-l-neon-blue"
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-black uppercase text-xs truncate flex-1">{conv.listingTitle}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase ml-2">
                              {new Date(conv.lastTimestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-[9px] font-black text-neon-blue uppercase mt-1">
                            {user?.uid === conv.studentId ? conv.landlordName : conv.studentName}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate mt-1">{conv.lastMessage}</p>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Chat Area */}
                  <div className={cn("md:col-span-2 flex flex-col bg-gray-50/50", !activeConversation && "hidden md:flex")}>
                    {activeConversation ? (
                      <>
                        <div className="p-4 border-b-4 border-brutal-black bg-white flex justify-between items-center">
                          <div>
                            <h3 className="font-black uppercase text-sm">{activeConversation.listingTitle}</h3>
                            <p className="text-[8px] font-black text-neon-blue uppercase">
                              Chatting with {user?.uid === activeConversation.studentId ? activeConversation.landlordName : activeConversation.studentName}
                            </p>
                          </div>
                          <button onClick={() => setActiveConversation(null)} className="md:hidden bg-gray-100 p-2 brutal-border-sm">
                            <ArrowLeft size={20} />
                          </button>
                        </div>

                        <div 
                          ref={chatScrollRef}
                          className="flex-1 overflow-y-auto p-4 space-y-4"
                        >
                          {chatMessages.map((msg) => {
                            const isMe = msg.senderId === user?.uid;
                            const senderName = isMe ? 'You' : (user?.uid === activeConversation.studentId ? activeConversation.landlordName : activeConversation.studentName);
                            return (
                              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                <span className="text-[8px] font-black uppercase text-gray-400 mb-1 px-1">
                                  {senderName}
                                </span>
                                <div 
                                  className={cn(
                                    "max-w-[80%] p-3 brutal-border-sm text-xs font-bold",
                                    isMe ? "bg-neon-blue text-white" : "bg-white text-brutal-black"
                                  )}
                                >
                                  {msg.message}
                                  <p className={cn("text-[8px] mt-1 opacity-50", isMe ? "text-right" : "text-left")}>
                                    {msg.timestamp?.seconds 
                                      ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                      : '...'}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-4 bg-white border-t-4 border-brutal-black flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            className="flex-1 brutal-border p-3 text-xs font-black outline-none focus:ring-2 focus:ring-neon-blue"
                          />
                          <button 
                            onClick={sendMessage}
                            className="brutal-btn bg-brutal-black text-white px-4"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="opacity-20">
                          <MessageSquare size={64} className="mx-auto" />
                          <p className="font-black uppercase text-xl mt-4">Select a conversation</p>
                          <p className="text-xs font-bold uppercase">Choose a chat from the list to start messaging</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Listing Details Modal */}
          <AnimatePresence>
            {selectedListing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brutal-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white brutal-border w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[80]"
                >
                  <button 
                    onClick={() => setSelectedListing(null)}
                    className="absolute top-4 right-4 z-10 bg-white brutal-border-sm p-1 hover:rotate-90 transition-transform"
                  >
                    <X size={24} />
                  </button>

                  <div className="space-y-4">
                    <div className="h-64 md:h-80 bg-gray-200 relative">
                      {selectedListing.images && selectedListing.images.length > 0 ? (
                        <img 
                          src={selectedListing.images[activeImageIndex] || selectedListing.images[0]} 
                          alt={selectedListing.title} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={64} />
                        </div>
                      )}
                      {selectedListing.images && selectedListing.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-brutal-black/50 p-2 brutal-border-sm backdrop-blur-sm">
                          {selectedListing.images.map((_, idx) => (
                            <button 
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={cn(
                                "w-3 h-3 brutal-border-sm transition-all",
                                activeImageIndex === idx ? "bg-neon-green scale-125" : "bg-white hover:bg-gray-200"
                              )}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedListing.images && selectedListing.images.length > 1 && (
                      <div className="flex gap-2 px-6 overflow-x-auto pb-2 custom-scrollbar">
                        {selectedListing.images.map((url, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={cn(
                              "w-20 h-20 brutal-border shrink-0 overflow-hidden transition-all",
                              activeImageIndex === idx ? "ring-4 ring-neon-green scale-95" : "opacity-70 hover:opacity-100"
                            )}
                          >
                            <img src={url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 md:p-10 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{selectedListing.title}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <MapPin size={16} className="text-neon-blue" />
                          <span className="text-xs font-black uppercase tracking-widest text-gray-500">{selectedListing.location}</span>
                        </div>
                      </div>
                      <div className="bg-neon-green text-brutal-black px-6 py-2 text-2xl font-black brutal-border rotate-2">
                        {selectedListing.price.toLocaleString()} XAF
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</h4>
                      <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedListing.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6">
                      <div className="p-4 brutal-border bg-gray-50">
                        <p className="text-[10px] font-black uppercase text-gray-400">Posted By</p>
                        <p className="font-black uppercase">{selectedListing.ownerName}</p>
                      </div>
                      <div className="p-4 brutal-border bg-gray-50">
                        <p className="text-[10px] font-black uppercase text-gray-400">Date Posted</p>
                        <p className="font-black uppercase">{new Date(selectedListing.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        startConversation(selectedListing);
                        setSelectedListing(null);
                      }}
                      className="w-full brutal-btn bg-neon-blue text-white text-xl py-5 font-black uppercase italic"
                    >
                      CHAT WITH LANDLORD
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'guide' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-12 pb-20"
            >
              <div className="text-center space-y-4">
                <div className="inline-block bg-neon-pink text-white p-4 -rotate-3 brutal-border mb-4">
                  <Info size={48} />
                </div>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">{t.guide.title}</h2>
                <p className="font-black text-xl text-gray-400 uppercase tracking-tight">{t.guide.subtitle}</p>
              </div>

              <div className="space-y-12">
                {/* Step 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="inline-block bg-brutal-black text-white px-4 py-1 font-black uppercase italic">Step 01</div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t.guide.step1Title}</h3>
                    <p className="font-bold text-gray-600 leading-relaxed">{t.guide.step1Desc}</p>
                    <button 
                      onClick={() => setActiveTab('planner')}
                      className="brutal-btn bg-neon-green px-6 py-2 font-black uppercase text-xs"
                    >
                      {t.guide.step1Btn}
                    </button>
                  </div>
                  <div className="brutal-border bg-white p-4 rotate-2">
                    <div className="aspect-video bg-gray-100 brutal-border-sm flex items-center justify-center">
                      <Calendar size={64} className="text-neon-green" />
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="brutal-border bg-white p-4 -rotate-2 order-2 md:order-1">
                    <div className="aspect-video bg-gray-100 brutal-border-sm flex items-center justify-center">
                      <BookOpen size={64} className="text-neon-blue" />
                    </div>
                  </div>
                  <div className="space-y-4 order-1 md:order-2">
                    <div className="inline-block bg-brutal-black text-white px-4 py-1 font-black uppercase italic">Step 02</div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{t.guide.step2Title}</h3>
                    <p className="font-bold text-gray-600 leading-relaxed">{t.guide.step2Desc}</p>
                    <button 
                      onClick={() => setActiveTab('gce')}
                      className="brutal-btn bg-neon-blue text-white px-6 py-2 font-black uppercase text-xs"
                    >
                      {t.guide.step2Btn}
                    </button>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="inline-block bg-brutal-black text-white px-4 py-1 font-black uppercase italic">Step 03</div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Housing & Market</h3>
                    <p className="font-bold text-gray-600 leading-relaxed">Need a room near campus? Or want to sell your old textbooks? The **Housing** and **Market** tabs are where students connect. Real-time chat makes it easy to close deals.</p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setActiveTab('housing')}
                        className="brutal-btn bg-neon-yellow px-6 py-2 font-black uppercase text-xs"
                      >
                        Find Housing
                      </button>
                      <button 
                        onClick={() => setActiveTab('market')}
                        className="brutal-btn bg-neon-pink text-white px-6 py-2 font-black uppercase text-xs"
                      >
                        Visit Market
                      </button>
                    </div>
                  </div>
                  <div className="brutal-border bg-white p-4 rotate-1">
                    <div className="aspect-video bg-gray-100 brutal-border-sm flex items-center justify-center">
                      <Home size={64} className="text-neon-yellow" />
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="brutal-border bg-white p-4 -rotate-1 order-2 md:order-1">
                    <div className="aspect-video bg-gray-100 brutal-border-sm flex items-center justify-center">
                      <Compass size={64} className="text-orange-400" />
                    </div>
                  </div>
                  <div className="space-y-4 order-1 md:order-2">
                    <div className="inline-block bg-brutal-black text-white px-4 py-1 font-black uppercase italic">Step 04</div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Career Compass</h3>
                    <p className="font-bold text-gray-600 leading-relaxed">Not sure what to do after graduation? Our AI Career Architect helps you map out your future based on your GCE results and interests. Ask anything!</p>
                    <button 
                      onClick={() => setActiveTab('compass')}
                      className="brutal-btn bg-orange-400 text-white px-6 py-2 font-black uppercase text-xs"
                    >
                      Map My Career
                    </button>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-brutal-black text-white p-8 brutal-border text-center space-y-6">
                  <div className="inline-block bg-neon-green text-brutal-black px-4 py-1 font-black uppercase italic">Final Step</div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter">Go Unlimited with Pro</h3>
                  <p className="font-bold text-gray-400 max-w-2xl mx-auto">{t.common.unlockGce}</p>
                  <button 
                    onClick={() => {
                      setPaymentType('UPGRADE');
                      setShowPaywall(true);
                    }}
                    className="brutal-btn bg-neon-pink text-white px-12 py-4 text-xl hover:scale-105 transition-all"
                  >
                    UPGRADE TO PRO NOW
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-block bg-neon-green text-white p-4 rotate-3 brutal-border mb-4">
                  <HelpCircle size={48} />
                </div>
                <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none">FAQs & <br /> Mastery Hub</h2>
                <p className="font-black text-xl text-gray-400 uppercase tracking-tight">Everything you need to know about the student journey in Cameroon</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div className="bg-brutal-black text-white p-6 brutal-border rotate-[-1deg]">
                    <h3 className="text-2xl font-black uppercase italic mb-4 text-neon-green">University Admissions</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase text-neon-pink tracking-widest">How do I apply to State Universities?</p>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed">{t.common.stateUniInfo}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase text-neon-pink tracking-widest">What are the deadlines?</p>
                        <p className="text-xs font-bold text-gray-400 leading-relaxed">Deadlines typically fall between August and October. Professional schools (Concours) often have earlier deadlines in June/July.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 brutal-border rotate-[1deg]">
                    <h3 className="text-2xl font-black uppercase italic mb-4 text-brutal-black">GCE Mastery</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase text-neon-blue tracking-widest">How can I access past papers?</p>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed">Go to the "GCE Mastery" tab. Premium users get access to full solutions for official past papers dating back to 2015 for all major subjects.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase text-neon-blue tracking-widest">When are GCE results usually out?</p>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed">Results are typically released in late July or early August. You can check them via SMS or at your local center.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-neon-yellow p-6 brutal-border rotate-[2deg]">
                    <h3 className="text-2xl font-black uppercase italic mb-4 text-brutal-black">Career Planning</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase tracking-widest">Which fields pay best in Cameroon?</p>
                        <p className="text-xs font-bold text-brutal-black/70 leading-relaxed">Currently, Tech (Software Dev), Medicine, Engineering, and specialized Business roles are high in demand. Use our AI Career Architect to find your specific fit!</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase tracking-widest">How do I choose a major?</p>
                        <p className="text-xs font-bold text-brutal-black/70 leading-relaxed">Don't just follow the crowd. Look at your GCE performance, your interests, and the job market. Our "Career Compass" tool can help you map this out.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neon-blue text-white p-6 brutal-border rotate-[-2deg]">
                    <h3 className="text-2xl font-black uppercase italic mb-4">The Plug Premium</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase text-neon-yellow tracking-widest">How do I pay for Premium?</p>
                        <p className="text-xs font-bold text-white/80 leading-relaxed">Click "GO UNLIMITED". Enter your MoMo number and pay. You'll need to dial *126# on your phone to confirm the transaction.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-sm uppercase text-neon-yellow tracking-widest">Is my data safe?</p>
                        <p className="text-xs font-bold text-white/80 leading-relaxed">Absolutely. We don't store your MoMo PIN. All transactions are handled securely via standard network protocols.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brutal-black text-white p-12 brutal-border text-center space-y-6">
                <h3 className="text-4xl font-black uppercase italic tracking-tighter">{t.common.stillQuestions}</h3>
                <p className="font-black text-gray-400">{t.common.aiCareerDesc}</p>
                <button 
                  onClick={() => {
                    setChatSection('career');
                    setIsChatOpen(true);
                  }}
                  className="brutal-btn bg-neon-pink text-white px-8 py-4 text-xl hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                >
                  {t.common.chatAiNow}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mb-8 space-y-8"
            >
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">{t.profile.settings}</h4>
                <div className="brutal-border p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h5 className="font-black uppercase text-sm">{t.profile.notifications}</h5>
                    <p className="text-[10px] font-bold text-gray-500">{t.profile.notificationsDesc}</p>
                  </div>
                  <button 
                    onClick={requestNotificationPermission}
                    disabled={notificationsPermission === 'granted'}
                    className={cn(
                      "brutal-btn text-[10px] px-4 py-2 w-full sm:w-auto",
                      notificationsPermission === 'granted' ? "bg-neon-green text-brutal-black" : "bg-neon-blue text-white"
                    )}
                  >
                    {notificationsPermission === 'granted' ? t.profile.enabled : t.profile.enable}
                  </button>
                </div>
              </div>

              <div className="flex flex-nowrap overflow-x-auto gap-4 pb-2 custom-scrollbar">
                <button 
                  onClick={() => setProfileView('details')}
                  className={cn(
                    "flex-1 min-w-[140px] brutal-btn text-sm py-4 font-black uppercase italic tracking-tighter transition-all shrink-0",
                    profileView === 'details' ? "bg-brutal-black text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-brutal-black hover:bg-gray-50"
                  )}
                >
                  {t.profile.details}
                </button>
                <button 
                  onClick={() => setProfileView('history')}
                  className={cn(
                    "flex-1 min-w-[140px] brutal-btn text-[10px] py-4 font-black uppercase italic tracking-tighter transition-all shrink-0",
                    profileView === 'history' ? "bg-neon-pink text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-brutal-black hover:bg-gray-50"
                  )}
                >
                  {t.profile.history}
                </button>
                <button 
                  onClick={() => setProfileView('mastery')}
                  className={cn(
                    "flex-1 min-w-[140px] brutal-btn text-[10px] py-4 font-black uppercase italic tracking-tighter transition-all shrink-0",
                    profileView === 'mastery' ? "bg-neon-yellow text-brutal-black -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-white text-brutal-black hover:bg-gray-50"
                  )}
                >
                  {t.nav.gce}
                </button>
              </div>

              {profileView === 'details' && (
                <div className="brutal-border bg-white p-4 md:p-8 space-y-8 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="bg-brutal-black text-white p-3 rotate-3">
                      <User size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{t.profile.academicProfile}</h3>
                      <div className="sticker bg-neon-blue text-white text-[8px] mt-1">{t.profile.personalizedAi}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.profile.fullName}</label>
                        <input 
                          type="text" 
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full brutal-border p-4 text-sm font-black outline-none focus:ring-4 focus:ring-neon-blue transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.profile.desiredField}</label>
                        <input 
                          type="text" 
                          value={userProfile.desiredField}
                          onChange={(e) => setUserProfile({ ...userProfile, desiredField: e.target.value })}
                          placeholder="e.g. Software Engineering"
                          className="w-full brutal-border p-4 text-sm font-black outline-none focus:ring-4 focus:ring-neon-blue transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.profile.academicHistory}</label>
                        <textarea 
                          value={userProfile.academicHistory}
                          onChange={(e) => setUserProfile({ ...userProfile, academicHistory: e.target.value })}
                          placeholder="e.g. GCE A-Level: 5 papers (Bio A, Chem B, Phys B, Math C, Eng C)"
                          rows={5}
                          className="w-full brutal-border p-4 text-sm font-black outline-none focus:ring-4 focus:ring-neon-blue transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.profile.preferredUnis}</label>
                      <input 
                        type="text" 
                        value={userProfile.preferredUniversities}
                        onChange={(e) => setUserProfile({ ...userProfile, preferredUniversities: e.target.value })}
                        placeholder="e.g. University of Buea, Polytech Yaounde"
                        className="w-full brutal-border p-4 text-sm font-black outline-none focus:ring-4 focus:ring-neon-blue transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.profile.careerInterests}</label>
                      <input 
                        type="text" 
                        value={userProfile.careerInterests}
                        onChange={(e) => setUserProfile({ ...userProfile, careerInterests: e.target.value })}
                        placeholder="e.g. Cybersecurity, AI Research, FinTech"
                        className="w-full brutal-border p-4 text-sm font-black outline-none focus:ring-4 focus:ring-neon-blue transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-8 border-t-2 border-brutal-black/10 relative z-10">
                    <div className="bg-neon-yellow/10 p-6 brutal-border border-dashed border-brutal-black/30 flex items-start gap-4">
                      <Sparkles size={24} className="text-neon-yellow shrink-0" />
                      <div>
                        <h4 className="font-black uppercase text-sm mb-1">{t.profile.aiPersonalization}</h4>
                        <p className="text-xs font-bold text-gray-600 leading-tight">{t.profile.aiPersonalizationDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {profileView === 'history' && (
                <div className="brutal-border bg-white p-4 md:p-8 space-y-8 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-neon-pink/10 rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="bg-brutal-black text-white p-3 rotate-3">
                      <CreditCard size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">Payment History</h3>
                      <div className="sticker bg-neon-pink text-white text-[8px] mt-1">PREMIUM ACCESS</div>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {paymentHistory.length === 0 ? (
                      <div className="text-center py-12 brutal-border border-dashed border-brutal-black/20">
                        <p className="font-black text-lg opacity-40 uppercase tracking-tighter">No payment records found.</p>
                        <button 
                          onClick={() => {
                            setPaymentType('UPGRADE');
                            setShowPaywall(true);
                          }}
                          className="mt-4 brutal-btn bg-neon-pink text-white px-6 py-2 text-xs"
                        >
                          UPGRADE TO PREMIUM
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-brutal-black text-white">
                              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Date</th>
                              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Plan</th>
                              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Amount</th>
                              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Duration</th>
                              <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentHistory.map((record) => (
                              <tr key={record.id} className="border-b-2 border-brutal-black/10 hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-xs font-bold">{record.date}</td>
                                <td className="p-4 text-xs font-black uppercase tracking-tighter">{record.plan}</td>
                                <td className="p-4 text-xs font-black">{record.amount}</td>
                                <td className="p-4 text-xs font-bold">{record.duration}</td>
                                <td className="p-4">
                                  <span className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-2 py-1 brutal-border-sm",
                                    record.status === 'Completed' ? "bg-neon-green text-brutal-black" : 
                                    record.status === 'Pending' ? "bg-neon-yellow text-brutal-black" : "bg-neon-pink text-white"
                                  )}>
                                    {record.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 border-t-2 border-brutal-black/10 relative z-10">
                    <div className="bg-neon-blue/10 p-6 brutal-border border-dashed border-brutal-black/30 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Zap size={24} className="text-neon-blue shrink-0" />
                        <div>
                          <h4 className="font-black uppercase text-sm mb-1">Premium Status: {hasPaid ? "ACTIVE" : "INACTIVE"}</h4>
                          <p className="text-xs font-bold text-gray-600 leading-tight">
                            {hasPaid ? "You have full access to career paths, unlimited marketplace postings, and priority AI tools." : "Upgrade to unlock unlimited AI career guidance and marketplace features."}
                          </p>
                        </div>
                      </div>
                      {!hasPaid && (
                        <button 
                          onClick={() => {
                            setPaymentType('UPGRADE');
                            setShowPaywall(true);
                          }}
                          className="brutal-btn bg-neon-blue text-white px-6 py-3 text-xs shrink-0"
                        >
                          UPGRADE
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {profileView === 'mastery' && (
                <div className="brutal-border bg-white p-4 md:p-8 space-y-8 relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-neon-yellow/10 rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="bg-brutal-black text-white p-3 rotate-3">
                      <Trophy size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">GCE Mastery Badges</h3>
                      <div className="sticker bg-neon-yellow text-brutal-black text-[8px] mt-1">EXAM CHAMPION</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 relative z-10">
                    <div className="space-y-6">
                      <h4 className="font-black uppercase text-sm border-b-4 border-brutal-black pb-2">Your Progress</h4>
                      <div className="space-y-4">
                        {Object.entries(gceMastery.solvedCounts).length === 0 ? (
                          <div className="text-center py-12 brutal-border border-dashed border-brutal-black/20">
                            <p className="font-black text-lg opacity-40 uppercase tracking-tighter">No solutions tracked yet.</p>
                            <button 
                              onClick={() => setActiveTab('gce')}
                              className="mt-4 brutal-btn bg-neon-green text-brutal-black px-6 py-2 text-xs"
                            >
                              START SOLVING
                            </button>
                          </div>
                        ) : (
                          Object.entries(gceMastery.solvedCounts).map(([key, count]) => {
                            const [level, subject] = key.split('_');
                            const progress = Math.min((count / 30) * 100, 100);
                            return (
                              <div key={key} className="space-y-2">
                                <div className="flex justify-between items-end">
                                  <span className="font-black text-xs uppercase tracking-tight">{subject} ({level})</span>
                                  <span className="text-[10px] font-bold opacity-60">{count} / 30 Solutions</span>
                                </div>
                                <div className="h-4 brutal-border bg-gray-100 relative overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="absolute inset-0 bg-neon-blue"
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="font-black uppercase text-sm border-b-4 border-brutal-black pb-2">Badge Collection</h4>
                      {gceMastery.badges.length === 0 ? (
                        <div className="text-center py-12 brutal-border border-dashed border-brutal-black/20">
                          <p className="font-black text-lg opacity-40 uppercase tracking-tighter">No badges earned yet.</p>
                          <p className="text-[10px] font-bold mt-2 text-gray-400">Solve 3 papers in any subject to earn your first badge!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {gceMastery.badges.map(badge => (
                            <div key={badge.id} className="bg-gray-50 brutal-border p-4 flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-all">
                              <div className={cn(
                                "p-3 rounded-full brutal-border",
                                badge.tier === 'Bronze' ? "bg-orange-100 text-orange-600" :
                                badge.tier === 'Silver' ? "bg-gray-200 text-gray-600" :
                                badge.tier === 'Gold' ? "bg-yellow-100 text-yellow-600" :
                                "bg-purple-100 text-purple-600"
                              )}>
                                {badge.tier === 'Bronze' ? <Medal size={32} /> :
                                 badge.tier === 'Silver' ? <Award size={32} /> :
                                 badge.tier === 'Gold' ? <Trophy size={32} /> :
                                 <Star size={32} />}
                              </div>
                              <div>
                                <div className="text-[10px] font-black uppercase leading-none text-neon-blue">{badge.tier} Master</div>
                                <div className="text-xs font-bold mt-1 leading-tight">{badge.subject}</div>
                                <div className="text-[8px] font-black opacity-40 mt-2 uppercase">{badge.level} Level</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

              </div>
            </div>
          </RefreshIndicator>
        </div>
        {/* Decorative Background Stickers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-[0.05]">
          <div className="absolute top-[10%] left-[5%] rotate-[-15deg] text-9xl font-black tracking-tighter">PLUG</div>
          <div className="absolute top-[60%] right-[2%] rotate-[10deg] text-9xl font-black tracking-tighter">GCE</div>
          <div className="absolute bottom-[5%] left-[15%] rotate-[5deg] text-9xl font-black tracking-tighter">BAG</div>
          <div className="absolute top-[40%] left-[55%] rotate-[-20deg] text-9xl font-black tracking-tighter">HUSTLE</div>
          <div className="absolute top-[80%] left-[40%] rotate-[25deg] text-9xl font-black tracking-tighter">WIN</div>
          <div className="absolute top-[20%] right-[15%] rotate-[-10deg] text-9xl font-black tracking-tighter">ELITE</div>
        </div>

        {/* Market Posting Modal */}
      <AnimatePresence>
        {isPostingMarketItem && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-brutal-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white brutal-border w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="p-4 border-b-4 border-brutal-black bg-neon-yellow flex items-center justify-between sticky top-0 z-10">
                <h3 className="font-black uppercase italic text-xl tracking-tighter">Post to Market</h3>
                <button onClick={() => {
                  setIsPostingMarketItem(false);
                  setMarketPaymentStep('idle');
                  setImageVerificationError(null);
                  setIdVerificationError(null);
                  setIsVerifyingImage(false);
                  setIsVerifyingID(false);
                }} className="p-2 hover:bg-brutal-black hover:text-white transition-colors brutal-border-sm bg-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8">
                {marketPaymentStep === 'idle' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.market.title}</label>
                          <input 
                            type="text" 
                            value={newMarketItem.title}
                            onChange={(e) => setNewMarketItem({...newMarketItem, title: e.target.value})}
                            className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-yellow bg-gray-50"
                            placeholder={t.common.egUni}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{t.common.priceXaf}</label>
                          <input 
                            type="text" 
                            value={newMarketItem.price}
                            onChange={(e) => setNewMarketItem({...newMarketItem, price: e.target.value})}
                            className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-yellow bg-gray-50"
                            placeholder={t.common.egPrice}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Description</label>
                        <textarea 
                          value={newMarketItem.description}
                          onChange={(e) => setNewMarketItem({...newMarketItem, description: e.target.value})}
                          className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-yellow bg-gray-50 h-20 resize-none"
                          placeholder={t.common.egHistory}
                        />
                      </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Item Image</label>
                      <div className="flex flex-col gap-4">
                        {isVerifyingImage ? (
                          <div className="w-full h-48 brutal-border flex flex-col items-center justify-center gap-4 bg-gray-50">
                            <div className="w-10 h-10 border-4 border-neon-yellow border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Verifying Image Safety...</p>
                          </div>
                        ) : newMarketItem.image && !newMarketItem.image.includes('picsum.photos') ? (
                          <div className="relative w-full h-48 brutal-border overflow-hidden bg-gray-100">
                            <img 
                              src={newMarketItem.image} 
                              alt="Item Preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                setNewMarketItem({...newMarketItem, image: 'https://picsum.photos/seed/market/400/300'});
                                setImageVerificationError(null);
                              }}
                              className="absolute top-2 right-2 bg-neon-pink text-white p-1 brutal-border-sm hover:rotate-12 transition-transform"
                            >
                              <X size={16} />
                            </button>
                            <div className="absolute bottom-2 left-2 bg-neon-green text-brutal-black px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm">
                              VERIFIED SAFE ✓
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 brutal-border border-dashed border-brutal-black/20 flex flex-col items-center justify-center gap-2 bg-gray-50">
                            <ImageIcon size={32} className="opacity-20" />
                            <p className="text-[10px] font-black uppercase opacity-40">No image selected</p>
                          </div>
                        )}

                        {imageVerificationError && (
                          <div className="p-3 bg-red-50 border-2 border-red-500 text-red-500 text-[10px] font-black uppercase flex items-center gap-2">
                            <AlertTriangle size={14} />
                            <span>{imageVerificationError}</span>
                          </div>
                        )}

                        <input 
                          type="file" 
                          accept="image/*"
                          disabled={isVerifyingImage}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsVerifyingImage(true);
                              setImageVerificationError(null);
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64 = reader.result as string;
                                const result = await verifyMarketImage(base64, file.type);
                                
                                if (result.isAppropriate) {
                                  setNewMarketItem({...newMarketItem, image: base64});
                                } else {
                                  const reason = result.reason || "Image rejected by community guidelines.";
                                  setImageVerificationError(reason);
                                  toast.error(reason, {
                                    className: 'brutal-border bg-neon-pink text-white font-black uppercase italic',
                                  });
                                  setNewMarketItem({...newMarketItem, image: 'https://picsum.photos/seed/market/400/300'});
                                }
                                setIsVerifyingImage(false);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden" 
                          id="market-item-image-upload"
                        />
                        <label 
                          htmlFor="market-item-image-upload"
                          className={cn(
                            "w-full brutal-border p-3 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all",
                            isVerifyingImage ? "bg-gray-100 cursor-not-allowed opacity-50" : "bg-white hover:bg-neon-yellow cursor-pointer"
                          )}
                        >
                          <Camera size={16} />
                          {newMarketItem.image && !newMarketItem.image.includes('picsum.photos') ? 'CHANGE IMAGE' : 'UPLOAD ITEM PHOTO'}
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Category</label>
                        <select 
                          value={newMarketItem.category}
                          onChange={(e) => setNewMarketItem({...newMarketItem, category: e.target.value})}
                          className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-yellow bg-gray-50 appearance-none"
                        >
                          <option>General</option>
                          <option>Books</option>
                          <option>Electronics</option>
                          <option>Fashion</option>
                          <option>Services</option>
                        </select>
                        <p className="text-[8px] font-bold text-neon-pink uppercase mt-1">Note: For houses/rooms, please use the Housing Navigator section.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Your Name</label>
                        <input 
                          type="text" 
                          value={newMarketItem.seller}
                          onChange={(e) => setNewMarketItem({...newMarketItem, seller: e.target.value})}
                          className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-yellow bg-gray-50"
                          placeholder="Seller Name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">WhatsApp/Phone Number</label>
                      <input 
                        type="text" 
                        value={newMarketItem.contact}
                        onChange={(e) => setNewMarketItem({...newMarketItem, contact: e.target.value})}
                        className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-yellow bg-gray-50"
                        placeholder="6xx xxx xxx"
                      />
                    </div>

                    <div className="space-y-4 p-4 bg-neon-blue/5 brutal-border border-dashed border-neon-blue/30">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="text-neon-blue" size={24} />
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-tighter">Student Verification</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Help us keep the market safe</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              checked={newMarketItem.isVerified}
                              onChange={(e) => setNewMarketItem({...newMarketItem, isVerified: e.target.checked})}
                              className="peer h-5 w-5 cursor-pointer appearance-none brutal-border bg-white checked:bg-neon-blue transition-all"
                            />
                            <CheckCircle2 className="absolute h-5 w-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                          </div>
                          <span className="text-[10px] font-black uppercase leading-tight group-hover:text-neon-blue transition-colors">
                            I confirm I am a verified student with a valid ID card
                          </span>
                        </label>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Upload Student ID (Required for verification)</label>
                          <div className="relative">
                            {isVerifyingID ? (
                              <div className="w-full brutal-border p-3 flex items-center justify-center gap-2 bg-gray-50">
                                <div className="w-4 h-4 border-2 border-neon-blue border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase animate-pulse">Verifying ID...</span>
                              </div>
                            ) : (
                              <>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  disabled={isVerifyingID}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setIsVerifyingID(true);
                                      setIdVerificationError(null);
                                      const reader = new FileReader();
                                      reader.onloadend = async () => {
                                        const base64 = reader.result as string;
                                        // Use a more specific prompt for ID verification
                                        const result = await verifyStudentId(base64, file.type);
                                        
                                        if (result.isAppropriate) {
                                          setNewMarketItem({...newMarketItem, studentIdImage: base64, isVerified: true});
                                        } else {
                                          const reason = result.reason || "Invalid or inappropriate ID card image.";
                                          setIdVerificationError(reason);
                                          toast.error(reason, {
                                            className: 'brutal-border bg-neon-pink text-white font-black uppercase italic',
                                          });
                                          setNewMarketItem({...newMarketItem, studentIdImage: '', isVerified: false});
                                        }
                                        setIsVerifyingID(false);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden" 
                                  id="student-id-upload"
                                />
                                <label 
                                  htmlFor="student-id-upload"
                                  className={cn(
                                    "w-full brutal-border p-3 text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all cursor-pointer",
                                    newMarketItem.studentIdImage ? "bg-neon-green/20 border-neon-green" : "bg-white hover:bg-neon-blue/10"
                                  )}
                                >
                                  {newMarketItem.studentIdImage ? (
                                    <>
                                      <CheckCircle2 size={14} className="text-neon-green" />
                                      ID VERIFIED ✓
                                    </>
                                  ) : 'CHOOSE ID PHOTO'}
                                </label>
                              </>
                            )}
                          </div>
                          {idVerificationError && (
                            <p className="text-[8px] font-black uppercase text-red-500 mt-1">{idVerificationError}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Payment Number (MoMo/OM)</label>
                      <input 
                        type="text" 
                        value={paymentNumber}
                        onChange={(e) => setPaymentNumber(e.target.value)}
                        className="w-full brutal-border p-3 text-sm font-black outline-none focus:ring-4 focus:ring-neon-pink bg-gray-50"
                        placeholder="6xx xxx xxx"
                      />
                    </div>

                    <div className="bg-neon-yellow/10 p-4 brutal-border border-dashed border-brutal-black/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase">Posting Fee</span>
                        <span className="bg-brutal-black text-neon-yellow px-3 py-1 text-xs font-black brutal-border-sm rotate-3">200 XAF</span>
                      </div>
                      <p className="text-[10px] font-black uppercase opacity-40 leading-tight">This fee helps us keep the market safe and verified for all students.</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (isVerifyingImage || isVerifyingID) return;
                        if (!newMarketItem.title || !newMarketItem.price || !newMarketItem.contact) {
                          toast.error("Please fill the essential fields!");
                          return;
                        }
                        if (!newMarketItem.isVerified) {
                          toast.error("Please upload and verify your Student ID to post in the market.");
                          return;
                        }
                        if (imageVerificationError) {
                          toast.error("Please upload a valid item image before posting.");
                          return;
                        }
                        
                        setPaymentType('MARKET_POST');
                        setPendingMarketItem({
                          ...newMarketItem,
                          id: Math.random().toString(36).substr(2, 9),
                          date: new Date().toISOString().split('T')[0]
                        } as MarketItem);
                        setShowPaywall(true);
                      }}
                      disabled={isVerifyingImage || isVerifyingID || isProcessingPayment}
                      className={cn(
                        "w-full brutal-btn text-xl py-5 transition-all",
                        (isVerifyingImage || isVerifyingID || isProcessingPayment) ? "bg-gray-200 cursor-not-allowed opacity-50" : "bg-neon-yellow hover:bg-brutal-black hover:text-white"
                      )}
                    >
                      {isProcessingPayment ? 'PROCESSING...' : (isVerifyingImage || isVerifyingID) ? 'VERIFYING...' : 'PAY 200 XAF & POST'}
                    </button>
                  </div>
                )}

                {marketPaymentStep === 'processing' && (
                  <div className="py-12 text-center space-y-8">
                    <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-8 border-gray-100 rounded-full"></div>
                      <div className="absolute inset-0 border-8 border-neon-yellow rounded-full border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={32} className="text-neon-yellow animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-3xl font-black uppercase italic tracking-tighter">Plugging into Network...</h4>
                      <p className="font-black text-gray-400 uppercase text-xs tracking-widest">Check your phone for the 200 XAF prompt.</p>
                      {paymentError && <p className="text-red-500 text-[10px] font-black uppercase">{paymentError}</p>}
                    </div>
                  </div>
                )}

                {marketPaymentStep === 'success' && (
                  <div className="py-12 text-center space-y-8">
                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-24 h-24 bg-neon-green brutal-border mx-auto flex items-center justify-center rotate-12"
                    >
                      <CheckCircle2 size={48} className="text-brutal-black" />
                    </motion.div>
                    <div className="space-y-3">
                      <h4 className="text-4xl font-black uppercase italic tracking-tighter">Item Plugged!</h4>
                      <p className="font-black text-neon-green bg-brutal-black px-4 py-1 inline-block rotate-[-2deg]">Your item is now live.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsPostingMarketItem(false);
                        setMarketPaymentStep('idle');
                        setNewMarketItem({
                          title: '',
                          price: '',
                          description: '',
                          category: 'General',
                          seller: '',
                          contact: '',
                          image: 'https://picsum.photos/seed/market/400/300',
                          isVerified: false,
                          studentIdImage: ''
                        });
                      }}
                      className="w-full brutal-btn bg-neon-green text-xl py-5"
                    >
                      BACK TO MARKET
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        <AnimatePresence>
          {showPaywall && (
            <div className="fixed inset-0 bg-brutal-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full bg-white brutal-border p-6 md:p-8 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <button 
                  onClick={() => setShowPaywall(false)}
                  className="absolute top-4 right-4 p-1 hover:bg-gray-100 z-10"
                  disabled={isProcessingPayment}
                >
                  <X size={24} />
                </button>

                <div className="text-center space-y-6 md:space-y-8">
                  {paymentStep === 'idle' && (
                    <>
                      <div className="inline-block p-4 md:p-6 bg-neon-pink brutal-border mb-2 md:mb-4 rotate-[-5deg]">
                        <Zap size={48} className="text-white fill-white md:w-16 md:h-16" />
                      </div>
                      <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                        {paymentType === 'UPGRADE' && <>Plug <br /> Overload!</>}
                        {paymentType === 'MARKET_POST' && <>Market <br /> Listing!</>}
                        {paymentType === 'HOUSING_POST' && <>Housing <br /> Listing!</>}
                        {paymentType === 'ITEM_PURCHASE' && <>Item <br /> Checkout!</>}
                      </h3>
                      <p className="font-black text-sm md:text-lg leading-tight text-gray-400">
                        {paymentType === 'UPGRADE' && "Unlock 5 years of complete GCE Ordinary & Advanced Level past papers and full solutions."}
                        {paymentType === 'MARKET_POST' && "Pay the listing fee to post your item in the student marketplace."}
                        {paymentType === 'HOUSING_POST' && "Pay the listing fee to post your house/room for students."}
                        {paymentType === 'ITEM_PURCHASE' && `Confirm your purchase of "${purchasingItem?.title}" for ${purchasingItem?.price}.`}
                      </p>
                      
                      {paymentType === 'UPGRADE' && (
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 md:gap-4">
                          <button 
                            onClick={() => setSelectedPlan('30_DAYS')}
                            className={cn(
                              "p-4 md:p-6 brutal-border text-left transition-all relative overflow-hidden group",
                              selectedPlan === '30_DAYS' ? "bg-neon-green -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-gray-50 opacity-40 hover:opacity-100"
                            )}
                          >
                            <div className="font-black uppercase text-[8px] md:text-[10px] mb-1 md:mb-2 tracking-widest">1 Month</div>
                            <div className="text-xl md:text-2xl font-black italic">1000 XAF</div>
                            {selectedPlan === '30_DAYS' && <div className="absolute -right-2 -bottom-2 opacity-20 rotate-12"><Zap size={32} className="md:w-10 md:h-10" /></div>}
                          </button>
                          <button 
                            onClick={() => setSelectedPlan('ACADEMIC_YEAR')}
                            className={cn(
                              "p-4 md:p-6 brutal-border text-left transition-all relative overflow-hidden group",
                              selectedPlan === 'ACADEMIC_YEAR' ? "bg-neon-blue text-white -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-gray-50 opacity-40 hover:opacity-100"
                            )}
                          >
                            <div className="font-black uppercase text-[8px] md:text-[10px] mb-1 md:mb-2 tracking-widest">Full Year</div>
                            <div className="text-xl md:text-2xl font-black italic">7000 XAF</div>
                            {selectedPlan === 'ACADEMIC_YEAR' && <div className="absolute -right-2 -bottom-2 opacity-20 rotate-12"><Zap size={32} className="md:w-10 md:h-10" /></div>}
                          </button>
                        </div>
                      )}

                      <div className="bg-gray-100 p-4 md:p-6 brutal-border text-left space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between border-b-2 border-brutal-black pb-2">
                          <span className="font-black uppercase text-[10px] md:text-xs">
                            {paymentType === 'UPGRADE' && 'Priority AI & Pro Access'}
                            {paymentType === 'MARKET_POST' && 'Market Listing Fee'}
                            {paymentType === 'HOUSING_POST' && 'Housing Listing Fee'}
                            {paymentType === 'ITEM_PURCHASE' && 'Market Purchase'}
                          </span>
                          <span className="text-neon-pink bg-brutal-black px-2 md:px-3 py-0.5 md:py-1 font-black text-[10px] md:text-xs rotate-2">
                            {paymentType === 'UPGRADE' && (selectedPlan === '30_DAYS' ? '1000 XAF' : '7000 XAF')}
                            {paymentType === 'MARKET_POST' && '200 XAF'}
                            {paymentType === 'HOUSING_POST' && '2000 XAF'}
                            {paymentType === 'ITEM_PURCHASE' && purchasingItem?.price}
                          </span>
                        </div>
                        <ul className="text-[10px] md:text-xs space-y-1.5 md:space-y-2 font-black uppercase tracking-tight">
                          {paymentType === 'UPGRADE' && (
                            <>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Unlimited Priority AI Support</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Unlimited Marketplace Postings</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Advanced Exam Planner AI</li>
                            </>
                          )}
                          {paymentType === 'MARKET_POST' && (
                            <>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Reach thousands of students</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Verified listing badge</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Direct chat with buyers</li>
                            </>
                          )}
                          {paymentType === 'HOUSING_POST' && (
                            <>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> List your room/studio/apartment</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Targeted student housing audience</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Secure payment integration</li>
                            </>
                          )}
                          {paymentType === 'ITEM_PURCHASE' && (
                            <>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Direct Payment to Seller</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Secure Transaction Tracking</li>
                              <li className="flex items-center gap-2 md:gap-3"><ChevronRight size={12} className="text-neon-pink md:w-3.5 md:h-3.5" /> Verified Student Marketplace</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <div className="space-y-2 md:space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Enter MoMo/OM Number</label>
                          <div className="flex gap-2">
                            {(() => {
                              const num = paymentNumber.trim().replace(/\s+/g, '');
                              const mtnPrefixes = ['67', '68', '650', '651', '652', '653', '654'];
                              const orangePrefixes = ['69', '655', '656', '657', '658', '659'];
                              
                              // Check both 9-digit and 12-digit formats
                              const checkNum = num.startsWith('237') ? num.substring(3) : num;
                              const p2 = checkNum.substring(0, 2);
                              const p3 = checkNum.substring(0, 3);
                              
                              if (mtnPrefixes.includes(p2) || mtnPrefixes.includes(p3)) {
                                return <div className="bg-neon-yellow text-brutal-black px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm animate-bounce">MTN MoMo Detected 🔌</div>;
                              }
                              if (orangePrefixes.includes(p2) || orangePrefixes.includes(p3)) {
                                return <div className="bg-orange-500 text-white px-2 py-0.5 text-[8px] font-black uppercase brutal-border-sm animate-bounce">Orange Money Detected 🔌</div>;
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                        <input 
                          type="text"
                          value={paymentNumber}
                          onChange={(e) => setPaymentNumber(e.target.value)}
                          placeholder="6xx xxx xxx"
                          className="w-full brutal-border p-3 md:p-4 font-black text-xl md:text-2xl tracking-[0.2em] outline-none focus:ring-4 focus:ring-neon-pink bg-gray-50"
                        />
                      </div>

                      <button 
                        onClick={handlePayment}
                        disabled={isProcessingPayment}
                        className="w-full brutal-btn text-xl md:text-2xl py-4 md:py-6 bg-neon-pink text-white hover:bg-brutal-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {user ? (
                          <>
                            {paymentType === 'UPGRADE' && `PAY ${selectedPlan === '30_DAYS' ? '1000 XAF' : '7000 XAF'} NOW`}
                            {paymentType === 'MARKET_POST' && 'PAY 200 XAF NOW'}
                            {paymentType === 'HOUSING_POST' && 'PAY 2000 XAF NOW'}
                            {paymentType === 'ITEM_PURCHASE' && `PAY ${purchasingItem?.price} NOW`}
                          </>
                        ) : "LOGIN TO PAY"}
                      </button>

                      {paymentError && (
                        <div className="p-4 bg-red-100 text-red-600 brutal-border-sm font-black text-xs uppercase flex items-center gap-3">
                          <AlertTriangle size={16} />
                          {paymentError}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center gap-2 opacity-30">
                        <span className="text-[10px] font-black uppercase tracking-widest">Merchant: Jean Marc Fishier</span>
                      </div>
                    </>
                  )}

                  {paymentStep === 'processing' && (
                    <div className="py-12 space-y-10">
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 border-[12px] border-gray-100 rounded-full" />
                        <div className="absolute inset-0 border-[12px] border-neon-pink border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Zap size={48} className="text-neon-pink animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none">Awaiting <br /> Confirmation...</h3>
                          <p className="font-black text-neon-pink uppercase text-sm tracking-[0.2em] animate-pulse">Check your phone now!</p>
                        </div>
                        
                        <div className="bg-brutal-black text-white p-6 brutal-border rotate-[-1deg] space-y-4 shadow-[8px_8px_0px_0px_rgba(0,255,0,0.3)]">
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-widest text-neon-green opacity-80">MTN MoMo Instructions</p>
                              <ol className="text-[11px] font-bold text-left list-decimal list-inside space-y-1 opacity-90">
                                <li>A popup should appear on your phone.</li>
                                <li>If no popup, dial <span className="text-neon-yellow">*126#</span></li>
                                <li>Select <span className="text-neon-green">"Approvals"</span></li>
                              </ol>
                            </div>
                            <div className="space-y-1 border-t border-white/10 pt-3">
                              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 opacity-80">Orange Money Instructions</p>
                              <ol className="text-[11px] font-bold text-left list-decimal list-inside space-y-1 opacity-90">
                                <li>Dial <span className="text-neon-yellow">*150*50#</span> to authorize.</li>
                                <li>Enter your PIN to confirm the payment.</li>
                                <li>Wait for this screen to turn <span className="text-neon-green">GREEN</span></li>
                              </ol>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-white/20">
                            <p className="text-xs md:text-sm font-black uppercase">To: Jean Marc Fishier</p>
                            <p className="text-xs md:text-sm font-black uppercase">
                              Amount: {
                                paymentType === 'UPGRADE' 
                                  ? (selectedPlan === '30_DAYS' ? '1000 XAF' : '7000 XAF')
                                  : paymentType === 'MARKET_POST'
                                    ? '200 XAF'
                                    : paymentType === 'HOUSING_POST'
                                      ? '2000 XAF'
                                      : purchasingItem?.price
                              }
                            </p>
                          </div>
                        </div>
                        
                        <p className="font-black text-gray-400 uppercase text-[10px] tracking-[0.2em]">The plug will unlock automatically after confirmation.</p>
                      </div>
                    </div>
                  )}

                  {paymentStep === 'success' && (
                    <div className="py-8 space-y-10">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-32 h-32 bg-neon-green brutal-border mx-auto flex items-center justify-center rotate-12"
                      >
                        <CheckCircle2 size={64} className="text-brutal-black" />
                      </motion.div>
                      <div className="space-y-4">
                        <h4 className="text-5xl font-black uppercase italic tracking-tighter leading-none">You're <br /> Plugged!</h4>
                        <div className="bg-brutal-black text-neon-green px-6 py-2 inline-block rotate-[-2deg] font-black text-xl">
                          PREMIUM UNLOCKED
                        </div>
                        
                        <div className="bg-gray-50 p-4 md:p-8 brutal-border text-left space-y-6 border-dashed border-brutal-black/30">
                          <div className="flex items-center justify-between border-b-2 border-brutal-black/10 pb-3">
                            <span className="font-black uppercase text-[10px] opacity-40 tracking-widest">Access Level</span>
                            <span className="bg-brutal-black text-neon-green px-3 py-1 text-[10px] font-black uppercase rotate-1">Premium Elite</span>
                          </div>
                          
                          <div className="flex items-center justify-between border-b-2 border-brutal-black/10 pb-3">
                            <span className="font-black uppercase text-[10px] opacity-40 tracking-widest">Duration</span>
                            <span className="font-black text-xs uppercase italic">
                              {selectedPlan === '30_DAYS' ? '30 Days Access' : 'Full Academic Year (2025/26)'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <span className="font-black uppercase text-[10px] opacity-40 tracking-widest">Unlocked Features:</span>
                            <ul className="text-[11px] space-y-2 font-black uppercase">
                              <li className="flex items-center gap-3"><CheckCircle size={14} className="text-neon-green" /> Unlimited AI Career Architect</li>
                              <li className="flex items-center gap-3"><CheckCircle size={14} className="text-neon-green" /> 5 Years GCE Solutions (All Subjects)</li>
                              <li className="flex items-center gap-3"><CheckCircle size={14} className="text-neon-green" /> Priority Study Plans & Housing Tips</li>
                            </ul>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            setShowPaywall(false);
                            setPaymentStep('idle');
                          }}
                          className="w-full brutal-btn bg-neon-green text-2xl py-6 hover:bg-brutal-black hover:text-white transition-all"
                        >
                          START CRUSHING IT
                        </button>
                        
                        <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">Transaction ID: CP-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Floating Compare Bar */}
        <AnimatePresence>
          {selectedUniIds.length > 0 && uniView === 'list' && activeTab === 'universities' && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-2xl"
            >
              <div className="brutal-border bg-brutal-black text-white p-4 flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(0,255,0,1)]">
                <div className="flex items-center gap-4">
                  <div className="bg-neon-green text-brutal-black p-2 rotate-[-5deg]">
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">Comparison Ready</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase">{selectedUniIds.length} Universities Selected</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedUniIds([])}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:text-neon-pink transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setUniView('compare')}
                    className="brutal-btn bg-neon-green text-brutal-black px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-white transition-all"
                  >
                    Compare Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          {/* Floating Chat Toggle Button */}
          {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-36 lg:bottom-12 right-6 z-[60] brutal-btn bg-neon-pink p-4 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group transition-transform active:scale-95"
            >
              <MessageSquare size={32} className="text-white group-hover:scale-110 transition-transform" />
              <div className="absolute -top-12 right-0 bg-brutal-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest brutal-border-sm whitespace-nowrap animate-bounce">
                NEED A PLUG? 🔌
              </div>
            </button>
          )}

          {/* Side Chat Drawer */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-16 lg:bottom-0 right-0 w-full md:w-[450px] lg:w-[550px] bg-claude-bg z-[65] flex flex-col shadow-[-20px_0px_50px_0px_rgba(0,0,0,0.05)]"
              >
                <div className="p-5 border-b border-black/5 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
                  <div className="flex items-center gap-3">
                    <div className="bg-claude-accent text-white p-2 rounded-xl">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-gray-900 leading-none">AI Career Architect</h3>
                      <p className="text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{chatSection} Section</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(messages[chatTabKey]?.length || 0) > 0 && (
                      <button 
                        onClick={() => {
                          setMessages(prev => ({ ...prev, [chatTabKey]: [] }));
                          toast.success("Chat history cleared");
                        }}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                        title="Clear Chat"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => setIsChatOpen(false)}
                      className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-900"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 custom-scrollbar">
                    {[
                      { id: 'general', label: 'General', icon: <Zap size={14} />, color: 'bg-neon-blue' },
                      { id: 'gce', label: 'GCE/BACC', icon: <BookOpen size={14} />, color: 'bg-neon-green' },
                      { id: 'career', label: 'Career', icon: <Briefcase size={14} />, color: 'bg-neon-yellow' },
                      { id: 'hustle', label: 'Hustle', icon: <DollarSign size={14} />, color: 'bg-neon-pink' }
                    ].map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setChatSection(section.id as any)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-[11px] tracking-tight transition-all shrink-0 border",
                          chatSection === section.id 
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm" 
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {section.icon}
                        {section.label}
                      </button>
                    ))}
                  </div>

                  {(messages[chatTabKey]?.length || 0) === 0 && (
                    <div className="mt-8 space-y-8">
                      <div className="claude-card p-8 relative overflow-hidden bg-white">
                        <h2 className="text-4xl font-bold leading-tight mb-4 tracking-tight text-gray-900">
                          Welcome to <br />
                          <span className="text-claude-accent">CampusPlug</span>
                        </h2>
                        <p className="text-base font-medium text-gray-500 leading-relaxed">
                          I'm your career architect. Need GCE solutions, a study plan, or a side hustle? I'm here to help you navigate your academic journey.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {quickPlugs.map((plug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(plug.prompt)}
                            className="bg-white border border-gray-100 p-5 rounded-2xl text-left hover:border-claude-accent/30 hover:bg-claude-bg transition-all group relative"
                          >
                            <div className="flex items-center gap-4 relative z-10">
                              <div className="p-3 bg-claude-bg text-claude-accent rounded-xl group-hover:scale-110 transition-transform">
                                {plug.icon}
                              </div>
                              <span className="font-bold text-gray-800 text-sm">{plug.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-10">
                    {(messages[chatTabKey] || []).map((message) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={message.id}
                        className={cn(
                          "flex flex-col",
                          message.role === 'user' ? "items-end" : "items-start"
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%]",
                          message.role === 'user' 
                            ? "claude-bubble-user" 
                            : "claude-bubble-ai w-full"
                        )}>
                          {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-claude-accent text-white rounded-md flex items-center justify-center">
                                <Zap size={12} />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CampusPlug</span>
                            </div>
                          )}
                          <div className={cn(
                            "markdown-body text-[15px] leading-relaxed",
                            message.role === 'user' ? "text-gray-900" : "text-gray-800"
                          )}>
                            {message.image && (
                              <div className="mb-4 rounded-xl overflow-hidden border border-black/5">
                                <img 
                                  src={`data:image/png;base64,${message.image}`} 
                                  alt="Uploaded question" 
                                  className="w-full h-auto max-h-64 object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>

                          {message.role === 'assistant' && (
                            <div className="mt-4 pt-4 border-t border-black/5 flex justify-start gap-4">
                              <button 
                                onClick={() => {
                                  const title = message.content.split('\n')[0].replace(/[#*]/g, '').trim().substring(0, 40) + '...';
                                  saveRecommendation(title, message.content, 'career');
                                }}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-claude-accent transition-colors"
                              >
                                <Heart size={12} />
                                Save to library
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-claude-accent/20 text-claude-accent rounded-md flex items-center justify-center animate-pulse">
                          <Zap size={12} />
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-6 bg-claude-bg border-t border-black/5 relative z-20">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {selectedImage && (
                      <div className="relative inline-block">
                        <div className="rounded-xl overflow-hidden w-20 h-20 border border-black/10 shadow-sm">
                          <img 
                            src={`data:image/png;base64,${selectedImage.data}`} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <button 
                          onClick={() => setSelectedImage(null)}
                          className="absolute -top-2 -right-2 bg-gray-900 text-white p-1 rounded-full shadow-lg hover:bg-claude-accent transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-black/10 p-2 shadow-sm focus-within:border-claude-accent/50 focus-within:ring-4 focus-within:ring-claude-accent/5 transition-all">
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => imageInputRef.current?.click()}
                        className="p-3 text-gray-400 hover:text-claude-accent transition-all rounded-xl hover:bg-claude-bg"
                        title="Upload Image"
                      >
                        <Plus size={20} />
                      </button>
                      <textarea
                        ref={chatInputRef as any}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Ask anything..."
                        rows={1}
                        className="flex-1 px-2 py-3 font-medium focus:outline-none bg-transparent text-gray-800 placeholder:text-gray-400 resize-none max-h-32 min-h-[44px]"
                        style={{ height: 'auto' }}
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className={cn(
                          "p-3 rounded-xl transition-all flex items-center justify-center",
                          isLoading || !input.trim() 
                            ? "bg-gray-100 text-gray-300" 
                            : "bg-gray-900 text-white hover:bg-claude-accent"
                        )}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 font-medium">
                      CampusPlug can make mistakes. Check important info.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      {/* Badge Notification */}
      <AnimatePresence>
        {showBadgeNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4"
          >
            <div className="bg-brutal-black text-white brutal-border p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-neon-yellow animate-pulse" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className={cn(
                  "p-4 rounded-full brutal-border",
                  showBadgeNotification.tier === 'Bronze' ? "bg-orange-500" :
                  showBadgeNotification.tier === 'Silver' ? "bg-gray-400" :
                  showBadgeNotification.tier === 'Gold' ? "bg-yellow-500" :
                  "bg-purple-500"
                )}>
                  {showBadgeNotification.tier === 'Bronze' ? <Medal size={48} /> :
                   showBadgeNotification.tier === 'Silver' ? <Award size={48} /> :
                   showBadgeNotification.tier === 'Gold' ? <Trophy size={48} /> :
                   <Star size={48} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter text-neon-yellow">Mastery Unlocked!</h3>
                  <p className="text-sm font-bold mt-2">You've earned the <span className="text-neon-blue">{showBadgeNotification.tier} Badge</span> in {showBadgeNotification.subject} ({showBadgeNotification.level} Level)!</p>
                  <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">Keep plugging, on est ensemble!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
    
    {/* GCE Viewer Overlay */}
    <AnimatePresence>
      {isViewingGce && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brutal-black/90 p-4 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-5xl h-[90vh] bg-[#F0F0F0] brutal-border flex flex-col relative overflow-hidden"
          >
            {/* Viewer Header */}
            <div className="bg-white border-b-4 border-brutal-black p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 sticky top-0 z-20">
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => setIsViewingGce(false)}
                  className="bg-brutal-black text-white p-2 hover:bg-neon-pink transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 brutal-border-sm",
                      gceViewerType === 'paper' ? "bg-neon-pink text-white" : "bg-neon-green text-brutal-black"
                    )}>
                      {gceViewerType === 'paper' ? 'Past Paper' : 'Full Solutions'}
                    </span>
                    <span className="text-[10px] font-black uppercase text-gray-400">Cameroon GCE Board</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase italic leading-tight tracking-tighter">
                    {gceViewerTitle}
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownloadPdf}
                  className="brutal-btn-sm bg-white hover:bg-neon-yellow flex items-center gap-2 text-xs"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Save PDF</span>
                </button>
                <button 
                  onClick={() => window.print()}
                  className="brutal-btn-sm bg-white hover:bg-neon-blue flex items-center gap-2 text-xs"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.share?.({
                      title: gceViewerTitle,
                      text: `Check out this GCE ${gceViewerType} on CampusPlug!`,
                      url: window.location.href
                    }).catch(() => {
                      toast.success("Link copied to clipboard!");
                    });
                  }}
                  className="brutal-btn-sm bg-brutal-black text-white hover:bg-neon-pink flex items-center gap-2 text-xs"
                >
                  <Share2 size={14} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Viewer Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-paper">
              {/* Paper Effect Container */}
              <div className="max-w-4xl mx-auto bg-white brutal-border p-6 sm:p-12 min-h-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative prose prose-slate max-w-none">
                {/* Historical Accuracy Alert */}
                <div className="mb-8 p-3 bg-neon-yellow/10 brutal-border-sm border-neon-yellow flex items-center gap-3 not-prose">
                  <ShieldCheck className="text-brutal-black shrink-0" size={20} />
                  <p className="text-[10px] font-black uppercase text-brutal-black leading-tight">
                    <span className="text-neon-pink">Archive Adherence:</span> This content is strictly reconstructed from the official GCE Board archives for the year <span className="underline decoration-2">{gceYear}</span>. Accuracy is prioritized.
                  </p>
                </div>

                {/* Decorative Paper Elements */}
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none opacity-10">
                  <FileText size={120} className="rotate-12 translate-x-12 -translate-y-6" />
                </div>
                
                {isGceViewerLoading && !gceViewerContent && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-8 border-gray-200 border-t-neon-pink rounded-full animate-spin"></div>
                      <BookOpen size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brutal-black animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black uppercase italic tracking-tighter mb-2">Unlocking Paper...</p>
                      <p className="text-sm font-bold text-gray-500 animate-pulse">Our AI is fetching the complete archives for you.</p>
                    </div>
                  </div>
                )}

                <div className="markdown-body gce-mastery-content">
                  <ReactMarkdown>{gceViewerContent || ""}</ReactMarkdown>
                  {isGceViewerLoading && gceViewerContent && (
                    <div className="mt-4 flex items-center gap-2 text-neon-pink font-black uppercase italic animate-pulse text-xs">
                      <Zap size={14} />
                      AI Generating content...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Viewer Footer */}
            <div className="bg-white border-t-4 border-brutal-black p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
                <ShieldCheck size={14} className="text-neon-green" />
                Verified CampusPlug Archive
              </div>
              <button 
                onClick={() => setIsViewingGce(false)}
                className="text-xs font-black uppercase italic text-neon-pink hover:underline"
              >
                Close Viewer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </ErrorBoundary>
  );
}
