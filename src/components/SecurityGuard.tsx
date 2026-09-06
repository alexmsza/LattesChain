"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export function SecurityGuard() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Bloqueio de Clique Direito (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      // Permite contexto em inputs e textareas para acessibilidade de digitação
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
      showToast("Ambiente Protegido: cópia e inspeção direta desabilitadas pelo protocolo LattesChain.");
    };

    // 2. Bloqueio de Teclas de Atalho de Inspeção e Extração de Código
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        showToast("DevTools desabilitadas por política de integridade institucional.");
        return;
      }

      // Ctrl+U / Cmd+Option+U (Exibir Código Fonte)
      if (cmdOrCtrl && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        showToast("Visualização de código-fonte desabilitada.");
        return;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspecionar Elemento)
      if (cmdOrCtrl && e.shiftKey && (e.key === "I" || e.key === "i")) {
        e.preventDefault();
        showToast("Inspeção de elementos bloqueada.");
        return;
      }

      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if (cmdOrCtrl && e.shiftKey && (e.key === "J" || e.key === "j")) {
        e.preventDefault();
        showToast("Console bloqueado para proteção do ambiente.");
        return;
      }

      // Ctrl+Shift+C (Seletor de elementos)
      if (cmdOrCtrl && e.shiftKey && (e.key === "C" || e.key === "c")) {
        e.preventDefault();
        showToast("Seletor de elementos desabilitado.");
        return;
      }

      // Ctrl+S / Cmd+S (Salvar página completa)
      if (cmdOrCtrl && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        showToast("Gravação offline desabilitada. Valide atestações no /validator.");
        return;
      }
    };

    // 3. Prevenção de arrasto de imagens/documentos
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "A") {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("dragstart", handleDragStart);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-solana-green/40 bg-navy-950/95 px-4 py-3 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
        <ShieldAlert className="h-5 w-5 text-solana-green shrink-0 animate-pulse" />
        <span className="leading-snug">{toastMessage}</span>
      </div>
    </div>
  );
}
