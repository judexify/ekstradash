import { useEffect } from "react";
import DominanceBar from "./components/DominanceBar.jsx";
import FearGreedBadge from "./components/FearGreedBadge.jsx";
import CoinList from "./components/CoinList.jsx";
import CurrencyToggle from "./components/CurrencyToggle.jsx";
import GestureHUD from "./components/GestureHUD.jsx";
import StatusBar from "./components/StatusBar.jsx";
import { dispatchGesture } from "./context/GestureContext.jsx";

export default function App() {
  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key === "arrowup") dispatchGesture("SCROLL_UP");
      if (key === "arrowdown") dispatchGesture("SCROLL_DOWN");
      if (key === "r") dispatchGesture("REFRESH");
      if (key === "c") dispatchGesture("TOGGLE_CURRENCY");
      if (key === "f") dispatchGesture("FAVORITE");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main className="app-shell">
      <DominanceBar />
      <section className="top-grid" aria-label="Market controls">
        <div>
          <p className="eyebrow">Ekstra Motion Runtime</p>
          <h1>Crypto Command Surface</h1>
        </div>
        <div className="control-cluster">
          <FearGreedBadge />
          <CurrencyToggle />
        </div>
      </section>
      <CoinList />
      <StatusBar />
      <GestureHUD />
    </main>
  );
}
