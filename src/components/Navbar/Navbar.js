import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authFetch, IsUserLogged } from "helpers/authHelpers";

const foodRoutes = ["food", "barcode", "recipes"];
const exerciseRoutes = ["exercise", "workouts"];
const profileRoutes = ["profile", "signup"];
const mainRoutes = ["dashboard", "diary", "home", "", "login"];

function Navbar() {
    const location = useLocation();
    const loggedIn = IsUserLogged(); // display a different Navbar if logged in

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

    useEffect(() => {
        clearSearchState(topLevelPath);
    }, [topLevelPath]);

    if (!loggedIn) {
        return (
            <nav id="navbar" className={navbarClass}>
                <Link to="/">
                    <h1>fitBud.</h1>
                </Link>
                <ul>
                    <li>
                        <Link to="/food">Food</Link>
                    </li>
                    <li>
                        <Link to="/exercise">Exercise</Link>
                    </li>
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                </ul>
            </nav>
        );
    } else {
        let profile = JSON.parse(window.localStorage.profile);
        return (
            <nav id="navbar" className={navbarClass}>
                <Link
                    to="/"
                    onClick={() => {
                        clearSearchState(location);
                    }}
                >
                    <h1>fitBud.</h1>
                </Link>
                <ul>
                    <li>
                        <Link to="/food">Food</Link>
                    </li>
                    <li>
                        <Link to="/exercise">Exercise</Link>
                    </li>
                    <li>
                        <ProfileIcon profile={profile} navbarClass={navbarClass} />
                    </li>
                </ul>
            </nav>
        );
    }
}

function ProfileIcon(props) {
    const { profile, navbarClass } = props;
    const [showMenu, setShowMenu] = useState(false);
    return (
        <div
            id="navbar-profile"
            tabIndex="0"
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setShowMenu(false);
                }
            }}
        >
            <div id="navbar-profile-icon" onClick={() => setShowMenu(!showMenu)}>
                {profile.firstName[0].toUpperCase()}
            </div>
            {showMenu ? <ProfileMenu navbarClass={navbarClass} /> : null}
        </div>
    );
}

function ProfileMenu(props) {
    const { navbarClass } = props;
    const navigate = useNavigate();

    const logoutOnClick = () => {
        let resStatus;
        authFetch(
            `${process.env.REACT_APP_GATEWAY_URI}/account/logout`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            },
            navigate
        ).then((res) => {
            resStatus = res.status;
            if (res.status === 200) {
                window.localStorage.clear();
                window.sessionStorage.clear();
                navigate("/");
            }
        });
    };

    return (
        <div id="navbar-profile-menu" className={navbarClass}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/diary">Diary</Link>
            <Link to="/profile">Profile</Link>
            <p onClick={logoutOnClick}>Logout</p>
        </div>
    );
}

function clearSearchState(topLevelPath) {
    if (typeof window === "undefined") {
        return;
    }

    if (topLevelPath !== "food") {
        window.sessionStorage.removeItem("FoodSearchPageText");
        window.sessionStorage.removeItem("FoodSearchPageResults");
        window.sessionStorage.removeItem("FoodSearchPageStatus");
    }

    if (topLevelPath !== "exercise") {
        window.sessionStorage.removeItem("ExerciseSearchPageText");
        window.sessionStorage.removeItem("ExerciseSearchPageType");
        window.sessionStorage.removeItem("ExerciseSearchPageResults");
    }
}

export default Navbar;
