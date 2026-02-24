
import type { Service } from '../types'
import { formatCurrency, statusClass, statusLabel, formatTimeAgo } from '../utils/formatters'

interface MyServiceListItemProps {
    service: Service
    onClick: (id: string) => void
}

export function MyServiceListItem({ service, onClick }: MyServiceListItemProps) {
    return (
        <div
            className="group relative bg-forest-800 border border-white/5 rounded-[32px] p-8 transition-all duration-500 hover:border-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/5 cursor-pointer overflow-hidden flex flex-col h-full"
            onClick={() => onClick(service.id)}
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

            {/* Header: Status & Time */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${statusClass(service.status)}`}>
                    {statusLabel(service.status)}
                </span>
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500/40"></span>
                    {formatTimeAgo(service.created_at)}
                </div>
            </div>

            {/* Content: Title & Stats */}
            <div className="flex-grow space-y-4 relative z-10">
                <h3 className="text-xl font-black text-white leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {service.title}
                </h3>

                <div className="flex items-center gap-6">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Propostas</div>
                        <div className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                            {service.proposals_count || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Budget */}
            <div className="mt-8 pt-8 border-t border-white/5 relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Orçamento</div>
                    <div className="text-lg font-black text-white tracking-tighter">
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
    )
}
