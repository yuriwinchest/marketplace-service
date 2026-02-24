export function Footer() {
  return (
    <footer className="relative bg-[#021a0f] border-t border-[#34d399]/10 pt-24 pb-12 overflow-hidden">
      {/* Decorative background for footer */}
      <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-[#10b981]/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-5%] w-[20%] h-[40%] bg-[#10b981]/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-start">

          {/* Left: Identity Section */}
          <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
            {/* Avatar with luxury border */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[#10b981] blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <div className="w-28 h-28 relative z-10 rounded-[40px] bg-gradient-to-br from-[#064328] to-[#021a0f] border-2 border-[#10b981]/30 flex items-center justify-center text-5xl overflow-hidden shadow-2xl transition-transform group-hover:scale-105 group-hover:rotate-3">
                <span className="grayscale-0">👨‍💻</span>
              </div>
            </div>

            {/* Resume Info */}
            <div className="space-y-4">
              <div>
                <h2 className="text-3xl font-black font-display text-white tracking-tight">Yuri Winchester</h2>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#10b981] mt-1">Full Stack Architect</p>
              </div>
              <p className="text-sm text-emerald-100/40 font-medium leading-relaxed max-w-sm">
                Transformando visões complexas em interfaces de alto impacto e sistemas escaláveis. Foco total em
                <span className="text-white"> performance</span>, <span className="text-white">agilidade</span> e <span className="text-white">valor imediato</span>.
              </p>
              <div className="pt-2">
                <a
                  href="https://yuriwinchester.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-white font-black text-xs tracking-[0.2em] uppercase group"
                >
                  Yuriwinchester.com.br
                  <span className="w-8 h-px bg-[#10b981] group-hover:w-12 transition-all" />
                </a>
              </div>
            </div>
          </div>

          {/* Right: Connect Card */}
          <div className="glass-panel rounded-[40px] p-10 border-[#10b981]/15 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />

            <h3 className="text-xl font-black font-display text-white relative z-10">Vamos <span className="text-[#10b981]">Conectar?</span></h3>

            <div className="space-y-6 relative z-10">
              {/* Link items */}
              {[
                { l: 'E-mail Profissional', v: 'yurialmide@gmail.com', i: '📩' },
                { l: 'Direct WhatsApp', v: '+55 61 99552-1849', i: '💬' }
              ].map(item => (
                <div key={item.l} className="group cursor-default">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981]/40 group-hover:text-[#10b981] transition-colors mb-1">{item.l}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{item.i}</span>
                    <p className="text-base font-bold text-white/80 group-hover:text-white transition-colors">{item.v}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.open('https://yuriwinchester.com.br', '_blank')}
              className="w-full h-14 rounded-2xl bg-white/5 hover:bg-[#10b981] text-emerald-100/60 hover:text-[#021a0f] border border-white/5 hover:border-[#10b981] text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-3 relative z-10"
            >
              Conheça o Portfolio Completo
            </button>
          </div>
        </div>

        {/* Global Footer Credits */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 group-hover:opacity-100 transition-opacity">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
            © 2024 Yuri Winchester — All Rights Reserved
          </p>
          <div className="flex items-center gap-6">
            <div className="h-px w-12 bg-white/20" />
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
          </div>
        </div>
      </div>
    </footer>
  )
}
