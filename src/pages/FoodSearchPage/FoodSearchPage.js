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

export default function FoodSearchPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchText, setSearchText] = useSessionStorage("FoodSearchPageText", "");
    const [searchResults, setSearchResults] = useSessionStorage("FoodSearchPageResults", []);
    const [searchType, setSearchType] = useState("full");
    const [searchStatus, setSearchStatus] = useSessionStorage("FoodSearchPageStatus", 200);
    const searchBoxRef = useRef(null);

    const userIsLoggedIn = IsUserLogged();

    const fetchResults = (override) => {
        if (userIsLoggedIn && (override || searchType === "user")) {
            let userId = JSON.parse(window.localStorage.profile)._id;
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?userId=${userId}`, {
                method: "GET",
            })
                .then((res) => {
                    setSearchStatus(res.status);
                    return res.json();
                })
                .then((json) => setSearchResults(json));
        } else {
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${encodeURIComponent(searchText)}`)
                .then((res) => {
                    setSearchStatus(res.status);
                    return res.json();
                })
                .then((json) => setSearchResults(json));
        }
    };
    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            fetchResults();
            return;
        }
        return;
    };

    return (
        <div id="food-search-page-body">
            <div className="food-background-round round-background-decoration"></div>
            <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="food-search-page-searchbox">
                <button title="Search!" id="food-search-page-searchbox-button" onClick={() => fetchResults()}>
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
                    <button title="Scan a Barcode!" id="food-search-page-searchbox-button" onClick={() => navigate("/barcode")}>
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
                            Full Search
                        </button>
                        <button
                            id="food-search-page-choice-user"
                            className={`exercise-search-page-choice-button${searchType === "user" ? "-active" : ""}`}
                            onClick={() => {
                                fetchResults(true);
                                setSearchType("user");
                            }}
                        >
                            My Foods
                        </button>
                    </div>
                    <button id="food-search-page-submit-food-button" onClick={() => navigate("/food/createFood")}>
                        Submit a Food!
                    </button>
                </div>
            ) : null}
            <div id="food-search-island">
                <p id="food-search-island-number">{searchResults.length > 0 ? `Results: ${searchResults.length}` : null}</p>
                {searchResults.length > 0 ? (
                    <FoodSearchList searchResults={searchResults} />
                ) : (
                    <>
                        <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                        {searchStatus !== 200 ? null : <h3>Search for a Food or Scan a Barcode!</h3>}
                    </>
                )}
                {searchStatus !== 200 ? <h3>Search came back empty!</h3> : null}
            </div>
        </div>
    );
}

function FoodSearchList(props) {
    let { searchResults } = props;
    return (
        <ul id="food-search-results-list">
            {searchResults.map((searchResults, index) => (
                <FoodSearchResult response={searchResults} key={`food-search-result-${index}`} />
            ))}
            <li id="food-search-refine-message">
                <h4>Didn't find what you were looking for? Consider refining your search!</h4>
            </li>
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
