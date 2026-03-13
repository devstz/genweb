import { Button } from "@/components/ui/button";
import { LucideSettings, LucideShieldCheck, LucideTerminal, LucideZap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-zinc-800 selection:text-zinc-100 overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-900/50 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-zinc-800/30 rounded-full blur-[120px]" />
      </div>

      {/* Шапка */}
      <header className="relative z-20 border-b border-zinc-800/50 backdrop-blur-md bg-zinc-950/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-zinc-100 p-1.5 rounded-lg">
              <LucideTerminal className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Панель Управления</span>
          </div>

          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-xl px-5 transition-all">
              <LucideShieldCheck className="w-4 h-4 mr-2" />
              Вход в систему
            </Button>
          </Link>
        </div>
      </header>

      {/* Основной контент */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-24 md:py-32">
        <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          {/* Метка */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
            </span>
            Система генерации контента
          </div>

          {/* Заголовок */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
            УПРАВЛЕНИЕ <br /> AI БОТОМ.
          </h1>

          {/* Описание */}
          <p className="max-w-xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed">
            Централизованный интерфейс для мониторинга генераций, <br /> управления шаблонами и контроля ресурсов системы.
          </p>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Link href="/login">
              <Button className="h-16 px-10 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 font-black text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
                <LucideZap className="w-5 h-5 mr-3 fill-zinc-950" />
                НАЧАТЬ РАБОТУ
              </Button>
            </Link>

            <Button variant="outline" className="h-16 px-10 rounded-2xl border-zinc-800 bg-transparent text-zinc-100 hover:bg-zinc-900 font-bold transition-all">
              <LucideSettings className="w-5 h-5 mr-3" />
              КОНФИГУРАЦИЯ
            </Button>
          </div>
        </div>

        {/* Декоративные элементы */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl aspect-square pointer-events-none">
          <div className="absolute top-1/4 left-0 w-32 h-32 bg-zinc-800/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-zinc-900/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </main>

      {/* Подвал */}
      <footer className="relative z-20 border-t border-zinc-800/30 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center items-center gap-6">
          <p className="text-zinc-600 text-sm font-medium">
            © 2026 СИСТЕМА УПРАВЛЕНИЯ AI. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </p>
        </div>
      </footer>
    </div>
  );
}
