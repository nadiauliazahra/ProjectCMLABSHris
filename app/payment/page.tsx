"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import axios from "axios";
import { API_URL } from "../../utils/config";

export default function PricingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"package" | "seat">("package");
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH PACKAGES ---
  // --- FETCH PACKAGES ---
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/payment/packages`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Map the API response to the format your UI expects
        const formattedPackages = res.data.map((pkg: any) => {
            
            // SAFETY CHECK 1: Handle Price
            // Try 'price' (from your controller mapping) OR 'price_per_user' (raw DB field)
            // Default to 0 if both fail
            const rawPrice = pkg.price ?? pkg.price_per_user ?? 0;
            const finalPrice = parseInt(String(rawPrice)); // Ensure it's a string before parsing

            return {
                id: pkg.id,
                name: pkg.name,
                // Logic for subtitle based on package name or level
                subtitle: pkg.name === 'Pro' ? "Best for growing business" : 
                          pkg.name === 'Ultra' ? "Maximum ability" : "Great for small businesses",
                
                price: isNaN(finalPrice) ? 0 : finalPrice, // Prevent NaN
                
                period: "/user/month",
                
                // SAFETY CHECK 2: Handle Description & Features
                desc: pkg.desc || pkg.description || "No description", 
                features: Array.isArray(pkg.features) ? pkg.features : [], // Ensure array
                
                highlight: pkg.highlight || pkg.level === 'premium',
            };
        });

        setPackages(formattedPackages);
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // --- MOCK SEATS (Kept static as requested) ---
  const seats = [
    { id: "seat-1", name: "Paket 1", subtitle: "Starter Seat", price: 200000, period: "/user/month", desc: "Starter seat desc", features: [], highlight: false },
    { id: "seat-2", name: "Paket 2", subtitle: "Pro Seat", price: 200000, period: "/user/month", desc: "Pro seat desc", features: [], highlight: true },
    { id: "seat-3", name: "Paket 3", subtitle: "Enterprise", price: 200000, period: "/user/month", desc: "Enterprise desc", features: [], highlight: false },
  ];

  const dataToDisplay = activeTab === "package" ? packages : seats;

  const handleSelect = (pkg: any) => {
    const params = new URLSearchParams({
      id: pkg.id, 
      plan: pkg.name,
      price: pkg.price.toString(),
      type: activeTab,
    });
    router.push(`/payment/invoice?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar font-sans">
      
      {/* --- BACKGROUND EFFECTS --- */}
      <div className={`fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${activeTab === 'package' ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('/package-bg.png')" }} />
      <div className={`fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${activeTab === 'seat' ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: "url('/seat-bg.png')" }} />
      <div className="fixed inset-0 bg-[#0F1826] -z-30" />

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative min-h-screen flex flex-col items-center py-12 px-4 md:px-6">
        
        {/* --- HEADER --- */}
        <div className="text-center max-w-3xl mb-12 mt-12 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">HRIS Pricing Plans</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Choose the package that fits your company needs. Scalable and secure.
          </p>
        </div>

        {/* --- TOGGLE SWITCHER --- */}
        <div className="relative inline-flex items-center p-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-16">
            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#B0CBEA]/10 rounded-full shadow-lg transition-all duration-300 ease-in-out ${activeTab === 'package' ? 'left-1' : 'left-[calc(50%+2px)]'}`} />
            <button onClick={() => setActiveTab("package")} className={`relative z-10 w-32 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === "package" ? "text-[#B0CBEA]" : "text-[#576475] hover:text-[#B0CBEA]"}`}>Package</button>
            <button onClick={() => setActiveTab("seat")} className={`relative z-10 w-32 py-2 text-sm font-medium transition-colors duration-200 ${activeTab === "seat" ? "text-[#B0CBEA]" : "text-[#576475] hover:text-[#B0CBEA]"}`}>Seat</button>
        </div>

        {/* --- CARDS GRID --- */}
        {loading ? (
            <div className="text-white text-xl animate-pulse">Loading packages...</div>
        ) : (
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl w-full items-start ${activeTab === 'seat' ? 'gap-y-6' : ''}`}>
            {dataToDisplay.map((item) => (
                <div key={item.id} className="group relative transition-all duration-300 ease-out h-full hover:-translate-y-2">
                
                {/* Glass Background */}
                <div className="absolute inset-0 bg-[#0F1826]/20 backdrop-blur-xl rounded-[10px] border border-white/10 group-hover:border-white/30 group-hover:shadow-2xl group-hover:shadow-[#2D8DFE]/10 transition-all duration-300" />

                {/* Content */}
                <div className={`relative z-10 flex flex-col h-full rounded-[10px] overflow-hidden ${activeTab === 'seat' ? 'p-6 min-h-[300px]' : 'p-8 min-h-[500px]'}`}>
                    
                    <div className="mb-2">
                        <h3 className="text-[34px] font-semibold text-white leading-tight mb-2">{item.name}</h3>
                        <p className="text-gray-300 text-base font-normal">{item.subtitle}</p>
                    </div>

                    <div className="mt-4 mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-[34px] font-semibold text-white">Rp.{item.price.toLocaleString("id-ID")}</span>
                            <span className="text-sm text-gray-400 font-normal">{item.period}</span>
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/10 mb-6"></div>

                    {item.desc && <p className="text-sm text-gray-300 mb-4">{item.desc}</p>}

                    {/* Features List - RESTORED ORIGINAL DESIGN */}
                    {item.features && item.features.length > 0 && (
                        <ul className="space-y-3 mb-8 flex-1">
                        {item.features.map((feature: string, idx: number) => (
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

                    {(!item.features || item.features.length === 0) && <div className="flex-1"></div>}

                    <button onClick={() => handleSelect(item)} className="w-full py-3 rounded-[5px] text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-white/10 border border-white/10 text-white hover:bg-[#E33F68] hover:border-[#E33F68] hover:shadow-lg hover:shadow-pink-500/20">
                        {activeTab === "package" ? "Select a package" : "Upgrade Paket"}
                        <Icon icon="mdi:arrow-right" className="text-lg transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}

      </div>
    </div>
  );
}