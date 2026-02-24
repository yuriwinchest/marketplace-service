import type { Service } from '../types'
import { formatCurrency, formatTimeAgo, formatLocation, urgencyLabel } from '../utils/formatters'

interface ServiceCardProps {
    service: Service
    onClick: (id: string) => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
    const isHighUrgency = service.urgency === 'high'

    return (
        <div
            className={`group relative bg-forest-800 border ${isHighUrgency ? 'border-emerald-500/30' : 'border-white/5'} rounded-[32px] p-8 transition-all duration-500 hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer overflow-hidden flex flex-col h-full`}
            onClick={() => onClick(service.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick(service.id)
                }
            }}
        >
            {/* Background Glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${isHighUrgency ? 'bg-emerald-500/10' : 'bg-emerald-500/5'} rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>

            {/* Header: Client & Urgency */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[16px] bg-emerald-500/10 flex items-center justify-center text-xl text-emerald-400 font-black border border-emerald-500/10 shadow-inner">
                        {service.client_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                        <div className="text-white font-black text-sm tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                            {service.client_name || 'Particular'}
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-emerald-500/40"></span>
                            {formatTimeAgo(service.created_at)}
                        </div>
                    </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${isHighUrgency
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-gray-400 border-white/5'
                    }`}>
                    {urgencyLabel(service.urgency)}
                </div>
            </div>

            {/* Content: Title & Description */}
            <div className="flex-grow space-y-4 relative z-10">
                <h3 className="text-xl font-black text-white leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {service.title}
                </h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed line-clamp-3 italic opacity-80">
                    "{service.description || 'Sem descrição detalhada disponível para esta demanda.'}"
                </p>
            </div>

            {/* Footer: Tags & Budget */}
            <div className="mt-10 pt-8 border-t border-white/5 space-y-6 relative z-10">
                <div className="flex flex-wrap gap-2 text-gray-500">
                    <span className="bg-forest-900/50 border border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <span>📁</span> {service.category_name || 'Geral'}
                    </span>
                    <span className="bg-forest-900/50 border border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-2">
                        <span>📍</span> {formatLocation(service)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Orçamento Estimado</div>
                        <div className="text-2xl font-black text-white tracking-tighter">
                            {service.budget_min && service.budget_max
                                ? `${formatCurrency(service.budget_min)} - ${formatCurrency(service.budget_max)}`
                                : 'A combinar'}
                        </div>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-forest-900 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 group-hover:translate-x-2 transition-transform duration-300">
                        →
                    </div>
                </div>
            </div>
        </div>
    )
}
