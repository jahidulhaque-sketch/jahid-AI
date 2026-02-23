
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageRole, AppMode, ImageQuality } from './types';
import { generateTextResponse, generateImage, editImage } from './services/geminiService';
import { NeonButton } from './components/NeonButton';
import { LiveMode } from './components/LiveMode';
import { PowerLogo } from './components/PowerLogo';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('JAHID IS DANCING...');
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT);
  const [imageQuality, setImageQuality] = useState<ImageQuality>(ImageQuality.BASIC);
  const [showLive, setShowLive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const ultraLoadingMessages = [
    "Synthesizing 4K Neural Grids...",
    "Calibrating Raytracing Proxies...",
    "Enhancing Textural Fidelity...",
    "Finalizing Ultra HDR Render...",
    "Jahid is perfecting the details..."
  ];

  useEffect(() => {
    let interval: any;
    let progressInterval: any;

    if (isLoading && imageQuality === ImageQuality.ULTRA) {
      let i = 0;
      setLoadingMessage(ultraLoadingMessages[0]);
      setProgress(5);

      interval = setInterval(() => {
        i = (i + 1) % ultraLoadingMessages.length;
        setLoadingMessage(ultraLoadingMessages[i]);
      }, 3500);

      // Simulated progress bar for Ultra Mode
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + Math.random() * 2.5;
          if (prev < 98) return prev + 0.1;
          return prev;
        });
      }, 500);

    } else if (isLoading) {
      setLoadingMessage('JAHID IS THINKING...');
      setProgress(0);
    } else {
      setProgress(0);
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [isLoading, imageQuality]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setSelectedImageMime(file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: textToSend,
      timestamp: Date.now(),
      imageUrl: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      if (mode === AppMode.IMAGE) {
        const imageUrl = await generateImage(textToSend, imageQuality);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: MessageRole.MODEL,
          text: `Generated ${imageQuality === ImageQuality.ULTRA ? 'Ultra 4K' : 'Basic'} image for: "${textToSend}"`,
          timestamp: Date.now(),
          imageUrl,
          isImageGeneration: true,
          imageQuality
        };
        setMessages(prev => [...prev, botMessage]);
      } else if (selectedImage) {
        const editedUrl = await editImage(selectedImage, selectedImageMime!, textToSend || "Enhance this image");
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: MessageRole.MODEL,
          text: `Edited your image.`,
          timestamp: Date.now(),
          imageUrl: editedUrl,
        };
        setMessages(prev => [...prev, botMessage]);
        setSelectedImage(null);
      } else {
        const { text, groundingUrls } = await generateTextResponse(textToSend, messages, useSearch);
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: MessageRole.MODEL,
          text,
          timestamp: Date.now(),
          groundingUrls
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error(error);
      let errorText = "Error: Something went wrong while processing your request.";
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: errorText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#02040a] text-slate-100 font-sans relative overflow-hidden">
      {/* Dynamic Cyber Background for Empty State */}
      {messages.length === 0 && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
           <div className="cyber-grid absolute inset-0 [transform:rotateX(45deg)_translateY(-20%)]"></div>
           <div className="scanline"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="shockwave [animation-delay:0s]"></div>
              <div className="shockwave [animation-delay:1s]"></div>
              <div className="shockwave [animation-delay:2s]"></div>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="glass neon-border flex items-center justify-between px-6 py-4 z-20">
        <div className="flex items-center gap-3">
          <PowerLogo size="sm" />
          <h1 className="neon-text text-xl md:text-2xl text-cyan-400 tracking-tighter uppercase">JAHID</h1>
        </div>
        
        <div className="flex gap-2">
           <NeonButton 
            variant={useSearch ? 'cyan' : 'purple'} 
            onClick={() => setUseSearch(!useSearch)}
            className="hidden sm:flex"
          >
            <i className={`fa-solid ${useSearch ? 'fa-globe' : 'fa-brain'}`}></i>
            {useSearch ? 'Search On' : 'Standard'}
          </NeonButton>
          <NeonButton variant="purple" onClick={() => setShowLive(true)}>
            <i className="fa-solid fa-microphone"></i> LIVE
          </NeonButton>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 z-10 relative">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
            <div className="relative group">
               <div className="absolute -inset-10 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-500"></div>
               <PowerLogo size="lg" className="mb-4 drop-shadow-[0_0_50px_rgba(0,242,255,0.4)]" />
            </div>

            <div className="space-y-4 max-w-2xl px-4">
              <h2 className="text-4xl md:text-5xl font-bold neon-text text-white tracking-widest glitch-text uppercase">
                NEURAL CORE ACTIVE
              </h2>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              <p className="text-lg md:text-xl font-light italic text-cyan-100/60 uppercase tracking-widest animate-[pulse_3s_infinite]">
                Advanced Intelligence Interface. Awaiting Input...
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full px-6">
               <button 
                  onClick={() => setInputText("What is your architectural foundation?")} 
                  className="group p-4 bg-slate-900/40 border border-cyan-500/20 rounded-2xl text-left hover:border-cyan-400/60 transition-all hover:bg-cyan-500/5"
               >
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-microchip text-cyan-400"></i>
                    <span className="text-cyan-400 font-bold text-xs uppercase tracking-widest">System Info</span>
                  </div>
                  <p className="text-sm text-slate-300">"What is your architectural foundation?"</p>
               </button>

               <button 
                  onClick={() => setInputText("Generate a digital art piece: Cybernetic Samurai, neon city, 8k")} 
                  className="group p-4 bg-slate-900/40 border border-purple-500/20 rounded-2xl text-left hover:border-purple-400/60 transition-all hover:bg-purple-500/5"
               >
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-palette text-purple-400"></i>
                    <span className="text-purple-400 font-bold text-xs uppercase tracking-widest">Creative Engine</span>
                  </div>
                  <p className="text-sm text-slate-300">"Generate a digital art piece: Cybernetic Samurai..."</p>
               </button>

               <button 
                  onClick={() => { setMode(AppMode.IMAGE); setImageQuality(ImageQuality.ULTRA); setInputText("Photorealistic interior of a luxury starship, cinematic lighting, 8k"); }} 
                  className="group p-4 bg-slate-900/40 border border-amber-500/20 rounded-2xl text-left hover:border-amber-400/60 transition-all hover:bg-amber-500/5"
               >
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-gem text-amber-400"></i>
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">Ultra Mode</span>
                  </div>
                  <p className="text-sm text-slate-300">"Photorealistic interior of a luxury starship..."</p>
               </button>

               <button 
                  onClick={() => setInputText("Analyze the future of quantum computing trends.")} 
                  className="group p-4 bg-slate-900/40 border border-green-500/20 rounded-2xl text-left hover:border-green-400/60 transition-all hover:bg-green-500/5"
               >
                  <div className="flex items-center gap-3 mb-2">
                    <i className="fa-solid fa-atom text-green-400"></i>
                    <span className="text-green-400 font-bold text-xs uppercase tracking-widest">Research Link</span>
                  </div>
                  <p className="text-sm text-slate-300">"Analyze the future of quantum computing trends."</p>
               </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.5s_ease-out]`}>
            <div className={`
              max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-xl 
              ${msg.role === MessageRole.USER 
                ? 'bg-gradient-to-br from-cyan-600/80 to-blue-700/80 border border-cyan-400/30' 
                : 'bg-slate-900/90 border border-slate-700/50 backdrop-blur-md'}
            `}>
              {msg.imageUrl && (
                <div className={`mb-3 rounded-xl overflow-hidden shadow-lg border ${msg.imageQuality === ImageQuality.ULTRA ? 'border-amber-400/50 shadow-amber-900/20' : 'border-cyan-400/20'}`}>
                  <img src={msg.imageUrl} alt="User upload or generated" className="w-full h-auto object-cover max-h-[400px]" />
                  {msg.imageQuality === ImageQuality.ULTRA && (
                    <div className="bg-amber-500/80 text-black text-[10px] font-bold px-2 py-0.5 absolute top-2 right-2 rounded uppercase tracking-tighter">Ultra 4K</div>
                  )}
                </div>
              )}
              {msg.text && (
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>
              )}
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                        <i className="fa-solid fa-link text-[10px]"></i> Source {i + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[10px] mt-2 opacity-30 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className={`bg-slate-900/95 border rounded-2xl p-6 shadow-2xl backdrop-blur-xl w-full max-w-md transition-all duration-500 ${imageQuality === ImageQuality.ULTRA ? 'border-amber-500/60 shadow-amber-900/20' : 'border-slate-700/50'}`}>
              
              {imageQuality === ImageQuality.ULTRA ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin"></div>
                        <i className="fa-solid fa-bolt absolute inset-0 flex items-center justify-center text-xs text-amber-500"></i>
                      </div>
                      <span className="text-sm font-bold neon-text text-amber-400 tracking-wider uppercase">Neural Reconstruction</span>
                    </div>
                    <span className="text-xs font-mono text-amber-500/80">{Math.floor(progress)}%</span>
                  </div>
                  
                  <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <div className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm italic text-amber-200/90 font-medium">{loadingMessage}</span>
                    <span className="text-[10px] uppercase tracking-widest text-amber-500/40 font-bold">Ultra Mode: High Fidelity 4K Generation</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full animate-bounce bg-cyan-400"></div>
                    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] bg-cyan-400"></div>
                    <div className="w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] bg-cyan-400"></div>
                  </div>
                  <span className="text-sm italic neon-text text-cyan-400">{loadingMessage}</span>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      <footer className="glass border-t border-slate-800 p-4 md:p-6 z-20">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
             <button 
              onClick={() => setMode(mode === AppMode.TEXT ? AppMode.IMAGE : AppMode.TEXT)}
              className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 whitespace-nowrap ${mode === AppMode.IMAGE ? 'bg-cyan-500 border-cyan-400 text-black font-bold' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              <i className="fa-solid fa-image"></i>
              {mode === AppMode.IMAGE ? 'Image Engine' : 'Text Engine'}
            </button>
            
            {mode === AppMode.IMAGE && (
              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                  onClick={() => setImageQuality(ImageQuality.BASIC)}
                  className={`px-3 py-1 rounded text-xs transition-all ${imageQuality === ImageQuality.BASIC ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,242,255,0.4)]' : 'text-slate-400'}`}
                >
                  Basic
                </button>
                <button 
                  onClick={() => setImageQuality(ImageQuality.ULTRA)}
                  className={`px-3 py-1 rounded text-xs transition-all ${imageQuality === ImageQuality.ULTRA ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'text-slate-400'}`}
                >
                  Ultra 4K
                </button>
              </div>
            )}

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-paperclip"></i>
              <span className="hidden sm:inline">Attach</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
            {selectedImage && (
              <div className="relative group">
                <img src={selectedImage} alt="Selected" className="w-10 h-10 object-cover rounded border border-cyan-400" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center group-hover:scale-110 transition-transform"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                mode === AppMode.IMAGE 
                  ? (imageQuality === ImageQuality.ULTRA ? "Describe an ultra-realistic 4K scene..." : "Describe a basic image to generate...") 
                  : selectedImage ? "What should I do with this image?" 
                  : "Message Jahid AI..."
              }
              className={`w-full bg-slate-900/80 border rounded-xl py-4 pl-6 pr-16 focus:outline-none transition-all text-slate-100 backdrop-blur-md ${imageQuality === ImageQuality.ULTRA && mode === AppMode.IMAGE ? 'border-amber-500/50 focus:border-amber-500 focus:ring-1 focus:ring-amber-500' : 'border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'}`}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className={`absolute right-3 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${imageQuality === ImageQuality.ULTRA && mode === AppMode.IMAGE ? 'bg-amber-500 hover:bg-amber-400' : 'bg-cyan-500 hover:bg-cyan-400'} text-black shadow-lg`}
            >
              <i className="fa-solid fa-arrow-up text-lg"></i>
            </button>
          </div>
          {mode === AppMode.IMAGE && imageQuality === ImageQuality.ULTRA && (
            <p className="text-[10px] text-amber-500/60 text-center uppercase tracking-widest animate-pulse">Ultra Mode active: Higher quality requires a few more seconds.</p>
          )}
        </div>
      </footer>

      {showLive && <LiveMode onClose={() => setShowLive(false)} />}
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
