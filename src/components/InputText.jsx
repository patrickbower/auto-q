import React, { useState, useRef, useEffect } from "react";
import { messageStore } from "../store.js";
import Icon from "./Icon.jsx";
import autosize from "autosize";

const AddText = (message) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    // Move cursor to the end
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    }

    var ta = document.querySelector("textarea");
    autosize(ta);
  }, []);

  const [text, setText] = useState(
    "The answer to the great question of life, the universe and everything is 42, it said with infinite majesty and calm."
  );

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const submitText = () => {
    messageStore.set(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4 flex items-center justify-center h-full">
        <div className="w-full max-w-4xl p-4 md:p-16 rounded-lg">
          <textarea
            ref={textareaRef}
            autoFocus
            required
            id="text"
            rows="3"
            value={text}
            placeholder="Enter your text"
            onChange={handleTextChange}
            className="appearance-none w-full max-w-4xl text-white bg-transparent text-2xl md:text-5xl resize-none focus:outline-none placeholder-gray-500 caret-red-500 md:leading-extra-loose"
            maxLength="300"
          />
        </div>
      </div>
      <div className="p-4 text-center">
        <button
          onClick={submitText}
          className="appearance-none inline-block bg-red-500 rounded-full w-14 h-14 pt-1 mb-6"
        >
          <Icon
            src="../icons/mic.svg"
            width={38}
            height={50}
          />
        </button>
        <p>Click and begin reading aloud</p>
      </div>
    </div>
  );
};

export default AddText;
