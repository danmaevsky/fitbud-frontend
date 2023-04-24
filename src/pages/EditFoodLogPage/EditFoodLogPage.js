import "./EditFoodLogPage.css";
import backArrow from "assets/back-arrow.svg";
import showMoreDownArrow from "assets/show-more-down-arrow.svg";
import DropdownMenu from "components/DropdownMenu";
import { Link, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useSessionStorage from "hooks/useSessionStorage";
import useLocalStorage from "hooks/useLocalStorage";
import useWindowDimensions from "hooks/useWindowDimensions";
import { ToTitleCase, ProcessNutritionalContents, ProcessFoodName, ProcessUnit, GetBuiltInUnits } from "helpers/fitnessHelpers";
import { getCurrentDate } from "helpers/generalHelpers";
import { authFetch } from "helpers/authHelpers";
import SaveLogButtonIcon from "components/SaveLogButtonIcon";
import DeleteLogButtonIcon from "components/DeleteLogButtonIcon";

export default function EditFoodLogPage() {
    // Basically the FoodPage but with blue background and reads from localStorage instead of GET request
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const currentDate = getCurrentDate();

    console.log(searchParams);
    let mealPosition, logPosition, date, foodLog, foodResponse, diary;
    let initialNumServings = 1;
    let initialServingName = "";
    let initialMetricQuantity = 100;

    if (location.state) {
        mealPosition = location.state.mealPosition;
        logPosition = location.state.logPosition;
        date = location.state.date;
        diary = date === currentDate ? JSON.parse(window.localStorage.CurrentDiary) : JSON.parse(window.localStorage.PrevDiary);
        foodLog = diary[mealPosition].foodLogs[logPosition];
        foodResponse = foodLog.foodObject;

        // set initial values
        initialNumServings = foodLog.numServings;
        initialServingName = foodLog.servingName;
        initialMetricQuantity = foodLog.quantityMetric;
    }

    console.log("initialNumServing", initialNumServings);

    const [numServings, setNumServings] = useState(initialNumServings);
    const [servingName, setServingName] = useState(initialServingName);
    const [metricQuantity, setMetricQuantity] = useState(initialMetricQuantity);

    console.log(servingName);

    useEffect(() => {
        if (!location.state) {
            navigate(-1, { state: null });
        } else {
            setNumServings(initialNumServings);
            setServingName(initialServingName);
            setMetricQuantity(initialMetricQuantity);
        }
    }, []);

    if (!location.state) {
        return (
            <div id="food-page-body">
                <div className="default-background-round round-background-decoration"></div>
                <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
                <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
                <div id="food-island"></div>
            </div>
        );
    }

    return (
        <div id="food-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="food-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} alt="back arrow" />
                    Go Back
                </Link>

                <FoodInfo
                    foodResponse={foodResponse}
                    numServings={numServings}
                    setNumServings={setNumServings}
                    servingName={servingName}
                    setServingName={setServingName}
                    metricQuantity={metricQuantity}
                    setMetricQuantity={setMetricQuantity}
                />
                {!foodResponse ? "Loading..." : null}
                <div id="food-log-page-log-buttons">
                    <DeleteFoodLogButton mealPosition={mealPosition} logPosition={logPosition} date={date} diary={diary} />
                    <SaveFoodLogButton
                        mealPosition={mealPosition}
                        logPosition={logPosition}
                        date={date}
                        foodId={foodResponse._id}
                        servingName={servingName}
                        numServings={numServings}
                        quantityMetric={metricQuantity}
                        diary={diary}
                    />
                </div>
            </div>
        </div>
    );
}

function FoodInfo(props) {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const { foodResponse, numServings, setNumServings, servingName, setServingName, metricQuantity, setMetricQuantity } = props;

    const defaultMetricQuantity = foodResponse.servingQuantity ? Math.round(foodResponse.servingQuantity / 0.01) * 0.01 : 100;
    const defaultMetricUnit = foodResponse.servingQuantityUnit ? foodResponse.servingQuantityUnit : "g";

    useEffect(() => {
        setMetricQuantity(defaultMetricQuantity);
    }, []);

    const defaultUnitRounding = metricQuantity === Math.round(foodResponse.servingQuantity / 0.01) * 0.01;

    let foodName = ProcessFoodName(foodResponse.name);
    let brand = foodResponse.brandName ? ToTitleCase(foodResponse.brandName) : foodResponse.brandOwner ? ToTitleCase(foodResponse.brandOwner) : null;
    let nutrients = ProcessNutritionalContents(foodResponse.nutritionalContent, metricQuantity, numServings, defaultUnitRounding);

    return (
        <div id="food-info">
            <h3>{foodName}</h3>
            <p>{brand}</p>
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
            <SelectServingSize
                householdServingName={foodResponse.servingName}
                defaultServingQuantity={defaultMetricQuantity}
                defaultMetricUnit={defaultMetricUnit}
                setMetricQuantity={setMetricQuantity}
                numServings={numServings}
                setNumServings={setNumServings}
                servingName={servingName}
                setServingName={setServingName}
            />
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

function SaveFoodLogButton(props) {
    const { mealPosition, logPosition, date, foodId, servingName, numServings, quantityMetric, diary } = props;
    const navigate = useNavigate();

    const currentDate = getCurrentDate();
    console.log("save food log");

    const saveFoodOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "food",
                action: "updateLog",
                contents: {
                    mealPosition: mealPosition,
                    logPosition: logPosition,
                    foodId: foodId,
                    servingName: servingName,
                    numServings: numServings,
                    quantityMetric: quantityMetric,
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
                        if (date === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + date);
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
        <div id="food-log-page-save-log" className="food-log-page-log-button" onClick={saveFoodOnClick}>
            <button>
                <SaveLogButtonIcon />
            </button>
            <label>Save Changes</label>
        </div>
    );
}

function DeleteFoodLogButton(props) {
    const { mealPosition, logPosition, date, diary } = props;
    const navigate = useNavigate();
    const currentDate = getCurrentDate();

    const deleteFoodOnClick = () => {
        if (diary) {
            let diaryId = diary._id;
            let patchBody = {
                type: "food",
                action: "deleteLog",
                contents: {
                    mealPosition: mealPosition,
                    logPosition: logPosition,
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
                        if (date === currentDate) {
                            navigate("/diary");
                        } else {
                            navigate("/diary/?date=" + date);
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
        <div id="food-log-page-delete-log" className="food-log-page-log-button" onClick={deleteFoodOnClick}>
            <button>
                <DeleteLogButtonIcon />
            </button>
            <label>Delete Log</label>
        </div>
    );
}

function SelectServingSize(props) {
    // needs to understand if food is measured in grams or milliliters by default
    // needs to preserve the default unit from the database
    // needs to create a range of appropriate units
    const {
        householdServingName,
        defaultServingQuantity,
        defaultMetricUnit,
        setMetricQuantity,
        numServings,
        setNumServings,
        servingName,
        setServingName,
    } = props;

    const [numText, setNumText] = useState(numServings);

    let units = {};
    let defaultUnitName = `${defaultServingQuantity} ${ProcessUnit(defaultMetricUnit)}`;
    if (householdServingName) {
        defaultUnitName += ` (${ToTitleCase(householdServingName)})`;
    }
    units[defaultUnitName] = defaultServingQuantity;
    let builtInUnits = GetBuiltInUnits(defaultMetricUnit);

    units = {
        ...units,
        ...builtInUnits,
    };

    const inputOnChange = (e) => {
        let n = Number(e.target.value);
        setNumText(e.target.value);
        if (n > 0 && n < 10001) {
            setNumServings(n);
        }
    };

    const inputOnBlur = () => {
        if (numText < 0) {
            setNumText(0);
            setNumServings(1);
            return;
        } else if (numText > 10000) {
            setNumText(10000);
            setNumServings(10000);
            return;
        }
        setNumServings(numText);
        return;
    };

    const onUnitSelect = (selection) => {
        setMetricQuantity(units[selection]);
        setServingName(selection);
    };

    useEffect(() => {
        // determine initial unit
        let initialServingName = householdServingName ? householdServingName : ProcessUnit(defaultMetricUnit);
        setServingName(initialServingName);
    }, []);

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
            <div id="food-page-serving-size-selector">
                <p>Serving Size:</p>
                <DropdownMenu
                    options={Object.keys(units)}
                    listItemClass="food-serving-dropdown-item"
                    onSelect={onUnitSelect}
                    initialSelection={servingName}
                />
            </div>
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
