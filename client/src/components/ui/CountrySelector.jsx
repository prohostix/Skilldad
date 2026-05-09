import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CountrySelector = ({ countryCodes, selectedCode, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedCountry = countryCodes.find(c => c.code === selectedCode) || countryCodes[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getFlagUrl = (iso) => `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;

    return (
        <div className="relative group min-w-[110px]" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-inter text-white text-sm cursor-pointer hover:bg-white/10 w-full justify-between"
            >
                <div className="flex items-center gap-2">
                    <img 
                        src={getFlagUrl(selectedCountry.iso)} 
                        alt={selectedCountry.name} 
                        className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                    />
                    <span className="font-medium">{selectedCountry.code}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-slate-400'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 mt-2 w-[240px] max-h-[300px] bg-[#0A0A0A]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden left-0"
                    >
                        <div className="p-1 space-y-1 overflow-y-auto max-h-[290px] custom-scrollbar">
                            {countryCodes.map((country) => (
                                <button
                                    key={country.iso}
                                    type="button"
                                    onClick={() => {
                                        onSelect(country.code);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                                        selectedCode === country.code 
                                        ? 'bg-primary/10 text-primary' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={getFlagUrl(country.iso)} 
                                            alt={country.name} 
                                            className="w-5 h-3.5 object-cover rounded-sm"
                                        />
                                        <div className="flex flex-col items-start translate-y-[1px]">
                                            <span className="text-xs font-bold tracking-tight text-left">{country.name}</span>
                                            <span className="text-[10px] opacity-60 font-medium">{country.code}</span>
                                        </div>
                                    </div>
                                    {selectedCode === country.code && <Check size={14} className="text-primary" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CountrySelector;
