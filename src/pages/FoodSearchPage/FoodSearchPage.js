import magnifyingGlass from "assets/magnifying-glass.svg";
import barcodeScannerIcon from "assets/barcode-scan-icon.svg";
import clearTextX from "assets/clear-text-x.svg";
import foodSearchPlacehoder from "assets/food-search-placeholder.svg";
import "./FoodSearchPage.css";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSessionStorage from "hooks/useSessionStorage";
import { ToTitleCase, ProcessFoodName } from "helpers/fitnessHelpers";
import { IsUserLogged, authFetch } from "helpers/authHelpers";
import useLocalStorage from "hooks/useLocalStorage";

export default function FoodSearchPage() {
    const userIsLoggedIn = IsUserLogged();

    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useSessionStorage("FoodSearchPageText", "");
    const [searchResults, setSearchResults] = useSessionStorage("FoodSearchPageResults", []);
    const [searchType, setSearchType] = useSessionStorage("FoodSearchPageType", userIsLoggedIn ? "recents" : "all");
    const [searchStatus, setSearchStatus] = useSessionStorage("FoodSearchPageStatus", 200);
    const searchBoxRef = useRef(null);

    const [myFoods, setMyFoods] = useLocalStorage("MyFoods", []);
    const [recipes, setRecipes] = useLocalStorage("Recipes", []);
    const [recents, setRecents] = useLocalStorage("Recents", []);

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
        } else if (userIsLoggedIn && override === "recents") {
            // API call to retrieve a user's recently added foods
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/profile/users/history`, {
                method: "GET",
            })
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error(res.status);
                    }
                    return res.json();
                })
                .then((json) => {
                    setRecents(json);
                })
                .catch((err) => {
                    setRecents([]);
                    console.log(err);
                });
        } else {
            // both "recents" and "all" mode
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${encodeURIComponent(searchText)}`)
                .then((res) => {
                    setSearchStatus(res.status);
                    if (res.status !== 200) {
                        throw new Error(res.status);
                    }
                    return res.json();
                })
                .then((json) => {
                    setSearchType("all");
                    setSearchResults(json);
                })
                .catch((err) => {
                    setSearchType("all");
                    setSearchResults([]);
                    console.log(err);
                });
        }
    };
    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            if (searchType === "all" || searchType === "recents") {
                fetchResults();
            }
            return;
        }
        return;
    };

    let list;
    let placeholderText;
    switch (searchType) {
        case "recents":
            list = recents;
            placeholderText = "Search Recents";
            break;
        case "all":
            list = searchResults;
            placeholderText = "Search Foods";
            break;
        case "user":
            list = myFoods;
            placeholderText = "Search Your Foods";
            break;
        case "recipe":
            list = recipes;
            placeholderText = "Search Recipes";
            break;
        default:
            list = searchResults;
            placeholderText = "Search Foods";
    }

    // only run this useEffect if userIsLoggedIn changes, not on first render
    const firstRender = useRef(true);
    useEffect(() => {
        if (!firstRender.current) {
            setSearchType(userIsLoggedIn ? "recents" : "all");
        }
    }, [userIsLoggedIn]);

    useEffect(() => {
        firstRender.current = false;
        if (searchType === "recents") {
            fetchResults("recents");
        }
    }, []);

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
                        if (searchType === "all" || searchType === "recents") {
                            fetchResults();
                        }
                    }}
                >
                    <img src={magnifyingGlass} alt="magnifying glass icon" />
                </button>
                <input
                    id="food-search-page-searchbox-input"
                    type="text"
                    placeholder={placeholderText}
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
                            className={`exercise-search-page-choice-button${searchType === "recents" ? "-active" : ""}`}
                            onClick={() => {
                                fetchResults("recents");
                                setSearchType("recents");
                            }}
                        >
                            Recents
                        </button>
                        <button
                            id="food-search-page-choice-user"
                            className={`exercise-search-page-choice-button${searchType === "all" ? "-active" : ""}`}
                            onClick={() => setSearchType("all")}
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
        /* Constructing a good search algorithm is very interesting. This sort has gone through many
        iterations already:
        Version 1.0: Simply sort by Levenshtein Distance
            Notes: this worked well but it became clear that smaller strings were favored over longer
                strings. This is because a user typically builds a search query out of an empty string.
                Smaller strings have a smaller Levenshtein Distance to other small strings since there
                is less to mutate to get from one string to the other. This meant that until you typed
                the exact name of the food as a query (and sometimes not even then), the result you
                were looking for did not come up to the top. This inspired Version 1.1.

            Code:
                // sort by Levenshtein Distance
                const searchTextLower = searchText.toLowerCase();
                const recipeANameLower = recipeA.name.toLowerCase();
                const recipeBNameLower = recipeB.name.toLowerCase();
                let LevA = LevenshteinDistance(searchTextLower, recipeANameLower);
                let LevB = LevenshteinDistance(searchTextLower, recipeBNameLower);
        
        Version 1.1: Sort by Normalized Levenshtein Distance
            Notes: this version worked a lot better. Small strings did not automatically shoot up to
                to the top anymore. This made the search fit the query much better, and meant that
                the correct result would end up at the top much sooner in typing than in Version 1.
                There are still problems, however, and they come from the fact that Levenshtein 
                Distance does not necessarily mean matching. There are many coincidences where
                the Normalized Levenshtein Distance is the same, even when one string "looks" like the
                query much more than the other.
                For example, "cinnamon toast crunch coffee creamer, cinnamon toast" and "carrots, raw"
                have the same Normalized Levenshtein Distance to the query "carrots". How does that
                make sense...? Originally "cinnamon toast..." had a LevD of around 52. The reason
                it ended up showing up above "carrots, raw" is because after normalizing for distance,
                they became equal. Essentially, normalizing it made it so that in the most optimal form,
                if all else were equal, these two strings are identical. To fix this, we need some way to
                weigh the successful continuity of characters together. Maybe having 2 or more characters
                in a row matching should result in a multiplier to lower the score. This inspired
                Version 1.2.

            Code:
                // normalizing the Levenshtein Distance so that smaller strings are not given advantage
                if (recipeA.name.length > recipeB.name.length) {
                    LevA -= recipeA.name.length - recipeB.name.length;
                } else {
                    LevB -= recipeB.name.length - recipeA.name.length;
                }

        Version 1.2: Normalized Levenshtein Distance with Bonus for Containing Substring
                Notes: this version works better than the last by providing the result that contains
                    the search query with a bonus, scaled by the percentage of the string that matches.
                    If the entire result matches the query, it gets 100% of the bonus, etc. The idea was
                    to give strings a bonus for each consecutive character that matched, scaling up somehow
                    with the more letters that matched. The insight that enabled this version was to realize 
                    that doing that means to simply check for if it contains substring and assigning a bonus
                    based on how big that substring was as a percentage of the total string. One potential
                    improvement would be to use my GetPhrases algorithm and match against every phrase.
                    For example, this solves the problem with "carrots, raw" and "cinnamon toast crunch
                    coffee creamer, cinnamon toast" with the query "carrots", but I change the query to
                    "carrots.", the bonus is taken away from "carrots, raw" because it does not technically
                    contain the full substring "carrots.". It only contains part of the substring; the "."
                    broke the result. Maybe I could write a version of the Levenshtein Distance that computes
                    the distance it would take for the query to become a substring of the result and assign
                    the bonus based off that.

                Code:
                    // giving result a bonus if it actually contains the search query
                    const beta = 1;
                    if (recipeA.name.toLowerCase().includes(searchText.toLowerCase())) {
                        LevA -= beta * (searchText.length / recipeA.name.length);
                    }
                    if (recipeB.name.toLowerCase().includes(searchText.toLowerCase())) {
                        LevB -= beta * (searchText.length / recipeB.name.length) * beta;
                    }

        Version 2.0: Scanning Levenshtein Distance
                Notes: The time complexity of this algorithm is a bit worse, O(m * n^2), but this version of
                the string similarity essentially scans through all consecutive substrings and finds the
                minimum distance it takes string A to become a substring of string B. This fixes the earlier
                issue where adding a "." breaks Version 1.2 of the search.

        */
        if (searchText) {
            // sort by Levenshtein Distance
            const searchTextLower = searchText.toLowerCase();
            const recipeANameLower = recipeA.name.toLowerCase();
            const recipeBNameLower = recipeB.name.toLowerCase();
            let LevA = ScanningLevenshteinDistance(searchTextLower, recipeANameLower);
            let LevB = ScanningLevenshteinDistance(searchTextLower, recipeBNameLower);

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
        list = <RecipeSearchList searchResults={[...searchResults].sort(sortFunction)} myFoods={true} />;
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
    } else if (searchType === "recents") {
        list = <FoodSearchList searchResults={[...searchResults].sort(sortFunction)} myFoods={true} />;
        emptyDefault = (
            <>
                <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                <h3>You don't have any recent diary entries!</h3>
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
            {searchStatus !== 200 && searchType === "all" ? <h3>Search came back empty!</h3> : null}
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

function ScanningLevenshteinDistance(query = "", str2 = "") {
    if (query.length > str2.length) {
        return LevenshteinDistance(query, str2);
    }

    let min = Infinity;
    for (let i = 0; i <= str2.length - query.length; i++) {
        let Lev = LevenshteinDistance(query, str2.substring(i, i + query.length));
        if (Lev < min) {
            min = Lev;
        }
    }

    return min;
}

function ConvertTimestampToDate(timestamp) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateObj = new Date(timestamp);
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}
