import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
    const location = useLocation();
    return (
        <nav id="navbar">
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
