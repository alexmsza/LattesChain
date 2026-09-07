"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Target,
  Lightbulb,
  BookOpen,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Radio,
  Sliders,
} from "lucide-react";
import { SLIDES_DATA, TEAM_MEMBERS, SlideData } from "../slides-data";

export default function SpeakerNotesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<"sm" | "md" | "lg" | "xl">("lg");
  const [channelConnected, setChannelConnected] = useState(false);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  const totalSlides = SLIDES_DATA.length;
  const slide = SLIDES_DATA[currentSlide];
  const nextSlideData = currentSlide < totalSlides - 1 ? SLIDES_DATA[currentSlide + 1] : null;

  // BroadcastChannel setup for real-time bidirectional synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("lattes_pitch_sync");
      broadcastChannelRef.current = channel;
      setChannelConnected(true);

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === "SYNC_SLIDE" && typeof payload?.slideIndex === "number") {
          setCurrentSlide(payload.slideIndex);
        } else if (type === "SYNC_TIMER") {
          if (typeof payload?.seconds === "number") setTimerSeconds(payload.seconds);
          if (typeof payload?.isRunning === "boolean") setIsTimerRunning(payload.isRunning);
        }
      };

      // Solicit slide sync from main presentation on open
      channel.postMessage({ type: "REQUEST_STATE" });
    } catch {
      // Fallback: storage event
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lattes_pitch_current_slide" && e.newValue) {
        const idx = parseInt(e.newValue, 10);
        if (!isNaN(idx) && idx >= 0 && idx < totalSlides) {
          setCurrentSlide(idx);
        }
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [totalSlides]);

  // Notify other windows when slide changes locally
  const broadcastSlideChange = useCallback((idx: number) => {
    try {
      broadcastChannelRef.current?.postMessage({
        type: "SYNC_SLIDE",
        payload: { slideIndex: idx },
      });
      localStorage.setItem("lattes_pitch_current_slide", idx.toString());
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
          return nextVal;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => {
      const next = !prev;
      broadcastChannelRef.current?.postMessage({
        type: "SYNC_TIMER",
        payload: { seconds: timerSeconds, isRunning: next },
      });
      return next;
    });
  }, [timerSeconds]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    broadcastChannelRef.current?.postMessage({
      type: "SYNC_TIMER",
      payload: { seconds: 0, isRunning: false },
    });
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const nextIdx = Math.min(prev + 1, totalSlides - 1);
      broadcastSlideChange(nextIdx);
      return nextIdx;
    });
  }, [totalSlides, broadcastSlideChange]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const prevIdx = Math.max(prev - 1, 0);
      broadcastSlideChange(prevIdx);
      return prevIdx;
    });
  }, [broadcastSlideChange]);

  const goToSlide = (idx: number) => {
    if (idx >= 0 && idx < totalSlides) {
      setCurrentSlide(idx);
      broadcastSlideChange(idx);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
        case "+":
        case "=":
          e.preventDefault();
          setFontSizeLevel((curr) => (curr === "sm" ? "md" : curr === "md" ? "lg" : "xl"));
          break;
        case "-":
        case "_":
          e.preventDefault();
          setFontSizeLevel((curr) => (curr === "xl" ? "lg" : curr === "lg" ? "md" : "sm"));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, toggleTimer, resetTimer]);

  const fontClasses = {
    sm: "text-base sm:text-lg leading-relaxed",
    md: "text-lg sm:text-xl leading-relaxed",
    lg: "text-xl sm:text-2xl leading-relaxed font-medium",
    xl: "text-2xl sm:text-3xl leading-loose font-medium",
  }[fontSizeLevel];

  return (
    <div className="min-h-screen bg-[#07050d] text-slate-100 flex flex-col selection:bg-solana-purple selection:text-white font-sans">
      {/* TOP STATUS BAR */}
      <header className="sticky top-0 z-30 bg-[#0d0918]/95 backdrop-blur-md border-b border-purple-900/40 px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* LOGO & TITLE */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-solana-purple/20 border border-solana-purple/40 text-solana-purple">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-white text-base">
                  Lattes<span className="text-solana-green">Chain</span>
                </span>
                <span className="rounded-full bg-solana-purple/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-solana-purpleSoft border border-solana-purple/40">
                  Notas do Orador
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-solana-green font-medium">
                  <Radio className="h-3 w-3 animate-pulse" /> Sincronizado
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Slide {currentSlide + 1} de {totalSlides}: <strong className="text-slate-200">{slide.category}</strong>
              </p>
            </div>
          </div>

          {/* CRONÔMETRO DE GRAVAÇÃO */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-1.5 shadow-inner">
              <Clock className="h-4 w-4 text-solana-green animate-pulse" />
              <span
                className={`font-mono text-base font-extrabold tracking-wider ${
                  timerSeconds > 300
                    ? "text-rose-400 animate-pulse"
                    : timerSeconds > 240
                    ? "text-amber-400"
                    : "text-solana-green"
                }`}
              >
                {formatTime(timerSeconds)}
                <span className="text-slate-500 font-normal text-xs ml-1">/ 05:00</span>
              </span>
              <button
                onClick={toggleTimer}
                title="Pausar / Iniciar (T)"
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-solana-green" />}
              </button>
              <button
                onClick={resetTimer}
                title="Zerar cronômetro (R)"
                className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* AJUSTE DE FONTE */}
            <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-950 border border-slate-800 p-1">
              <button
                onClick={() => setFontSizeLevel((c) => (c === "xl" ? "lg" : c === "lg" ? "md" : "sm"))}
                disabled={fontSizeLevel === "sm"}
                className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                title="Diminuir texto (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-mono uppercase px-1 text-slate-400">
                {fontSizeLevel}
              </span>
              <button
                onClick={() => setFontSizeLevel((c) => (c === "sm" ? "md" : c === "md" ? "lg" : "xl"))}
                disabled={fontSizeLevel === "xl"}
                className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition-all"
                title="Aumentar texto (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>

            {/* RETORNAR À APRESENTAÇÃO */}
            <Link
              href="/pitch"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-solana-purple/40 bg-solana-purple/20 px-3 py-1.5 text-xs font-bold text-solana-purpleSoft hover:bg-solana-purple/30 transition-all"
            >
              Ver Slides <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* SLIDES MINI SELECTOR BAR */}
        <div className="max-w-6xl mx-auto grid grid-cols-6 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
          {SLIDES_DATA.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`text-left p-1.5 rounded-lg border transition-all ${
                idx === currentSlide
                  ? "bg-solana-purple/20 border-solana-purple text-white shadow-sm"
                  : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold">Slide {idx + 1}</span>
                <span className="font-mono text-[9px] opacity-75">{s.timeRange.split(" ")[0]}</span>
              </div>
              <p className="text-[10px] font-medium truncate mt-0.5">{s.category}</p>
            </button>
          ))}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto w-full flex-1 p-4 sm:p-6 space-y-6">
        {/* SLIDE CONTEXT BANNER */}
        <div className="rounded-2xl border border-purple-900/40 bg-gradient-to-r from-purple-950/40 via-slate-950/70 to-slate-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-solana-purple/20 border border-solana-purple/30 px-3 py-1 text-xs font-semibold text-solana-purpleSoft">
              <Sparkles className="h-3.5 w-3.5" />
              {slide.badge}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-white mt-1.5">
              {slide.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">{slide.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Meta de Tempo</div>
              <div className="font-mono text-sm sm:text-base font-bold text-solana-green">{slide.timeRange}</div>
            </div>
          </div>
        </div>

        {/* PRIMARY TELEPROMPTER SCRIPT (O QUE FALAR PALAVRA POR PALAVRA) */}
        <section className="rounded-3xl border border-solana-purple/50 bg-[#120c22]/90 backdrop-blur-md p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎙️</span>
              <h2 className="font-display text-base sm:text-lg font-bold text-white">
                Roteiro Falado Palavra por Palavra (Script Guiado)
              </h2>
            </div>
            <span className="text-xs font-mono text-solana-purpleSoft bg-solana-purple/10 px-2.5 py-1 rounded-full border border-solana-purple/30">
              ~60s de locução fluida
            </span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl p-5 sm:p-7 border border-slate-800/90 shadow-inner">
            <p className={`text-slate-100 font-sans ${fontClasses}`}>
              &ldquo;{slide.speakerScript}&rdquo;
            </p>
          </div>
        </section>

        {/* GUIDANCE & DETAILS DUAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* PONTO-CHAVE PARA A BANCA */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
              <Target className="h-4 w-4" />
              <h3>Objetivo Crucial do Slide (O que a Banca Deve Reter)</h3>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {slide.keyObjective}
            </p>
          </div>

          {/* DICA DE ORATÓRIA & POSTURA */}
          <div className="rounded-2xl border border-solana-green/30 bg-solana-green/10 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-solana-green font-bold text-sm">
              <Lightbulb className="h-4 w-4" />
              <h3>Dica de Entrega & Entonação</h3>
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {slide.deliveryTip}
            </p>
          </div>
        </div>

        {/* ESPECIAL SLIDE 5: EQUIPE COMPLETA JOVIAN TECH */}
        {currentSlide === 5 && (
          <div className="rounded-2xl border border-solana-purple/40 bg-slate-950/90 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-solana-purpleSoft">
                  Participantes da Equipe • Jovian Tech
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">3 Integrantes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {TEAM_MEMBERS.map((member, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-1">
                  <div className="font-bold text-white text-sm">{member.name}</div>
                  <div className="text-xs font-semibold text-solana-purpleSoft">{member.role}</div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEXT SLIDE PREVIEW (O QUE VEM A SEGUIR) */}
        {nextSlideData && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                A Seguir • Slide {nextSlideData.id + 1} ({nextSlideData.category})
              </span>
              <h4 className="text-sm font-bold text-white">{nextSlideData.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{nextSlideData.subtitle}</p>
            </div>
            <button
              onClick={nextSlide}
              className="inline-flex items-center gap-1.5 rounded-xl bg-solana-purple/30 border border-solana-purple/50 px-4 py-2 text-xs font-bold text-solana-purpleSoft hover:bg-solana-purple hover:text-white transition-all shrink-0"
            >
              Avançar <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* CITATIONS & SOURCES */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
            <BookOpen className="h-3.5 w-3.5 text-solana-purpleSoft" />
            <span>Fontes & Normativas Citadas Neste Bloco:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {slide.citations.map((c, i) => (
              <a
                key={i}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-solana-purple/40 transition-all text-slate-300 hover:text-white"
              >
                <div>
                  <div className="font-semibold text-solana-purpleSoft">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.note}</div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </main>

      {/* STICKY BOTTOM CONTROLS */}
      <footer className="sticky bottom-0 z-30 bg-[#0d0918]/95 backdrop-blur-md border-t border-purple-900/40 p-3 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Slide Anterior (←)
          </button>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>Espaço/→ = Avançar</span>
            <span>•</span>
            <span>T = Cronômetro</span>
            <span>•</span>
            <span>+/- = Fonte</span>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="inline-flex items-center gap-1.5 rounded-xl bg-solana-purple px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-solana-purpleDeep disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Próximo Slide (→)
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
