import React, { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { messageStore } from "../store.js";

const RealTimeAutocue = () => {
  const sentence = useStore(messageStore);
  const words = sentence.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const textContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionTimeoutRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;

    if (SpeechRecognition && SpeechGrammarList) {
      const recognition = new SpeechRecognition();
      const speechRecognitionList = new SpeechGrammarList();

      const grammar = `#JSGF V1.0; grammar words; public <word> = ${words.join(
        " | ",
      )};`;
      speechRecognitionList.addFromString(grammar, 1);

      recognition.grammars = speechRecognitionList;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 5;

      recognitionRef.current = recognition;

      setupRecognitionEventListeners();
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearTimeout(recognitionTimeoutRef.current);
    };
  }, []);

  const setupRecognitionEventListeners = () => {
    const recognition = recognitionRef.current;

    recognition.onresult = handleRecognitionResult;
    recognition.onsoundstart = () => console.log("Sound started");
    recognition.onsoundend = handleSoundEnd;
    recognition.onend = () => console.log("Recognition ended");
  };

  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const areSimilar = (word1, word2, threshold = 0.7) => {
    const distance = levenshteinDistance(
      word1.toLowerCase(),
      word2.toLowerCase(),
    );
    const maxLength = Math.max(word1.length, word2.length);
    const similarity = 1 - distance / maxLength;
    return similarity >= threshold;
  };

  const highlightWord = (index) => {
    if (index < words.length && textContainerRef.current) {
      textContainerRef.current.children[index].classList.add("highlight");
    }
  };

  const handleRecognitionResult = (event) => {
    clearTimeout(recognitionTimeoutRef.current);
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim().toLowerCase();

    console.log("Transcript:", transcript); // For debugging

    const recognizedWords = transcript.split(" ");
    let matchFound = false;

    for (let i = 0; i < recognizedWords.length; i++) {
      for (let j = currentWordIndex; j < words.length; j++) {
        const recognizedWord = recognizedWords[i];
        const expectedWord = words[j].toLowerCase();

        if (
          areSimilar(recognizedWord, expectedWord) ||
          expectedWord.includes(recognizedWord) ||
          recognizedWord.includes(expectedWord)
        ) {
          // Highlight all words up to and including the matched word
          for (let k = currentWordIndex; k <= j; k++) {
            highlightWord(k);
          }
          setCurrentWordIndex(j + 1);
          matchFound = true;
          break;
        }
      }
      if (matchFound) break;
    }

    if (currentWordIndex >= words.length) {
      recognitionRef.current.stop();
      setIsRecognitionActive(false);
    }
  };

  const handleSoundEnd = () => {
    console.log("Sound ended");
    const recognition = recognitionRef.current;
    recognition.stop();
    recognition.start(); // Restart to continue listening
  };

  const startRecognition = () => {
    setCurrentWordIndex(0);
    if (textContainerRef.current) {
      Array.from(textContainerRef.current.children).forEach((span) =>
        span.classList.remove("highlight"),
      );
    }
    recognitionRef.current.start();
    setIsRecognitionActive(true);

    recognitionTimeoutRef.current = setTimeout(() => {
      recognitionRef.current.stop();
      recognitionRef.current.start(); // Restart recognition every 5 seconds
    }, 5000);
  };

  const stopRecognition = () => {
    recognitionRef.current.stop();
    clearTimeout(recognitionTimeoutRef.current);
    setIsRecognitionActive(false);
  };

  return (
    <div>
      <h1>Real-time Autocue</h1>
      <button
        onClick={startRecognition}
        disabled={isRecognitionActive}
      >
        Start
      </button>
      <button
        onClick={stopRecognition}
        disabled={!isRecognitionActive}
      >
        Stop
      </button>
      <div
        ref={textContainerRef}
        className="text-4xl"
      >
        {words.map((word, index) => (
          <span key={index}>{word} </span>
        ))}
      </div>
    </div>
  );
};

export default RealTimeAutocue;
