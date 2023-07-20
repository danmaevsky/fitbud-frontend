import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useLocalStorage from "hooks/useLocalStorage";
import { IsUserLogged } from "helpers/authHelpers";
import { fetchDiaryHelper } from "helpers/fitnessHelpers";
import { getCurrentDate } from "helpers/generalHelpers";
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
import ForgotPasswordEmailPage from "pages/ForgotPasswordEmailPage";
import ForgotPasswordPasswordPage from "pages/ForgotPasswordPasswordPage";
// protected pages
import AuthWrapper from "layouts/AuthWrapper";
import ExerciseStrengthPage from "pages/ExerciseStrengthPage";
import DashboardPage from "pages/DashboardPage";
import DiaryPage from "pages/DiaryPage";
import ProfilePage from "pages/ProfilePage";
import RecipeBuilderPage from "pages/RecipeBuilderPage";
import RecipePage from "pages/RecipePage";
import ChangePasswordPage from "pages/ChangePasswordPage";
import ExerciseCardioPage from "pages/ExerciseCardioPage";
import EditFoodLogPage from "pages/EditFoodLogPage";
import EditRecipeLogPage from "pages/EditRecipeLogPage";
import EditExerciseStrengthLogPage from "pages/EditExerciseStrengthLogPage";
import EditExerciseCardioLogPage from "pages/EditExerciseCardioLogPage";
import CreateFoodPage from "pages/CreateFoodPage";

function App() {
    /* Effects that I would like to run globally across the whole application */
    // If user is logged in, upon first accessing the website we must update the diary once
    const navigate = useNavigate();
    const [currentDiary, setCurrentDiary] = useLocalStorage("CurrentDiary", null);
    const userIsLoggedIn = IsUserLogged();
    useEffect(() => {
        if (userIsLoggedIn) {
            const currentDate = getCurrentDate();
            fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
        }
    }, []);

    // If user is logged in, upon first accessing the website we want to navigate them to the dashboard page
    useEffect(() => {
        if (userIsLoggedIn) {
            navigate("/dashboard");
        }
    }, []);

    return (
        <div className="App">
            <Navbar />
            <div className="body">
                <Routes>
                    <Route path="/" element={<FoodSearchPage />} />
                    <Route path="/home" element={<FoodSearchPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/food" element={<FoodSearchPage />} />
                    <Route path="/food/:foodId" element={<FoodPage />} />
                    <Route path="/barcode" element={<BarcodeScanPage />} />
                    <Route path="/exercise" element={<ExerciseSearchPage />} />
                    <Route path="/forgotPassword" element={<ForgotPasswordEmailPage />} />
                    <Route path="/forgotPassword/:userId/:token" element={<ForgotPasswordPasswordPage />} />
                    <Route element={<AuthWrapper />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/diary" element={<DiaryPage />} />
                        <Route path="/edit-logs/food" element={<EditFoodLogPage />} />
                        <Route path="/edit-logs/strength" element={<EditExerciseStrengthLogPage />} />
                        <Route path="/edit-logs/cardio" element={<EditExerciseCardioLogPage />} />
                        <Route path="/edit-logs/recipe" element={<EditRecipeLogPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/changePassword" element={<ChangePasswordPage />} />
                        <Route path="/exercise/strength/:exerciseId" element={<ExerciseStrengthPage />} />
                        <Route path="/exercise/cardio/:exerciseId" element={<ExerciseCardioPage />} />
                        <Route path="/recipe-builder" element={<RecipeBuilderPage />} />
                        <Route path="/recipes/:recipeId" element={<RecipePage />} />
                        <Route path="/food/createFood" element={<CreateFoodPage />} />
                    </Route>
                </Routes>
            </div>
        </div>
    );
}

export default App;
