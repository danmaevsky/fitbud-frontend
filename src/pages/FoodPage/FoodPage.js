import "./FoodPage.css";
import backArrow from "assets/back-arrow.svg";
import DropdownMenu from "components/DropdownMenu";
import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import useWindowDimensions from "hooks/useWindowDimensions";

export default function FoodPage() {
    const { foodId } = useParams();
    const [foodResponse, setFoodResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(200);
    useEffect(() => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/${foodId}`, {
            method: "GET",
        })
            .then((res) => {
                setResponseStatus(res.status);
                return res.json();
            })
            .then((json) => setFoodResponse(json));
    }, []);
    return (
        <div id="food-page-body">
            <div id="food-page-round-background-decoration"></div>
            <div id="food-page-bottom-top-banner-background-decoration"></div>
            <div id="food-page-bottom-bot-banner-background-decoration"></div>
            <div id="food-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} />
                    Go Back
                </Link>
                {responseStatus === 200 && foodResponse ? <FoodInfo foodResponse={foodResponse} /> : "ERROR!!!"}
            </div>
        </div>
    );
}

function FoodInfo(props) {
    const { foodResponse } = props;

    const defaultMetricQuantity = foodResponse.servingQuantity ? foodResponse.servingQuantity : 100;
    const defaultMetricUnit = foodResponse.servingQuantityUnit ? foodResponse.servingQuantityUnit : "g";

    const [metricQuantity, setMetricQuantity] = useState(defaultMetricQuantity);
    const [numServings, setNumServings] = useState(1);
    const defaultUnitRounding = metricQuantity === foodResponse.servingQuantity;

    let foodName = ProcessFoodName(foodResponse.name);
    let brand = foodResponse.brandName ? ToTitleCase(foodResponse.brandName) : foodResponse.brandOwner ? ToTitleCase(foodResponse.brandOwner) : null;
    let nutrients = ProcessNutritionalContents(foodResponse.nutritionalContent, metricQuantity, numServings, defaultUnitRounding);

    return (
        <div id="food-info">
            <h3>{foodName}</h3>
            <p>{brand}</p>
            <MacroCircle kcal={nutrients.kcal} totalFat={nutrients.totalFat} totalCarb={nutrients.totalCarb} protein={nutrients.protein} />
            <div id="food-info-macros">
                <h5 id="food-info-macro-fat">
                    Fat:
                    <br />
                    {nutrients.totalFat}g
                </h5>
                <h5 id="food-info-macro-carb">
                    Carbs: <br />
                    {nutrients.totalCarb}g
                </h5>
                <h5 id="food-info-macro-protein">
                    Protein: <br />
                    {nutrients.protein}g
                </h5>
            </div>
            <SelectServingSize
                householdServingName={foodResponse.servingName}
                defaultServingQuantity={defaultMetricQuantity}
                defaultMetricUnit={defaultMetricUnit}
                setMetricQuantity={setMetricQuantity}
                setNumServings={setNumServings}
            />
            <p></p>
        </div>
    );
}

function FoodMoreInfo(props) {
    const { nutrients } = props;
}

function SelectServingSize(props) {
    // needs to understand if food is measured in grams or milliliters by default
    // needs to preserve the default unit from the database
    // needs to create a range of appropriate units
    const { householdServingName, defaultServingQuantity, defaultMetricUnit, setMetricQuantity, setNumServings } = props;

    const [numText, setNumText] = useState(1);

    let units = {};
    let defaultUnitName = `${defaultServingQuantity} ${ProcessUnit(defaultMetricUnit)}`;
    if (householdServingName) {
        defaultUnitName += ` (${ToTitleCase(householdServingName)})`;
    }
    units[defaultUnitName] = defaultServingQuantity;

    if (defaultMetricUnit === "g") {
        units = {
            ...units,
            "1 g": 1,
            "1 kg": 1000,
            "1 oz": 28,
            "1 lb": 28 * 16,
        };
    } else if (defaultMetricUnit === "ml") {
        units = {
            ...units,
            "1 mL": 1,
            "1 L": 1000,
            "1 tsp": 4.92892,
            "1 tbsp": 14.7868,
            "1 fl oz": 29.5735,
            "1 cup": 236.588,
        };
    }

    const inputOnChange = (e) => {
        setNumText(e.target.value);
        let n = Number(e.target.value);
        if (n > 0 && n < 10001) {
            setNumServings(n);
        }
    };

    const inputOnBlur = () => {
        if (numText < 1) {
            setNumText(1);
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
    };

    return (
        <div id="food-page-serving-selector">
            <div id="food-page-serving-size-selector">
                <p>Serving Size:</p>
                <DropdownMenu options={Object.keys(units)} listItemClass="food-serving-dropdown-item" onSelect={onUnitSelect} />
            </div>
            <div id="food-page-num-serving-selector">
                <p>Number of Servings:</p>
                <input type="number" inputMode="decimal" value={numText} onChange={inputOnChange} onBlur={inputOnBlur} />
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
            console.log("Curr undefined!");
        }
    }, [windowDims]);
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

/* Utility Functions */
// Food Utilities
function ToTitleCase(x) {
    /* 
    Very useful function for converting aNy sTriNG into Title Case, where only the first letter of every
    word is capitalized. The API sends back everything in uppercase letters, so it's the job of the client
    to figure out how best to display everything
    */
    x = x
        .toLowerCase()
        .split(" ")
        .map((s) => {
            if (s === "bbq") {
                return "BBQ";
            }
            return s.charAt(0).toUpperCase() + s.substring(1);
        })
        .join(" ");
    // extra capitalization
    for (let i = 0; i < x.length - 1; i++) {
        if (x[i] === "(" || x[i] === "[" || x[i] === "{" || x[i] === "-") {
            x = x.substring(0, i + 1) + x[i + 1].toUpperCase() + x.substring(i + 2);
        }
    }
    return x;
}
function GetPhrases(s, ans, offset) {
    /*
    Magic T(n) = O(n^3) recursive function. Splits a string into "phrases", which is a combination of consecutive words
    in a string. This function is super useful for trimming off some of the extra repeated information that comes in a food's
    name, like "Salt & Pepper Cashews, Salt & Pepper"
    */
    ans = ans ? ans : {};
    let j = offset ? offset : 0;
    let k = offset ? offset : 0;
    let builder = "";
    for (let i = offset ? offset : 0; i < s.length; i++) {
        // !offset ? console.log(builder) : null;
        if (builder === "") {
            j = i;
            k = i;
        }
        if (s[i] === " ") {
            // console.log("space", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
                GetPhrases(s, ans, i + 1);
            }
            builder = builder === "" ? "" : builder + s[i];
            k++;
        } else if (s[i] === ",") {
            // console.log("comma", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
                GetPhrases(s, ans, i + 1);
            }
            builder = "";
        } else if (i === s.length - 1) {
            builder += s[i];
            k++;
            // console.log("end", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
            }
        } else {
            builder += s[i];
            k++;
        }
    }
    return ans;
}

function MultiDimIncludes(arr, val) {
    // Multidimensional Array version of .includes() that is good enough for my purposes
    for (let i = 0; i < arr.length; i++) {
        let temp = true;
        for (let j = 0; j < arr[i].length; j++) {
            temp = arr[i][j] === val[j];
        }
        if (temp) {
            return temp;
        }
    }
    return false;
}

function ProcessFoodName(x) {
    /*
    Actual Function that will strip the extra information from the names of foods as well as call ToTitleCase to
    standardize the way that food names are displayed
    */
    let phrases = GetPhrases(x);
    // console.log(phrases);
    let maxKey = "";
    let keys = Object.keys(phrases);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key.length > maxKey.length && phrases[key].length > 1) {
            maxKey = key;
        }
    }

    if (maxKey !== "") {
        // console.log(maxKey);
        phrases[maxKey].sort((a, b) => {
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }
            return 0;
        });
        x = x.substring(0, phrases[maxKey][phrases[maxKey].length - 1][0]) + x.substring(phrases[maxKey][phrases[maxKey].length - 1][1]);
        x = x.replace("  ", " ");
        if (x.substring(x.length - 2) === ", ") {
            x = x.substring(0, x.length - 2);
        }
    }
    // to Title Case
    x = ToTitleCase(x);
    return x;
}

function ProcessUnit(unit) {
    if (unit === "ml") {
        return "mL";
    }
    return unit;
}

function ProcessNutritionalContents(nutritionalContents, metricQuantity, numServings, defaultUnitRounding) {
    /*
    This function is used for processing nutrients and rounding them appropriately according the serving size.
    If the serving size is the same as what came from the database i.e. the same as on a nutrition label,
    it would look better if the calories were rounded to the nearest 5 and the macros were rounded to the 
    nearest 1. That is the purpose of passing in "defaultUnitRounding"
    */
    let precision = defaultUnitRounding ? 0 : 1;
    let nutrients = {};
    Object.keys(nutritionalContents).forEach((key) => {
        if (key === "kcal") return (nutrients[key] = Number((nutritionalContents[key] / 100) * metricQuantity));
        nutrients[key] = Number(((nutritionalContents[key] / 100) * metricQuantity * numServings).toFixed(precision));
    });

    console.log(nutrients);
    nutrients.kcal = defaultUnitRounding ? RoundToNearestFive(nutrients.kcal) * numServings : nutrients.kcal * numServings;
    nutrients.kcal = nutrients.kcal > 25_000 ? nutrients.kcal.toExponential(2) : nutrients.kcal.toFixed(0);
    return nutrients;
}

function RoundToNearestFive(n) {
    return Math.round(n / 5) * 5;
}
