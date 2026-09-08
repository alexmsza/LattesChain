"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Layers,
  Cpu,
  ArrowRight,
  TrendingUp,
  Video,
  Tv,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { SLIDES_DATA, TEAM_MEMBERS, SlideData } from "./slides-data";

type FontSizeLevel = "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
const FONT_SIZES: FontSizeLevel[] = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

const DRAWER_FONT_CLASSES: Record<FontSizeLevel, string> = {
  "2xs": "text-[10px] sm:text-[11px] leading-snug",
  xs: "text-[11px] sm:text-xs leading-normal",
  sm: "text-xs leading-relaxed",
  md: "text-xs sm:text-sm leading-relaxed",
  lg: "text-sm sm:text-base leading-relaxed font-medium",
  xl: "text-base sm:text-lg leading-relaxed font-medium",
  "2xl": "text-lg sm:text-xl leading-relaxed font-semibold",
};

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [speakerWindowOpened, setSpeakerWindowOpened] = useState(false);
  const [speakerFontSize, setSpeakerFontSize] = useState<FontSizeLevel>("md");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const totalSlides = SLIDES_DATA.length;
  const slide = SLIDES_DATA[currentSlide];

  // Ref estável para responder a REQUEST_STATE sem reinicializar o canal
  const syncStateRef = useRef({
    currentSlide,
    timerSeconds,
    isTimerRunning,
    speakerFontSize,
  });

  useEffect(() => {
    syncStateRef.current = {
      currentSlide,
      timerSeconds,
      isTimerRunning,
      speakerFontSize,
    };
  }, [currentSlide, timerSeconds, isTimerRunning, speakerFontSize]);

  // Carregar preferência salva de tamanho de fonte das notas
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("lattes_pitch_font_size");
      if (saved && FONT_SIZES.includes(saved as FontSizeLevel)) {
        setSpeakerFontSize(saved as FontSizeLevel);
      }
    } catch {}
  }, []);

  // BroadcastChannel setup para comunicação bidirecional com a janela do orador
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("lattes_pitch_sync");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "SYNC_SLIDE" && typeof payload?.slideIndex === "number") {
          const target = payload.slideIndex;
          if (target >= 0 && target < totalSlides) {
            setCurrentSlide(target);
          }
        } else if (type === "SYNC_TIMER") {
          if (typeof payload?.seconds === "number") setTimerSeconds(payload.seconds);
          if (typeof payload?.isRunning === "boolean") setIsTimerRunning(payload.isRunning);
        } else if (type === "SYNC_FONT_SIZE") {
          if (payload?.fontSize && FONT_SIZES.includes(payload.fontSize as FontSizeLevel)) {
            setSpeakerFontSize(payload.fontSize as FontSizeLevel);
          }
        } else if (type === "REQUEST_STATE") {
          // Quando a janela de orador abrir, responde o estado corrente através do ref
          channel?.postMessage({
            type: "SYNC_SLIDE",
            payload: { slideIndex: syncStateRef.current.currentSlide },
          });
          channel?.postMessage({
            type: "SYNC_TIMER",
            payload: {
              seconds: syncStateRef.current.timerSeconds,
              isRunning: syncStateRef.current.isTimerRunning,
            },
          });
          channel?.postMessage({
            type: "SYNC_FONT_SIZE",
            payload: { fontSize: syncStateRef.current.speakerFontSize },
          });
        }
      };
    } catch {
      // Fallback para ambientes sem suporte a BroadcastChannel
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lattes_pitch_sync_event" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.type === "SYNC_SLIDE" && typeof parsed.slideIndex === "number") {
            const idx = parsed.slideIndex;
            if (idx >= 0 && idx < totalSlides) {
              setCurrentSlide(idx);
            }
          } else if (parsed.type === "SYNC_FONT_SIZE" && parsed.fontSize) {
            if (FONT_SIZES.includes(parsed.fontSize as FontSizeLevel)) {
              setSpeakerFontSize(parsed.fontSize as FontSizeLevel);
            }
          }
        } catch {}
      } else if (e.key === "lattes_pitch_current_slide" && e.newValue) {
        const idx = parseInt(e.newValue, 10);
        if (!isNaN(idx) && idx >= 0 && idx < totalSlides) {
          setCurrentSlide(idx);
        }
      } else if (e.key === "lattes_pitch_font_size" && e.newValue) {
        if (FONT_SIZES.includes(e.newValue as FontSizeLevel)) {
          setSpeakerFontSize(e.newValue as FontSizeLevel);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [totalSlides]);

  // Função para abrir notas do orador em janela independente pop-out
  const openSpeakerWindow = useCallback(() => {
    setShowNotes(false); // Oculta notas locais para deixar tela limpa para gravação
    setSpeakerWindowOpened(true);
    
    const width = 1120;
    const height = 820;
    const left = typeof window !== "undefined" ? window.screenX + 60 : 100;
    const top = typeof window !== "undefined" ? window.screenY + 60 : 100;

    const popup = window.open(
      "/pitch/speaker",
      "LattesPitchSpeakerNotes",
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
    if (popup) {
      popup.focus();
    }
  }, []);

  // Notificar outros ouvintes quando o slide mudar
  const broadcastSlide = useCallback((idx: number) => {
    try {
      broadcastChannelRef.current?.postMessage({
        type: "SYNC_SLIDE",
        payload: { slideIndex: idx },
      });
      localStorage.setItem("lattes_pitch_current_slide", idx.toString());
      localStorage.setItem(
        "lattes_pitch_sync_event",
        JSON.stringify({ type: "SYNC_SLIDE", slideIndex: idx, timestamp: Date.now() })
      );
    } catch {
      // ignore
    }
  }, []);

  // Notificar cronômetro
  const broadcastTimer = useCallback((sec: number, running: boolean) => {
    try {
      broadcastChannelRef.current?.postMessage({
        type: "SYNC_TIMER",
        payload: { seconds: sec, isRunning: running },
      });
    } catch {
      // ignore
    }
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const nextVal = prev + 1;
          broadcastTimer(nextVal, true);
          return nextVal;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, broadcastTimer]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => {
      const next = !prev;
      broadcastTimer(timerSeconds, next);
      return next;
    });
  }, [timerSeconds, broadcastTimer]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    broadcastTimer(0, false);
  }, [broadcastTimer]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = Math.min(prev + 1, totalSlides - 1);
      broadcastSlide(next);
      return next;
    });
  }, [totalSlides, broadcastSlide]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const next = Math.max(prev - 1, 0);
      broadcastSlide(next);
      return next;
    });
  }, [broadcastSlide]);

  const goToSlide = useCallback((idx: number) => {
    if (idx >= 0 && idx < totalSlides) {
      setCurrentSlide(idx);
      broadcastSlide(idx);
    }
  }, [totalSlides, broadcastSlide]);

  // Alternar modo de gravação 100% limpo
  const toggleRecordingMode = useCallback(() => {
    setIsRecordingMode((prev) => {
      const next = !prev;
      if (next) setShowNotes(false);
      return next;
    });
  }, []);

  // Ajustes de tamanho de fonte das notas com sincronização
  const changeFontSize = useCallback((newSize: FontSizeLevel) => {
    setSpeakerFontSize(newSize);
    try {
      localStorage.setItem("lattes_pitch_font_size", newSize);
      broadcastChannelRef.current?.postMessage({
        type: "SYNC_FONT_SIZE",
        payload: { fontSize: newSize },
      });
    } catch {}
  }, []);

  const increaseFontSize = useCallback(() => {
    setSpeakerFontSize((curr) => {
      const idx = FONT_SIZES.indexOf(curr);
      const next = idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1] : curr;
      try {
        localStorage.setItem("lattes_pitch_font_size", next);
        broadcastChannelRef.current?.postMessage({
          type: "SYNC_FONT_SIZE",
          payload: { fontSize: next },
        });
      } catch {}
      return next;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setSpeakerFontSize((curr) => {
      const idx = FONT_SIZES.indexOf(curr);
      const next = idx > 0 ? FONT_SIZES[idx - 1] : curr;
      try {
        localStorage.setItem("lattes_pitch_font_size", next);
        broadcastChannelRef.current?.postMessage({
          type: "SYNC_FONT_SIZE",
          payload: { fontSize: next },
        });
      } catch {}
      return next;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          prevSlide();
          break;
        case "Home":
          e.preventDefault();
          goToSlide(0);
          break;
        case "End":
          e.preventDefault();
          goToSlide(totalSlides - 1);
          break;
        case "n":
        case "N":
          e.preventDefault();
          setShowNotes((v) => !v);
          break;
        case "o":
        case "O":
          e.preventDefault();
          openSpeakerWindow();
          break;
        case "g":
        case "G":
          e.preventDefault();
          toggleRecordingMode();
          break;
        case "t":
        case "T":
          e.preventDefault();
          toggleTimer();
          break;
        case "r":
        case "R":
          e.preventDefault();
          resetTimer();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "+":
        case "=":
          e.preventDefault();
          increaseFontSize();
          break;
        case "-":
        case "_":
          e.preventDefault();
          decreaseFontSize();
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
          const target = parseInt(e.key, 10) - 1;
          if (target >= 0 && target < totalSlides) {
            goToSlide(target);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, totalSlides, toggleTimer, resetTimer, openSpeakerWindow, toggleRecordingMode, goToSlide, increaseFontSize, decreaseFontSize]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`min-h-[calc(100vh-4rem)] flex flex-col bg-[#0b0813] text-white selection:bg-solana-purple selection:text-white transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 p-3 md:p-6"
          : isRecordingMode
          ? "px-2 py-2 sm:px-4 sm:py-3"
          : "px-3 py-4 sm:px-6 sm:py-6"
      }`}
    >
      {/* SE ESTIVER NO MODO GRAVAÇÃO: BARRA DISCRETA DE STATUS */}
      {isRecordingMode ? (
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2 py-1 px-3 mb-2 rounded-xl bg-slate-900/60 border border-rose-500/30 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-rose-300 text-[11px] sm:text-xs">
              Modo Gravação Ativo (Tela Limpa 16:9)
            </span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Notas sincronizadas em outra janela
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
              <Clock className="h-3 w-3 text-solana-green" />
              <span>{formatTime(timerSeconds)}</span>
            </div>

            <button
              onClick={openSpeakerWindow}
              className="px-2 py-0.5 rounded-md bg-solana-purple/20 hover:bg-solana-purple/30 text-solana-purpleSoft text-[11px] border border-solana-purple/40 flex items-center gap-1 transition-colors"
              title="Abrir teleprompter com notas em 2ª tela (O)"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Reabrir Notas (O)</span>
            </button>

            <button
              onClick={toggleRecordingMode}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 flex items-center gap-1 transition-colors"
              title="Sair do modo gravação e restaurar painéis (G)"
            >
              <span>Restaurar Painéis (G)</span>
            </button>
          </div>
        </div>
      ) : (
        /* TOP HEADER CONTROLS (MODO NORMAL) */
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-solana-purple/20 border border-solana-purple/40 text-solana-purple shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm sm:text-base font-bold text-white tracking-tight">
                  Lattes<span className="text-solana-green">Chain</span>
                </span>
                <span className="rounded-full bg-solana-purple/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-solana-purple border border-solana-purple/30">
                  Pitch 5 Minutos
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Superteam Brasil Hackathon • Slide {currentSlide + 1} de {totalSlides}
              </p>
            </div>
          </div>

          {/* TIMER BAR & CONTROLES DE JANELA DUPLA / GRAVAÇÃO */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* STOPWATCH */}
            <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3 py-1.5 shadow-inner">
              <Clock className="h-3.5 w-3.5 text-solana-green animate-pulse" />
              <span
                className={`font-mono text-xs sm:text-sm font-bold tracking-wider ${
                  timerSeconds > 300 ? "text-rose-400" : timerSeconds > 240 ? "text-amber-400" : "text-slate-200"
                }`}
              >
                {formatTime(timerSeconds)} <span className="text-slate-500 font-normal">/ 05:00</span>
              </span>
              <button
                onClick={toggleTimer}
                title={isTimerRunning ? "Pausar cronômetro (T)" : "Iniciar cronômetro (T)"}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {isTimerRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-solana-green" />}
              </button>
              <button
                onClick={resetTimer}
                title="Zerar cronômetro (R)"
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* SEPARAR NOTAS EM OUTRA JANELA (POP-OUT / 2ª TELA) */}
            <button
              onClick={openSpeakerWindow}
              className="inline-flex items-center gap-1.5 rounded-xl border border-solana-green/40 bg-solana-green/10 hover:bg-solana-green/20 text-solana-green px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
              title="Abre as notas do orador e teleprompter em uma janela separada para você gravar apenas os slides (Atalho: O)"
            >
              <Tv className="h-3.5 w-3.5" />
              <span>Separar Notas (Janela Pop-out)</span>
              <span className="text-[10px] opacity-70 font-mono">(O)</span>
            </button>

            {/* MODO GRAVAÇÃO LIMPO (OCULTA TUDO EXCETO SLIDE) */}
            <button
              onClick={toggleRecordingMode}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
              title="Ativar visual limpo para gravação de vídeo/OBS (Atalho: G)"
            >
              <Video className="h-3.5 w-3.5 text-rose-400" />
              <span className="hidden sm:inline">Modo Gravação</span>
              <span className="text-[10px] opacity-70 font-mono">(G)</span>
            </button>

            {/* TOGGLE SPEAKER NOTES EMBUTIDA */}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                showNotes
                  ? "border-solana-purple/50 bg-solana-purple/20 text-solana-purple"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
              }`}
              title="Mostrar/Ocultar notas embutidas na página (Atalho: N)"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Notas Embutidas</span>
              <span className="text-[10px] opacity-60 font-mono">(N)</span>
            </button>

            {/* FULLSCREEN TOGGLE */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              title="Alternar tela cheia (F)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* PROGRESS TRACKER (OCULTO EM MODO GRAVAÇÃO PARA LIMPEZA VISUAL) */}
      {!isRecordingMode && (
        <div className="max-w-7xl mx-auto w-full pt-2">
          <div className="grid grid-cols-6 gap-1 sm:gap-2">
            {SLIDES_DATA.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => goToSlide(idx)}
                className={`group flex flex-col gap-1 text-left transition-all ${
                  idx === currentSlide ? "opacity-100" : "opacity-40 hover:opacity-80"
                }`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "bg-gradient-to-r from-solana-purple to-solana-green shadow-sm shadow-solana-purple/50"
                      : idx < currentSlide
                      ? "bg-solana-purple/70"
                      : "bg-slate-800"
                  }`}
                />
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-300 truncate hidden sm:block">
                  {idx + 1}. {s.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN SLIDE VIEWPORT */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col py-4">
        <div className="relative flex-1 w-full min-h-[440px] rounded-3xl border border-slate-800/90 bg-gradient-to-b from-[#140e26]/80 via-[#0e0a1b]/95 to-[#0b0813] shadow-2xl shadow-solana-purple/10 overflow-hidden flex flex-col justify-between p-6 sm:p-10">
          {/* SLIDE BACKGROUND GLOW DECORATIONS */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-solana-purple/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-72 w-72 rounded-full bg-solana-green/10 blur-3xl pointer-events-none" />

          {/* SLIDE TOP META */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-solana-purple/40 bg-solana-purple/10 px-3 py-1 text-xs font-semibold text-solana-purpleSoft">
                <Sparkles className="h-3 w-3 text-solana-green" />
                {slide.badge}
              </span>
              {!isRecordingMode && (
                <span className="rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-mono text-slate-300 border border-slate-700/60">
                  {slide.timeRange}
                </span>
              )}
            </div>
            {!isRecordingMode && (
              <span className="text-xs text-slate-400 font-mono">
                Use as setas <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">←</kbd>{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">→</kbd> ou clique nos botões
              </span>
            )}
          </div>

          {/* SLIDE DYNAMIC CONTENT */}
          <div className="relative z-10 my-auto py-4">
            {/* SLIDE 0: CAPA / ABERTURA */}
            {currentSlide === 0 && (
              <div className="space-y-6 max-w-4xl">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-solana-green">
                    Solana Attestation Service • Token-2022 Soulbound • W3C VC
                  </span>
                  <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                    Lattes<span className="text-solana-green">Chain</span>
                  </h1>
                  <p className="text-lg sm:text-2xl font-semibold text-slate-200">
                    O Passaporte Acadêmico Global Descentralizado e Soberano
                  </p>
                  <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
                    Transformando diplomas, históricos escolares e horas complementares em atestações imutáveis,
                    livres de fraude e verificáveis em menos de 1 segundo em qualquer país do mundo.
                  </p>
                </div>

                {/* 3 PILARES SUMMARY */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-solana-purpleSoft font-bold text-sm">
                      <GraduationCap className="h-4 w-4 text-solana-purple" />
                      1. Aluno Soberano
                    </div>
                    <p className="text-xs text-slate-300">
                      O histórico pertence à carteira do aluno. Compartilhável via QR Code ou link em 1 clique.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-solana-green font-bold text-sm">
                      <Building2 className="h-4 w-4 text-solana-green" />
                      2. IES Sem Burocracia
                    </div>
                    <p className="text-xs text-slate-300">
                      Emissão assinada no SAS em 2s. Elimina 80% do trabalho manual das secretarias acadêmicas.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <ShieldCheck className="h-4 w-4 text-blue-400" />
                      3. Validação RH + IA
                    </div>
                    <p className="text-xs text-slate-300">
                      Checagem instantânea on-chain em &lt;400ms e equivalência curricular semântica por IA.
                    </p>
                  </div>
                </div>

                {!isRecordingMode && (
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={nextSlide}
                      className="inline-flex items-center gap-2 rounded-full bg-solana-purple px-6 py-3 text-sm font-bold text-white shadow-lg shadow-solana-purple/30 hover:bg-solana-purpleDeep hover:scale-105 transition-all"
                    >
                      Iniciar Apresentação (5 Min)
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <Link
                      href="/validator"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                    >
                      Abrir Validador Ao Vivo
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* SLIDE 1: O PROBLEMA */}
            {currentSlide === 1 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-300 mt-1">{slide.subtitle}</p>
                </div>

                {/* STATS IMPACTANTES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Dado Global UNESCO</span>
                      <AlertTriangle className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl font-black text-white">6 Milhões +</div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      De estudantes transfronteiriços travados por falta de padronização, lentidão e custos consulares
                      na validação de qualificações acadêmicas.
                    </p>
                    <span className="text-[10px] text-slate-400 italic">Fonte: UNESCO Global Convention on Recognition</span>
                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">HireRight Benchmark</span>
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="font-display text-3xl sm:text-4xl font-black text-white">#1 Em Inconsistência</div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Adulterações e discrepâncias em histórico educacional lideram o ranking de fraudes detectadas em
                      processos seletivos corporativos no mundo todo.
                    </p>
                    <span className="text-[10px] text-slate-400 italic">Fonte: HireRight Global Screening Benchmark</span>
                  </div>
                </div>

                {/* AS 3 VÍTIMAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                    <span className="text-xs font-bold text-solana-purpleSoft">1. Estudantes</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Perdem prazos de bolsas de estudo, intercâmbios e vagas no exterior por semanas de espera burocrática.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                    <span className="text-xs font-bold text-solana-purpleSoft">2. Secretarias de IES</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Gargalo crônico respondendo e-mails e telefonemas de terceiros para confirmar autenticidade de papéis.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
                    <span className="text-xs font-bold text-solana-purpleSoft">3. RHs e Empresas</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Gastam de 5 a 15 dias em background check educacional sem garantia real de integridade documental.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 2: A SOLUÇÃO */}
            {currentSlide === 2 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-300 mt-1">{slide.subtitle}</p>
                </div>

                {/* 4 ETAPAS DA SOLUÇÃO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-solana-purple/30 bg-slate-900/80 p-5 space-y-2 relative overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-solana-purple/20 text-solana-purple flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="font-bold text-white text-base">Emissão Oficial</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      A faculdade ancora a credencial diretamente no protocolo aberto via assinatura digital, criando uma
                      prova matemática na Solana.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-solana-purple/30 bg-slate-900/80 p-5 space-y-2 relative overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-solana-purple/20 text-solana-purple flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="font-bold text-white text-base">Posse Soberana</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      A credencial é entregue à custódia do aluno com disponibilidade perene, complementando os sistemas
                      da faculdade com preservação histórica permanente.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-solana-purple/30 bg-slate-900/80 p-5 space-y-2 relative overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-solana-purple/20 text-solana-purple flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h3 className="font-bold text-white text-base">Partilha Fácil</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      O aluno compartilha um link público seguro ou QR Code no currículo, LinkedIn ou candidatura de
                      emprego.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-solana-green/40 bg-slate-900/80 p-5 space-y-2 relative overflow-hidden">
                    <div className="h-8 w-8 rounded-lg bg-solana-green/20 text-solana-green flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <h3 className="font-bold text-white text-base">Auditoria &lt;1s</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Qualquer recrutador ou universidade no mundo confere a autenticidade on-chain instantaneamente sem
                      intermediários.
                    </p>
                  </div>
                </div>

                {/* PADRÃO W3C VC CALLOUT */}
                <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Lock className="h-4 w-4" />
                      Padrão Internacional: W3C Verifiable Credentials Data Model v2.0
                    </div>
                    <p className="text-xs text-slate-300">
                      Interoperabilidade global comprovada matematicamente por criptografia assimétrica de curva elíptica ed25519.
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-mono bg-blue-900/40 text-blue-300 border border-blue-500/30 rounded-lg px-3 py-1.5">
                    w3.org/TR/vc-data-model-2.0
                  </span>
                </div>
              </div>
            )}

            {/* SLIDE 3: POR QUE SOLANA? */}
            {currentSlide === 3 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-300 mt-1">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-solana-purple/40 bg-slate-900/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-solana-purpleSoft font-bold text-sm">
                      <Layers className="h-4 w-4 text-solana-purple" />
                      1. Solana Attestation Service (SAS)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Padrão oficial da rede para atestações verificáveis on-chain. Interoperabilidade imediata com
                      Civic e Solana ID para identidade unificada.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-solana-green/40 bg-slate-900/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-solana-green font-bold text-sm">
                      <Lock className="h-4 w-4 text-solana-green" />
                      2. Token-2022 NonTransferable
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Soulbound Token nativo ao nível de protocolo. O token cola na carteira do aluno; nenhuma transação
                      consegue vendê-lo ou transferi-lo.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/40 bg-slate-900/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-400" />
                      3. PermanentDelegate (Revogação)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Em caso de fraude detectada ou anulação judicial, a universidade revoga o título on-chain sem
                      depender de autorização do aluno.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      4. Custo Sub-Centavo (&lt; R$ 0,01)
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Emitir centenas de milhares de disciplinas custa frações de centavo de real. Em Ethereum custaria
                      entre US$ 5 e US$ 50 por transação.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-500/40 bg-slate-900/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                      <ShieldCheck className="h-4 w-4 text-indigo-400" />
                      5. LGPD & GDPR por Design
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Zero dados sensíveis (CPF, nome) gravados on-chain. Ancoramos apenas o hash SHA-256 do documento
                      canônico com assinatura ed25519.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-pink-500/40 bg-slate-900/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-pink-300 font-bold text-sm">
                      <Cpu className="h-4 w-4 text-pink-400" />
                      6. Zero Cripto Onboarding
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Nem faculdades nem alunos compram cripto: nosso relayer atua como Fee Payer corporativo,
                      absorvendo as micro-taxas gasless.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: NA PRÁTICA (DEMO & IA) */}
            {currentSlide === 4 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-300 mt-1">{slide.subtitle}</p>
                </div>

                {/* 4 TELAS EM AÇÃO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-solana-purple">
                        Secretaria IES
                      </span>
                      <h4 className="font-bold text-sm text-white">1. Emissão On-Chain</h4>
                      <p className="text-xs text-slate-300">
                        Cadastro de notas, ementas e Portaria MEC com ancoragem assinada no SAS em 2 segundos.
                      </p>
                    </div>
                    {!isRecordingMode && (
                      <Link
                        href="/university"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-all"
                      >
                        Ver Portal IES <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-solana-green">
                        Estudante
                      </span>
                      <h4 className="font-bold text-sm text-white">2. Meu Passaporte</h4>
                      <p className="text-xs text-slate-300">
                        Visualização de credenciais, progresso de horas complementares e QR Code de apresentação pública.
                      </p>
                    </div>
                    {!isRecordingMode && (
                      <Link
                        href="/student"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-all"
                      >
                        Ver Passaporte <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                        Empresa / RH
                      </span>
                      <h4 className="font-bold text-sm text-white">3. Validador Instantâneo</h4>
                      <p className="text-xs text-slate-300">
                        Upload de PDF (hash calculado localmente no browser) ou consulta por hash em menos de 400ms.
                      </p>
                    </div>
                    {!isRecordingMode && (
                      <Link
                        href="/validator"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-900/30 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-800/50 transition-all"
                      >
                        Test Drive 1 Clique <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>

                  <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                        Gemini 1.5 Pro
                      </span>
                      <h4 className="font-bold text-sm text-white">4. Camada de IA</h4>
                      <p className="text-xs text-slate-300">
                        Gera Trust Report executivo e calcula equivalência curricular semântica entre ementas diferentes.
                      </p>
                    </div>
                    {!isRecordingMode && (
                      <Link
                        href="/validator"
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-900/30 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-800/50 transition-all"
                      >
                        Testar Equivalência <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* PROTOTYPE LIVE CALLOUT */}
                <div className="rounded-2xl border border-solana-green/40 bg-solana-green/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-solana-green/20 text-solana-green flex items-center justify-center shrink-0">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Protótipo 100% Funcional e Auditado</h4>
                      <p className="text-xs text-slate-300">
                        Contratos Anchor, scripts Solana SAS em Python, backend em Go e 4 presets de teste disponíveis no /validator.
                      </p>
                    </div>
                  </div>
                  {!isRecordingMode && (
                    <Link
                      href="/validator"
                      className="inline-flex items-center gap-2 rounded-xl bg-solana-green px-5 py-2.5 text-xs font-bold text-navy-900 hover:bg-emerald-300 transition-all shadow-md shrink-0"
                    >
                      Abrir Simulador On-Chain
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* SLIDE 5: TIME E PRÓXIMOS PASSOS */}
            {currentSlide === 5 && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-sm sm:text-lg text-slate-300 mt-1">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* TIME & STACK */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-solana-purpleSoft">
                        Equipe de Engenharia • JOVIAN TECH
                      </span>
                      <Users className="h-4 w-4 text-solana-purple" />
                    </div>

                    <div className="space-y-3">
                      {TEAM_MEMBERS.map((member, i) => (
                        <div key={i}>
                          <div className="font-bold text-white text-xs sm:text-sm">
                            {member.name} • <span className="text-solana-purpleSoft">{member.role}</span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">
                            {member.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-solana-green">
                        Stack MVP Custo Zero
                      </span>
                      <p className="text-xs text-slate-400">
                        Go (Relayer ultraleve) • Python + Gemini AI • Supabase (Postgres RLS) • Next.js 14 • Solana Devnet/Mainnet
                      </p>
                    </div>
                  </div>

                  {/* ROADMAP EM 3 FASES */}
                  <div className="rounded-2xl border border-solana-purple/30 bg-slate-900/70 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-solana-green">
                        Roadmap de Execução & GTM
                      </span>
                      <TrendingUp className="h-4 w-4 text-solana-green" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-solana-purple/20 text-solana-purpleSoft flex items-center justify-center font-bold text-xs shrink-0">
                          1
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">Fase 1: Piloto Beachhead</div>
                          <p className="text-xs text-slate-300">
                            Emissão de horas complementares e certificados de extensão com Centros Acadêmicos (sem trava regulatória).
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-solana-purple/20 text-solana-purpleSoft flex items-center justify-center font-bold text-xs shrink-0">
                          2
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">Fase 2: Expansão Internacional</div>
                          <p className="text-xs text-slate-300">
                            Calibração da IA para compatibilidade com o Processo de Bolonha (ECTS - Europa) e faculdades dos EUA.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="h-6 w-6 rounded-full bg-solana-green/20 text-solana-green flex items-center justify-center font-bold text-xs shrink-0">
                          3
                        </span>
                        <div>
                          <div className="font-bold text-white text-xs sm:text-sm">Fase 3: Mainnet & ERPs Legados</div>
                          <p className="text-xs text-slate-300">
                            State Compression na Mainnet e integração via API REST v1 para ERPs (TOTVS RM, Sophia, ATS Gupy).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SLIDE FOOTER NAVIGATION */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className={`flex items-center gap-2 transition-opacity ${isRecordingMode ? "opacity-0 hover:opacity-100" : ""}`}>
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="inline-flex items-center gap-1 rounded-xl bg-solana-purple px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-solana-purpleDeep disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              {!isRecordingMode && (
                <>
                  <span>{slide.timeRange}</span>
                  <span>•</span>
                </>
              )}
              <span>Slide {currentSlide + 1} de {totalSlides}</span>
            </div>

            {!isRecordingMode && (
              <div className="flex items-center gap-2">
                <Link
                  href="/validator"
                  className="text-xs text-solana-green hover:underline flex items-center gap-1"
                >
                  Testar Validador Ao Vivo <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SPEAKER NOTES DRAWER (RECOLHÍVEL COM TECLA N) */}
      {showNotes && (
        <div className="max-w-7xl mx-auto w-full mt-2 rounded-2xl border border-solana-purple/30 bg-[#120c22]/95 backdrop-blur-md p-4 sm:p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/40 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-solana-purple" />
              <span className="font-bold text-xs sm:text-sm text-white">
                Notas do Orador & Script de Fala Guiada — Slide {currentSlide + 1}: {slide.category}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              {/* CONTROLE DE TAMANHO DE FONTE DAS NOTAS */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 p-1 shadow-inner">
                <button
                  onClick={decreaseFontSize}
                  disabled={speakerFontSize === "2xs"}
                  className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  title="Diminuir fonte das notas (-)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-solana-purple/20 text-solana-purpleSoft border border-solana-purple/30">
                  Aa {speakerFontSize}
                </span>
                <button
                  onClick={increaseFontSize}
                  disabled={speakerFontSize === "2xl"}
                  className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                  title="Aumentar fonte das notas (+)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              <span className="font-mono text-solana-green font-semibold hidden sm:inline">Meta de Tempo: {slide.timeRange}</span>
              <button
                onClick={() => setShowNotes(false)}
                className="text-slate-400 hover:text-white text-xs underline"
              >
                Ocultar (N)
              </button>
            </div>
          </div>

          {/* SELETOR DIRETO DE FALA (MUDAR A FALA ALTERA O SLIDE JUNTO) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-purple-900/30">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-solana-green animate-pulse" /> Trocar Fala:
              </span>
              {SLIDES_DATA.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    idx === currentSlide
                      ? "bg-solana-purple text-white border-solana-purple shadow-sm ring-1 ring-solana-purple/50"
                      : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                  title={`Ir para a fala e slide ${idx + 1}: ${s.category}`}
                >
                  Fala {idx + 1} • {s.category}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                title="Fala anterior (muda o slide junto)"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Fala Anterior
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="px-2.5 py-1 rounded-lg bg-solana-purple/30 border border-solana-purple/50 text-xs font-semibold text-solana-purpleSoft hover:bg-solana-purple hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1"
                title="Próxima fala (muda o slide junto)"
              >
                Próxima Fala <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
            {/* SCRIPT DE FALA FALADA (PALAVRA POR PALAVRA) */}
            <div className="lg:col-span-2 space-y-2 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="text-solana-purpleSoft">🎙️ O que falar (Script do Vídeo):</span>
                  <span className="rounded bg-solana-green/10 border border-solana-green/30 px-2 py-0.5 text-[10px] text-solana-green font-mono">
                    Slide {currentSlide + 1} ativo
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">~60 segundos de fala</span>
              </div>
              <p className={`text-slate-200 leading-relaxed font-sans italic ${DRAWER_FONT_CLASSES[speakerFontSize]}`}>
                &ldquo;{slide.speakerScript}&rdquo;
              </p>
            </div>

            {/* OBJETIVOS E FONTES CONSULTÁVEIS */}
            <div className="space-y-3">
              <div className="space-y-1 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="font-semibold text-amber-300">🎯 Ponto-Chave para a Banca:</span>
                <p className="text-slate-300 leading-normal">{slide.keyObjective}</p>
              </div>

              <div className="space-y-1.5 bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="font-semibold text-solana-green">📚 Fontes Consultáveis Citadas:</span>
                <div className="space-y-1">
                  {slide.citations.map((c, i) => (
                    <div key={i} className="flex flex-col">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-solana-purpleSoft hover:underline flex items-center gap-1 font-medium"
                      >
                        {c.name} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <span className="text-[10px] text-slate-400">{c.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 italic bg-purple-950/20 p-2 rounded-lg border border-purple-900/30">
                💡 <strong>Dica de Oratória:</strong> {slide.deliveryTip}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
