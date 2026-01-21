import "./App.css";
import Navbar from "./Components/Navbar";
import Manager from "./Components/Manager";
import Footer from "./Components/Footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <Manager />

      <Footer />
    </div>
  );
}

export default App;
