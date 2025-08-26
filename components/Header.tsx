import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 pb-2">
        SEO Landing Page Optimizer
      </h1>
      <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
        Generate a complete SEO and content strategy for your landing page with the power of AI.
      </p>
    </header>
  );
};

export default Header;