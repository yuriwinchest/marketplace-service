export function Footer() {
  return (
    <footer className="relative bg-[#071a0f] border-t border-white/5 pt-16 pb-10 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#10b981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-start">

          {/* Left: Profile */}
          <div className="flex gap-6 items-start">
            {/* Avatar */}
            <div className="w-20 h-20 shrink-0 rounded-full bg-[#10b981]/20 border-2 border-[#10b981]/30 flex items-center justify-center text-3xl overflow-hidden">
              <span>👨‍💻</span>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl font-black text-white">Yuri Winchester</h2>
                <p className="text-sm font-bold text-white/60 mt-0.5">Desenvolvedor Full Stack</p>
              </div>
              <p className="text-xs text-white/50 italic">
                Especialista em React, Node.js, Sistemas Web, Comércio e Sistemas Empresariais Personalizados
              </p>
              <p className="text-xs text-white/35 leading-relaxed max-w-sm">
                Com foco para ofertar as melhores soluções digitais, especializado em desenvolvimento e
                implementação rápidos de fácil gestão, entregando assim produtos que geram valor imediato.
              </p>
              <a
                href="https://yuriwinchester.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#10b981] font-black text-xs tracking-widest hover:gap-3 transition-all"
              >
                YURIWINCHESTER.COM.BR <span>→</span>
              </a>
            </div>
          </div>

          {/* Right: Contact Card */}
          <div className="rounded-2xl border border-white/5 bg-white/3 p-6 space-y-4 min-w-[240px]">
            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#10b981]/50">Email</p>
                <p className="text-sm font-bold text-white">yurialmide@gmail.com</p>
              </div>
            </div>

            {/* Whatsapp */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 shrink-0 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#10b981]/50">Whatsapp</p>
                <p className="text-sm font-bold text-white">+55 61 99552-1849</p>
              </div>
            </div>

            <button
              onClick={() => window.open('https://yuriwinchester.com.br', '_blank')}
              className="w-full py-2.5 rounded-xl bg-[#10b981] text-xs font-black text-[#021a0f] hover:bg-[#059669] transition-all"
            >
              Ver Perfil Completo
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-xs text-white/20 tracking-widest">
            © 2024 Yuri Winchester. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
