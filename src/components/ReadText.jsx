import { useStore } from "@nanostores/react";
import { messageStore } from "../store.js";

export default function Receiver() {
  const message = useStore(messageStore);
  return (
    <p className="text-white font-bold text-6xl" id="message">
      {message}
    </p>
  );
}
