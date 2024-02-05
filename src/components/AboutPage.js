import React from 'react';
import packageJson from '../../package.json';

const AboutPage = () => {

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-800 text-white">
      <img src="/AutoBk.svg" alt="AutoBk Controller" className="w-1/2 max-w-md" />
      <h1 className="text-2xl font-semibold mt-5">AutoBk Controller</h1>
      {packageJson.version && <p className="mt-2">Version: {packageJson.version}</p>}
      <a
        href="https://github.com/ds2600/autobk-controller" 
        className="mt-5 text-blue-500 hover:text-blue-700"
        target="_blank"
        rel="noopener noreferrer"
      >
        Github
      </a>
    </div>
  );
};

export default AboutPage;
