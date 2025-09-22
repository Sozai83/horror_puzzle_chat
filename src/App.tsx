// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Camera, Image, Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  messageType: 'text' | 'voice' | 'image';
  phase: GamePhase;
  timestamp: Date;
}

type GamePhase = 'phase_1' | 'phase_2' | 'phase_3' | 'broken';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<GamePhase>('phase_1');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  let added = false;

  // Trigger responses (script mode)
  const triggers: Record<string, { response: string; nextPhase?: GamePhase }> = {
    'ALERT': {
      response: 'Soft as a cradle, but keeper of fears. I guard the whispers that haunt your ears. I hide what you seek, though silent I stay. Lift me, and find it—before dreams decay',
      nextPhase: 'phase_2'
    },
    'CLUE_2': {
      response: 'なぜ...なぜここにいる？でも...でも進んで。',
      nextPhase: 'phase_3'
    },
    'FINAL': {
      response: 'K3Y...3Y3...th3y...w4tch1ng...',
      nextPhase: 'broken'
    }
  };

  // AI responses by phase
  const aiResponses = {
    phase_1: [
      "部屋を見回してみて。何か手掛かりがあるはず。",
      "引き出しや箱の中も調べてみよう。",
      "壁に貼ってある写真や絵も怪しいね。"
    ],
    phase_2: [
      "その箱...開けた？中に何かいる...いや、大丈夫、進んで。",
      "君の後ろに...いや、気のせいだ。でも気をつけて。",
      "音が聞こえる...でも...でも続けて。"
    ],
    phase_3: [
      "その箱...開けた？中に何かいる...いや、大丈夫、進んで。",
      "君の後ろに...いや、気のせいだ。でも気をつけて。",
      "音が聞こえる...でも...でも続けて。"
    ],
    broken: [
      "3rr0r...f1nd...th3m...",
      "th3y...w4tch...y0u...",
      "d0...n0t...tr5st..."
    ]
  };

  // Add message helper
  const addMessage = (type: 'user' | 'ai', content: string, messageType: 'text' | 'voice' | 'image' = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      messageType,
      phase: phase,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Send text message
  const sendTextMessage = async () => {
    if (!input.trim()) return;

    addMessage('user', input);
    const currentInput = input.trim().toUpperCase();
    setInput('');
    setIsTyping(true);

    // Check for triggers
    if (triggers[currentInput]) {
      const trigger = triggers[currentInput];
      setTimeout(() => {
        addMessage('ai', trigger.response);
        if (trigger.nextPhase) {
          setPhase(trigger.nextPhase);
        }
        setIsTyping(false);
      }, 1500);
      return;
    }

    // Normal AI response
    setTimeout(() => {
      const responses = aiResponses[phase];
      const response = responses[Math.floor(Math.random() * responses.length)];
      addMessage('ai', response);
      setIsTyping(false);
    }, 2000);
  };

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addMessage('user', '📷 画像をアップロードしました', 'image');
    setIsAnalyzing(true);
    setIsTyping(true);

    // TODO: Replace with actual Vision API call
    // Mock analysis for now
    setTimeout(() => {
      addMessage('ai', '画像を解析中...');
      setTimeout(() => {
        const mockResults = [
          '断片を並べ替えると...「地下室の鏡の後ろ」という文字が浮かび上がりました。',
          'この鏡には隠された文字が...「MIRROR WORLD AWAITS 3147」。数字の組み合わせかもしれません。',
          '血で書かれた暗号...これは古い言語です。「彼らが来る、扉を閉めろ」と書いてあります。'
        ];
        const result = mockResults[Math.floor(Math.random() * mockResults.length)];
        addMessage('ai', result);
        if (Math.random() > 0.5) {
          setPhase('phase_1');
        }
        setIsAnalyzing(false);
        setIsTyping(false);
      }, 2000);
    }, 1500);
  };

  const openCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handleImageUpload as any;
    input.click();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial message
  useEffect(() => {
    if (!added) {
      addMessage(
        'ai',
        'I’ll help you escape from this room. First, take a look around. I can also accept clues in the form of sounds or images.'
      );
      added = true;
    }
  }, []);

  const getPhaseClass = (msgPhase: GamePhase) => {
    switch (msgPhase) {
      case 'phase_1': return 'text-yellow-300';
      case 'broken': return 'text-red-500 glitch-text';
      default: return 'text-white';
    }
  };

  const getStatusText = () => {
    switch (phase) {
      case 'phase_1': return { text: 'Online', class: 'text-green-400' };
      case 'phase_2': return { text: 'Connection Unstable', class: 'text-yellow-400' };
      case 'broken': return { text: 'SYSTEM FAILURE', class: 'text-red-400 glitch-text' };
    }
  };

  const status = getStatusText();

  return (
    <div className={`min-h-screen bg-gray-900 text-white font-mono ${phase === 'broken' ? 'broken-bg' : ''}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        
        .glitch-text {
          animation: glitch 0.3s infinite;
          text-shadow: 2px 2px 0px #ff0000, -2px -2px 0px #00ff00;
        }
        
        .broken-bg {
          background: linear-gradient(45deg, #1a1a1a, #2d0000);
        }

        .recording-pulse {
          animation: recording-pulse 1s infinite;
        }

        @keyframes recording-pulse {
          0%, 100% { background-color: rgb(239, 68, 68); }
          50% { background-color: rgb(127, 29, 29); }
        }
      `}} />

      <div className="container mx-auto max-w-2xl h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h1 className={`text-xl ${phase === 'broken' ? 'glitch-text' : ''}`}>
            {phase === 'broken' ? 'SY5T3M_3RR0R' : ''}
          </h1>
          <div className={`text-sm ${status?.class}`}>
            {status?.text}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-xs ${msg.type === 'user'
                ? 'bg-blue-600 ml-auto'
                : `bg-gray-800 ${getPhaseClass(msg.phase)}`
                }`}
            >
              <div className={msg.type === 'ai' && phase === 'broken' ? 'font-bold tracking-wider' : ''}>
                {msg.messageType === 'voice' && '🎤 '}
                {msg.messageType === 'image' && '📷 '}
                {msg.content}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="bg-gray-800 p-3 rounded-lg max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-gray-800 p-3 rounded-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">画像解析中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="mb-2 text-xs text-gray-400">
            💡 If you discover any clues, share them with me.
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
              className={`flex-1 p-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 ${phase === 'broken' ? 'text-red-400 placeholder-red-600' : ''
                }`}
              placeholder={phase === 'broken' ? '3nt3r...m355463...' : 'メッセージを入力...'}
              disabled={isTyping}
            />

            <button
              onClick={openCamera}
              disabled={isTyping || isAnalyzing}
              className="p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
              title="カメラで撮影"
            >
              <Camera size={20} />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isTyping || isAnalyzing}
              className="p-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg transition-colors"
              title="画像アップロード"
            >
              <Image size={20} />
            </button>

            <button
              onClick={sendTextMessage}
              disabled={isTyping || !input.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
              title="送信"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;