import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from './utils/apiBase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Target,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const revenueData = [
  { name: 'Jan', "Monthly Revenue": 4000, "Yearly Revenue": 2400 },
  { name: 'Feb', "Monthly Revenue": 3000, "Yearly Revenue": 1398 },
  { name: 'Mar', "Monthly Revenue": 5000, "Yearly Revenue": 8000 },
  { name: 'Apr', "Monthly Revenue": 8780, "Yearly Revenue": 3908 },
  { name: 'May', "Monthly Revenue": 7890, "Yearly Revenue": 4800 },
  { name: 'Jun', "Monthly Revenue": 13900, "Yearly Revenue": 3800 },
  { name: 'Jul', "Monthly Revenue": 14900, "Yearly Revenue": 4300 },
  { name: 'Aug', "Monthly Revenue": 16000, "Yearly Revenue": 9800 },
  { name: 'Sep', "Monthly Revenue": 19000, "Yearly Revenue": 12000 },
  { name: 'Oct', "Monthly Revenue": 21000, "Yearly Revenue": 10080 },
  { name: 'Nov', "Monthly Revenue": 24000, "Yearly Revenue": 16000 },
  { name: 'Dec', "Monthly Revenue": 26000, "Yearly Revenue": 18000 },
];

const dealsData = [
  {
    name: 'Apple Inc.',
    date: 'Sep 20, 2023',
    salesRep: 'Victoria Rodriguez',
    status: 'Won',
    value: '₹75.5k',
  },
  {
    name: 'Lucasfilm Ltd.',
    date: 'Sep 20, 2023',
    salesRep: 'Victoria Rodriguez',
    status: 'Won',
    value: '₹95.0k',
  },
  {
    name: 'Stark Ind.',
    date: 'Sep 21, 2023',
    salesRep: 'Tony Stark',
    status: 'Lost',
    value: '₹76.36k',
  },
  {
    name: 'Wayne Ent.',
    date: 'Sep 22, 2023',
    salesRep: 'Bruce Wayne',
    status: 'Pending',
    value: '₹140.0k',
  },
  {
    name: 'Oscorp LLC',
    date: 'Sep 23, 2023',
    salesRep: 'Norman Osborn',
    status: 'Won',
    value: '₹120.5k',
  },
];

const forecastData = [
  { name: 'Won', value: 97, fill: '#3b82f6' },
  { name: 'Pending Forecast', value: 36, fill: '#14b8a6' },
  { name: 'Revenue.est', value: 45, fill: '#f59e0b' },
];

const CountUp = ({ end, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing function for smooth finish
      const easeOutQuad = (t) => t * (2 - t);
      const currentCount = Math.floor(easeOutQuad(percentage) * end);

      setCount(currentCount);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <span>
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
};



export default function Dashboard() {
  const navigate = useNavigate();
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('01 Nov 2023 to 30 Dec 2023');
  const dateDropdownRef = useRef(null);

  const [latestJobCards, setLatestJobCards] = useState([]);
  const [loadingJobCards, setLoadingJobCards] = useState(true);
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    monthlyDiff: 0,
    yearlyRevenue: 0,
    yearlyDiff: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchLatestJobCards = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jobcard`);
        if (res.ok) {
          const data = await res.json();

          // Sort by createdAt descending and slice to 5 for the latest list
          const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatestJobCards(sorted.slice(0, 5));

          // --- CALCULATE REAL STATS ---
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth(); // 0-indexed

          // Filter jobs for current year, current month, previous month, current year, previous year
          let curMonthSum = 0;
          let prevMonthSum = 0;
          let curYearSum = 0;
          let prevYearSum = 0;

          // Chart data initialization for 12 months of current year
          const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthlyTotals = Array(12).fill(0);

          data.forEach(card => {
            const cardDate = new Date(card.jobDate || card.createdAt);
            const amt = Number(card.totalAmount) || 0;
            const cardYear = cardDate.getFullYear();
            const cardMonth = cardDate.getMonth();

            // Check current year
            if (cardYear === currentYear) {
              curYearSum += amt;
              monthlyTotals[cardMonth] += amt;
            }

            // Check previous year
            if (cardYear === currentYear - 1) {
              prevYearSum += amt;
            }

            // Check current month & year
            if (cardYear === currentYear && cardMonth === currentMonth) {
              curMonthSum += amt;
            }

            // Check previous month
            const isPrevMonth = (currentMonth === 0)
              ? (cardYear === currentYear - 1 && cardMonth === 11)
              : (cardYear === currentYear && cardMonth === currentMonth - 1);
            if (isPrevMonth) {
              prevMonthSum += amt;
            }
          });

          // Calculate percentage differences
          let mDiff = 0;
          if (prevMonthSum > 0) {
            mDiff = ((curMonthSum - prevMonthSum) / prevMonthSum) * 100;
          } else if (curMonthSum > 0) {
            mDiff = 100;
          }

          let yDiff = 0;
          if (prevYearSum > 0) {
            yDiff = ((curYearSum - prevYearSum) / prevYearSum) * 100;
          } else if (curYearSum > 0) {
            yDiff = 100;
          }

          // Build cumulative yearly revenue array for the chart
          let cumulativeYearly = 0;
          const chartData = monthsNames.map((name, idx) => {
            cumulativeYearly += monthlyTotals[idx];
            return {
              name,
              "Monthly Revenue": monthlyTotals[idx],
              "Yearly Revenue": cumulativeYearly
            };
          });

          setStats({
            monthlyRevenue: curMonthSum,
            monthlyDiff: mDiff,
            yearlyRevenue: curYearSum,
            yearlyDiff: yDiff,
            chartData
          });
        }
      } catch (err) {
        console.error("Error fetching latest job cards:", err);
      } finally {
        setLoadingJobCards(false);
      }
    };
    fetchLatestJobCards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ranges = ['Today', 'Last Week', 'Last Month', 'Current Year'];

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name}: ₹{Number(entry.value).toLocaleString('en-IN')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Main Content */}
      <main className="mt-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {new Date().getHours() < 12 ? 'Good Morning!' : new Date().getHours() < 17 ? 'Good Afternoon!' : 'Good Evening!'}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Here's what's happening today in your business.</p>
        </div>

        {/* Diwali Festive Special Banner with Animated Fireworks, Rockets & Diya */}
        <div className="relative overflow-hidden rounded-3xl mb-8 p-6 sm:p-9 text-white shadow-2xl border border-amber-500/40 bg-gradient-to-r from-[#2e0510] via-[#520a18] to-[#420917]">
          {/* Decorative Golden Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Firework Burst 1 (Top Left) */}
          <div className="absolute top-3 left-12 w-28 h-28 pointer-events-none firework-anim-1">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="3" fill="#fef08a" />
              <line x1="50" y1="50" x2="50" y2="10" stroke="#fde047" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="85" y2="20" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="90" y2="50" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="80" y2="80" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="50" y2="90" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="20" y2="80" stroke="#a855f7" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="10" y2="50" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="50" y1="50" x2="20" y2="20" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              <circle cx="50" cy="8" r="2.5" fill="#fef08a" />
              <circle cx="87" cy="18" r="2.5" fill="#f59e0b" />
              <circle cx="92" cy="50" r="2.5" fill="#ef4444" />
              <circle cx="18" cy="18" r="2.5" fill="#10b981" />
            </svg>
          </div>

          {/* Firework Burst 2 (Center Top) */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-36 h-36 pointer-events-none firework-anim-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="4" fill="#ffffff" />
              <line x1="50" y1="50" x2="50" y2="5" stroke="#fde047" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="50" y1="50" x2="90" y2="25" stroke="#fb923c" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="50" y1="50" x2="95" y2="60" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="50" y1="50" x2="70" y2="92" stroke="#e879f9" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="50" y1="50" x2="30" y2="92" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="50" y1="50" x2="5" y2="60" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="5 3" />
              <line x1="50" y1="50" x2="10" y2="25" stroke="#facc15" strokeWidth="2.5" strokeDasharray="5 3" />
              <circle cx="50" cy="4" r="3" fill="#ffffff" />
              <circle cx="92" cy="23" r="3" fill="#fb923c" />
              <circle cx="97" cy="62" r="3" fill="#f43f5e" />
              <circle cx="8" cy="23" r="3" fill="#facc15" />
            </svg>
          </div>

          {/* Firework Burst 3 (Right Center behind Diya) */}
          <div className="absolute top-6 right-8 w-32 h-32 pointer-events-none firework-anim-3">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="3" fill="#fef08a" />
              <line x1="50" y1="50" x2="50" y2="12" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
              <line x1="50" y1="50" x2="80" y2="20" stroke="#ec4899" strokeWidth="2" strokeDasharray="3 2" />
              <line x1="50" y1="50" x2="88" y2="50" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
              <line x1="50" y1="50" x2="75" y2="80" stroke="#4ade80" strokeWidth="2" strokeDasharray="3 2" />
              <line x1="50" y1="50" x2="25" y2="80" stroke="#fb923c" strokeWidth="2" strokeDasharray="3 2" />
              <line x1="50" y1="50" x2="12" y2="50" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 2" />
              <line x1="50" y1="50" x2="20" y2="20" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
            </svg>
          </div>

          {/* Rising Real Diwali Rocket 1 (Patakha with Stick & Sparks) */}
          <div className="absolute bottom-1 left-1/4 pointer-events-none rocket-trail-1">
            <svg width="26" height="75" viewBox="0 0 26 75" fill="none" className="overflow-visible drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
              <polygon points="13,0 5,16 21,16" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
              <rect x="6" y="16" width="14" height="26" rx="2" fill="#f97316" stroke="#fde047" strokeWidth="1" />
              <rect x="6" y="21" width="14" height="4" fill="#facc15" />
              <rect x="6" y="32" width="14" height="4" fill="#16a34a" />
              <line x1="13" y1="30" x2="13" y2="70" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
              <g className="real-rocket-sparks">
                <circle cx="13" cy="44" r="3" fill="#ffffff" />
                <path d="M 9,42 Q 13,56 17,42" fill="#ef4444" />
                <line x1="13" y1="42" x2="13" y2="58" stroke="#f59e0b" strokeWidth="3" strokeDasharray="3 1" />
              </g>
            </svg>
          </div>

          {/* Rising Real Diwali Rocket 2 (Patakha with Stick & Sparks) */}
          <div className="absolute bottom-2 right-1/4 pointer-events-none rocket-trail-2 hidden sm:block">
            <svg width="26" height="75" viewBox="0 0 26 75" fill="none" className="overflow-visible drop-shadow-[0_0_12px_rgba(234,88,12,0.8)]">
              <polygon points="13,0 5,16 21,16" fill="#7c3aed" stroke="#fef08a" strokeWidth="1" />
              <rect x="6" y="16" width="14" height="26" rx="2" fill="#ea580c" stroke="#fde047" strokeWidth="1" />
              <rect x="6" y="21" width="14" height="4" fill="#38bdf8" />
              <rect x="6" y="32" width="14" height="4" fill="#facc15" />
              <line x1="13" y1="30" x2="13" y2="70" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" />
              <g className="real-rocket-sparks">
                <circle cx="13" cy="44" r="3" fill="#ffffff" />
                <path d="M 9,42 Q 13,56 17,42" fill="#f97316" />
                <line x1="13" y1="42" x2="13" y2="58" stroke="#eab308" strokeWidth="3" strokeDasharray="3 1" />
              </g>
            </svg>
          </div>

          {/* Anar Spark Sprays (Bottom left & right) */}
          <div className="absolute -bottom-2 left-6 pointer-events-none text-amber-300 text-xs anar-spray-1 select-none">
            ✨ 💥 ✨
          </div>
          <div className="absolute -bottom-2 right-44 pointer-events-none text-yellow-200 text-xs anar-spray-2 select-none hidden md:block">
            ⚡ 🌟 💥
          </div>

          {/* Floating Twinkling Stars & Sparklers */}
          <div className="absolute top-4 left-6 diwali-star-twinkle-1 text-amber-300 text-lg select-none pointer-events-none">✦</div>
          <div className="absolute top-8 left-1/3 diwali-star-twinkle-2 text-yellow-200 text-xs select-none pointer-events-none">✨</div>
          <div className="absolute bottom-6 left-1/2 diwali-star-twinkle-3 text-amber-300 text-sm select-none pointer-events-none">★</div>
          <div className="absolute top-5 right-1/3 diwali-star-twinkle-2 text-yellow-100 text-sm select-none pointer-events-none">✦</div>
          <div className="absolute bottom-5 right-20 diwali-star-twinkle-1 text-amber-200 text-base select-none pointer-events-none">✨</div>
          <div className="absolute top-1/2 right-12 sparkle-spinner text-yellow-300 text-xl select-none pointer-events-none">🎇</div>

          {/* Content Layout */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-red-500/25 border border-amber-400/50 rounded-full px-4 py-1.5 text-xs font-bold text-amber-200 shadow-lg shadow-amber-900/40 mb-3.5 backdrop-blur-md">
                <span className="text-base">🎆</span>
                <span>दीपावली महापर्व की हार्दिक शुभकामनाएं</span>
                <span className="text-base">🪔</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-3">
                <span className="diwali-gold-text drop-shadow-[0_2px_18px_rgba(245,158,11,0.6)]">
                  Happy Diwali!
                </span>
              </h2>

              <p className="text-amber-100/90 text-sm sm:text-base font-medium max-w-2xl leading-relaxed mb-4">
                भगवान श्री गणेश एवं माता लक्ष्मी जी की कृपा से आपके जीवन और व्यापार में सुख, समृद्धि और नई ऊंचाइयां आएं।
                <span className="block mt-1.5 font-bold text-amber-300 text-base">
                  — printosynk family
                </span>
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs font-bold text-amber-200/90">
                <span className="px-3.5 py-1.5 rounded-xl bg-black/35 border border-amber-500/30 backdrop-blur-md shadow-sm flex items-center gap-1.5">
                  <span>🪔</span> Light & Prosperity
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-black/35 border border-amber-500/30 backdrop-blur-md shadow-sm flex items-center gap-1.5">
                  <span>💥</span> Festive Celebrations
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-black/35 border border-amber-500/30 backdrop-blur-md shadow-sm flex items-center gap-1.5">
                  <span>✨</span> Quality Print Services
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-black/35 border border-amber-500/30 backdrop-blur-md shadow-sm flex items-center gap-1.5">
                  <span>🤝</span> Trusted Partnership
                </span>
              </div>
            </div>

            {/* Right Visual: Glowing Traditional Brass Diya Illustration */}
            <div className="shrink-0 flex items-center justify-center relative p-3">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/40 via-yellow-500/25 to-transparent rounded-full blur-2xl" />

              <svg
                viewBox="0 0 240 180"
                className="w-48 sm:w-56 h-auto relative z-10 drop-shadow-[0_12px_28px_rgba(0,0,0,0.7)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Hanging Lanterns */}
                <g className="diwali-lantern-swing">
                  <line x1="45" y1="0" x2="45" y2="40" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polygon points="45,40 55,54 35,54" fill="#f59e0b" />
                  <polygon points="35,54 55,54 45,68" fill="#d97706" />
                  <circle cx="45" cy="54" r="3" fill="#fef08a" />
                </g>

                <g className="diwali-lantern-swing" style={{ animationDelay: '0.8s' }}>
                  <line x1="195" y1="0" x2="195" y2="35" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="3 3" />
                  <polygon points="195,35 205,49 185,49" fill="#f59e0b" />
                  <polygon points="185,49 205,49 195,63" fill="#d97706" />
                  <circle cx="195" cy="49" r="3" fill="#fef08a" />
                </g>

                {/* Center Diya Base */}
                <ellipse cx="120" cy="155" rx="70" ry="12" fill="rgba(0,0,0,0.35)" />
                <path
                  d="M 45 130 C 52 165, 188 165, 195 130 C 182 142, 58 142, 45 130 Z"
                  fill="url(#diyaBodyGrad)"
                  stroke="#fef08a"
                  strokeWidth="1.5"
                />
                <ellipse cx="120" cy="130" rx="75" ry="14" fill="url(#diyaRimGrad)" stroke="#fde047" strokeWidth="1" />
                <ellipse cx="120" cy="130" rx="66" ry="9" fill="url(#diyaOilGrad)" />
                <path d="M 118 126 C 117 115, 123 115, 122 126 Z" fill="#78350f" />

                {/* Glowing Flames */}
                <g className="diwali-flame-glow">
                  <path
                    d="M 120 48 C 100 85, 105 118, 120 125 C 135 118, 140 85, 120 48 Z"
                    fill="url(#outerFlameGrad)"
                  />
                  <path
                    d="M 120 62 C 107 90, 110 115, 120 123 C 130 115, 133 90, 120 62 Z"
                    fill="url(#midFlameGrad)"
                  />
                  <path
                    d="M 120 78 C 113 95, 114 112, 120 120 C 126 112, 127 95, 120 78 Z"
                    fill="#ffffff"
                  />
                </g>

                <defs>
                  <linearGradient id="diyaBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#78350f" />
                  </linearGradient>
                  <linearGradient id="diyaRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#b45309" />
                    <stop offset="30%" stopColor="#fef08a" />
                    <stop offset="70%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  <linearGradient id="diyaOilGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="100%" stopColor="#92400e" />
                  </linearGradient>
                  <linearGradient id="outerFlameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient id="midFlameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="40%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
          <div className="w-full lg:w-[60%]">
            <div className="bg-white rounded-2xl p-6 h-full min-h-50 flex flex-col justify-center shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative z-10 w-[70%]">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  Design, Print, Promote and Build<br className="hidden sm:block" /> your own <span className="text-teal-500">Brand Identity.</span>
                </h2>
                <p className="text-sm text-gray-500 mb-6">Premium printing services for marketing,<br></br> branding and packaging.</p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/job-card')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-sm hover:shadow shrink-0">
                  Add Card
                </button>
                <button
                  onClick={() => navigate('/paper-stock')}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition shadow-sm hover:shadow shrink-0"
                >
                  Paper Stock
                </button>
              </div>
            </div>

            {/* Machine Image Background */}
            <div className="absolute right-0 bottom-0 h-[90%] w-[45%] sm:w-[48%] z-0 transform group-hover:scale-105 transition-transform duration-500 pointer-events-none flex items-end justify-end opacity-100 pr-4 pb-2">
              <img src="/machine.png" alt="Printing Machine" className="object-contain w-full h-full object-bottom-right" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%)' }} />
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:w-[40%]">
          {/* Stat Card 1 */}
          <div className="bg-white py-5 px-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-md transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Monthly Revenue</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">
              <CountUp end={stats.monthlyRevenue} prefix="₹" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${stats.monthlyDiff >= 0 ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-600'}`}>
                {stats.monthlyDiff >= 0 ? '+' : ''}{stats.monthlyDiff.toFixed(1)}%
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">vs prev. month</span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="bg-white py-5 px-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center hover:shadow-md transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">Yearly Revenue</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">
              <CountUp end={stats.yearlyRevenue} prefix="₹" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${stats.yearlyDiff >= 0 ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-600'}`}>
                {stats.yearlyDiff >= 0 ? '+' : ''}{stats.yearlyDiff.toFixed(1)}%
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">vs prev. year</span>
            </div>
          </div>
        </div>
    </div>

        {/* Main Chart */ }
  <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <h3 className="text-lg font-bold text-gray-900">Balance Overview</h3>
      <div className="flex flex-wrap gap-4 sm:gap-6">
        <div className="text-center">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Monthly Revenue</div>
          <div className="font-bold text-gray-900">
            <CountUp end={stats.monthlyRevenue} prefix="₹" />
          </div>
        </div>
        <div className="text-center border-l pl-4 sm:pl-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">Yearly Revenue</div>
          <div className="font-bold text-gray-900">
            <CountUp end={stats.yearlyRevenue} prefix="₹" />
          </div>
        </div>
      </div>
    </div>

    <div className="h-62.5 sm:h-75 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={stats.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} dx={-5} />
          <Tooltip content={customTooltip} />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="Monthly Revenue"
            stroke="#14b8a6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#14b8a6', stroke: '#fff', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="Yearly Revenue"
            stroke="#f97316"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* Bottom Section */ }
  <div className="flex flex-col lg:flex-row gap-6">
    {/* Deals Table */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Latest Job Cards</h3>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">Top 5 recently added job cards</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-gray-400 border-b border-gray-100">
              <th className="pb-3 font-medium px-2">Client Name</th>
              <th className="pb-3 font-medium px-2">Job Name</th>
              <th className="pb-3 font-medium px-2">Job Number</th>
              <th className="pb-3 font-medium px-2">Job Qty</th>
              <th className="pb-3 font-medium px-2">Job Date</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loadingJobCards ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400 animate-pulse font-medium">
                  Loading Latest Job Cards...
                </td>
              </tr>
            ) : latestJobCards.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-400 italic">
                  No Job Cards found.
                </td>
              </tr>
            ) : (
              latestJobCards.map((card, idx) => (
                <tr key={card._id || idx} className="border-b last:border-0 border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-2 font-bold text-gray-900">{card.partyName}</td>
                  <td className="py-4 px-2 text-gray-700 font-semibold">{card.jobName || 'N/A'}</td>
                  <td className="py-4 px-2">
                    <span className="font-mono text-xs text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded font-bold">
                      {card.jobNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-2 font-semibold text-gray-900">
                    {Number(card.jobQty || 0).toLocaleString()}
                  </td>
                  <td className="py-4 px-2 text-gray-500 font-medium">
                    {new Date(card.jobDate || card.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Forecast Chart */}
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:w-1/3 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Forecast</h3>
      <div className="h-62.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" hide />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `${val}k`} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {forecastData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
        {forecastData.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.fill }}></div>
            {entry.name.split(' ')[0]}
          </div>
        ))}
      </div>
    </div>
  </div>

      </main >
    </div >
  );
}
