'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaBuilding, FaChevronDown, FaCheck, FaUserTie } from 'react-icons/fa';

interface Workspace {
    id: string;
    name: string;
    role: string;
    type: 'PERSONAL' | 'STAFF';
}

export default function WorkspaceSwitcher() {
    const { data: session } = useSession();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user) return;
        
        const fetchWorkspaces = async () => {
            try {
                const res = await fetch('/api/workspaces');
                if (res.ok) {
                    const data = await res.json();
                    setWorkspaces(data.workspaces || []);
                }
            } catch (err) {
                console.error("Failed to fetch workspaces", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWorkspaces();
    }, [session]);

    if (loading) {
        return (
            <div className="w-full mb-4 z-[70] animate-pulse">
                <div className="h-12 bg-slate-200 rounded-xl"></div>
            </div>
        );
    }

    const currentWorkspaceId = session?.user?.id;
    const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0] || { name: 'My Business', role: 'OWNER', type: 'PERSONAL', id: currentWorkspaceId };
    const hasMultipleWorkspaces = workspaces.length > 1;

    const switchWorkspace = (workspace: Workspace) => {
        document.cookie = `billgst_workspace_id=${workspace.id}; path=/; max-age=31536000`;
        document.cookie = `billgst_workspace_role=${workspace.role}; path=/; max-age=31536000`;
        setIsOpen(false);
        window.location.reload();
    };

    return (
        <div className="relative w-full mb-4 z-[70]">
            <button 
                onClick={() => hasMultipleWorkspaces && setIsOpen(!isOpen)}
                disabled={!hasMultipleWorkspaces}
                className={`w-full flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl transition-all group ${hasMultipleWorkspaces ? 'hover:border-indigo-300 hover:shadow-md cursor-pointer' : 'opacity-80 cursor-default'}`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeWorkspace?.type === 'PERSONAL' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {activeWorkspace?.type === 'PERSONAL' ? <FaUserTie size={14} /> : <FaBuilding size={14} />}
                    </div>
                    <div className="text-left overflow-hidden">
                        <div className="text-xs font-bold text-slate-800 truncate">{activeWorkspace?.name}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{activeWorkspace?.role}</div>
                    </div>
                </div>
                {hasMultipleWorkspaces && (
                    <FaChevronDown className={`text-slate-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-3 pb-2 mb-2 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Your Workspaces
                        </div>
                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => switchWorkspace(ws)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors ${ws.id === currentWorkspaceId ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${ws.type === 'PERSONAL' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {ws.type === 'PERSONAL' ? <FaUserTie size={14} /> : <FaBuilding size={14} />}
                                </div>
                                <div className="text-left flex-1 overflow-hidden">
                                    <div className={`text-xs font-bold truncate ${ws.id === currentWorkspaceId ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {ws.name}
                                    </div>
                                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                                        {ws.type === 'PERSONAL' ? 'My Business' : ws.role}
                                    </div>
                                </div>
                                {ws.id === currentWorkspaceId && (
                                    <FaCheck className="text-indigo-600 text-xs" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
