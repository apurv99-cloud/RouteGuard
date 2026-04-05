import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="flex items-center justify-between px-8 py-3 glass sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Truck className="w-8 h-8 text-brand-deep" />
                <span className="text-2xl font-black tracking-tighter uppercase">
                    Route<span className="text-brand-sage">Guard</span>
                </span>
            </div>
            <div className="flex gap-6 items-center uppercase text-sm font-semibold tracking-wider">
                <a href="#features" className="hover:text-brand-steel transition-colors">Features</a>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-brand-darkest text-brand-lightest rounded-full hover:bg-brand-deep transition-all shadow-lg hover:shadow-brand-deep/20"
                >
                    Launch System
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
