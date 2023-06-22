import magnifyingGlass from "assets/magnifying-glass.svg";
import barcodeScannerIcon from "assets/barcode-scan-icon.svg";
import clearTextX from "assets/clear-text-x.svg";
import foodSearchPlacehoder from "assets/food-search-placeholder.svg";
import "./FoodSearchPage.css";
import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSessionStorage from "hooks/useSessionStorage";
import { ToTitleCase, ProcessFoodName } from "helpers/fitnessHelpers";
import { IsUserLogged, authFetch } from "helpers/authHelpers";
import useLocalStorage from "hooks/useLocalStorage";

export default function FoodSearchPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useSessionStorage("FoodSearchPageText", "");
    const [searchResults, setSearchResults] = useSessionStorage("FoodSearchPageResults", []);
    const [searchType, setSearchType] = useSessionStorage("FoodSearchPageType", "full");
    const [searchStatus, setSearchStatus] = useSessionStorage("FoodSearchPageStatus", 200);
    const searchBoxRef = useRef(null);

    const [myFoods, setMyFoods] = useLocalStorage("MyFoods", []);
    const [recipes, setRecipes] = useLocalStorage("Recipes", []);

    const userIsLoggedIn = IsUserLogged();

    const fetchResults = (override) => {
        if (userIsLoggedIn && override === "user") {
            let userId = JSON.parse(window.localStorage.profile)._id;
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?userId=${userId}`, {
                method: "GET",
            })
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(res.status);
                    }
                    return res.json();
                })
                .then((json) => {
                    setMyFoods(json);
                })
                .catch((err) => console.log(err));
        } else if (userIsLoggedIn && override === "recipe") {
            // userId is pulled from access token in the backend
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/`, {
                method: "GET",
            })
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(res.status);
                    }
                    return res.json();
                })
                .then((json) => {
                    setRecipes(json);
                })
                .catch((err) => console.log(err));
        } else {
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${encodeURIComponent(searchText)}`)
                .then((res) => {
                    setSearchStatus(res.status);
                    if (res.status !== 200) {
                        throw new Error(res.status);
                    }
                    return res.json();
                })
                .then((json) => {
                    setSearchType("full");
                    setSearchResults(json);
                })
                .catch((err) => console.log(err));
        }
    };
    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            if (searchType === "full") {
                fetchResults();
            }
            return;
        }
        return;
    };

    let list;
    switch (searchType) {
        case "full":
            list = searchResults;
            break;
        case "user":
            list = myFoods;
            break;
        case "recipe":
            list = recipes;
            break;
        default:
            list = searchResults;
    }

    return (
        <div id="food-search-page-body">
            <div className="food-background-round round-background-decoration"></div>
            <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="food-search-page-searchbox">
                <button
                    title="Search!"
                    id="food-search-page-searchbox-button"
                    onClick={() => {
                        if (searchType === "full") {
                            fetchResults();
                        }
                    }}
                >
                    <img src={magnifyingGlass} alt="magnifying glass icon" />
                </button>
                <input
                    id="food-search-page-searchbox-input"
                    type="text"
                    placeholder="Search Food"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={inputOnKeydown}
                    ref={searchBoxRef}
                ></input>
                {searchText !== "" ? (
                    <button
                        title="Clear text"
                        id="food-search-page-cleartext-button"
                        onClick={() => {
                            searchBoxRef.current.focus();
                            setSearchText("");
                        }}
                    >
                        <img src={clearTextX} alt="clear text icon X" />
                    </button>
                ) : (
                    <button
                        title="Scan a Barcode!"
                        id="food-search-page-searchbox-button"
                        onClick={() =>
                            navigate("/barcode", {
                                state: location.state,
                            })
                        }
                    >
                        <img src={barcodeScannerIcon} alt="barcode scanner icon" />
                    </button>
                )}
            </div>
            {userIsLoggedIn ? (
                <div id="food-search-page-logged-in-features">
                    <div id="food-search-page-choices">
                        <button
                            id="food-search-page-choice-full"
                            className={`exercise-search-page-choice-button${searchType === "full" ? "-active" : ""}`}
                            onClick={() => setSearchType("full")}
                        >
                            All
                        </button>
                        <button
                            id="food-search-page-choice-user"
                            className={`exercise-search-page-choice-button${searchType === "user" ? "-active" : ""}`}
                            onClick={() => {
                                fetchResults("user"); // override true so that when My Foods is clicked, it automatically sends GET
                                setSearchType("user");
                            }}
                        >
                            My Foods
                        </button>
                        <button
                            id="food-search-page-choice-recipe"
                            className={`exercise-search-page-choice-button${searchType === "recipe" ? "-active" : ""}`}
                            onClick={() => {
                                fetchResults("recipe"); // override true so that when Recipes is clicked, it automatically sends GET
                                setSearchType("recipe");
                            }}
                        >
                            My Recipes
                        </button>
                    </div>
                </div>
            ) : null}
            <FoodSearchIsland searchResults={list} searchText={searchText} searchType={searchType} searchStatus={searchStatus} />
        </div>
    );
}

function FoodSearchIsland(props) {
    const { searchResults, searchText, searchType, searchStatus } = props;

    const navigate = useNavigate();

    const sortFunction = (recipeA, recipeB) => {
        if (searchText) {
            // sort by Levenshtein Distance
            let LevA = LevenshteinDistance(searchText, recipeA.name.toLowerCase());
            let LevB = LevenshteinDistance(searchText, recipeB.name.toLowerCase());

            // normalizing the Levenshtein Distance so that smaller strings are not given advantage
            if (recipeA.name.length > recipeB.name.length) {
                LevA -= recipeA.name.length - recipeB.name.length;
            } else {
                LevB -= recipeB.name.length - recipeA.name.length;
            }
            return LevA - LevB;
        } else {
            // otherwise just sort by timestamp
            return new Date(recipeB.timestamp).getTime() - new Date(recipeA.timestamp).getTime();
        }
    };

    // dynamically change which list shows up
    let list;
    let emptyDefault;
    if (searchType === "recipe") {
        list = <RecipeSearchList searchResults={[...searchResults].sort(sortFunction)} />;
        emptyDefault = (
            <>
                <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                <h3>You don't have any recipes to look at yet!</h3>
            </>
        );
    } else if (searchType === "user") {
        list = <FoodSearchList searchResults={[...searchResults].sort(sortFunction)} myFoods={true} />;
        emptyDefault = (
            <>
                <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                <h3>You haven't submitted any foods yet!</h3>
            </>
        );
    } else {
        list = <FoodSearchList searchResults={searchResults} />;
        emptyDefault = (
            <>
                <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                {searchStatus !== 200 ? null : <h3>Search for a Food or Scan a Barcode!</h3>}
            </>
        );
    }

    return (
        <div id="food-search-island">
            <p id="food-search-island-number">{searchResults.length > 0 ? `Results: ${searchResults.length}` : null}</p>
            {searchResults.length > 0 ? list : emptyDefault}
            {searchStatus !== 200 && searchType === "full" ? <h3>Search came back empty!</h3> : null}
            <button
                id="food-search-page-submit-food-button"
                onClick={() => navigate(searchType === "recipe" ? "/recipe-builder" : "/food/createFood")}
            >
                {searchType === "recipe" ? "Create a Recipe!" : "Submit a Food!"}
            </button>
        </div>
    );
}

function FoodSearchList(props) {
    let { searchResults, myFoods } = props;
    return (
        <ul id="food-search-results-list">
            {searchResults.map((searchResults, index) => (
                <FoodSearchResult response={searchResults} key={`food-search-result-${index}`} />
            ))}
            {!myFoods ? (
                <li id="food-search-refine-message">
                    <h4>Didn't find what you were looking for? Consider refining your search!</h4>
                </li>
            ) : null}
        </ul>
    );
}

function FoodSearchResult(props) {
    let { _id, name, brandOwner, brandName, isVerified } = props.response;
    const location = useLocation();
    name = ProcessFoodName(name);
    let brand = brandName ? ToTitleCase(brandName) : brandOwner ? ToTitleCase(brandOwner) : null;

    const navigate = useNavigate();

    const resultOnClick = () => {
        navigate("/food/" + _id, {
            state: location.state,
        });
    };
    return (
        <li className="food-search-result" onClick={resultOnClick}>
            <h4>{name}</h4>
            <p>{brand}</p>
        </li>
    );
}

function RecipeSearchList(props) {
    let { searchResults } = props;
    return (
        <ul id="recipe-search-results-list">
            {searchResults.map((searchResults, index) => (
                <RecipeSearchResult response={searchResults} key={`food-search-result-${index}`} />
            ))}
            {/* <li id="food-search-refine-message">
                <h4>Didn't find what you were looking for? Consider refining your search!</h4>
            </li> */}
        </ul>
    );
}

function RecipeSearchResult(props) {
    let { _id, name, timestamp } = props.response;
    const location = useLocation();

    const navigate = useNavigate();

    const resultOnClick = () => {
        navigate("/recipes/" + _id, {
            state: location.state,
        });
    };
    return (
        <li className="recipe-search-result" onClick={resultOnClick}>
            <h4>{name}</h4>
            <p>{ConvertTimestampToDate(timestamp)}</p>
        </li>
    );
}

// Courtesy of https://www.tutorialspoint.com/levenshtein-distance-in-javascript
// I have implemented this algorithm before in Python, did not want to waste time converting it to JavaScript
function LevenshteinDistance(str1 = "", str2 = "") {
    const track = Array(str2.length + 1)
        .fill(null)
        .map(() => Array(str1.length + 1).fill(null));
    for (let i = 0; i <= str1.length; i += 1) {
        track[0][i] = i;
    }
    for (let j = 0; j <= str2.length; j += 1) {
        track[j][0] = j;
    }
    for (let j = 1; j <= str2.length; j += 1) {
        for (let i = 1; i <= str1.length; i += 1) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    // console.log(str2, ":", track[str2.length][str1.length]);
    return track[str2.length][str1.length];
}

function ConvertTimestampToDate(timestamp) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateObj = new Date(timestamp);
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}
