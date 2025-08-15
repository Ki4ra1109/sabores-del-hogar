import { useState } from 'react';
import './index.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-[#FFF1E6] text-[#5C3A21] flex flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-4xl font-bold text-[#F28D8D]">¡Sabores de Hogar!</h1>
      <p className="text-lg text-[#5C3A21]/80">Repostería casera con amor 💖</p>
      <button
        onClick={() => setCount((count) => count + 1)}
        className="bg-[#A16C4A] text-white px-6 py-3 rounded-lg hover:bg-[#8C5839] transition"
      >
        count is {count}
      </button>
    </div>
  );
}

export default App;
