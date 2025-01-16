import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MCPI Inventory Management System
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your inventory management with our comprehensive system designed for efficiency and accuracy.
        </p>

        <div className="grid gap-4 md:flex md:gap-6 justify-center">
          <Button
            size="lg"
            className="px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate("/login")}
          >
            Get Started
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            className="px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all"
            onClick={() => navigate("/dashboard")}
          >
            View Dashboard
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-3 text-primary">Real-time Tracking</h3>
            <p className="text-gray-600">Monitor your inventory levels and movements in real-time</p>
          </div>
          
          <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-3 text-primary">Easy Management</h3>
            <p className="text-gray-600">Simplified interface for managing items and locations</p>
          </div>
          
          <div className="p-6 rounded-lg bg-white shadow-md hover:shadow-lg transition-all">
            <h3 className="text-xl font-semibold mb-3 text-primary">Detailed Reports</h3>
            <p className="text-gray-600">Generate comprehensive reports and analytics</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;