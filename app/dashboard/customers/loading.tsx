export default function Loading() {
    return (
        <div className="w-full h-full p-4 md:p-6 animate-pulse flex flex-col gap-4 md:gap-6">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2 md:mb-4">
                <div className="h-8 bg-slate-200/50 rounded-lg w-1/2 md:w-1/3"></div>
                <div className="h-10 bg-slate-200/50 rounded-xl w-full md:w-32"></div>
            </div>

            {/* Stats/Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="h-28 bg-white/60 rounded-2xl border border-slate-100 shadow-sm"></div>
                <div className="h-28 bg-white/60 rounded-2xl border border-slate-100 shadow-sm"></div>
                <div className="h-28 bg-white/60 rounded-2xl border border-slate-100 shadow-sm"></div>
                <div className="h-28 bg-white/60 rounded-2xl border border-slate-100 shadow-sm"></div>
            </div>

            {/* Table/List Skeleton */}
            <div className="mt-2 md:mt-4 flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-6 flex flex-col gap-3 md:gap-4">
                <div className="h-6 bg-slate-200/50 rounded-md w-1/3 mb-2 md:mb-4"></div>
                
                {/* Search/Filter Bar */}
                <div className="flex gap-4 mb-2">
                    <div className="h-10 bg-slate-100 rounded-xl w-full"></div>
                    <div className="h-10 bg-slate-100 rounded-xl w-24 shrink-0"></div>
                </div>

                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-14 bg-slate-50 rounded-xl w-full flex items-center px-4 gap-4">
                        <div className="h-8 w-8 bg-slate-200/50 rounded-full shrink-0"></div>
                        <div className="h-4 bg-slate-200/50 rounded w-1/4"></div>
                        <div className="h-4 bg-slate-200/50 rounded w-1/4 ml-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
