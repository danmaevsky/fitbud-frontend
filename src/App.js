import "./App.css";
import { Route, Routes } from "react-router-dom";
// components
import Navbar from "components/Navbar";

// pages
import DemoPage from "pages/DemoPage";
import LoginPage from "pages/LoginPage";
import FoodSearchPage from "pages/FoodSearchPage";
import FoodPage from "pages/FoodPage";
import ExerciseSearchPage from "pages/ExerciseSearchPage";
import BarcodeScanPage from "pages/BarcodeScanPage";

function App() {
    return (
        <div className="App">
            <Navbar />
            <div className="body">
                <Routes>
                    <Route path="/demo" element={<DemoPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/food" element={<FoodSearchPage />} />
                    <Route path="/food/:foodId" element={<FoodPage />} />
                    <Route path="/barcode" element={<BarcodeScanPage />} />
                    <Route path="/exercise" element={<ExerciseSearchPage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
