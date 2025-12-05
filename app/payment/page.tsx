"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function PricingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"package" | "seat">("package");

  // --- DATA CONFIGURATION ---
  const packages = [
    {
      id: "standard",
      name: "Standard",
      subtitle: "Great for small businesses",
      price: 15000,
      period: "/user/month",
      desc: "This package for 1 until 50 employees",
      features: [
        "Standard features",
        "GPS-based attendance validation",
        "Employee data management",
        "Leave & time-off request",
        "Overtime management (government regulations)",
        "Fixed work schedule management",
        "Automatic tax calculation",
      ],
      highlight: false,
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Best for growing business",
      price: 12000,
      period: "/user/month",
      desc: "This package for 51 until 100 employees",
      features: [
        "All Standard features",
        "Check in & Check out attendance settings",
        "Fingerprint integration",
        "Employee document management",
        "Sick leave & time-off settings",
        "Shift management",
        "Comprehensive reports",
        "Overtime management (custom)",
      ],
      highlight: true,
    },
    {
      id: "ultra",
      name: "Ultra",
      subtitle: "Maximum ability for your business",
      price: 19000,
      period: "/user/month",
      desc: "This package for 100+ employees",
      features: [
        "All Premium features",
        "Face recognition",
        "Automated check-out attendance",
        "Employee turnover dashboard",
        "Custom dashboard analysis",
      ],
      highlight: false,
    },
  ];

  const seats = [
    {
      id: "seat-1",
      name: "Paket 1",
      subtitle: "Starter Seat",
      price: 200000,
      period: "/user/month",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      features: [],
      highlight: false,
    },
    {
      id: "seat-2",
      name: "Paket 2",
      subtitle: "Pro Seat",
      price: 200000,
      period: "/user/month",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      features: [],
      highlight: true,
    },
    {
      id: "seat-3",
      name: "Paket 3",
      subtitle: "Enterprise Seat",
      price: 200000,
      period: "/user/month",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      features: [],
      highlight: false,
    },
    {
      id: "seat-4",
      name: "Paket 4",
      subtitle: "Starter Seat",
      price: 200000,
      period: "/user/month",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      features: [],
      highlight: false,
    },
    {
      id: "seat-5",
      name: "Paket 5",
      subtitle: "Pro Seat",
      price: 200000,
      period: "/user/month",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      features: [],
      highlight: true,
    },
    {
      id: "seat-6",
      name: "Paket 6",
      subtitle: "Enterprise Seat",
      price: 200000,
      period: "/user/month",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      features: [],
      highlight: false,
    },
  ];

  const dataToDisplay = activeTab === "package" ? packages : seats;

  const handleSelect = (pkg: any) => {
    const params = new URLSearchParams({
      plan: pkg.name,
      price: pkg.price.toString(),
      type: activeTab,
    });
    router.push(`/payment/invoice?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar font-sans">
      
      {/* --- BACKGROUND EFFECTS --- */}
      
      {/* 1. Background for PACKAGE Tab */}
      <div 
        className={`fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            activeTab === 'package' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          backgroundImage: "url('/package-bg.png')" 
        }}
      />

      {/* 2. Background for SEAT Tab */}
      <div 
        className={`fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${
            activeTab === 'seat' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          backgroundImage: "url('/seat-bg.png')" 
        }}
      />
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-[#0F1826] -z-30" />

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative min-h-screen flex flex-col items-center py-12 px-4 md:px-6">
        
        {/* --- HEADER --- */}
        <div className="text-center max-w-3xl mb-12 mt-12 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            HRIS Pricing Plans
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam in dictum elit.
            Integer aliquam fringilla laoreet Pellentesque ultrices qui magna eget sollicitudin.
          </p>
        </div>

        {/* --- TOGGLE SWITCHER --- */}
        <div className="relative inline-flex items-center p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-16">
            
            {/* Active Indicator */}
            <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#B0CBEA]/10 rounded-full shadow-lg transition-all duration-300 ease-in-out ${
                    activeTab === 'package' ? 'left-1' : 'left-[calc(50%+2px)]' 
                }`}
            />

            {/* Buttons */}
            <button
                onClick={() => setActiveTab("package")}
                className={`relative z-10 w-32 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === "package" ? "text-[#B0CBEA]" : "text-[#576475] hover:text-[#B0CBEA]"
                }`}
            >
                Package
            </button>

            <button
                onClick={() => setActiveTab("seat")}
                className={`relative z-10 w-32 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === "seat" ? "text-[#B0CBEA]" : "text-[#576475] hover:text-[#B0CBEA]"
                }`}
            >
                Seat
            </button>
        </div>

        {/* --- CARDS GRID --- */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full items-start ${activeTab === 'seat' ? 'gap-y-6' : ''}`}>
          {dataToDisplay.map((item) => (
            <div
              key={item.id}
              className={`
                group relative transition-all duration-300 ease-out h-full
                hover:-translate-y-2
              `}
            >
              {/* Glass Background Layer */}
              <div className="absolute inset-0 bg-[#0F1826]/20 backdrop-blur-xl rounded-[10px] border border-white/10 group-hover:border-white/30 group-hover:shadow-2xl group-hover:shadow-[#2D8DFE]/10 transition-all duration-300" />

              {/* Content Layer */}
              <div className={`
                  relative z-10 flex flex-col h-full rounded-[10px] overflow-hidden
                  ${activeTab === 'seat' ? 'p-6 min-h-[300px]' : 'p-8 min-h-[500px]'}
              `}>
                
                {/* Title & Subtitle */}
                <div className="mb-2">
                  <h3 className="text-[34px] font-semibold text-white leading-tight mb-2">{item.name}</h3>
                  <p className="text-gray-300 text-base font-normal">{item.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mt-4 mb-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-[34px] font-semibold text-white">
                            Rp.{item.price.toLocaleString("id-ID")}
                        </span>
                        <span className="text-sm text-gray-400 font-normal">{item.period}</span>
                    </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-white/10 mb-6"></div>

                {/* Description */}
                {item.desc && (
                    <p className="text-sm text-gray-300 mb-4">{item.desc}</p>
                )}

                {/* Features List */}
                {item.features.length > 0 && (
                    <ul className="space-y-3 mb-8 flex-1">
                    {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start justify-between text-sm text-gray-200">
                        <span className="flex-1">{feature}</span>
                        {/* Solid Circle Checkmark */}
                        <div className="mt-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 ml-3 shadow-sm">
                            <Icon icon="mdi:check" className="text-[#0F1826] text-[10px] font-bold" />
                        </div>
                        </li>
                    ))}
                    </ul>
                )}

                {/* Spacer */}
                {item.features.length === 0 && <div className="flex-1"></div>}

                {/* Action Button */}
                <button
                  onClick={() => handleSelect(item)}
                  className={`
                      w-full py-3 rounded-[5px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                      bg-white/10 border border-white/10 text-white
                      hover:bg-[#E33F68] hover:border-[#E33F68] hover:shadow-lg hover:shadow-pink-500/20
                  `}
                >
                  {activeTab === "package" ? "Select a package" : "Upgrade Paket"}
                  <Icon icon="mdi:arrow-right" className="text-lg transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}