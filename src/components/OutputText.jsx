import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { messageStore } from "../store.js";
import Icon from "./Icon.jsx";

const RealTimeAutocue = () => {
  const sentence = useStore(messageStore);
  const words = sentence.split(" ");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [isFinshed, setIsFinshed] = useState(false);
  const textContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionTimeoutRef = useRef(null);

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
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const areSimilar = (word1, word2, threshold = 0.7) => {
    const distance = levenshteinDistance(
      word1.toLowerCase(),
      word2.toLowerCase()
    );
    const maxLength = Math.max(word1.length, word2.length);
    const similarity = 1 - distance / maxLength;
    return similarity >= threshold;
  };

  const cleanupRecognition = useCallback(() => {
    setIsCleaningUp(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.error("Error aborting recognition:", error);
      }
      recognitionRef.current.onresult = null;
      recognitionRef.current.onsoundstart = null;
      recognitionRef.current.onsoundend = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current = null;
    }
    clearTimeout(recognitionTimeoutRef.current);
    setIsRecognitionActive(false);
    setCurrentWordIndex(0);
    setIsCleaningUp(false);
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList =
      window.SpeechGrammarList || window.webkitSpeechGrammarList;

    if (SpeechRecognition && SpeechGrammarList) {
      const recognition = new SpeechRecognition();
      const speechRecognitionList = new SpeechGrammarList();

      const grammar = `#JSGF V1.0; grammar words; public <word> = ${words.join(
        " | "
      )};`;
      speechRecognitionList.addFromString(grammar, 1);

      recognition.grammars = speechRecognitionList;
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 5;

      recognitionRef.current = recognition;

      setupRecognitionEventListeners();

      startRecognition();
    }

    return cleanupRecognition;
  }, [cleanupRecognition]);

  useEffect(() => {
    if (currentWordIndex >= words.length - 1) {
      highlightWord(words.length - 1);
      setTimeout(() => {
        stopRecognition();
      }, 500);
    }
  }, [currentWordIndex, words.length]);

  const setupRecognitionEventListeners = () => {
    const recognition = recognitionRef.current;

    recognition.onresult = handleRecognitionResult;
    recognition.onsoundstart = () => console.log("Sound started");
    recognition.onsoundend = handleSoundEnd;
    recognition.onend = handleRecognitionEnd;
    recognition.onerror = (event) => {
      if (event.error === "aborted" && isCleaningUp) {
        console.log("Recognition aborted during cleanup");
      } else {
        // console.error("Recognition error:", event.error);
        if (event.error === "not-allowed") {
          cleanupRecognition();
        }
      }
    };
  };

  const handleRecognitionEnd = () => {
    console.log("Recognition ended");
    if (!isCleaningUp) {
      cleanupRecognition();
    }
    setIsFinshed(true);
  };

  const highlightWord = (index) => {
    if (index < words.length && textContainerRef.current) {
      textContainerRef.current.children[index].classList.add("highlight");
    }
  };

  const handleRecognitionResult = (event) => {
    if (!recognitionRef.current || isCleaningUp) return;

    clearTimeout(recognitionTimeoutRef.current);
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim().toLowerCase();

    console.log("Transcript:", transcript);

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

    if (currentWordIndex === words.length - 1) {
      const lastRecognizedWord = recognizedWords[recognizedWords.length - 1];
      const lastExpectedWord = words[words.length - 1].toLowerCase();
      if (areSimilar(lastRecognizedWord, lastExpectedWord, 0.5)) {
        highlightWord(words.length - 1);
        setCurrentWordIndex(words.length);
      }
    }
  };

  const handleSoundEnd = () => {
    console.log("Sound ended");
    if (!isCleaningUp) {
      stopRecognition();
    }
  };

  const startRecognition = () => {
    if (isCleaningUp) return;

    setCurrentWordIndex(0);
    if (textContainerRef.current) {
      Array.from(textContainerRef.current.children).forEach((span) =>
        span.classList.remove("highlight")
      );
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecognitionActive(true);

        recognitionTimeoutRef.current = setTimeout(() => {
          restartRecognition();
        }, 5000);
      }
    } catch (error) {
      console.error("Error starting recognition:", error);
      setIsRecognitionActive(false);
      if (error.name === "NotAllowedError") {
        cleanupRecognition();
      }
    }
  };

  const stopRecognition = () => {
    if (isCleaningUp) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
    clearTimeout(recognitionTimeoutRef.current);
    setIsRecognitionActive(false);
  };

  const restartRecognition = () => {
    if (isCleaningUp) return;

    stopRecognition();
    setTimeout(() => {
      startRecognition();
    }, 100);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4 flex items-center justify-center h-full">
        <div className="bg-neutral-700 w-full max-w-4xl p-16 rounded-lg speech-bubble relative -mt-1">
          <div
            ref={textContainerRef}
            className="text-5xl speech-text"
            style={{ lineHeight: "3.74rem" }}
          >
            {words.map((word, index) => (
              <span key={index}>{word} </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 flex items-center flex-col">
        {isFinshed ? (
          <>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="appearance-none bg-green rounded-full w-14 h-14 mb-6 flex items-center justify-center"
            >
              <Icon
                src="../icons/check.svg"
                width={70}
                height={70}
              />
            </button>
            <p className="text-green-600">Done</p>
          </>
        ) : (
          <>
            <button
              onClick={stopRecognition}
              disabled={!isRecognitionActive}
              className="appearance-none bg-white rounded-full w-14 h-14 mb-6 flex items-center justify-center"
            >
              <Icon
                src="../icons/stop.svg"
                width={30}
                height={30}
              />
            </button>
            <p>Stop</p>
          </>
        )}
      </div>
    </div>
  );
};

export default RealTimeAutocue;
