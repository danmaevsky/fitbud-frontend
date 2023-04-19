import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

const foodRoutes = ["food", "barcode", "recipes"];
const exerciseRoutes = ["exercise", "workouts"];
const profileRoutes = ["profile"];
const mainRoutes = ["dashboard", "diary", "home", "", "login"];

function Navbar() {
    const location = useLocation();

    // picking the color of the navbar
    const topLevelPath = location.pathname.split("/")[1];
    let navbarClass;
    if (foodRoutes.includes(topLevelPath)) {
        navbarClass = "food";
    } else if (exerciseRoutes.includes(topLevelPath)) {
        navbarClass = "exercise";
    } else if (profileRoutes.includes(topLevelPath)) {
        navbarClass = "profile";
    } else if (mainRoutes.includes(topLevelPath)) {
        navbarClass = "main";
    } else {
        navbarClass = "main";
    }

    return (
        <nav id="navbar" className={navbarClass}>
            <Link
                to="/"
                onClick={() => {
                    clearFoodSearchPageState(location);
                    clearExerciseSearchPageState(location);
                }}
            >
                <h1>fitBud.</h1>
            </Link>
            <ul>
                <li>
                    <Link to="/food" onClick={() => clearFoodSearchPageState(location)}>
                        Food
                    </Link>
                </li>
                <li>
                    <Link to="/exercise" onClick={() => clearExerciseSearchPageState(location)}>
                        Exercise
                    </Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
            </ul>
        </nav>
    );
}

function clearFoodSearchPageState(location) {
    if (typeof window === "undefined") {
        return;
    }
    if (location.pathname !== "/food") {
        window.sessionStorage.removeItem("FoodSearchPageText");
        window.sessionStorage.removeItem("FoodSearchPageResults");
        window.sessionStorage.removeItem("FoodSearchPageStatus");
    }
}

function clearExerciseSearchPageState(location) {
    if (typeof window === "undefined") {
        return;
    }
    if (location.pathname !== "/exercise") {
        window.sessionStorage.removeItem("ExerciseSearchPageText");
        window.sessionStorage.removeItem("ExerciseSearchPageType");
        window.sessionStorage.removeItem("ExerciseSearchPageResults");
    }
}

export default Navbar;
