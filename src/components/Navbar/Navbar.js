import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authFetch, IsUserLogged } from "helpers/authHelpers";

const foodRoutes = ["food", "barcode", "home", "", "recipes", "recipe-builder"];
const exerciseRoutes = ["exercise", "workouts"];
const profileRoutes = ["profile", "signup", "forgotPassword"];
const mainRoutes = ["dashboard", "diary", "login"];

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
                        <Link className={topLevelPath === "food" || topLevelPath === "barcode" ? "nav-active" : null} to="/food">
                            Food
                        </Link>
                    </li>
                    <li>
                        <Link className={topLevelPath === "exercise" ? "nav-active" : null} to="/exercise">
                            Exercise
                        </Link>
                    </li>
                    <li>
                        <Link className={topLevelPath === "login" ? "nav-active" : null} to="/login">
                            Login
                        </Link>
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
                        <Link className={topLevelPath === "food" || topLevelPath === "barcode" ? "nav-active" : null} to="/food">
                            Food
                        </Link>
                    </li>
                    <li>
                        <Link className={topLevelPath === "exercise" ? "nav-active" : null} to="/exercise">
                            Exercise
                        </Link>
                    </li>
                    <li>
                        <ProfileIcon profile={profile} navbarClass={navbarClass} topLevelPath={topLevelPath} />
                    </li>
                </ul>
            </nav>
        );
    }
}

function ProfileIcon(props) {
    const { profile, navbarClass, topLevelPath } = props;
    const [showMenu, setShowMenu] = useState(false);
    const [imageURL, setImageURL] = useState("");
    const [hasProfilePicture, setHasProfilePicture] = useState(profile.hasProfilePicture);
    const [isAttemptingFetch, setIsAttemptingFetch] = useState(false);
    const navigate = useNavigate();

    const handleResponse = (res) => {
        if (res.status === 200) {
            return res.json();
        }
        // best way to cancel a Promise chain is to throw an error
        if (res.status === 400) {
            setHasProfilePicture(false);
            throw new Error(400);
        }
        if (res.status === 500) {
            setHasProfilePicture(false);
            console.log(res);
            throw new Error(500);
        }
    };

    const getProfilePic = async () => {
        if (isAttemptingFetch) {
            return;
        }
        setIsAttemptingFetch(true);

        authFetch(
            `${process.env.REACT_APP_GATEWAY_URI}/profile/users/profilePicture`,
            {
                method: "GET",
            },
            navigate
        )
            .then(handleResponse)
            .then((imageLink) => setImageURL(imageLink.url))
            .catch((err) => {
                console.log(err);
                setIsAttemptingFetch(false);
            });
    };

    useEffect(() => {
        getProfilePic();
    }, []);

    if (hasProfilePicture) {
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
                    <img src={imageURL} />
                </div>
                {showMenu ? <ProfileMenu navbarClass={navbarClass} topLevelPath={topLevelPath} /> : null}
            </div>
        );
    } else {
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
                {showMenu ? <ProfileMenu navbarClass={navbarClass} topLevelPath={topLevelPath} /> : null}
            </div>
        );
    }
}

function ProfileMenu(props) {
    const { navbarClass, topLevelPath } = props;
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
            if (res.status === 200 || res.status === 404) {
                window.localStorage.clear();
                window.sessionStorage.clear();
                navigate("/");
            }
        });
    };

    return (
        <div id="navbar-profile-menu" className={navbarClass}>
            <Link className={topLevelPath === "dashboard" ? "nav-active" : null} to="/dashboard">
                Dashboard
            </Link>
            <Link className={topLevelPath === "diary" ? "nav-active" : null} to="/diary">
                Diary
            </Link>
            <Link className={topLevelPath === "profile" ? "nav-active" : null} to="/profile">
                Profile
            </Link>
            <p onClick={logoutOnClick}>Logout</p>
        </div>
    );
}

function clearSearchState(topLevelPath) {
    if (typeof window === "undefined") {
        return;
    }

    if (topLevelPath !== "food" && topLevelPath !== "recipes") {
        window.sessionStorage.removeItem("FoodSearchPageText");
        window.sessionStorage.removeItem("FoodSearchPageResults");
        window.sessionStorage.removeItem("FoodSearchPageStatus");
        window.sessionStorage.removeItem("FoodSearchPageType");
    }

    if (topLevelPath !== "exercise") {
        window.sessionStorage.removeItem("ExerciseSearchPageText");
        window.sessionStorage.removeItem("ExerciseSearchPageType");
        window.sessionStorage.removeItem("ExerciseSearchPageResults");
    }
}

export default Navbar;
