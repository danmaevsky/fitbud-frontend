import magnifyingGlass from "assets/magnifying-glass.svg";
import barcodeScannerIcon from "assets/barcode-scan-icon.svg";
import clearTextX from "assets/clear-text-x.svg";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import useSessionStorage from "hooks/useSessionStorage";
import { useRef } from "react";

export default function DashboardPage() {
    return (
        <div id="dashboard-page-body">
            <div id="dashboard-page-round-background-decoration"></div>
            <div id="dashboard-page-bottom-top-banner-background-decoration"></div>
            <div id="dashboard-page-bottom-bot-banner-background-decoration"></div>
            <div id="dashboard-page-content">
                <div id="dashboard-daily-summary-island">
                    <h3>Your Daily Summary</h3>
                </div>
                <FoodSearchbox />
            </div>
        </div>
    );
}

function FoodSearchbox() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useSessionStorage("FoodSearchPageText", "");
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
