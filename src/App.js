import "./App.css";
import { Route, Routes } from "react-router-dom";
// components
import Navbar from "components/Navbar";


/* Pages */
// unprotected pages
import HomePage from "pages/HomePage";
import LoginPage from "pages/LoginPage";
import SignupPage from "pages/SignupPage";
import FoodSearchPage from "pages/FoodSearchPage";
import FoodPage from "pages/FoodPage";
import ExerciseSearchPage from "pages/ExerciseSearchPage";
import BarcodeScanPage from "pages/BarcodeScanPage";
// protected pages
import AuthWrapper from "layouts/AuthWrapper";

import ExerciseStrengthPage from "pages/ExerciseStrengthPage";
import DashboardPage from "pages/DashboardPage";
import DiaryPage from "pages/DiaryPage";
import EditFoodLogPage from "pages/EditFoodLogPage";


function App() {
    return (
        <div className="App">
            <Navbar />
            <div className="body">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/food" element={<FoodSearchPage />} />
                    <Route path="/food/:foodId" element={<FoodPage />} />
                    <Route path="/barcode" element={<BarcodeScanPage />} />
                    <Route path="/exercise" element={<ExerciseSearchPage />} />
                    <Route path="/exercise/strength/:exerciseId" element={<ExerciseStrengthPage />} />
                    <Route element={<AuthWrapper />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/diary" element={<DiaryPage />} />
                        <Route path="editLogs/food" element={<EditFoodLogPage />} />
                    </Route>
                </Routes>
            </div>
        </div>
    );
}

export default App;
