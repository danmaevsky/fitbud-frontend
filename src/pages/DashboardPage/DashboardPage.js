import magnifyingGlass from "assets/magnifying-glass.svg";
import barcodeScannerIcon from "assets/barcode-scan-icon.svg";
import clearTextX from "assets/clear-text-x.svg";
import foodSearchPlacehoder from "assets/food-search-placeholder.svg";
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";
import useSessionStorage from "hooks/useSessionStorage";
import { useEffect, useRef, useState } from "react";
import useLocalStorage from "hooks/useLocalStorage";
import useWindowDimensions from "hooks/useWindowDimensions";
import authFetch from "helpers/auth/authFetch";
import getAllDiaryEntries from "helpers/fitness/getAllDiaryEntries";
import CalculateGoal from "helpers/fitness/CalculateGoal";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [currentDiary, setCurrentDiary] = useLocalStorage("CurrentDiary", null);
    const [profile, setProfile] = useLocalStorage("profile", null);

    useEffect(() => {
        const dateObj = new Date();
        const currentDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
        // if (!currentDiary) {
        //     fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
        // } else if (currentDiary && currentDiary.timestamp.split("T")[0] !== currentDate) {
        //     fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
        // }
        fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
    }, []);
    return (
        <div id="dashboard-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="dashboard-page-content">
                <DailySummary currentDiary={currentDiary} profile={profile} />
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

function DailySummary(props) {
    const { currentDiary, profile } = props;

    // Load the blank page here
    if (!profile && !currentDiary) {
        return (
            <div id="dashboard-daily-summary-island">
                <h3>Your Daily Summary</h3>
                <p>Loading Profile...</p>
            </div>
        );
    }

    let calorieGoal = CalculateGoal(profile);
    let fatGoal = profile.goals.macroBreakdown.fat;
    let carbGoal = profile.goals.macroBreakdown.carbs;
    let proteinGoal = profile.goals.macroBreakdown.protein;
    // No Diary Found, display Default
    if (!currentDiary) {
        return (
            <div id="dashboard-daily-summary-island">
                <h2 id="dashboard-daily-summary-header">Your Daily Summary</h2>
                <div id="dashboard-daily-summary-calculation">
                    <div id="dashboard-daily-summary-goal">
                        <label>Goal</label>
                        <h4> {calorieGoal}</h4>
                    </div>
                    <label>-</label>
                    <div id="dashboard-daily-summary-food">
                        <label>Food</label>
                        <h4>0</h4>
                    </div>
                    <label>+</label>
                    <div id="dashboard-daily-summary-exercise">
                        <label>Exercise</label>
                        <h4>0</h4>
                    </div>
                    <label>=</label>
                    <div id="dashboard-daily-summary-exercise">
                        <label>Remaining</label>
                        <h4>{calorieGoal}</h4>
                    </div>
                </div>
                <div id="dashboard-daily-summary-charts">
                    <GoalCircle calorieGoal={calorieGoal} kcal={0} totalFat={0} totalCarb={0} protein={0} />
                    <div id="dashboard-daily-summary-pie-charts">
                        <div id="dashboard-daily-summary-fat">
                            <label>Fat Goal:</label>
                            <MacroCircle calorieGoal={calorieGoal} kcal={0} macroType="Fat" totalMacro={0} macroGoal={fatGoal} />
                        </div>
                        <div id="dashboard-daily-summary-carbs">
                            <label>Carb Goal:</label>
                            <MacroCircle calorieGoal={calorieGoal} kcal={0} macroType="Carbs" totalMacro={0} macroGoal={carbGoal} />
                        </div>
                        <div id="dashboard-daily-summary-protein">
                            <label>Protein Goal:</label>
                            <MacroCircle calorieGoal={calorieGoal} kcal={0} macroType="Protein" totalMacro={0} macroGoal={proteinGoal} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div id="dashboard-daily-summary-island">
            <h3 id="dashboard-daily-summary-header">Your Daily Summary</h3>
            <div id="dashboard-daily-summary-goal">
                <label>Goal:</label>
                <h4> {CalculateGoal(profile)}</h4>
            </div>
        </div>
    );
}

function fetchDiaryHelper(currentDate, setCurrentDiary, navigate) {
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
                return getAllDiaryEntries(diary, navigate);
            } else if (resStatus === 400) {
                throw new Error(400);
            } else if (resStatus === 404) {
                throw new Error(404);
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

function GoalCircle(props) {
    const { calorieGoal, kcal, totalFat, totalCarb, protein } = props;
    const kcalComputed = 9 * totalFat + 4 * totalCarb + 4 * protein;
    const windowDims = useWindowDimensions();
    const canvas = useRef(null);

    // const macroCirclePrimaryFat = "#fa2800";
    // const macroCirclePrimaryCarb = "#2d65cd";
    // const macroCirclePrimaryProtein = "#5a0094";

    // const macroCirclePrimaryFat = "#ff6500";
    // const macroCirclePrimaryCarb = "#9aff00";
    // const macroCirclePrimaryProtein = "#5a0094";

    const macroCirclePrimaryFat = "#ffc300";
    const macroCirclePrimaryCarb = "#2bb6ff";
    const macroCirclePrimaryProtein = "#e5007a";
    const defaultPrimaryBlue = "#284687";

    const macroCirclePrimaryGray = "#999999";
    const macroCircleSecondaryGray = "#ddd";

    /* 
    Responsiveness
        Some responsiveness needs to be done here because its HTML Canvas. Not ideal but oh well
    */
    // @media basically
    let elemWidth;
    if (windowDims.width <= 800) {
        elemWidth = Math.max(windowDims.width / 6, windowDims.height / 4);
        elemWidth = Math.min(150, elemWidth);
    } else if (windowDims.height <= 750) {
        elemWidth = windowDims.height / 5;
    } else {
        elemWidth = Math.max(windowDims.width / 5, windowDims.height / 4);
        elemWidth = Math.min(200, elemWidth);
    }
    let elemHeight = elemWidth;

    useEffect(() => {
        let curr = canvas.current;
        if (curr) {
            let pixelRatio = window.devicePixelRatio;

            let totalAngle = Math.min(Math.PI * 2, (Math.PI * 2 * kcal) / calorieGoal);
            let angleGap = Math.PI / 10;
            angleGap = 0;
            let angleOffset = -Math.PI / 2 + angleGap / 2;
            let numMacros = (totalFat > 0) * 1 + (totalCarb > 0) * 1 + (protein > 0) * 1;
            let availableAngle = totalAngle - numMacros * angleGap;
            availableAngle = 0; // effectively turns off the other colors
            let fatAngle = ((9 * totalFat) / kcalComputed) * availableAngle;
            let carbAngle = ((4 * totalCarb) / kcalComputed) * availableAngle;
            let proteinAngle = ((4 * protein) / kcalComputed) * availableAngle;

            /* Draw the macro circle */
            curr.height = pixelRatio * elemHeight;
            curr.width = pixelRatio * elemWidth;
            let ctx = curr.getContext("2d");
            ctx.clearRect(0, 0, curr.width, curr.height);
            ctx.lineWidth = curr.width / 9;
            ctx.lineCap = "round";

            // Always draw gray circle
            ctx.beginPath();
            ctx.strokeStyle = macroCircleSecondaryGray;
            ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.lineWidth = curr.width / 12;

            if (availableAngle > 0) {
                // totalFat
                if (fatAngle > 0) {
                    let startAngle = angleOffset;
                    let endAngle = startAngle + fatAngle + (carbAngle > 0 || proteinAngle > 0 ? 0 : angleGap);
                    ctx.beginPath();
                    ctx.strokeStyle = macroCirclePrimaryFat;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                    ctx.stroke();
                }

                // totalCarb
                if (carbAngle > 0) {
                    let startAngle = angleOffset + (fatAngle > 0 ? fatAngle + angleGap : 0);
                    let endAngle = startAngle + carbAngle + (proteinAngle > 0 || fatAngle > 0 ? 0 : angleGap);
                    ctx.beginPath();
                    ctx.strokeStyle = macroCirclePrimaryCarb;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                    ctx.stroke();
                }

                // protein
                if (proteinAngle > 0) {
                    let startAngle = angleOffset + (fatAngle > 0 ? fatAngle + angleGap : 0) + (carbAngle > 0 ? carbAngle + angleGap : 0);
                    let endAngle = startAngle + proteinAngle + (carbAngle > 0 || fatAngle > 0 ? 0 : angleGap);
                    ctx.beginPath();
                    ctx.strokeStyle = macroCirclePrimaryProtein;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                    ctx.stroke();
                }

                if (kcalComputed <= 0) {
                    let startAngle = angleOffset;
                    let endAngle = totalAngle + angleOffset;
                    endAngle = endAngle < angleOffset ? angleOffset + Math.PI / 1000 : endAngle;
                    console.log(startAngle);
                    console.log(endAngle);
                    ctx.beginPath();
                    ctx.strokeStyle = defaultPrimaryBlue;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                    ctx.stroke();
                }
            } else {
                if (kcal > 0) {
                    let startAngle = angleOffset;
                    let endAngle = totalAngle + angleOffset;
                    console.log(startAngle);
                    console.log(endAngle);
                    ctx.beginPath();
                    ctx.strokeStyle = defaultPrimaryBlue;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                    ctx.stroke();
                }
            }
        } else {
            // console.log("Curr undefined!");
        }
    }, [windowDims, kcalComputed, protein, totalCarb, totalFat, elemHeight, elemWidth]);
    return (
        <div id="goal-circle" style={{ width: elemWidth, height: elemHeight }}>
            <canvas ref={canvas} style={{ width: elemWidth, height: elemHeight }}></canvas>
            <div>
                <h4>{calorieGoal - kcal}</h4>
                <h5>Remaining</h5>
            </div>
        </div>
    );
}

function MacroPieChart(props) {
    const { goal, kcal, totalFat, totalCarb, protein, showMacro } = props;
    const kcalComputed = 9 * totalFat + 4 * totalCarb + 4 * protein;
    const windowDims = useWindowDimensions();
    const canvas = useRef(null);

    // const macroCirclePrimaryFat = "#fa2800";
    // const macroCirclePrimaryCarb = "#2d65cd";
    // const macroCirclePrimaryProtein = "#5a0094";

    // const macroCirclePrimaryFat = "#ff6500";
    // const macroCirclePrimaryCarb = "#9aff00";
    // const macroCirclePrimaryProtein = "#5a0094";

    const macroCirclePrimaryFat = "#ffc300";
    const macroCirclePrimaryCarb = "#2bb6ff";
    const macroCirclePrimaryProtein = "#e5007a";
    const defaultPrimaryBlue = "#1956ff";

    const macroCirclePrimaryGray = "#999999";
    const macroCircleSecondaryGray = "#eee";

    /* 
    Responsiveness
        Some responsiveness needs to be done here because its HTML Canvas. Not ideal but oh well
    */
    // @media basically
    let elemWidth = Math.max(windowDims.width / 12, windowDims.height / 12);
    elemWidth = Math.min(75, elemWidth);
    let elemHeight = elemWidth;

    useEffect(() => {
        let curr = canvas.current;
        if (curr) {
            let pixelRatio = window.devicePixelRatio;
            let angleGap = 0;
            // let angleGap = 0;
            let angleOffset = -Math.PI / 2 + angleGap / 2;
            let numMacros = (totalFat > 0) * 1 + (totalCarb > 0) * 1 + (protein > 0) * 1;
            let availableAngle = 2 * Math.PI - numMacros * angleGap;
            let fatAngle = ((9 * totalFat) / kcalComputed) * availableAngle;
            let carbAngle = ((4 * totalCarb) / kcalComputed) * availableAngle;
            let proteinAngle = ((4 * protein) / kcalComputed) * availableAngle;

            /* Draw the macro circle */
            curr.height = pixelRatio * elemHeight;
            curr.width = pixelRatio * elemWidth;
            let ctx = curr.getContext("2d");
            ctx.clearRect(0, 0, curr.width, curr.height);
            ctx.lineWidth = curr.width / 9;
            ctx.lineCap = "round";

            // Always draw gray circle
            ctx.fillStyle = macroCircleSecondaryGray;
            ctx.beginPath();
            ctx.moveTo(curr.width / 2, curr.height / 2);
            ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, 0, 2 * Math.PI);
            ctx.lineTo(curr.width / 2, curr.height / 2);
            ctx.closePath();
            ctx.fill();

            ctx.lineWidth = curr.width / 12;

            if (availableAngle > 0) {
                // totalFat
                if (showMacro === "fat" && fatAngle > 0) {
                    let startAngle = angleOffset;
                    let endAngle = startAngle + fatAngle;
                    ctx.beginPath();
                    ctx.fillStyle = macroCirclePrimaryFat;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 1.8) / 5, startAngle, endAngle);
                    ctx.lineTo(curr.width / 2, curr.height / 2);
                    ctx.fill();
                }

                // totalCarb
                if (showMacro === "carb" && carbAngle > 0) {
                    let startAngle = angleOffset;
                    let endAngle = startAngle + carbAngle;
                    ctx.beginPath();
                    ctx.fillStyle = macroCirclePrimaryCarb;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 1.8) / 5, startAngle, endAngle);
                    ctx.lineTo(curr.width / 2, curr.height / 2);
                    ctx.fill();
                }

                // protein
                if (showMacro === "protein" && proteinAngle > 0) {
                    let startAngle = angleOffset;
                    let endAngle = startAngle + proteinAngle;
                    ctx.beginPath();
                    ctx.fillStyle = macroCirclePrimaryProtein;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 1.8) / 5, startAngle, endAngle);
                    ctx.lineTo(curr.width / 2, curr.height / 2);
                    ctx.fill();
                }
            } else {
                if (kcal > 0) {
                    let startAngle = angleOffset;
                    let endAngle = 2 * Math.PI + angleOffset;
                    endAngle = endAngle < angleOffset ? angleOffset + Math.PI / 1000 : endAngle;
                    console.log(startAngle);
                    console.log(endAngle);
                    ctx.beginPath();
                    ctx.strokeStyle = defaultPrimaryBlue;
                    ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                    ctx.stroke();
                }
            }
        } else {
            // console.log("Curr undefined!");
        }
    }, [windowDims, kcalComputed, protein, totalCarb, totalFat, elemHeight, elemWidth]);
    return (
        <div id="goal-circle" style={{ width: elemWidth, height: elemHeight }}>
            <canvas ref={canvas} style={{ width: elemWidth, height: elemHeight }}></canvas>
        </div>
    );
}

function MacroCircle(props) {
    const { calorieGoal, kcal, macroType, totalMacro, macroGoal } = props;
    const windowDims = useWindowDimensions();
    const canvas = useRef(null);

    // const macroCirclePrimaryFat = "#fa2800";
    // const macroCirclePrimaryCarb = "#2d65cd";
    // const macroCirclePrimaryProtein = "#5a0094";

    // const macroCirclePrimaryFat = "#ff6500";
    // const macroCirclePrimaryCarb = "#9aff00";
    // const macroCirclePrimaryProtein = "#5a0094";

    const macroCirclePrimaryFat = "#ffc300";
    const macroCirclePrimaryCarb = "#2bb6ff";
    const macroCirclePrimaryProtein = "#e5007a";
    const defaultPrimaryBlue = "#284687";

    const macroCirclePrimaryGray = "#999999";
    const macroCircleSecondaryGray = "#ddd";

    let atwaterFactor = macroType === "Fat" ? 9 : 4;
    let macroGoalTotal = (calorieGoal * macroGoal) / atwaterFactor;

    let colorToUse;
    if (macroType === "Fat") colorToUse = macroCirclePrimaryFat;
    else if (macroType === "Carbs") colorToUse = macroCirclePrimaryCarb;
    else if (macroType === "Protein") colorToUse = macroCirclePrimaryProtein;

    /* 
    Responsiveness
        Some responsiveness needs to be done here because its HTML Canvas. Not ideal but oh well
    */
    // @media basically
    let elemWidth;
    if (windowDims.width <= 400) {
        elemWidth = Math.max(windowDims.width / 4, 0);
        elemWidth = Math.min(80, elemWidth);
    } else if (windowDims.width <= 800) {
        elemWidth = Math.max(windowDims.width / 10, windowDims.height / 7);
        elemWidth = Math.min(85, elemWidth);
    } else if (windowDims.height <= 750) {
        elemWidth = windowDims.height / 8;
    } else {
        elemWidth = Math.max(windowDims.width / 10, windowDims.height / 10);
        elemWidth = Math.min(100, elemWidth);
    }

    let elemHeight = elemWidth;

    useEffect(() => {
        let curr = canvas.current;
        if (curr) {
            let pixelRatio = window.devicePixelRatio;

            let angleOffset = -Math.PI / 2;
            let availableAngle = 2 * Math.PI;
            let macroAngle = (totalMacro / macroGoalTotal) * availableAngle;

            /* Draw the macro circle */
            curr.height = pixelRatio * elemHeight;
            curr.width = pixelRatio * elemWidth;
            let ctx = curr.getContext("2d");
            ctx.clearRect(0, 0, curr.width, curr.height);
            ctx.lineWidth = curr.width / 9;
            ctx.lineCap = "round";

            // Always draw gray circle
            ctx.beginPath();
            ctx.strokeStyle = macroCircleSecondaryGray;
            ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.lineWidth = curr.width / 12;

            // totalFat
            if (macroAngle > 0) {
                let startAngle = angleOffset;
                let endAngle = startAngle + macroAngle;
                ctx.beginPath();
                ctx.strokeStyle = colorToUse;
                ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, startAngle, endAngle);
                ctx.stroke();
            }
        } else {
            // console.log("Curr undefined!");
        }
    }, [windowDims, elemHeight, elemWidth]);

    return (
        <div className="dashboard-macro-circle" style={{ width: elemWidth, height: elemHeight }}>
            <canvas ref={canvas} style={{ width: elemWidth, height: elemHeight }}></canvas>
            <div className="dashboard-macro-circle-inner-text">
                <h4>{totalMacro.toFixed(0)}g</h4>
                <p> out of {macroGoalTotal.toFixed(0)}g</p>
            </div>
        </div>
    );
}
