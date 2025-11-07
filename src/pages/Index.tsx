import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "./Home";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
};

export default Index;
