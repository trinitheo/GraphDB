
import React from 'react';

interface WelcomeCardProps {
  name: string;
}

const getDailyQuote = () => {
  const quotes = [
    "Every patient is a story waiting to be heard.",
    "Compassion is the nurse's superpower.",
    "You make healing possible—one smile at a time.",
    "Your care is the calm in someone's storm.",
  ];
  return quotes[new Date().getDate() % quotes.length];
};

const WelcomeCard: React.FC<WelcomeCardProps> = ({ name }) => {
  // Use static "Welcome" as requested, instead of time-based greeting
  const greeting = "Welcome";
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const quote = getDailyQuote();

  return (
    <div className="card-panel bg-sky-50/50 border-sky-200 p-8">
      {/* Increased font size to 40pt (approx text-6xl/7xl range) as requested */}
      <h1 className="text-[40pt] font-bold text-slate-800 leading-tight">
        {greeting}, {name}! Let's see what's on the board today!
      </h1>
      <p className="text-slate-600 mt-3 text-lg font-medium">{today}</p>
      <p className="text-sm text-sky-800 italic mt-4">“{quote}”</p>
    </div>
  );
};

export default WelcomeCard;
