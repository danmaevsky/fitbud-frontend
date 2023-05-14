import magnifyingGlass from "assets/magnifying-glass.svg";
import clearTextX from "assets/clear-text-x.svg";
import foodSearchPlacehoder from "assets/food-search-placeholder.svg";
import "./RecipeSearchPage.css";
import { IsUserLogged, authFetch } from "helpers/authHelpers";
import { ProcessFoodName } from "helpers/fitnessHelpers";
import useLocalStorage from "hooks/useLocalStorage";
import useSessionStorage from "hooks/useSessionStorage";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TimestampToYMD } from "helpers/generalHelpers";

export default function RecipeSearchPage() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useSessionStorage("RecipeSearchPageText", "");
    const [recipes, setRecipes] = useLocalStorage("Recipes", []);
    const searchBoxRef = useRef(null);

    const userIsLoggedIn = IsUserLogged();

    const fetchResults = () => {
        if (userIsLoggedIn) {
            // userId is pulled from access token in the backend
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/`, {
                method: "GET",
            })
                .then((res) => {
                    return res.json();
                })
                .then((json) => setRecipes(json));
        }
    };

    const inputOnKeydown = (e) => {
        // if (e.key === "Enter") {
        //     fetchResults();
        //     return;
        // }
        // return;
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const sortFunction = (recipeA, recipeB) => {
        // if no search text, then sort by timestamp
        if (searchText) {
            return LevenshteinDistance(searchText, recipeA.name) - LevenshteinDistance(searchText, recipeB.name);
        } else {
            return new Date(recipeB.timestamp).getTime() - new Date(recipeA.timestamp).getTime();
        }
    };

    return (
        <div id="recipe-search-page-body">
            <div className="food-background-round round-background-decoration"></div>
            <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="recipe-search-page-controls">
                <div id="recipe-search-page-searchbox">
                    <button title="Search!" id="food-search-page-searchbox-button" onClick={() => fetchResults()}>
                        <img src={magnifyingGlass} alt="magnifying glass icon" />
                    </button>
                    <input
                        id="recipe-search-page-searchbox-input"
                        type="text"
                        placeholder="Search Recipes"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onKeyDown={inputOnKeydown}
                        ref={searchBoxRef}
                    ></input>
                    {searchText !== "" ? (
                        <button
                            title="Clear text"
                            id="recipe-search-page-cleartext-button"
                            onClick={() => {
                                searchBoxRef.current.focus();
                                setSearchText("");
                            }}
                        >
                            <img src={clearTextX} alt="clear text icon X" />
                        </button>
                    ) : (
                        <div id="exercise-search-page-searchbox-placeholder"></div>
                    )}
                </div>
                <button id="recipe-search-page-create-button" onClick={() => navigate("/recipe-builder")}>
                    Create a Recipe!
                </button>
            </div>
            <div id="recipe-search-island">
                <p id="food-search-island-number">{recipes.length > 0 ? `Results: ${recipes.length}` : null}</p>
                {recipes.length > 0 ? (
                    <FoodSearchList searchResults={[...recipes].sort(sortFunction)} />
                ) : (
                    <>
                        <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                        {recipes.length <= 0 ? <h3>You don't have any recipes to look at yet!</h3> : null}
                    </>
                )}
            </div>
        </div>
    );
}

function FoodSearchList(props) {
    let { searchResults } = props;
    return (
        <ul id="recipe-search-results-list">
            {searchResults.map((searchResults, index) => (
                <FoodSearchResult response={searchResults} key={`food-search-result-${index}`} />
            ))}
            <li id="recipe-search-refine-message">
                <h4>Didn't find what you were looking for? Consider refining your search!</h4>
            </li>
        </ul>
    );
}

function FoodSearchResult(props) {
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
    console.log(str2, ":", track[str2.length][str1.length]);
    return track[str2.length][str1.length];
}

function ConvertTimestampToDate(timestamp) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateObj = new Date(timestamp);
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}
