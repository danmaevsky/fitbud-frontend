import magnifyingGlass from "assets/magnifying-glass.svg";
import barcodeScannerIcon from "assets/barcode-scan-icon.svg";
import minusSign from "assets/minus-sign.svg";
import plusSign from "assets/add-food-plus.svg";
import clearTextX from "assets/clear-text-x.svg";
import foodSearchPlacehoder from "assets/food-search-placeholder.svg";
import backArrow from "assets/back-arrow.svg";
import showMoreDownArrow from "assets/show-more-down-arrow.svg";
import DeleteLogButtonIcon from "components/DeleteLogButtonIcon";
import DropdownMenu from "components/DropdownMenu";
import { useLocation, useNavigate } from "react-router-dom";
import "./RecipeBuilderPage.css";
import useSessionStorage from "hooks/useSessionStorage";
import { useEffect, useRef, useState } from "react";
import useWindowDimensions from "hooks/useWindowDimensions";
import { authFetch } from "helpers/authHelpers";
import UpdateFormInput from "components/UpdateFormInput";
import useArray from "hooks/useArray";
import { ProcessFoodName, ProcessNutritionalContents, ProcessUnit, ToTitleCase, GetBuiltInUnits } from "helpers/fitnessHelpers";

export default function RecipeBuilderPage() {
    const location = useLocation();
    const [foodResponse, setFoodResponse] = useState(null);
    const [responseStatus, setResponseStatus] = useState(200);

    let defaultFoodId = "";
    let editMode = false;
    let recipeId = null;
    let defaultRecipeCopy = [];
    let defaultRecipeName = "";
    let defaultRecipeNumServings = 1;
    let defaultNutrientsCopy = [];
    // checking location.state
    if (location.state) {
        if (location.state.from === "recipe-builder-barcode") {
            // check if came from barcode scanner page
            defaultFoodId = location.state.barcodeFoodId;
        } else if (location.state.from === "recipe-page") {
            // check if came from a specific recipes page for the purpose of editing
            console.log("came from recipe-page");
            editMode = true;
            recipeId = location.state.recipeResponse._id;
            defaultRecipeCopy = ExtractBuilderCopyFromRecipeResponse(location.state.recipeResponse);
            defaultNutrientsCopy = ExtractNutrientsFromRecipeResponse(location.state.recipeResponse);
            defaultRecipeName = location.state.recipeResponse.name;
            defaultRecipeNumServings = location.state.recipeResponse.numServings;
            console.log(defaultNutrientsCopy);
        }
    }
    const [foodId, setFoodId] = useState(defaultFoodId);

    let renderFoodInfo = responseStatus === 200; // check if response code is good
    renderFoodInfo = renderFoodInfo && foodResponse && foodId === foodResponse._id; // check if there is a response, and if URL param matches the response (prevents re-render with stale information, sometimes fatal)
    const [metricQuantity, setMetricQuantity] = useState(100);
    const [numServings, setNumServings] = useState(1);
    const [servingName, setServingName] = useState("");
    const [foodName, setFoodName] = useState("");
    const [brand, setBrand] = useState("");
    const [defaultMetricUnit, setDefaultMetricUnit] = useState("g");
    const [householdServingName, setHouseholdServingName] = useState("");
    const [processedNutrients, setProcessedNutrients] = useState(null);

    const [recipeCopy, setRecipeCopy] = useSessionStorage("recipeCopy-RecipeBuilder", defaultRecipeCopy);
    const [recipe, recipeMethods] = useArray(defaultRecipeCopy);
    const [nutrientsCopy, setNutrientsCopy] = useSessionStorage("nutrientsCopy-RecipeBuilder", defaultNutrientsCopy);
    const [nutrients, nutrientsMethods] = useArray(defaultNutrientsCopy);

    useEffect(() => {
        let resStatus;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/${foodId}`, {
            method: "GET",
        })
            .then((res) => {
                resStatus = res.status;
                return res.json();
            })
            .then((json) => {
                setResponseStatus(resStatus);
                setFoodResponse(json);
            });
    }, [foodId]);

    const addFoodToRecipe = (
        _id,
        metricQuantity,
        numServings,
        servingName,
        brand,
        foodName,
        householdServingName,
        defaultMetricUnit,
        processedNutrients
    ) => {
        recipeMethods.push({
            foodId: _id,
            servingName: servingName,
            numServings: numServings,
            quantityMetric: metricQuantity,
            brand: brand,
            foodName: foodName,
            defaultMetricUnit: defaultMetricUnit,
            householdServingName: householdServingName,
        });
        nutrientsMethods.push(processedNutrients);
        setNumServings(1);
        setServingName("");
    };

    useEffect(() => {
        setRecipeCopy(recipe.slice());
        setNutrientsCopy(nutrients.slice());
    }, [recipe, nutrients]);

    return (
        <div id="recipe-builder-page-body">
            <div className="food-background-round round-background-decoration"></div>
            <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="recipe-builder-page-content">
                <div>
                    {foodId !== "" || renderFoodInfo ? (
                        <div id="recipe-builder-food-island">
                            <div id="recipe-builder-food-island-buttons">
                                <button
                                    id="recipe-builder-food-island-back-arrow"
                                    onClick={() => {
                                        setFoodId("");
                                    }}
                                >
                                    <img src={backArrow} alt="back arrow" />
                                    Go Back
                                </button>
                                <button
                                    id="recipe-builder-food-island-add"
                                    onClick={() => {
                                        addFoodToRecipe(
                                            foodId,
                                            metricQuantity,
                                            numServings,
                                            servingName,
                                            brand,
                                            foodName,
                                            householdServingName,
                                            defaultMetricUnit,
                                            processedNutrients
                                        );
                                        setFoodId("");
                                    }}
                                >
                                    <img src={plusSign} alt="add arrow" />
                                    Add Food
                                </button>
                            </div>
                            {renderFoodInfo ? (
                                <FoodInfo
                                    foodResponse={foodResponse}
                                    metricQuantity={metricQuantity}
                                    setMetricQuantity={setMetricQuantity}
                                    numServings={numServings}
                                    setNumServings={setNumServings}
                                    servingName={servingName}
                                    setServingName={setServingName}
                                    setFoodName={setFoodName}
                                    setBrand={setBrand}
                                    setDefaultMetricUnit={setDefaultMetricUnit}
                                    setHouseholdServingName={setHouseholdServingName}
                                    setProcessedNutrients={setProcessedNutrients}
                                />
                            ) : null}
                        </div>
                    ) : (
                        <FoodSearchbox foodId={foodId} setFoodId={setFoodId} />
                    )}
                </div>
                <RecipeItems
                    recipe={recipe}
                    recipeMethods={recipeMethods}
                    nutrients={nutrients}
                    nutrientsMethods={nutrientsMethods}
                    defaultRecipeName={defaultRecipeName}
                    defaultRecipeNumServings={defaultRecipeNumServings}
                    recipeId={recipeId}
                    editMode={editMode}
                />
            </div>
        </div>
    );
}

function FoodSearchbox(props) {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchStatus, setSearchStatus] = useState(200);
    const searchBoxRef = useRef(null);
    const { foodId, setFoodId } = props;

    const fetchResults = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${encodeURIComponent(searchText)}`)
            .then((res) => {
                setSearchStatus(res.status);
                return res.json();
            })
            .then((json) => setSearchResults(json))
            .then(() => {
                window.sessionStorage.FoodSearchPageText = JSON.stringify(searchText);
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
        <div id="recipe-builder-food-search">
            <div id="recipe-builder-food-searchbox">
                <button id="recipe-builder-food-searchbox-search-button" onClick={fetchResults}>
                    <img src={magnifyingGlass} alt="magnifying glass icon" />
                </button>
                <input
                    id="recipe-builder-food-searchbox-input"
                    type="text"
                    placeholder="Search Food"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={inputOnKeydown}
                    ref={searchBoxRef}
                ></input>
                {searchText !== "" ? (
                    <button
                        id="recipe-builder-food-cleartext-button"
                        onClick={() => {
                            searchBoxRef.current.focus();
                            setSearchText("");
                        }}
                    >
                        <img src={clearTextX} alt="clear text icon X" />
                    </button>
                ) : (
                    <button id="dashboard-food-searchbox-barcode-button" onClick={() => navigate("/barcode", { state: { from: "recipe-builder" } })}>
                        <img src={barcodeScannerIcon} alt="barcode scanner icon" />
                    </button>
                )}
            </div>
            <div id="recipe-builder-search-island">
                <p id="recipe-builder-search-island-number">{searchResults.length > 0 ? `Results: ${searchResults.length}` : null}</p>
                {searchResults.length > 0 ? (
                    <FoodSearchList searchResults={searchResults} foodId={foodId} setFoodId={setFoodId} />
                ) : (
                    <>
                        <img id="food-search-placeholder-icon" src={foodSearchPlacehoder} alt="food search placeholder icon" />
                        {searchStatus !== 200 ? null : <h3>Search for Foods to add them to the Recipe below!</h3>}
                    </>
                )}
                {searchStatus !== 200 ? <h3>Search came back empty!</h3> : null}
            </div>
        </div>
    );
}

function RecipeItems(props) {
    const { recipe, recipeMethods, nutrients, nutrientsMethods, defaultRecipeName, defaultRecipeNumServings, recipeId, editMode } = props;
    const [recipeNameCopy, setRecipeNameCopy] = useSessionStorage("recipeNameCopy-RecipeBuilder", defaultRecipeName);
    const [recipeName, setRecipeName] = useState(defaultRecipeName);

    const [recipeNumServingsCopy, setRecipeNumServingsCopy] = useSessionStorage("recipeNumServingsCopy-RecipeBuilder", defaultRecipeNumServings);
    const [recipeNumServings, setRecipeNumServings] = useState(defaultRecipeNumServings);
    const [recipeNumServingsText, setRecipeNumServingsText] = useState(defaultRecipeNumServings);

    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const [recipeError, setRecipeError] = useState("");
    const navigate = useNavigate();

    const saveUserRecipe = () => {
        if (recipe.length < 1) {
            setRecipeError("Cannot save an empty recipe!");
            return;
        }

        if (!recipeName) {
            setRecipeError("Recipe must have a name!");
            return;
        }

        if (!recipeNumServings) {
            setRecipeError("Enter a valid number of servings (1 - 10,000)!");
            return;
        }

        let recipeObject = {
            name: recipeName,
            ingredients: [],
            numServings: recipeNumServings,
        };

        for (let i = 0; i < recipe.length; i++) {
            recipeObject.ingredients.push({
                foodId: recipe[i].foodId,
                servingName: recipe[i].servingName,
                numServings: recipe[i].numServings,
                quantityMetric: recipe[i].quantityMetric,
            });
        }

        let resStatus;

        console.log(recipeObject);

        if (editMode) {
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/${recipeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recipeObject),
            })
                .then((res) => {
                    resStatus = res.status;
                    return res.json();
                })
                .then((res) => {
                    if (resStatus == 200) {
                        recipeMethods.clear();
                        nutrientsMethods.clear();
                        setRecipeError("");
                        setRecipeName("");
                        setRecipeNumServingsText("");
                        navigate("/food");
                    } else if (resStatus == 500) {
                        console.log("Backend Error ", resStatus);
                    }
                })
                .catch((err) => {
                    console.log("Error in recipe save: ", err.message);
                });
        } else {
            authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(recipeObject),
            })
                .then((res) => {
                    resStatus = res.status;
                    return res.json();
                })
                .then((res) => {
                    if (resStatus == 201) {
                        recipeMethods.clear();
                        nutrientsMethods.clear();
                        setRecipeError("");
                        setRecipeName("");
                        setRecipeNumServingsText("");
                    } else if (resStatus == 500) {
                        console.log("Backend Error ", resStatus);
                    }
                })
                .catch((err) => {
                    console.log("Error in recipe save: ", err.message);
                });
        }
    };

    const deleteRecipe = () => {
        if (!editMode) {
            return;
        }
        authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/${recipeId}`, {
            method: "DELETE",
        })
            .then((res) => {
                if (res.status === 200) {
                    navigate("/food");
                } else {
                    throw Error(res.status);
                }
            })
            .catch((err) => console.log(err));
    };

    let totalRecipeNutrients = TallyRecipeNutrients(nutrients, recipeNumServings);

    const recipeNumServingsInputOnChange = (e) => {
        let n = Number(e.target.value);
        setRecipeNumServingsText(e.target.value);
        if (n > 0 && n <= 10000) {
            setRecipeNumServings(n);
        }
    };

    const recipeNumServingsInputOnBlur = (e) => {
        let n = Number(e.target.value);
        if (!n || n <= 0) {
            setRecipeNumServingsText(1);
            setRecipeNumServings(1);
            return;
        } else if (n > 10000) {
            setRecipeNumServingsText(10000);
            setRecipeNumServings(10000);
            return;
        }

        setRecipeNumServingsText(n);
    };

    useEffect(() => {
        setRecipeNameCopy(recipeName);
        setRecipeNumServingsCopy(recipeNumServings);
    }, [recipeName, recipeNumServings]);

    return (
        <div id="recipe-builder-main-island">
            {editMode ? (
                <button id="recipe-island-delete" onClick={deleteRecipe}>
                    Delete Recipe
                    <DeleteLogButtonIcon />
                </button>
            ) : null}
            <div id="recipe-info">
                <h3 id="recipe-builder-main-header">Recipe Builder</h3>
                {totalRecipeNutrients ? (
                    <>
                        <MacroCircle
                            kcal={totalRecipeNutrients.kcal}
                            totalFat={totalRecipeNutrients.totalFat}
                            totalCarb={totalRecipeNutrients.totalCarb}
                            protein={totalRecipeNutrients.protein}
                        />
                        <div id="food-info-macros">
                            <h5 id="food-info-macro-fat">
                                Fat:
                                <br />
                                {totalRecipeNutrients.totalFat} g
                            </h5>
                            <h5 id="food-info-macro-carb">
                                Carbs:
                                <br />
                                {totalRecipeNutrients.totalCarb} g
                            </h5>
                            <h5 id="food-info-macro-protein">
                                Protein:
                                <br />
                                {totalRecipeNutrients.protein} g
                            </h5>
                        </div>
                    </>
                ) : null}
                <div id="recipe-inputs">
                    <UpdateFormInput
                        type="text"
                        id="recipe-name-input"
                        label={"Recipe Name"}
                        placeholder={"Recipe Name"}
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        onClick={(e) => e.target.select()}
                    />
                    <UpdateFormInput
                        type="number"
                        id="recipe-serving-input"
                        inputMode="decimal"
                        label={"Num. Servings"}
                        placeholder={"Num. Servings"}
                        value={recipeNumServingsText}
                        onChange={recipeNumServingsInputOnChange}
                        onBlur={recipeNumServingsInputOnBlur}
                        onClick={(e) => e.target.select()}
                    />
                </div>
                <IngredientListRecipe recipe={recipe} recipeMethods={recipeMethods} nutrientsMethods={nutrientsMethods} />
                {showMoreInfo && totalRecipeNutrients ? (
                    <>
                        <FoodMoreInfo processedNutrients={totalRecipeNutrients} />
                        <div id="recipe-info-show-less">
                            <button onClick={() => setShowMoreInfo(false)}>
                                <img id="food-info-show-less-arrow" src={showMoreDownArrow} alt="show less nutritional information icon" />
                            </button>
                        </div>
                    </>
                ) : totalRecipeNutrients ? (
                    <div id="recipe-info-show-more" onClick={() => setShowMoreInfo(true)}>
                        <h5>Show More Nutritional Information</h5>
                        <button>
                            <img id="food-info-show-more-arrow" src={showMoreDownArrow} alt="show more nutritional information icon" />
                        </button>
                    </div>
                ) : null}
                {recipeError ? <h4 id="recipe-builder-error">{recipeError}</h4> : null}
                <button id="recipe-builder-save-recipe-button" onClick={saveUserRecipe}>
                    Save Recipe
                </button>
            </div>
        </div>
    );
}

function FoodInfo(props) {
    const [showMoreInfo, setShowMoreInfo] = useState(false);
    const {
        foodResponse,
        metricQuantity,
        setMetricQuantity,
        numServings,
        setNumServings,
        servingName,
        setServingName,
        setFoodName,
        setBrand,
        setDefaultMetricUnit,
        setHouseholdServingName,
        setProcessedNutrients,
    } = props;
    const defaultMetricQuantity = foodResponse.servingQuantity ? foodResponse.servingQuantity.toFixed(2) : 100;
    const defaultMetricUnit = foodResponse.servingQuantityUnit ? foodResponse.servingQuantityUnit : "g";
    const defaultUnitRounding = metricQuantity === foodResponse.servingQuantity;

    let foodName = ProcessFoodName(foodResponse.name);
    let brand = foodResponse.brandName ? ToTitleCase(foodResponse.brandName) : foodResponse.brandOwner ? ToTitleCase(foodResponse.brandOwner) : null;
    let nutrients = ProcessNutritionalContents(foodResponse.nutritionalContent, metricQuantity, numServings, defaultUnitRounding);

    useEffect(() => {
        setNumServings(1);
        setMetricQuantity(defaultMetricQuantity);
        setServingName(defaultMetricUnit);
        setBrand(brand);
        setFoodName(foodName);
        setDefaultMetricUnit(defaultMetricUnit);
        setHouseholdServingName(foodResponse.servingName);
    }, [foodResponse]);

    useEffect(() => {
        setProcessedNutrients(nutrients);
    }, [foodResponse, metricQuantity, numServings]);

    return (
        <div id="food-info">
            <h3>{foodName}</h3>
            <p>{brand}</p>
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

function FoodSearchList(props) {
    let { searchResults, foodId, setFoodId } = props;
    return (
        <ul id="recipe-builder-search-results-list">
            {searchResults.map((searchResults, index) => (
                <FoodSearchResult foodId={foodId} setFoodId={setFoodId} response={searchResults} key={`food-search-result-${index}`} />
            ))}
            <li id="recipe-builder-search-refine-message">
                <h4>Didn't find what you were looking for? Consider refining your search!</h4>
            </li>
        </ul>
    );
}

function FoodSearchResult(props) {
    const { foodId, setFoodId } = props;
    let { _id, name, brandOwner, brandName, isVerified } = props.response;
    name = ProcessFoodName(name);
    let brand = brandName ? ToTitleCase(brandName) : brandOwner ? ToTitleCase(brandOwner) : null;

    const navigate = useNavigate();

    const resultOnClick = () => {
        setFoodId(_id);
    };
    return (
        <li className="food-search-result" onClick={resultOnClick}>
            <h4>{name}</h4>
            <p>{brand}</p>
        </li>
    );
}

function IngredientListRecipe(props) {
    const { recipe, recipeMethods, nutrientsMethods } = props;
    let ingredientElements = [];

    for (let i = 0; i < recipe.length; i++) {
        ingredientElements.push(
            <Ingredient
                foodName={recipe[i].foodName}
                servingName={recipe[i].servingName}
                numServings={recipe[i].numServings}
                brand={recipe[i].brand}
                metricQuantity={recipe[i].quantityMetric}
                idx={i}
                recipeMethods={recipeMethods}
                nutrientsMethods={nutrientsMethods}
                key={i}
            />
        );
    }

    return <div id="recipe-builder-ingredients">{ingredientElements}</div>;
}

function Ingredient(props) {
    const { foodName, servingName, numServings, brand, metricQuantity, idx, recipeMethods, nutrientsMethods } = props;

    let numServingsText = CreateServingText(props);

    return (
        <div className="recipe-section-item">
            <div className="recipe-section-item-name">
                <h4>{foodName}</h4>
                <p>
                    {brand ? brand + "," : null} {numServingsText}
                </p>
            </div>
            <div className="recipe-section-remove-item">
                <button
                    onClick={() => {
                        recipeMethods.remove(idx);
                        nutrientsMethods.remove(idx);
                    }}
                >
                    <img src={minusSign} />
                </button>
            </div>
        </div>
    );
}

function CreateServingText(foodLog) {
    let numServings = foodLog.numServings;
    let servingName = foodLog.servingName;
    let quantityMetric = foodLog.metricQuantity;

    let defaultMetricUnit = foodLog.defaultMetricUnit;
    let householdServingName = foodLog.householdServingName;

    let builtInUnits = GetBuiltInUnits(defaultMetricUnit);

    let servingWords = servingName.split(" ");

    if (householdServingName && servingName === householdServingName) {
        // Here we need to strip the number from the servingName if there is one and multiply it by numServings
        let householdNumber = Number(servingWords[0]);
        if (Number.isNaN(householdNumber)) {
            // no number
            return `${numServings} ${ToTitleCase(servingName)}`;
        } else {
            // there is a number
            return `${numServings * householdNumber} ${ToTitleCase(servingWords.splice(1).join(" "))}`;
        }
    } else if (Object.keys(builtInUnits).includes(servingName) || servingName === "g" || servingName === "mL") {
        // Here we simply need to check if it is a metric unit or not
        let servingUnit = ProcessUnit(servingWords[1]);
        if (servingUnit === "g" || servingUnit === "mL" || servingName === "g" || servingName === "mL") {
            console.log("numServings:", numServings);
            console.log("quantityMetric:", quantityMetric);
            return `${numServings * quantityMetric} ${servingUnit || servingName}`;
        } else {
            return `${numServings} ${servingUnit}`;
        }
    } else {
        return `${numServings} servings`;
    }
}

function AddNutrients(nutrients1, nutrients2) {
    let sum = {};
    if (nutrients1 && !nutrients2) {
        Object.keys(nutrients1).forEach((nutrient) => {
            sum[nutrient] = Number(nutrients1[nutrient]);
        });
    } else if (!nutrients1 && nutrients2) {
        Object.keys(nutrients2).forEach((nutrient) => {
            sum[nutrient] = Number(nutrients2[nutrient]);
        });
    } else {
        Object.keys(nutrients1).forEach((nutrient) => {
            sum[nutrient] = Number(nutrients1[nutrient]) + Number(nutrients2[nutrient]);
        });
    }

    return sum;
}

function TallyRecipeNutrients(nutrients, recipeNumServings) {
    let totalRecipeNutrients = null;
    console.log(nutrients);
    for (let i = 0; i < nutrients.length; i++) {
        totalRecipeNutrients = AddNutrients(totalRecipeNutrients, nutrients[i]);
    }

    if (totalRecipeNutrients) {
        Object.keys(totalRecipeNutrients).forEach((nutrient) => {
            let precision = nutrient === "kcal" ? 0 : 1;
            totalRecipeNutrients[nutrient] = (Number(totalRecipeNutrients[nutrient]) / recipeNumServings).toFixed(precision);
        });
    }

    return totalRecipeNutrients;
}

// Helper
function ExtractBuilderCopyFromRecipeResponse(recipeResponse) {
    let builderCopy = recipeResponse.ingredients.map((ingredient) => {
        return {
            foodId: ingredient.food._id,
            servingName: ingredient.servingName,
            numServings: ingredient.numServings,
            quantityMetric: ingredient.quantityMetric,
            brand: ingredient.brandName ? ToTitleCase(ingredient.brandName) : ingredient.brandOwner ? ToTitleCase(ingredient.brandOwner) : null,
            foodName: ProcessFoodName(ingredient.food.name),
            defaultMetricUnit: ingredient.food.servingQuantityUnit,
            householdServingName: ingredient.food.servingName,
        };
    });
    return builderCopy;
}

function ExtractNutrientsFromRecipeResponse(recipeResponse) {
    let nutrientCopy = recipeResponse.ingredients.map((ingredient) => {
        const defaultMetricQuantity = ingredient.food.servingQuantity ? ingredient.food.servingQuantity.toFixed(2) : 100;
        const defaultMetricUnit = ingredient.food.servingQuantityUnit ? ingredient.food.servingQuantityUnit : "g";
        const defaultUnitRounding = defaultMetricQuantity === ingredient.food.servingQuantity;

        let foodName = ProcessFoodName(ingredient.food.name);
        let brand = ingredient.food.brandName
            ? ToTitleCase(ingredient.food.brandName)
            : ingredient.food.brandOwner
            ? ToTitleCase(ingredient.food.brandOwner)
            : null;
        let nutrients = ProcessNutritionalContents(
            ingredient.food.nutritionalContent,
            defaultMetricQuantity,
            ingredient.numServings,
            defaultUnitRounding
        );
        return nutrients;
    });
    return nutrientCopy;
}
