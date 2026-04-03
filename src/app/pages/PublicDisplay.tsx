import React, { useState, useEffect } from 'react';
import { useEvent } from '../contexts/EventContext';
import { VideoPlayer } from '../components/shared/VideoPlayer';
import { NewsTicker } from '../components/shared/NewsTicker';
import { MatchCard } from '../components/shared/MatchCard';
import { EventLogo } from '../components/shared/EventLogo';
import { motion, AnimatePresence } from 'motion/react';

export function PublicDisplay() {
  const { 
    matches, 
    franchises, 
    sports, 
    event, 
    globalHeadlines, 
    eventHeadlines,
    videoPlayer,
    branding,
  } = useEvent();

  const [showFixtures, setShowFixtures] = useState(false);
  const [scoreFlash, setScoreFlash] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').slice(0, 5);

  // Track score changes for flash animation
  const [prevScores, setPrevScores] = useState<Record<string, any>>({});

  useEffect(() => {
    matches.forEach(match => {
      const prevScore = prevScores[match.id];
      const currentScoreA = match.scoreA ? Object.values(match.scoreA)[0] : 0;
      const currentScoreB = match.scoreB ? Object.values(match.scoreB)[0] : 0;
      
      if (prevScore) {
        const prevScoreA = prevScore.scoreA ? Object.values(prevScore.scoreA)[0] : 0;
        const prevScoreB = prevScore.scoreB ? Object.values(prevScore.scoreB)[0] : 0;
        
        if (currentScoreA !== prevScoreA || currentScoreB !== prevScoreB) {
          setScoreFlash(match.id);
          setTimeout(() => setScoreFlash(null), 800);
        }
      }
    });

    const newScores: Record<string, any> = {};
    matches.forEach(match => {
      newScores[match.id] = { scoreA: match.scoreA, scoreB: match.scoreB };
    });
    setPrevScores(newScores);
  }, [matches]);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Top Bar */}
      <div 
        className="flex items-center justify-between px-8 py-4 border-b border-white/10"
        style={{ backgroundColor: branding.primaryColor }}
      >
        <div className="flex items-center gap-4">
          <EventLogo size="md" />
          <h1 className="text-2xl font-bold">{branding.eventName}</h1>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/80">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <div className="text-lg font-medium">
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!showFixtures ? (
          <div className="h-full flex flex-col">
            {/* Video Player */}
            <div className="flex-1">
              <VideoPlayer 
                streamUrl={videoPlayer.currentStreamUrl}
                status={videoPlayer.status}
                className="w-full h-full"
              />
            </div>

            {/* Live Scorecards Strip */}
            {liveMatches.length > 0 && (
              <div className="bg-black/40 backdrop-blur-sm py-4 px-6">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {liveMatches.map(match => {
                    const franchiseA = franchises.find(f => f.id === match.franchiseAId);
                    const franchiseB = franchises.find(f => f.id === match.franchiseBId);
                    const sport = sports.find(s => s.id === match.sportId);

                    if (!franchiseA || !franchiseB || !sport) return null;

                    return (
                      <motion.div
                        key={match.id}
                        animate={scoreFlash === match.id ? {
                          backgroundColor: ['rgba(0,0,0,0)', 'rgba(245,158,11,0.5)', 'rgba(0,0,0,0)'],
                        } : {}}
                        transition={{ duration: 0.8 }}
                      >
                        <MatchCard 
                          match={match}
                          franchiseA={franchiseA}
                          franchiseB={franchiseB}
                          sport={sport}
                          variant="compact"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <div className="bg-black/60 backdrop-blur-sm py-4 px-6">
                <h3 className="text-lg font-bold mb-3 text-white/90">Upcoming Matches</h3>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                  {upcomingMatches.map(match => {
                    const franchiseA = franchises.find(f => f.id === match.franchiseAId);
                    const franchiseB = franchises.find(f => f.id === match.franchiseBId);
                    const sport = sports.find(s => s.id === match.sportId);

                    if (!franchiseA || !franchiseB || !sport) return null;

                    return (
                      <MatchCard 
                        key={match.id}
                        match={match}
                        franchiseA={franchiseA}
                        franchiseB={franchiseB}
                        sport={sport}
                        variant="compact"
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <FixturesBoard />
        )}
      </div>

      {/* Dual News Ticker */}
      <div className="border-t border-white/10">
        <NewsTicker 
          headlines={globalHeadlines.map(h => h.text)}
          backgroundColor={branding.primaryColor}
          textColor="#FFFFFF"
          speed={60}
        />
        <NewsTicker 
          headlines={eventHeadlines.length > 0 ? eventHeadlines.map(h => h.text) : ['No event-specific updates']}
          backgroundColor={branding.secondaryColor}
          textColor="#000000"
          speed={50}
        />
      </div>

      {/* Hidden toggle for fixtures view (keyboard shortcut) */}
      <button
        onClick={() => setShowFixtures(!showFixtures)}
        className="fixed bottom-20 right-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-sm opacity-50 hover:opacity-100 transition-opacity"
      >
        {showFixtures ? 'Live View' : 'Fixtures'}
      </button>
    </div>
  );
}

function FixturesBoard() {
  const { matches, sports, franchises, branding } = useEvent();
  const [activeTab, setActiveTab] = useState(sports[0]?.id || '');

  const sportMatches = matches.filter(m => m.sportId === activeTab);
  const activeSport = sports.find(s => s.id === activeTab);

  return (
    <motion.div 
      className="h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-4xl font-bold text-center mb-8" style={{ color: branding.secondaryColor }}>
        Fixtures & Results
      </h2>

      {/* Sport Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {sports.map(sport => (
          <motion.button
            key={sport.id}
            onClick={() => setActiveTab(sport.id)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === sport.id 
                ? 'text-black' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
            style={activeTab === sport.id ? { backgroundColor: branding.secondaryColor } : {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sport.name}
          </motion.button>
        ))}
        <motion.button
          onClick={() => setActiveTab('cultural')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === 'cultural'
              ? 'text-black'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
          style={activeTab === 'cultural' ? { backgroundColor: branding.secondaryColor } : {}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cultural Events
        </motion.button>
      </div>

      {/* Matches Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sportMatches.map((match, index) => {
            const franchiseA = franchises.find(f => f.id === match.franchiseAId);
            const franchiseB = franchises.find(f => f.id === match.franchiseBId);

            if (!franchiseA || !franchiseB || !activeSport) return null;

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MatchCard 
                  match={match}
                  franchiseA={franchiseA}
                  franchiseB={franchiseB}
                  sport={activeSport}
                  variant="full"
                />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}