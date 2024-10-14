import React, { useState } from "react";

const Info = () => {
  const [isOpen, setIsOpen] = useState(false);

  const InfoBox = function () {
    return (
      <div className="w-80 bg-white rounded-lg p-4 mt-4 shadow-xl">
        <p className="text-neutral-600 font-semibold">
          A side project exploring the Web Speech API and its ability to aid
          public speaking through auto-cue web app.
        </p>
        <div className="my-4 w-80 h-0.5 bg-neutral-600 relative -left-4"></div>
        <a
          href="https://www.patrickbower.com/"
          className="text-neutral-400 hover:text-neutral-600"
        >
          Made by Patrick Bower
        </a>
      </div>
    );
  };

  return (
    <div className="absolute top-4 left-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-full w-6 h-6"
      >
        <p className="font-bold text-neutral-600 block">i</p>
      </button>
      {isOpen ? <InfoBox /> : null}
    </div>
  );
};

export default Info;
