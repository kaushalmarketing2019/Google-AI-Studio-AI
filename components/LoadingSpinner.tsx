import React from 'react';

const LoadingSpinner: React.FC = () => {
    const messages = [
        "Analyzing SERPs...",
        "Researching keywords...",
        "Fetching search volume data...",
        "Crafting your content strategy...",
        "Consulting with SEO experts (the AI ones)...",
        "Finalizing your optimization plan..."
    ];
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2500);

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl min-h-[300px]">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
        <div className="absolute inset-2 border-4 border-fuchsia-500/30 rounded-full"></div>
        <div className="absolute inset-2 border-4 border-transparent border-t-fuchsia-500 rounded-full animate-spin" style={{animationDuration: '2s', animationDirection: 'reverse'}}></div>
      </div>
      <p className="text-slate-300 font-semibold text-lg">{message}</p>
    </div>
  );
};

export default LoadingSpinner;