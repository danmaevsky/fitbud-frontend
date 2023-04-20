import magnifyingGlass from "assets/magnifying-glass.svg";
import barcodeScannerIcon from "assets/barcode-scan-icon.svg";
import clearTextX from "assets/clear-text-x.svg";
import foodSearchPlacehoder from "assets/food-search-placeholder.svg";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import useSessionStorage from "hooks/useSessionStorage";
import { useEffect, useRef } from "react";
import useLocalStorage from "hooks/useLocalStorage";
import authFetch from "helpers/authFetch";
import getAllDiaryEntries from "helpers/getAllDiaryEntries";
import { useState } from "react";

export default function DashboardPage() {
    const [currentDiary, setCurrentDiary] = useLocalStorage("CurrentDiary", null);
    useEffect(() => {
        const dateObj = new Date();
        const currentDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
        if (!currentDiary) {
            fetchDiaryHelper(currentDate, setCurrentDiary);
        } else if (currentDiary && currentDiary.timestamp.split("T")[0] !== currentDate) {
            fetchDiaryHelper(currentDate, setCurrentDiary);
        }
    }, []);
    return (
        <div id="dashboard-page-body">
            <div id="dashboard-page-round-background-decoration"></div>
            <div id="dashboard-page-bottom-top-banner-background-decoration"></div>
            <div id="dashboard-page-bottom-bot-banner-background-decoration"></div>
            <div id="dashboard-page-content">
                <div id="dashboard-daily-summary-island">
                    <h3>Your Daily Summary</h3>
                </div>
                <div id="dashboard-widgets">
                    <FoodSearchbox />
                    <div id="dashboard-search-island">
                        <img src={foodSearchPlacehoder} alt="Food Search Placeholder Icon" />
                        <h3>Search for a Food or Scan a Barcode!</h3>
                    </div>
                    <div id="dashboard-progress-island">
                        <h3>Progress</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FoodSearchbox() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useSessionStorage("FoodSearchPageResults", []);
    const [searchStatus, setSearchStatus] = useSessionStorage("FoodSearchPageStatus", 200);
    const searchBoxRef = useRef(null);

    const fetchResults = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${encodeURIComponent(searchText)}`)
            .then((res) => {
                setSearchStatus(res.status);
                return res.json();
            })
            .then((json) => setSearchResults(json))
            .then(() => {
                window.sessionStorage.FoodSearchPageText = JSON.stringify(searchText);
                navigate("/food");
            });
    };

    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            fetchResults();
            return;
        }
        return;
    };

    return (
        <div id="dashboard-food-searchbox">
            <button id="dashboard-food-searchbox-search-button" onClick={fetchResults}>
                <img src={magnifyingGlass} alt="magnifying glass icon" />
            </button>
            <input
                id="dashboard-food-searchbox-input"
                type="text"
                placeholder="Search Food"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={inputOnKeydown}
                ref={searchBoxRef}
            ></input>
            {searchText !== "" ? (
                <button
                    id="dashboard-food-cleartext-button"
                    onClick={() => {
                        searchBoxRef.current.focus();
                        setSearchText("");
                    }}
                >
                    <img src={clearTextX} alt="clear text icon X" />
                </button>
            ) : (
                <button id="dashboard-food-searchbox-barcode-button" onClick={() => navigate("/barcode")}>
                    <img src={barcodeScannerIcon} alt="barcode scanner icon" />
                </button>
            )}
        </div>
    );
}

function fetchDiaryHelper(currentDate, setCurrentDiary) {
    let resStatus;
    authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/?date=${currentDate}`, {
        method: "GET",
    })
        .then((res) => {
            resStatus = res.status;
            return res.json();
        })
        .then(async (diary) => {
            if (resStatus === 200) {
                return getAllDiaryEntries(diary);
            } else if (resStatus === 400) {
                throw new Error(400);
            } else if (resStatus === 404) {
                return authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/?date=${currentDate}`, {
                    method: "POST",
                })
                    .then((res) => {
                        resStatus = res.status;
                        return res.json();
                    })
                    .then(async (diary) => {
                        if (resStatus === 201) {
                            return getAllDiaryEntries(diary);
                        } else {
                            throw new Error(resStatus);
                        }
                    });
            }
        })
        .then((processedDiary) => {
            setCurrentDiary(processedDiary);
        })
        .catch((error) => {
            console.log(error, resStatus);
        });
}

function pad(number) {
    if (String(number).length < 2) {
        return "0" + number;
    } else {
        return number;
    }
}
