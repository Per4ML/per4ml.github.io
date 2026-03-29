import { useState, useEffect } from 'react';
import { Cpu, Zap, Database, HardDrive, Moon, Sun } from 'lucide-react';
import PublicationMindmap from './components/PublicationMindmap';

interface NewsItem {
  id: number;
  date: string;
  title: string;
  description: string;
  link: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
}

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    fetch('/news.json')
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(err => console.error("Failed to load news:", err));

    fetch('/data/teams.json')
      .then(res => res.json())
      .then(data => setTeamMembers(data))
      .catch(err => console.error("Failed to load team members:", err));
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center space-y-8">
      
      {/* 2. Navigation Bar (Floating Island) */}
      <nav className="sticky top-8 z-50 w-full max-w-6xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm border border-zinc-200/50 dark:border-zinc-800/50 rounded-full transition-colors duration-300">
        <div className="px-6 flex justify-between items-center">
          <ul className="flex items-center overflow-x-auto no-scrollbar">
            <li>
              <a 
                href="#research" 
                className="block px-4 md:px-6 py-4 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600 dark:border-indigo-400 whitespace-nowrap"
              >
                Research Areas
              </a>
            </li>
            <li>
              <a 
                href="#publications" 
                className="block px-4 md:px-6 py-4 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium border-b-2 border-transparent transition-colors whitespace-nowrap"
              >
                Publications
              </a>
            </li>
            <li>
              <a 
                href="#news" 
                className="block px-4 md:px-6 py-4 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium border-b-2 border-transparent transition-colors whitespace-nowrap"
              >
                News
              </a>
            </li>
            <li>
              <a 
                href="#team" 
                className="block px-4 md:px-6 py-4 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium border-b-2 border-transparent transition-colors whitespace-nowrap"
              >
                Team
              </a>
            </li>
          </ul>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 ml-4 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* 1. Hero Section (Island) */}
      <section 
        className="relative w-full max-w-6xl h-[60vh] min-h-[400px] flex items-center justify-center bg-zinc-900 bg-cover bg-center rounded-[2.5rem] overflow-hidden shadow-sm"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(24, 24, 27, 0.6), rgba(24, 24, 27, 0.8)), url("https://picsum.photos/seed/architecture/1920/1080")' 
        }}
      >
        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight mb-4">
            Per4ML
          </h1>
          <p className="text-xl md:text-3xl text-zinc-200 font-light tracking-wide">
            Performance for Machine Learning
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full max-w-6xl flex flex-col space-y-8">
        
        {/* 3. Research Areas Section */}
        <section id="research" className="py-20 px-8 md:px-16 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Research Areas</h2>
              <p className="max-w-3xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Our lab focuses on bridging the gap between High-Performance Computing, Artificial Intelligence, and data-driven modeling. We design scalable algorithms and optimize systems to accelerate machine learning workloads across distributed architectures.
              </p>
            </div>

            {/* 4. Cards Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* 5. Card Styling - HPC */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-zinc-100 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                  <Cpu className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                  High-Performance Computing
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Developing novel parallel algorithms and communication-efficient protocols to scale complex scientific and machine learning applications on modern supercomputers.
                </p>
              </div>

              {/* Card - AI/ML Optimization */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-zinc-100 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                  AI/ML Optimization
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Optimizing deep learning training and inference pipelines. We focus on sparse attention mechanisms, quantization, and hardware-aware neural architecture search.
                </p>
              </div>

              {/* Card - Data-Driven Modeling */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-zinc-100 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                  <Database className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                  Data-Driven Modeling
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Creating robust surrogate models and physics-informed neural networks to accelerate traditional simulations and discover underlying patterns in massive datasets.
                </p>
              </div>

              {/* Card - Parallel I/O Systems */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-zinc-100 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-6">
                  <HardDrive className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                  Parallel I/O Systems
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Designing next-generation storage solutions and I/O middleware to alleviate data bottlenecks in distributed training and large-scale data analytics.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Publications Section */}
        <section id="publications" className="py-20 px-8 md:px-16 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Publications</h2>
              <p className="max-w-3xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Explore our interactive publication mindmap. Click on categories to expand, and click on papers to learn more.
              </p>
            </div>
            <PublicationMindmap />
          </div>
        </section>

        {/* News Section */}
        <section id="news" className="py-20 px-8 md:px-16 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm transition-colors duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">News & Updates</h2>
              <p className="max-w-3xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                The latest announcements, publications, and events from the Per4ML lab.
              </p>
            </div>

            {/* Timeline Container */}
            <div className="max-w-3xl mx-auto h-[600px] overflow-y-auto pr-4 custom-scrollbar">
              <div className="relative pt-4 pb-8">
                {/* Vertical Line */}
                <div className="absolute left-[88px] top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800"></div>

                {news.map((item, index) => {
                  const dotColors = ['border-indigo-500', 'border-emerald-500', 'border-purple-500', 'border-amber-500', 'border-rose-500'];
                  const dotColor = dotColors[index % dotColors.length];

                  return (
                    <div key={item.id} className="flex items-start mb-6 relative group">
                      {/* Date */}
                      <div className="w-[72px] shrink-0 text-right pr-4 pt-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                        {item.date}
                      </div>

                      {/* Dot */}
                      <div className={`absolute left-[88px] w-3.5 h-3.5 rounded-full border-[3px] bg-white dark:bg-zinc-900 -translate-x-[6px] mt-3.5 transition-transform duration-300 group-hover:scale-125 ${dotColor}`}></div>

                      {/* Card */}
                      <div className="ml-8 flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:shadow-md transition-shadow">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2 leading-relaxed">{item.description}</p>
                        {item.link && (
                          <a href={item.link} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mt-4 inline-flex items-center hover:underline">
                            Learn More <span className="ml-1 text-xs">&rarr;</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-20 px-8 md:px-16 bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-sm overflow-hidden relative transition-colors duration-300">
          <div className="max-w-5xl mx-auto mb-16 text-center">
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Team</h2>
            <p className="max-w-3xl mx-auto text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Meet the brilliant minds driving our research forward.
            </p>
          </div>

          <div className="relative w-full flex">
            {/* Gradient masks for smooth fade on edges */}
            <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none"></div>

            <div className="flex animate-scroll w-max hover:[animation-play-state:paused]">
              {/* First set */}
              <div className="flex gap-8 pr-8">
                {teamMembers.map((member, idx) => (
                  <div key={`set1-${idx}`} className="flex flex-col items-center w-64 shrink-0 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                    <img src={member.image} alt={member.name} referrerPolicy="no-referrer" className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-white dark:border-zinc-700 shadow-sm" />
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center mb-1">{member.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium text-center">{member.role}</p>
                  </div>
                ))}
              </div>
              {/* Second set */}
              <div className="flex gap-8 pr-8">
                {teamMembers.map((member, idx) => (
                  <div key={`set2-${idx}`} className="flex flex-col items-center w-64 shrink-0 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                    <img src={member.image} alt={member.name} referrerPolicy="no-referrer" className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-white dark:border-zinc-700 shadow-sm" />
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center mb-1">{member.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium text-center">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Simple Footer for completeness */}
      <footer className="w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-t-[2.5rem] shadow-sm text-zinc-500 dark:text-zinc-400 py-12 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} Per4ML Research Group. All rights reserved.</p>
      </footer>
    </div>
  );
}
