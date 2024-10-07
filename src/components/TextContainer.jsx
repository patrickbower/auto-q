import React, { useState } from "react";
import InputText from "../components/InputText.jsx";
import OutputText from "../components/OutputText.jsx";
// store
import { useStore } from "@nanostores/react";
import { messageStore } from "../store.js";

const TextContainer = () => {
  const message = useStore(messageStore);

  return <>{message ? <OutputText /> : <InputText />}</>;
};

export default TextContainer;
