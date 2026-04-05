import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Truck, Plus } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="h-20 glass border-b border-brand-sage/30 px-8 flex items-center justify-between sticky top-0 z-50 shadow-xl shadow-brand-darkest/5 backdrop-blur-xl">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-10">

                {/* Logo */}
                <div onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5 group cursor-pointer">
                    <div className="p-2 bg-brand-deep rounded-xl">
                        <Truck className="w-6 h-6 text-brand-lightest" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-brand-darkest uppercase italic">
                        Route<span className="text-brand-steel not-italic">Guard</span>
                    </span>
                </div>

                {/* Register Link */}
                <button
                    onClick={() => navigate('/register-truck')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-darkest text-brand-lightest text-[10px] font-black uppercase tracking-widest hover:bg-brand-deep transition-all shadow-lg hover:shadow-brand-deep/20 active:scale-95"
                >
                    <Plus size={14} />
                    Register Vehicle
                </button>

                {/* Search */}
                <div className="relative w-80 lg:w-[450px] group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-steel group-focus-within:text-brand-deep transition-all duration-300 group-focus-within:scale-110" />
                    <input
                        type="text"
                        placeholder="Search fleet, routes or drivers..."
                        className="w-full bg-brand-lightest/30 border border-brand-sage/20 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-4 focus:ring-brand-sage/20 focus:bg-white focus:border-brand-steel transition-all outline-none placeholder:text-brand-steel/50 font-medium"
                    />
                </div>

            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-6">
                <button className="p-3 rounded-2xl hover:bg-brand-sage/20 text-brand-deep relative transition-all active:scale-95 group">
                    <Bell size={22} />
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/50"></span>
                </button>

                <div className="h-10 w-[1px] bg-brand-sage/20 mx-1 shadow-[0_0_10px_rgba(174,195,176,0.3)]"></div>

                <div className="flex items-center gap-4 group cursor-pointer p-1.5 rounded-2xl hover:bg-brand-lightest transition-colors">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-brand-darkest leading-tight">Rohit Admin</p>
                        <p className="text-[9px] text-brand-steel font-black uppercase tracking-[0.15em] opacity-70">
                            Fleet Commander
                        </p>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-deep to-brand-steel text-brand-lightest flex items-center justify-center font-black shadow-lg shadow-brand-deep/20 group-hover:scale-105 transition-transform duration-300 border-2 border-white">
                        R
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;