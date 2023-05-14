import "./RecipePage.css";
import backArrow from "assets/back-arrow.svg";
import showMoreDownArrow from "assets/show-more-down-arrow.svg";
import addFoodPlus from "assets/add-food-plus.svg";
import DropdownMenu from "components/DropdownMenu";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import useWindowDimensions from "hooks/useWindowDimensions";
import {
    GetBuiltInUnits,
    ProcessFoodName,
    ProcessNutritionalContents,
    ProcessRecipeNutritionalContents,
    ProcessUnit,
    ToTitleCase,
} from "helpers/fitnessHelpers";
import { IsUserDiaryReady, IsUserLogged, authFetch } from "helpers/authHelpers";
import useSessionStorage from "hooks/useSessionStorage";
import { getCurrentDate } from "helpers/generalHelpers";

export default function RecipePage() {
    const { recipeId } = useParams();
    const location = useLocation();

    const [recipeResponse, setRecipeResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(200);
    const [numServings, setNumServings] = useState(1);
    const [mealPosition, setMealPosition] = useState("meal1");
    const [diaryDate, setDiaryDate] = useState(getCurrentDate());

    const userIsLoggedIn = IsUserLogged();

    // fetching food object
    useEffect(() => {
        let resStatus;
        authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/${recipeId}`, {
            method: "GET",
        })
            .then((res) => {
                resStatus = res.status;
                return res.json();
            })
            .then((json) => {
                setResponseStatus(resStatus);
                setRecipeResponse(json);
            });
    }, [recipeId]);

    // seeing if user came from the diary page
    useEffect(() => {
        if (location.state) {
            if (location.state.mealPosition && location.state.date) {
                setMealPosition(location.state.mealPosition);
                setDiaryDate(location.state.date);
            }
        }
    }, []);

    let renderRecipeInfo = responseStatus === 200; // check if response code is good
    renderRecipeInfo = renderRecipeInfo && recipeResponse && recipeId === recipeResponse._id; // check if there is a response, and if URL param matches the response (prevents re-render with stale information, sometimes fatal)

    return (
        <div id="food-page-body">
            <div className="food-background-round round-background-decoration"></div>
            <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="food-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} alt="back arrow" />
                    Go Back
                </Link>
                {renderRecipeInfo ? (
                    <RecipeInfo
                        recipeResponse={recipeResponse}
                        numServings={numServings}
                        setNumServings={setNumServings}
                        mealPosition={mealPosition}
                        setMealPosition={setMealPosition}
                    />
                ) : null}
                {!recipeResponse ? "Loading..." : null}
                {responseStatus !== 200 ? "404. No foods matching this ID!" : null}
                {userIsLoggedIn && renderRecipeInfo ? (
                    <AddFoodLogButton recipeId={recipeId} numServings={numServings} mealPosition={mealPosition} diaryDate={diaryDate} />
                ) : null}
            </div>
        </div>
    );
}

function RecipeInfo(props) {
    const { recipeResponse, numServings, setNumServings, mealPosition, setMealPosition } = props;
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    // const defaultMetricQuantity = foodResponse.servingQuantity ? Math.round(foodResponse.servingQuantity / 0.01) * 0.01 : 100;
    // const defaultMetricUnit = foodResponse.servingQuantityUnit ? foodResponse.servingQuantityUnit : "g";

    // useEffect(() => {
    //     setMetricQuantity(defaultMetricQuantity);
    // }, []);

    // let foodName = ProcessFoodName(foodResponse.name);
    // let brand = foodResponse.brandName ? ToTitleCase(foodResponse.brandName) : foodResponse.brandOwner ? ToTitleCase(foodResponse.brandOwner) : null;
    // let nutrients = ProcessNutritionalContents(foodResponse.nutritionalContent, metricQuantity, numServings, defaultUnitRounding);

    let recipeName = recipeResponse.name;
    let recipeDate = ConvertTimestampToDate(recipeResponse.timestamp);
    let nutrients = ProcessRecipeNutritionalContents(recipeResponse, numServings);

    return (
        <div id="food-info">
            <h3>{recipeName}</h3>
            <p>{recipeDate}</p>
            <div id="food-info-overview">
                <MacroCircle kcal={nutrients.kcal} totalFat={nutrients.totalFat} totalCarb={nutrients.totalCarb} protein={nutrients.protein} />
                <div id="food-info-macros">
                    <h5 id="food-info-macro-fat">
                        Fat:
                        <br />
                        {nutrients.totalFat} g
                    </h5>
                    <h5 id="food-info-macro-carb">
                        Carbs:
                        <br />
                        {nutrients.totalCarb} g
                    </h5>
                    <h5 id="food-info-macro-protein">
                        Protein:
                        <br />
                        {nutrients.protein} g
                    </h5>
                </div>
            </div>
            <SelectServingSize setNumServings={setNumServings} mealPosition={mealPosition} setMealPosition={setMealPosition} />
            {showMoreInfo ? (
                <>
                    <FoodMoreInfo processedNutrients={nutrients} />
                    <div id="food-info-show-less">
                        <button onClick={() => setShowMoreInfo(false)}>
                            <img id="food-info-show-less-arrow" src={showMoreDownArrow} alt="show less nutritional information icon" />
                        </button>
                    </div>
                </>
            ) : (
                <div id="food-info-show-more" onClick={() => setShowMoreInfo(true)}>
                    <h5>Show More Nutritional Information</h5>
                    <button>
                        <img id="food-info-show-more-arrow" src={showMoreDownArrow} alt="show more nutritional information icon" />
                    </button>
                </div>
            )}
        </div>
    );
}

function FoodMoreInfo(props) {
    const { processedNutrients } = props;

    return (
        <ul id="food-page-more-info">
            <h5>Nutritional Content</h5>
            <li>
                <p>Calories:</p>
                <p>{processedNutrients.kcal ? processedNutrients.kcal : "-"}</p>
            </li>
            <li>
                <p>Total Fat:</p>
                <p>{processedNutrients.totalFat ? processedNutrients.totalFat + "g" : "-"}</p>
            </li>
            <li>
                <ul>
                    <li>
                        <p>Saturated Fat:</p>
                        <p>{processedNutrients.saturatedFat ? processedNutrients.saturatedFat + "g" : "-"}</p>
                    </li>
                    <li>
                        <p>Trans Fat:</p>
                        <p>{processedNutrients.transFat ? processedNutrients.transFat + "g" : "-"}</p>
                    </li>
                    <li>
                        <p>Polyunsaturated Fat:</p>
                        <p>{processedNutrients.polyunsaturatedFat ? processedNutrients.polyunsaturatedFat + "g" : "-"}</p>
                    </li>
                    <li>
                        <p>Monounsaturated Fat:</p>
                        <p>{processedNutrients.monounsaturatedFat ? processedNutrients.monounsaturatedFat + "g" : "-"}</p>
                    </li>
                </ul>
            </li>
            <li>
                <p>Cholesterol:</p>
                <p>{processedNutrients.cholesterol ? processedNutrients.cholesterol + "mg" : "-"}</p>
            </li>
            <li>
                <p>Sodium:</p>
                <p>{processedNutrients.sodium ? processedNutrients.sodium + "mg" : "-"}</p>
            </li>
            <li>
                <p>Total Carbohydrates:</p>
                <p>{processedNutrients.totalCarb ? processedNutrients.totalCarb + "g" : "-"}</p>
            </li>
            <li>
                <ul>
                    <li>
                        <p>Dietary Fiber:</p>
                        <p>{processedNutrients.dietaryFiber ? processedNutrients.dietaryFiber + "g" : "-"}</p>
                    </li>
                    <li>
                        <p>Total Sugars:</p>
                        <p>{processedNutrients.totalSugar ? processedNutrients.totalSugar + "g" : "-"}</p>
                    </li>
                    <li>
                        <p>Added Sugars:</p>
                        <p>{processedNutrients.addedSugar ? processedNutrients.addedSugar + "g" : "-"}</p>
                    </li>
                    <li>
                        <p>Sugar Alcohols:</p>
                        <p>{processedNutrients.sugarAlcohols ? processedNutrients.sugarAlcohols + "g" : "-"}</p>
                    </li>
                </ul>
            </li>
            <li>
                <p>Protein:</p>
                <p>{processedNutrients.protein ? processedNutrients.protein + "g" : "-"}</p>
            </li>
            <li>
                <p>Vitamin D:</p>
                <p>{processedNutrients.vitaminD ? processedNutrients.vitaminD + "mcg" : "-"}</p>
            </li>
            <li>
                <p>Calcium:</p>
                <p>{processedNutrients.calcium ? processedNutrients.calcium + "mg" : "-"}</p>
            </li>
            <li>
                <p>Iron:</p>
                <p>{processedNutrients.iron ? processedNutrients.iron + "mg" : "-"}</p>
            </li>
            <li>
                <p>Potassium:</p>
                <p>{processedNutrients.potassium ? processedNutrients.potassium + "mg" : "-"}</p>
            </li>
            <li>
                <ul>
                    <li>
                        <p>Vitamin A:</p>
                        <p>{processedNutrients.vitaminA ? processedNutrients.vitaminA + "mcg" : "-"}</p>
                    </li>
                    <li>
                        <p>Vitamin C:</p>
                        <p>{processedNutrients.vitaminC ? processedNutrients.vitaminC + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Vitamin E:</p>
                        <p>{processedNutrients.vitaminE ? processedNutrients.vitaminE + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Thiamin:</p>
                        <p>{processedNutrients.thiamin ? processedNutrients.thiamin + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Riboflavin:</p>
                        <p>{processedNutrients.riboflavin ? processedNutrients.riboflavin + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Niacin:</p>
                        <p>{processedNutrients.niacin ? processedNutrients.niacin + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Vitamin B6:</p>
                        <p>{processedNutrients.vitaminB6 ? processedNutrients.vitaminB6 + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Folate:</p>
                        <p>{processedNutrients.folate ? processedNutrients.folate + "mcg" : "-"}</p>
                    </li>
                    <li>
                        <p>Vitamin B12:</p>
                        <p>{processedNutrients.vitaminB12 ? processedNutrients.vitaminB12 + "mcg" : "-"}</p>
                    </li>
                    <li>
                        <p>Biotin:</p>
                        <p>{processedNutrients.biotin ? processedNutrients.biotin + "mcg" : "-"}</p>
                    </li>
                    <li>
                        <p>Pantothenic Acid:</p>
                        <p>{processedNutrients.pantothenicAcid ? processedNutrients.pantothenicAcid + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Phosphorus:</p>
                        <p>{processedNutrients.phosphorus ? processedNutrients.phosphorus + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Iodine:</p>
                        <p>{processedNutrients.iodine ? processedNutrients.iodine + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Magnesium:</p>
                        <p>{processedNutrients.magnesium ? processedNutrients.magnesium + "mg" : "-"}</p>
                    </li>
                    <li>
                        <p>Selenium:</p>
                        <p>{processedNutrients.selenium ? processedNutrients.selenium + "mcg" : "-"}</p>
                    </li>
                </ul>
            </li>
        </ul>
    );
}

function AddFoodLogButton(props) {
    const { recipeId, numServings, mealPosition, diaryDate } = props;
    const navigate = useNavigate();

    const currentDate = getCurrentDate();
    const userIsLoaded = IsUserDiaryReady();

    let diary = null;
    if (userIsLoaded) diary = currentDate === diaryDate ? JSON.parse(window.localStorage.CurrentDiary) : JSON.parse(window.localStorage.PrevDiary);

    const addFoodOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "recipe",
                action: "addLog",
                contents: {
                    mealPosition: mealPosition,
                    recipeId: recipeId,
                    numServings: numServings,
                },
            };

            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/${diaryId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(patchBody),
            })
                .then((res) => {
                    if (res.status === 200) {
                        if (diaryDate === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + diaryDate);
                        }
                    } else {
                        throw Error(res.status);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            let postBody = {
                type: "recipe",
                action: "addLog",
                contents: {
                    mealPosition: mealPosition,
                    recipeId: recipeId,
                    numServings: numServings,
                },
            };
            console.log(postBody);

            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/diary/?date=${diaryDate}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postBody),
            })
                .then((res) => {
                    if (res.status === 201) {
                        if (diaryDate === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + diaryDate);
                        }
                    } else {
                        throw Error(res.status);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    };

    return (
        <div id="food-page-add-food-log" onClick={addFoodOnClick}>
            <button>
                <img src={addFoodPlus} />
            </button>
            <label>Add to Diary</label>
        </div>
    );
}

function SelectServingSize(props) {
    // needs to understand if food is measured in grams or milliliters by default
    // needs to preserve the default unit from the database
    // needs to create a range of appropriate units
    const { setNumServings, mealPosition, setMealPosition } = props;

    const [numText, setNumText] = useState(1);

    const inputOnChange = (e) => {
        let n = Number(e.target.value);
        setNumText(e.target.value);
        if (n >= 0 && n <= 10000) {
            setNumServings(n);
        }
    };

    const inputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n < 0) {
            setNumText(0);
            setNumServings(0);
            return;
        } else if (n > 10000) {
            setNumText(10000);
            setNumServings(10000);
            return;
        }
    };

    let mealNames;
    let mealOptions;
    const userIsLoggedIn = IsUserLogged();

    if (userIsLoggedIn) {
        mealNames = JSON.parse(window.localStorage.profile).preferences.mealNames;
        mealNames = {
            meal1: mealNames[0],
            meal2: mealNames[1],
            meal3: mealNames[2],
            meal4: mealNames[3],
            meal5: mealNames[4],
            meal6: mealNames[5],
        };
        mealOptions = Object.values(mealNames)
            .slice()
            .filter((name) => Boolean(name));
    }

    const onMealSelect = (selection) => {
        let i = Object.values(mealNames).indexOf(selection);

        if (i < 0) {
            return;
        }

        let mealPosition = "meal" + (i + 1);
        setMealPosition(mealPosition);
    };

    return (
        <div id="food-page-serving-selector">
            <div id="food-page-num-serving-selector">
                <p>Number of Servings:</p>
                <input
                    type="number"
                    inputMode="decimal"
                    value={numText}
                    onClick={(e) => e.target.select()}
                    onChange={inputOnChange}
                    onBlur={inputOnBlur}
                />
            </div>
            {userIsLoggedIn ? (
                <div id="food-page-meal-position-selector">
                    <p>Meal:</p>
                    <DropdownMenu
                        options={mealOptions}
                        listItemClass="meal-name-dropdown-item"
                        onSelect={onMealSelect}
                        initialSelection={mealNames[mealPosition]}
                    />
                </div>
            ) : null}
        </div>
    );
}

function MacroCircle(props) {
    const { kcal, totalFat, totalCarb, protein } = props;
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

    const macroCirclePrimaryGray = "#999999";

    /* 
    Responsiveness
        Some responsiveness needs to be done here because its HTML Canvas. Not ideal but oh well
    */
    // @media basically
    let elemWidth = Math.max(windowDims.width / 5, windowDims.height / 5);
    elemWidth = Math.min(125, elemWidth);
    let elemHeight = elemWidth;

    useEffect(() => {
        let curr = canvas.current;
        if (curr) {
            let pixelRatio = window.devicePixelRatio;
            let angleGap = Math.PI / 10;
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
            ctx.lineWidth = curr.width / 12;
            ctx.lineCap = "round";

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

            // if there are no macros
            if (kcalComputed <= 0) {
                ctx.beginPath();
                ctx.strokeStyle = macroCirclePrimaryGray;
                ctx.arc(curr.width / 2, curr.height / 2, (curr.width * 2) / 5, 0, 2 * Math.PI);
                ctx.stroke();
            }
        } else {
            // console.log("Curr undefined!");
        }
    }, [windowDims, kcalComputed, protein, totalCarb, totalFat, elemHeight, elemWidth]);
    return (
        <div id="macro-circle" style={{ width: elemWidth, height: elemHeight }}>
            <canvas ref={canvas} style={{ width: elemWidth, height: elemHeight }}></canvas>
            <div>
                <h4>{kcal}</h4>
                <h4>Cal</h4>
            </div>
        </div>
    );
}

function ConvertTimestampToDate(timestamp) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateObj = new Date(timestamp);
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}
