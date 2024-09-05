import OrderForm from "./components/OrderForm";
import ArticleGenerator from "./components/AriticleGenerator";
import "./index.css";
import { useState } from "react";

function App() {
  const [currentService, setCurrentService] = useState("checkOrder");

  return (
    <div className="min-h-screen bg-gray-100 pt-3">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose a service below to get started
          </p>
        </div>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={() => setCurrentService("checkOrder")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentService === "checkOrder"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Check Order
          </button>
          <button
            onClick={() => setCurrentService("article")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentService === "article"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Generate Article
          </button>
        </div>
        <div className="mt-10">
          {currentService === "checkOrder" ? <OrderForm /> : <ArticleGenerator />}
        </div>
      </div>
    </div>
  );
}

export default App;