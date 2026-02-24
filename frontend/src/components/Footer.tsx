export function Footer() {
  return (
    <footer className="relative bg-[#021a0f] border-t border-white/5 pt-24 pb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[30%] h-[50%] bg-[#10b981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-20 items-start">

          {/* Left Column: Profile */}
          <section className="space-y-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-black text-[#10b981]">Yuri Winchester</h2>
                <div className="h-1.5 w-24 bg-[#10b981] rounded-full" />
              </div>
              <h3 className="text-2xl font-bold text-white">Desenvolvedor Full Stack</h3>
            </div>

            <div className="space-y-6">
              <p className="text-base font-bold text-emerald-100/90 italic leading-relaxed">
                Especialista em React, Node.js, Sistemas e Sistemas Empresariais Personalizados
              </p>
              <p className="text-sm leading-relaxed text-emerald-100/50 max-w-xl">
                Com foco para ofertar as melhores soluções digitais, especializado em desenvolvimento e implementação rápidos de fácil gestão, entregando assim produtos que geram valor imediato.
              </p>
            </div>

            <a
              href="https://yuriwinchester.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-[#10b981] font-black text-sm tracking-widest transition-all hover:gap-5"
            >
              YURIWINCHESTER.COM.BR
              <span className="text-xl">→</span>
            </a>
          </section>

          {/* Right Column: Contact Container */}
          <section className="rounded-[48px] border border-white/5 bg-white/5 p-10 md:p-14 space-y-12 shadow-2xl">
            <h3 className="text-2xl font-black text-white flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] text-xs">●</span>
              Informações de Contato
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Contact Card 1 */}
              <div className="flex items-center gap-5 rounded-3xl border border-white/5 bg-[#021a0f]/60 p-6 transition-all hover:border-[#10b981]/30 hover:bg-[#042f1c]/60 group shadow-lg">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#10b981]/50 mb-1">EMAIL</p>
                  <p className="text-sm font-black text-white truncate">yurialmide@gmail.com</p>
                </div>
              </div>

              {/* Contact Card 2 */}
              <div className="flex items-center gap-5 rounded-3xl border border-white/5 bg-[#021a0f]/60 p-6 transition-all hover:border-[#10b981]/30 hover:bg-[#042f1c]/60 group shadow-lg">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#10b981]/50 mb-1">WHATSAPP</p>
                  <p className="text-sm font-black text-white truncate">+55 61 99552-1849</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.open('https://yuriwinchester.com.br', '_blank')}
              className="w-full py-5 rounded-3xl bg-[#10b981] text-base font-black text-[#021a0f] transition-all hover:bg-[#059669] hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)] shadow-xl"
            >
              Ver Perfil Completo
            </button>
          </section>
        </div>

        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-white/5 text-center">
          <p className="text-xs font-bold text-emerald-100/30 tracking-widest uppercase">
            © 2004 Yuri Winchester. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
