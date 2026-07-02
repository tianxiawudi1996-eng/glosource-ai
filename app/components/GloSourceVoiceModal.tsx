'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Supplier } from '../api/source/types';

interface GloSourceVoiceModalProps {
  supplier: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ko';
}

interface TranscriptItem {
  id: string;
  sender: 'buyer' | 'supplier' | 'translator';
  text: string;
  timestamp: string;
}

interface CallHistoryItem {
  id: string;
  supplierName: string;
  date: string;
  duration: string;
  language: string;
  price: string;
  moq: string;
  notes: string[];
  kind?: 'demo' | 'live';
}

interface CallSummaryView {
  kind: 'demo' | 'live';
  duration: string;
  language: string;
  transcriptLines: number;
  price?: string;
  priceSub?: string;
  moq?: string;
  moqSub?: string;
  notes: string[];
}

const COPY = {
  en: {
    subtitle: 'Real-time B2B interpreted calls',
    dialogLabel: 'GloSource Voice call',
    close: 'Close',
    errorTitle: 'Connection error',
    supplierBadge: 'Calling supplier',
    listedPriceMoq: 'Listed price / MOQ',
    inquire: 'Inquire',
    langTitle: 'Interpretation languages',
    langDesc: "Choose the supplier's language.",
    langOptionA: 'EN ↔ KO',
    langOptionB: 'EN ↔ ZH',
    modeTitle: 'Call mode',
    modeDesc: 'Scripted demo or live microphone',
    modeDemo: 'Demo (recommended)',
    modeLive: 'Live (coming soon)',
    startCall: 'Start call',
    demoNote: '※ Demo mode plays a scripted, simulated negotiation so you can preview how interpreted calls work. No real call is placed.',
    liveNote: '※ Live mode uses your microphone for real-time AI interpretation powered by Google Gemini.',
    historyEmpty: 'No calls yet.',
    deleteTitle: 'Delete',
    tagDemo: 'Demo',
    tagLive: 'Live call',
    connecting: 'Connecting...',
    transcriptTitle: 'Live interpretation transcript',
    waitingChannel: 'Waiting for the call channel...',
    speakNow: 'Speak into your microphone to start the conversation.',
    senderBuyer: 'Buyer (you)',
    senderTranslator: 'AI interpreter',
    senderSupplier: 'Supplier',
    mute: 'Mute',
    unmute: 'Unmute',
    endCallTitle: 'End call',
    demoAlertTitle: 'Call ended — simulated demo summary below.',
    demoAlertSub: 'This was a scripted demo, not a real negotiation. The summary is stored locally in your browser.',
    liveAlertTitle: 'Call ended.',
    liveAlertSub: 'Live calls are not auto-summarized — review the transcript for agreed terms. A call record is stored locally in your browser.',
    demoBadge: 'SIMULATED DEMO',
    summaryTitleDemo: 'Simulated negotiation summary',
    summaryTitleLive: 'Call summary',
    durationLabel: 'Duration',
    priceLabel: 'Agreed unit price',
    moqLabel: 'Adjusted min. order quantity (MOQ)',
    notesLabel: 'Agreed terms & follow-up actions',
    langPairLabel: 'Language pair',
    linesLabel: 'Transcript lines',
    newCall: 'Start another call',
    saveClose: 'Save & close',
    connError: "Couldn't connect to the live translation service. Please try again or use Demo mode.",
    liveNotEnabled: 'Live voice is not enabled yet. Please use Demo mode.',
  },
  ko: {
    subtitle: '실시간 B2B 음성 통역 비서',
    dialogLabel: 'GloSource Voice 통화',
    close: '닫기',
    errorTitle: '연동 오류 알림',
    supplierBadge: '통화 대상 공급사',
    listedPriceMoq: '등록 단가 / MOQ',
    inquire: '문의 필요',
    langTitle: '통역 언어 설정',
    langDesc: '상대방의 언어를 골라주세요.',
    langOptionA: 'KO ↔ EN',
    langOptionB: 'KO ↔ ZH',
    modeTitle: '연동 모드 설정',
    modeDesc: '실제 마이크 혹은 시뮬레이션',
    modeDemo: '시뮬레이터 (추천)',
    modeLive: '실시간 라이브',
    startCall: '전화 회의 시작하기',
    demoNote: '※ 시뮬레이터 모드는 가상의 해외 통화 및 통역 상황을 연출하여 기능을 즉시 확인할 수 있습니다.',
    liveNote: '※ 라이브 모드는 마이크를 활성화하여 실제 구글 제미나이 AI와 실시간으로 통역을 나눕니다.',
    historyEmpty: '이전 통화 기록이 없습니다.',
    deleteTitle: '삭제',
    tagDemo: '데모 시뮬레이션',
    tagLive: '라이브 통화',
    connecting: '통화 연결 중...',
    transcriptTitle: '실시간 통역 스크립트 로그',
    waitingChannel: '통화 채널 대기 중...',
    speakNow: '마이크에 대고 말씀하시거나 대화를 시작하세요.',
    senderBuyer: '한국 바이어 (나)',
    senderTranslator: '실시간 통역 비서',
    senderSupplier: 'Foreign Supplier',
    mute: '음소거',
    unmute: '음소거 해제',
    endCallTitle: '통화 종료',
    demoAlertTitle: '통화가 종료되고 합의 조건이 자동 정리되었습니다!',
    demoAlertSub: '데모 시뮬레이션 결과이며, 요약본이 브라우저 로컬 저장소(localStorage)에 보관되었습니다.',
    liveAlertTitle: '통화가 종료되었습니다.',
    liveAlertSub: '라이브 통화는 자동 요약되지 않습니다 — 합의 조건은 통화 스크립트에서 직접 확인하세요. 통화 기록이 브라우저 로컬 저장소에 보관되었습니다.',
    demoBadge: '데모 시뮬레이션',
    summaryTitleDemo: '협상 타결 결과 요약 (데모)',
    summaryTitleLive: '통화 요약',
    durationLabel: '통화 시간',
    priceLabel: '최종 협상 단가',
    moqLabel: '조정된 최소 주문 수량 (MOQ)',
    notesLabel: '합의 세부 조항 및 후속 Action',
    langPairLabel: '통역 언어',
    linesLabel: '스크립트 줄 수',
    newCall: '새로운 통화 시작하기',
    saveClose: '회의록 저장 및 닫기',
    connError: '실시간 통역 서비스에 연결하지 못했습니다. 다시 시도하거나 데모 모드를 이용해주세요.',
    liveNotEnabled: '라이브 음성은 아직 활성화되지 않았습니다. 데모 모드를 이용해주세요.',
  },
} as const;

export default function GloSourceVoiceModal({ supplier, isOpen, onClose, lang = 'en' }: GloSourceVoiceModalProps) {
  const [callState, setCallState] = useState<'ready' | 'connecting' | 'connected' | 'summary'>('ready');
  const [isMuted, setIsMuted] = useState(false);
  const [languageMode, setLanguageMode] = useState<'KO_EN' | 'KO_ZH'>('KO_EN');
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [speakerState, setSpeakerState] = useState<'idle' | 'user' | 'ai'>('idle');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [duration, setDuration] = useState(0);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [, setActiveStep] = useState<number>(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [summary, setSummary] = useState<CallSummaryView | null>(null);

  const t = COPY[lang];

  // Audio Context and Websocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const isMutedRef = useRef(false);

  // Keep mute state readable inside long-lived audio callbacks
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Load history from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('glosource_voice_history');
      if (stored) {
        try {
          setCallHistory(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Duration Timer
  useEffect(() => {
    if (callState === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
      if (callState === 'ready') setDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [callState]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Dynamic Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      let color1 = 'rgba(148, 163, 184, 0.4)'; // Slate
      let color2 = 'rgba(148, 163, 184, 0.15)';
      let amplitude = 4;
      let frequency = 0.015;

      if (callState === 'connecting') {
        color1 = 'rgba(234, 88, 12, 0.4)'; // Orange-ish
        color2 = 'rgba(59, 130, 246, 0.4)';  // Blue-ish
        amplitude = 8 + Math.sin(phase * 2) * 3;
        frequency = 0.025;
      } else if (callState === 'connected') {
        if (speakerState === 'user') {
          color1 = 'rgba(234, 88, 12, 0.85)'; // Intense Orange
          color2 = 'rgba(234, 88, 12, 0.3)';
          amplitude = 25 + Math.sin(phase * 4) * 8;
          frequency = 0.035;
        } else if (speakerState === 'ai') {
          color1 = 'rgba(59, 130, 246, 0.85)'; // Intense Blue
          color2 = 'rgba(59, 130, 246, 0.3)';
          amplitude = 28 + Math.cos(phase * 4.5) * 10;
          frequency = 0.03;
        } else {
          // Idle
          color1 = 'rgba(234, 88, 12, 0.3)';
          color2 = 'rgba(59, 130, 246, 0.2)';
          amplitude = 6 + Math.sin(phase) * 2;
          frequency = 0.015;
        }
      }

      // Draw Wave 1
      ctx.beginPath();
      ctx.strokeStyle = color1;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (let x = 0; x < width; x++) {
        const distFromCenter = Math.min(x, width - x) / (width / 2);
        const y = centerY + Math.sin(x * frequency + phase) * amplitude * distFromCenter;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Wave 2 (offset)
      ctx.beginPath();
      ctx.strokeStyle = color2;
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x++) {
        const distFromCenter = Math.min(x, width - x) / (width / 2);
        const y = centerY + Math.sin(x * (frequency * 0.8) - phase + 2) * (amplitude * 0.6) * distFromCenter;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.15;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [callState, speakerState]);

  if (!isOpen || !supplier) return null;

  const langPairLabel = lang === 'en'
    ? (languageMode === 'KO_EN' ? 'EN ↔ KO' : 'EN ↔ ZH')
    : (languageMode === 'KO_EN' ? '한국어 ↔ 영어' : '한국어 ↔ 중국어');

  // Sound Synthesizer (Beep)
  const playTone = (freq: number, durationMs: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationMs / 1000);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (e) {
      console.warn('Audio Context tone failed', e);
    }
  };

  // Convert Float32 to 16-Bit PCM
  const convertFloat32To16BitPCM = (buffer: Float32Array): ArrayBuffer => {
    const bufferLen = buffer.length;
    const outputBuffer = new ArrayBuffer(bufferLen * 2);
    const view = new DataView(outputBuffer);
    let offset = 0;
    for (let i = 0; i < bufferLen; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return outputBuffer;
  };

  // ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Base64 to ArrayBuffer
  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // ----------------------------------------------------
  // SIMULATION SCRIPT DEFINITION
  // ----------------------------------------------------
  interface SimStep {
    speaker: 'idle' | 'user' | 'ai';
    sender: 'buyer' | 'supplier' | 'translator';
    text: string;
    delay: number;
  }

  const getSimScript = (targetLang: 'KO_EN' | 'KO_ZH'): SimStep[] => {
    if (lang === 'en') {
      // EN demo: the buyer (user) speaks English, the supplier speaks Korean (or Chinese in EN ↔ ZH mode).
      const toZh = targetLang === 'KO_ZH';
      return [
        {
          speaker: 'user',
          sender: 'buyer',
          text: "Hello! I'm calling about your listing in my GloSource AI report. I'd like to negotiate the unit price for our first order of collagen serum.",
          delay: 3500
        },
        {
          speaker: 'ai',
          sender: 'translator',
          text: toZh
            ? '[Interpreter → ZH] "您好！我是在GloSource AI报告中看到贵司后联系您的。我想为我们首批胶原蛋白精华液订单商讨一下单价。"'
            : '[Interpreter → KO] "안녕하세요! GloSource AI 보고서에서 귀사를 보고 연락드렸습니다. 콜라겐 세럼 첫 주문 단가를 협의하고 싶습니다."',
          delay: 4000
        },
        {
          speaker: 'ai',
          sender: 'supplier',
          text: toZh
            ? '"啊，您好！很高兴认识您。是的，我们看到了您的询价。我们的胶原蛋白精华液标准批发价是每支1.50美元，起订量(MOQ)是5,000支。"'
            : '"아, 안녕하세요! 반갑습니다. 네, 보내주신 RFQ 확인했습니다. 저희 콜라겐 세럼 표준 도매가는 개당 $1.50이고, 최소 주문 수량(MOQ)은 5,000개입니다."',
          delay: 5000
        },
        {
          speaker: 'ai',
          sender: 'translator',
          text: '[Interpreter → EN] "Hello, nice to meet you! Yes, we received your RFQ. Our standard wholesale price for the collagen serum is $1.50 per unit, and our MOQ is 5,000 units."',
          delay: 4500
        },
        {
          speaker: 'user',
          sender: 'buyer',
          text: "This would be our first launch in our market, so we'd like to start with a 1,000-unit trial order. Could you adjust the price or lower the MOQ?",
          delay: 3500
        },
        {
          speaker: 'ai',
          sender: 'translator',
          text: toZh
            ? '[Interpreter → ZH] "因为这是我们首次在本地市场推出，所以想先下一笔1,000支的试单。请问可以调整价格或降低起订量吗？"'
            : '[Interpreter → KO] "저희 시장에 처음 출시하는 제품이라 1,000개 테스트 주문으로 먼저 진행하고 싶습니다. 가격 조정이나 MOQ 하향이 가능할까요?"',
          delay: 4500
        },
        {
          speaker: 'ai',
          sender: 'supplier',
          text: toZh
            ? '"这样啊。1,000支对我们的生产线来说确实有点少，但考虑到您是诚意长期的合作伙伴，首次试单我们可以提供1,000支，但单价需要稍微提高到每支1.65美元。您觉得怎么样？"'
            : '"1,000개는 저희 생산 라인 기준으로는 적은 수량이지만, 장기 파트너가 되실 것 같으니 첫 시험 주문에 한해 개당 $1.65에 1,000개로 진행해 드릴 수 있습니다. 어떠신가요?"',
          delay: 5500
        },
        {
          speaker: 'ai',
          sender: 'translator',
          text: '[Interpreter → EN] "1,000 units is quite low for our production line, but since you look like a serious long-term partner, we can offer 1,000 units at a slightly higher trial price of $1.65 per unit. What do you think?"',
          delay: 4500
        },
        {
          speaker: 'user',
          sender: 'buyer',
          text: "That works for us. Let's do 1,000 units at $1.65 for the trial. If the market response is good, we'll move to regular orders of 5,000+ units. Please send the contract draft and PI by email.",
          delay: 4500
        },
        {
          speaker: 'ai',
          sender: 'translator',
          text: toZh
            ? '[Interpreter → ZH] "太好了！首笔测试订单我们将按每支1.65美元采购1,000支。如果市场反应良好，我们会转为5,000支以上的定期订单。请通过电子邮件发送合同草案和形式发票(PI)。"'
            : '[Interpreter → KO] "좋습니다. 첫 테스트는 개당 $1.65에 1,000개로 진행하겠습니다. 시장 반응이 좋으면 5,000개 이상 정기 주문으로 전환하겠습니다. 계약서 초안과 PI를 이메일로 보내주세요."',
          delay: 5000
        },
        {
          speaker: 'ai',
          sender: 'supplier',
          text: toZh
            ? '"太棒了。我马上给您发送形式发票(PI)和合同草案。我也会加您的联系方式，以保持顺畅的沟通。非常感谢您的合作！"'
            : '"좋습니다. 프로포마 인보이스(PI)와 계약서 초안을 바로 보내드리겠습니다. 원활한 소통을 위해 메신저로도 연락드리겠습니다. 감사합니다!"',
          delay: 4500
        },
        {
          speaker: 'ai',
          sender: 'translator',
          text: '[Interpreter → EN] "Perfect — I will send the Proforma Invoice (PI) and contract draft right away, and add you on messenger to keep communication smooth. Thank you for your business!"',
          delay: 4000
        }
      ];
    }

    // KO demo (original): the buyer speaks Korean, the supplier speaks English (or Chinese).
    return [
      {
        speaker: 'user',
        sender: 'buyer',
        text: '안녕하세요! GloSource AI 보고서를 보고 연락드렸습니다. 콜라겐 세럼 1차 오더 단가 협상차 연락했습니다.',
        delay: 3500
      },
      {
        speaker: 'ai',
        sender: 'translator',
        text: targetLang === 'KO_EN'
          ? '[Translator] "Hello! I am calling regarding your GloSource AI report. I would like to negotiate the unit price for our initial order of collagen serum."'
          : '[Translator] "您好！我是看了GloSource AI报告后联系您的。我想为我们首批胶原蛋白精华液订单商讨一下单价。"',
        delay: 4000
      },
      {
        speaker: 'ai',
        sender: 'supplier',
        text: targetLang === 'KO_EN'
          ? '[Supplier] "Oh, hello! Nice to meet you. Yes, we saw your RFQ. For our collagen serum, the standard wholesale price is $1.50 per unit, and our MOQ is 5,000 units."'
          : '[Supplier] "啊，您好！很高兴认识您。是的，我们看到了您的询价。我们的胶原蛋白精华液标准批发价是每支1.50美元，起订量(MOQ)是5,000支。"',
        delay: 5000
      },
      {
        speaker: 'ai',
        sender: 'translator',
        text: '[Translator] "아, 안녕하세요! 만나서 반갑습니다. 예, 송신해 주신 RFQ 확인했습니다. 저희 콜라겐 세럼의 기준 도매가는 개당 $1.50 이며, 기본 최소 주문 수량(MOQ)은 5,000개입니다."',
        delay: 4500
      },
      {
        speaker: 'user',
        sender: 'buyer',
        text: '저희가 한국 시장 첫 출시라 테스트 오더로 1,000개 먼저 진행해보고 싶은데, 가격 조정이나 MOQ 하향이 가능한가요?',
        delay: 3500
      },
      {
        speaker: 'ai',
        sender: 'translator',
        text: targetLang === 'KO_EN'
          ? '[Translator] "Since this is our first launch in the Korean market, we want to place a trial order of 1,000 units first. Is it possible to adjust the price or lower the MOQ?"'
          : '[Translator] "因为这是我们首次在韩国市场推出，所以想先下一笔1,000支的试单。请问可以调整价格或降低起订量吗？"',
        delay: 4500
      },
      {
        speaker: 'ai',
        sender: 'supplier',
        text: targetLang === 'KO_EN'
          ? '[Supplier] "I see. 1,000 units is quite low for our production line, but since you are a serious long-term partner, we can offer 1,000 units at a slightly higher price of $1.65 per unit for the first trial. What do you think?"'
          : '[Supplier] "这样啊。1,000支对我们的生产线来说确实有点少，但考虑到您是诚意长期的合作伙伴，首次试单我们可以提供1,000支，但单价需要稍微提高到每支1.65美元。您觉得怎么样？"',
        delay: 5500
      },
      {
        speaker: 'ai',
        sender: 'translator',
        text: '[Translator] "그렇군요. 1,000개는 저희 생산 라인 규모상 매우 적은 수량이지만, 장기적인 비즈니스 파트너임을 감안하여 첫 시험 주문에 한해 약간 인상된 단가인 개당 $1.65에 맞춰드릴 수 있습니다. 어떻게 생각하시나요?"',
        delay: 4500
      },
      {
        speaker: 'user',
        sender: 'buyer',
        text: '좋습니다! 첫 테스트는 개당 $1.65에 1,000개로 진행하겠습니다. 시장 반응이 좋으면 바로 5,000개 이상 정기 주문하겠습니다. 이메일이나 위챗으로 계약서 초안 보내주세요.',
        delay: 4500
      },
      {
        speaker: 'ai',
        sender: 'translator',
        text: targetLang === 'KO_EN'
          ? '[Translator] "Great! We will proceed with 1,000 units at $1.65 for the first test. If market response is good, we will place regular orders of over 5,000 units. Please send a contract draft via email or WeChat."'
          : '[Translator] "太好了！首笔测试订单我们将按每支1.65美元采购1,000支。如果市场反应良好，我们会立即定期订购5,000支以上。请通过电子邮件或微信发送合同草案。"',
        delay: 5000
      },
      {
        speaker: 'ai',
        sender: 'supplier',
        text: targetLang === 'KO_EN'
          ? '[Supplier] "Perfect. I will send you the PI and contract draft right away. I will also add you on WeChat to keep communication smooth. Thank you for your business!"'
          : '[Supplier] "太棒了。我马上给您发送形式发票(PI)和合同草案。我也会加您的微信，以保持顺畅的沟通。非常感谢您的合作！"',
        delay: 4500
      },
      {
        speaker: 'ai',
        sender: 'translator',
        text: '[Translator] "훌륭합니다. 프로포마 인보이스(PI)와 계약서 초안을 바로 발송해 드리겠습니다. 또한 원활한 소통을 위해 위챗 등록도 추가하겠습니다. 거래해 주셔서 대단히 감사합니다!"',
        delay: 4000
      }
    ];
  };

  // ----------------------------------------------------
  // RUN SIMULATION
  // ----------------------------------------------------
  const runSimulation = () => {
    setCallState('connecting');
    setTranscript([]);
    setSpeakerState('idle');
    setActiveStep(0);
    setErrorMsg(null);

    playTone(660, 150);

    simTimerRef.current = setTimeout(() => {
      setCallState('connected');
      playTone(880, 200);

      const script = getSimScript(languageMode);
      let currentStep = 0;

      const executeStep = () => {
        if (currentStep >= script.length) {
          // Simulation complete
          simTimerRef.current = setTimeout(() => {
            endCall(true); // Save summary
          }, 1500);
          return;
        }

        const step = script[currentStep];
        setSpeakerState(step.speaker);
        setActiveStep(currentStep);

        const newMsg: TranscriptItem = {
          id: `${Date.now()}-${currentStep}`,
          sender: step.sender,
          text: step.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        setTranscript((prev) => [...prev, newMsg]);

        // Synthesize soft speech ticks if no audio
        playTone(step.speaker === 'user' ? 440 : 550, 80);

        currentStep++;
        simTimerRef.current = setTimeout(executeStep, step.delay);
      };

      executeStep();
    }, 2000);
  };

  // ----------------------------------------------------
  // REAL LIVE CONNECTION FLOW (WebSocket to Gemini)
  // ----------------------------------------------------
  const startLiveCall = async () => {
    setCallState('connecting');
    setTranscript([]);
    setSpeakerState('idle');
    setErrorMsg(null);

    try {
      // 1. Get Key from API
      const res = await fetch('/api/voice/token', { signal: AbortSignal.timeout(5000) }).catch(() => null);
      let apiKey = '';

      if (res && res.ok) {
        const data = await res.json();
        apiKey = data.apiKey ?? '';
      }

      // No client-side env fallback: the long-lived key must never reach the browser.
      // Live voice needs a server-minted ephemeral token (not yet enabled) — fall back to Demo mode.
      if (!apiKey) {
        throw new Error(t.liveNotEnabled);
      }

      // 2. Request Mic Permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // 3. Initialize WebSocket
      // Connect to v1alpha endpoint supporting Live Bidirectional stream
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const buyerLangName = lang === 'en' ? 'English' : 'Korean';
      const supplierLangName = languageMode === 'KO_ZH'
        ? 'Chinese'
        : (lang === 'en' ? 'Korean' : 'English');

      ws.onopen = () => {
        // Send setup message
        const setup = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-latest",
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Kore" // Kore/Puck/Aoede/Fenrir
                  }
                }
              }
            },
            systemInstruction: {
              parts: [
                {
                  text: `You are GloSource Voice, a B2B real-time voice translation assistant.
The buyer (user) speaks ${buyerLangName}. The supplier speaks ${supplierLangName}.
Your task is to listen to ${buyerLangName} audio and output ${supplierLangName} speech, and vice versa.
Do NOT engage in conversations. ONLY translate.
Provide translations immediately, naturally, and accurately. Do not say things like "He says" or "She asks". Just output the translated speech directly.`
                }
              ]
            }
          }
        };
        ws.send(JSON.stringify(setup));

        // Start recording
        startRecording(stream);
        setCallState('connected');
        playTone(880, 200);
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Handle Model Turn Audio Chunk
          if (msg.serverContent?.modelTurn?.parts) {
            setSpeakerState('ai');
            for (const part of msg.serverContent.modelTurn.parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                const pcmBuffer = base64ToArrayBuffer(part.inlineData.data);
                playReceivedAudio(pcmBuffer);
              }
              if (part.text) {
                // Transcript text
                const textItem: TranscriptItem = {
                  id: `${Date.now()}-ai-text`,
                  sender: 'translator',
                  text: part.text,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setTranscript((prev) => [...prev, textItem]);
              }
            }
          }

          // Handle Turn Complete / Idle
          if (msg.serverContent?.turnComplete) {
            setSpeakerState('idle');
          }
        } catch (err) {
          console.error('Error parsing WS message', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WS Error:', err);
        setErrorMsg(t.connError);
        endCall(false);
      };

      ws.onclose = () => {
        console.log('WS Connection closed');
      };

    } catch (e: unknown) {
      console.error(e);
      setErrorMsg((e instanceof Error ? e.message : '') || t.connError);
      setIsDemoMode(true);
      setCallState('ready');
    }
  };

  // Start Mic Recording
  const startRecording = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      // ScriptProcessor is deprecated but widely compatible for simple raw PCM streaming in browser
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      nextPlayTimeRef.current = audioContext.currentTime;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return;
        setSpeakerState('user');

        const inputBuffer = e.inputBuffer.getChannelData(0);
        const pcmBuffer = convertFloat32To16BitPCM(inputBuffer);
        const base64Data = arrayBufferToBase64(pcmBuffer);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "audio/pcm",
                  data: base64Data
                }
              ]
            }
          }));
        }
      };
    } catch (err) {
      console.error('Failed to configure audio recording', err);
    }
  };

  // Playback Queue for received base64 PCM audio chunks
  const playReceivedAudio = (arrayBuffer: ArrayBuffer) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const int16Array = new Int16Array(arrayBuffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    // Gemini Live API sends 24kHz audio output
    const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContext.destination);

    const now = audioContext.currentTime;
    if (nextPlayTimeRef.current < now) {
      nextPlayTimeRef.current = now;
    }
    sourceNode.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += audioBuffer.duration;
  };

  // ----------------------------------------------------
  // END CALL & SAVE SUMMARY
  // ----------------------------------------------------
  const endCall = (saveHistory = true) => {
    playTone(440, 150);

    // Stop timers — the duration interval and the simulation timeout chain are separate
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    if (simTimerRef.current) clearTimeout(simTimerRef.current);

    // Clean connections
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    setSpeakerState('idle');

    if (saveHistory) {
      setCallState('summary');

      // Always report the real elapsed time — never a fabricated duration
      const min = Math.floor(duration / 60);
      const sec = duration % 60;
      const formattedDuration = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      const dateStr = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

      let summaryView: CallSummaryView;
      let historyItem: CallHistoryItem;

      if (isDemoMode) {
        // Demo mode: keep the scripted outcome, clearly labelled as simulated
        const demoTerms = lang === 'en'
          ? {
              price: '$1.65 / unit (USD)',
              priceSub: 'Slightly above the $1.50 base price for the trial run',
              moq: '1,000 units',
              moqSub: 'Down from the standard MOQ of 5,000',
              notes: [
                'Agreed on $1.65/unit for the first 1,000-unit trial order',
                'Base price of $1.50/unit to apply retroactively on repeat orders above 5,000 units',
                'Supplier to send the Proforma Invoice (PI) and contract draft by email',
                'Messenger contact to be exchanged for real-time shipment updates'
              ],
              historyPrice: '$1.65 / unit (trial-order price vs. $1.50 standard)',
              historyMoq: '1,000 units (down from the standard MOQ of 5,000)'
            }
          : {
              price: '개당 $1.65 (USD)',
              priceSub: '기본가 $1.50 대비 테스트단가 소폭 조정',
              moq: '1,000개 (Units)',
              moqSub: '기본 MOQ 5,000개에서 80% 인하',
              notes: [
                '첫 시험 주문 1,000개 수량에 대한 가격 $1.65 합의 완료',
                '추후 5,000개 초과 주문 시 $1.50 기준 단가 소급 적용 약속',
                '이메일 또는 위챗(WeChat)으로 계약서 및 Proforma Invoice(PI) 발송 예정',
                '위챗 추가 후 실시간 출하 정보 교류망 구축 예정'
              ],
              historyPrice: '$1.65 / unit (기존 $1.50 대비 테스트 물량 단가 재합의)',
              historyMoq: '1,000개 (기본 MOQ 5,000개에서 80% 하향 타결)'
            };

        summaryView = {
          kind: 'demo',
          duration: formattedDuration,
          language: langPairLabel,
          transcriptLines: transcript.length,
          price: demoTerms.price,
          priceSub: demoTerms.priceSub,
          moq: demoTerms.moq,
          moqSub: demoTerms.moqSub,
          notes: demoTerms.notes
        };
        historyItem = {
          id: `voice-${Date.now()}`,
          supplierName: supplier.name,
          date: dateStr,
          duration: formattedDuration,
          language: langPairLabel,
          price: demoTerms.historyPrice,
          moq: demoTerms.historyMoq,
          notes: demoTerms.notes,
          kind: 'demo'
        };
      } else {
        // Live mode: no auto-extracted terms — neutral record only
        const reviewNote = lang === 'en'
          ? 'Review the transcript for agreed terms.'
          : '합의 조건은 통화 스크립트에서 직접 확인하세요.';
        summaryView = {
          kind: 'live',
          duration: formattedDuration,
          language: langPairLabel,
          transcriptLines: transcript.length,
          notes: [reviewNote]
        };
        historyItem = {
          id: `voice-${Date.now()}`,
          supplierName: supplier.name,
          date: dateStr,
          duration: formattedDuration,
          language: langPairLabel,
          price: '',
          moq: '',
          notes: [reviewNote],
          kind: 'live'
        };
      }

      setSummary(summaryView);
      const updatedHistory = [historyItem, ...callHistory].slice(0, 10);
      setCallHistory(updatedHistory);
      localStorage.setItem('glosource_voice_history', JSON.stringify(updatedHistory));
    } else {
      setCallState('ready');
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = callHistory.filter((item) => item.id !== id);
    setCallHistory(updated);
    localStorage.setItem('glosource_voice_history', JSON.stringify(updated));
  };

  const formattedLiveDuration = `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.dialogLabel}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-opacity duration-300"
    >

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0d1b2a] to-[#080f18] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Glowing Orange/Blue Ambient spots */}
        <div className="absolute top-[-50px] left-1/4 w-[250px] h-[250px] rounded-full bg-orange-600/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-50px] right-1/4 w-[250px] h-[250px] rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#EA580C] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                GloSource Voice <span className="text-[10px] uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded font-black">BETA</span>
              </h2>
              <p className="text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={t.close} className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6 z-10">

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-950/50 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <svg className="w-4 h-4 mt-0.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-bold">{t.errorTitle}</p>
                <p className="mt-0.5 opacity-90">{errorMsg}</p>
              </div>
            </div>
          )}

          {callState === 'ready' && (
            <div className="space-y-6">

              {/* Supplier Info Badge */}
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <p className="text-[10px] text-orange-500 uppercase tracking-widest font-black mb-1">{t.supplierBadge}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{supplier.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{supplier.platform} · {supplier.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{t.listedPriceMoq}</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">{supplier.estimatedPrice || t.inquire} / {supplier.moq || t.inquire}</p>
                  </div>
                </div>
              </div>

              {/* Call Settings */}
              <div className="grid grid-cols-2 gap-4">

                {/* Language Selector */}
                <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">{t.langTitle}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.langDesc}</p>
                  </div>
                  <div className="mt-4 flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setLanguageMode('KO_EN')}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${languageMode === 'KO_EN' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      {t.langOptionA}
                    </button>
                    <button
                      onClick={() => setLanguageMode('KO_ZH')}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${languageMode === 'KO_ZH' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      {t.langOptionB}
                    </button>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">{t.modeTitle}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{t.modeDesc}</p>
                  </div>
                  <div className="mt-4 flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setIsDemoMode(true)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${isDemoMode ? 'bg-[#0d1b2a] text-orange-500 border border-orange-500/20 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      {t.modeDemo}
                    </button>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="flex-1 cursor-not-allowed rounded-lg py-2 text-center text-xs font-bold text-slate-600"
                    >
                      {t.modeLive}
                    </button>
                  </div>
                </div>

              </div>

              {/* Call Start CTA */}
              <div className="text-center py-4">
                <button
                  onClick={isDemoMode ? runSimulation : startLiveCall}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-extrabold text-sm px-10 py-4.5 rounded-full shadow-[0_0_25px_rgba(234,88,12,0.35)] transition-all hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.56 11.56 0 018.82 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1z" />
                  </svg>
                  {t.startCall}
                </button>
                <p className="text-[10px] text-slate-500 mt-3 leading-normal">
                  {isDemoMode ? t.demoNote : t.liveNote}
                </p>
              </div>

              {/* History Button & List */}
              <div className="border-t border-slate-800/80 pt-5">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>{lang === 'en' ? `📜 Recent call log (${callHistory.length})` : `📜 최근 통화 협상 일지 (${callHistory.length}건)`}</span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showHistory && (
                  <div className="mt-3 space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {callHistory.length === 0 ? (
                      <p className="text-center py-4 text-xs text-slate-600">{t.historyEmpty}</p>
                    ) : (
                      callHistory.map((item) => (
                        <div key={item.id} className="p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                          <div>
                            <p className="text-xs font-bold text-slate-200">{item.supplierName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.date} · {item.language} · {item.duration}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${item.kind === 'live' ? 'text-blue-400 bg-blue-950/40 border-blue-900/40' : 'text-orange-500 bg-orange-950/40 border-orange-900/40'}`}>
                              {item.kind === 'live' ? t.tagLive : t.tagDemo}
                            </span>
                            <button
                              onClick={(e) => deleteHistoryItem(item.id, e)}
                              className="text-slate-500 hover:text-red-400 p-1"
                              title={t.deleteTitle}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          )}

          {(callState === 'connecting' || callState === 'connected') && (
            <div className="flex flex-col items-center py-4 space-y-6">

              {/* Pulse Connection Screen */}
              <div className="w-full text-center space-y-2">
                <h3 className="text-sm font-bold text-white">{supplier.name}</h3>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#EA580C] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#EA580C] animate-ping" />
                  {callState === 'connecting'
                    ? t.connecting
                    : (lang === 'en' ? `On call (${formattedLiveDuration})` : `통화 진행 중 (${formattedLiveDuration})`)}
                </div>
              </div>

              {/* Dynamic Wave Visualizer Canvas */}
              <div className="relative w-full h-[100px] bg-slate-950/40 border border-slate-800/80 rounded-2xl flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} width={600} height={100} className="w-full h-full" />
                {speakerState !== 'idle' && (
                  <span className={`absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${speakerState === 'user' ? 'bg-orange-600 text-white animate-pulse' : 'bg-blue-600 text-white animate-pulse'}`}>
                    {speakerState === 'user' ? 'Buyer Speaking' : 'AI Translating'}
                  </span>
                )}
              </div>

              {/* Live Transcription Log */}
              <div className="w-full flex flex-col space-y-3 bg-slate-950/50 border border-slate-900 rounded-2xl p-4 min-h-[180px] max-h-[220px] overflow-y-auto">
                <p className="text-[10px] text-slate-500 font-bold border-b border-slate-900 pb-1.5 mb-1.5">{t.transcriptTitle}</p>
                {transcript.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-600">
                    {callState === 'connecting' ? t.waitingChannel : t.speakNow}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transcript.map((msg) => {
                      const isBuyer = msg.sender === 'buyer';
                      const isTranslator = msg.sender === 'translator';

                      let bubbleStyle = 'bg-slate-900 text-slate-300 mr-auto';
                      let senderName: string = t.senderSupplier;

                      if (isBuyer) {
                        bubbleStyle = 'bg-orange-950/40 border border-orange-900/30 text-orange-200 ml-auto';
                        senderName = t.senderBuyer;
                      } else if (isTranslator) {
                        bubbleStyle = 'bg-[#0d1b2a] border border-blue-900/30 text-blue-300 mr-auto';
                        senderName = t.senderTranslator;
                      }

                      return (
                        <div key={msg.id} className="flex flex-col space-y-1">
                          <span className={`text-[10px] font-bold text-slate-500 ${isBuyer ? 'text-right' : ''}`}>
                            {senderName} <span className="font-normal opacity-70">({msg.timestamp})</span>
                          </span>
                          <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${bubbleStyle}`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={transcriptEndRef} />
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex items-center gap-6">

                {/* Mute Button */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4.5 rounded-full border transition-all ${isMuted ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'}`}
                  title={isMuted ? t.unmute : t.mute}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    {isMuted ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </button>

                {/* Terminate Button */}
                <button
                  onClick={() => endCall(true)}
                  className="p-5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-all hover:scale-105"
                  title={t.endCallTitle}
                >
                  <svg className="w-6 h-6 fill-current rotate-[135deg]" viewBox="0 0 24 24">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1A11.56 11.56 0 018.82 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.62c0-.55-.45-1-1-1z" />
                  </svg>
                </button>

                {/* Volume indicator or placeholder */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-500">
                  <span className="text-[10px] font-bold">{isDemoMode ? 'DEMO' : 'LIVE'}</span>
                </div>

              </div>

            </div>
          )}

          {callState === 'summary' && summary && (
            <div className="space-y-5">

              {/* End-of-call Alert */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/25 rounded-2xl flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-200">{summary.kind === 'demo' ? t.demoAlertTitle : t.liveAlertTitle}</p>
                  <p className="text-[10px] text-emerald-400/90 mt-0.5">{summary.kind === 'demo' ? t.demoAlertSub : t.liveAlertSub}</p>
                </div>
              </div>

              {/* Summary Details */}
              <div className="p-5 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs text-slate-400 font-semibold">{summary.kind === 'demo' ? t.summaryTitleDemo : t.summaryTitleLive}</h4>
                      {summary.kind === 'demo' && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-orange-600/20 border border-orange-500/40 text-orange-400 px-2 py-0.5 rounded">
                          {t.demoBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white mt-0.5">{supplier.name}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md">
                    {t.durationLabel} {summary.duration}
                  </span>
                </div>

                {summary.kind === 'demo' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 font-semibold">{t.priceLabel}</p>
                      <p className="text-sm font-black text-orange-500 mt-1">{summary.price}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{summary.priceSub}</p>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 font-semibold">{t.moqLabel}</p>
                      <p className="text-sm font-black text-blue-400 mt-1">{summary.moq}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{summary.moqSub}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 font-semibold">{t.langPairLabel}</p>
                      <p className="text-sm font-black text-orange-500 mt-1">{summary.language}</p>
                    </div>
                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] text-slate-400 font-semibold">{t.linesLabel}</p>
                      <p className="text-sm font-black text-blue-400 mt-1">{summary.transcriptLines}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-300">{summary.kind === 'demo' ? t.notesLabel : (lang === 'en' ? 'Next step' : '다음 단계')}</p>
                  <ul className="space-y-2">
                    {summary.notes.map((note, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setCallState('ready')}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-5 py-3.5 rounded-xl border border-slate-800 transition-colors"
                >
                  {t.newCall}
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#EA580C] hover:bg-orange-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md transition-colors"
                >
                  {t.saveClose}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
