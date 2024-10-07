import React, { useState } from "react";
import { messageStore } from "../store.js";

const AddText = (message) => {
  const [text, setText] = useState("");

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const submitText = () => {
    messageStore.set(text);
  };

  return (
    <div className="row mt-5" id="add-text-cont">
      <div className="col">
        <div className="w-full md:w-full mb-6">
          <label className="block uppercase tracking-wide text-gray-400 text-sm font-bold mb-2">
            Enter text
          </label>
          <textarea
            required
            id="text"
            rows="4"
            value={text}
            onChange={handleTextChange}
            className="appearance-none block w-full bg-white text-gray-900 font-medium border border-gray-400 rounded-lg py-3 px-3 leading-tight focus:outline-none focus:border-[#98c01d]"
          />
        </div>
      </div>
      <div className="text-right w-full">
        <button
          onClick={submitText}
          className="appearance-none inline-block bg-green-700 text-gray-100 font-bold text-xl rounded-lg py-3 px-6 leading-tight hover:bg-green-600"
        >
          Add text
        </button>
      </div>
    </div>
  );
};

export default AddText;
