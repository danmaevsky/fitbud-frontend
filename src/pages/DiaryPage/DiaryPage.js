import { useNavigate } from "react-router-dom";
import "./DiaryPage.css";
import addFoodPlus from "assets/add-food-plus.svg";
import useLocalStorage from "hooks/useLocalStorage";
import { getCurrentDate } from "helpers/generalHelpers";
import { useEffect } from "react";
import {
    CalculateGoal,
    ToTitleCase,
    ProcessFoodName,
    ProcessNutritionalContents,
    ProcessUnit,
    fetchDiaryHelper,
    GetBuiltInUnits,
} from "helpers/fitnessHelpers";
import useSessionStorage from "hooks/useSessionStorage";

export default function DiaryPage() {
    const navigate = useNavigate();
    const [currentDiary, setCurrentDiary] = useLocalStorage("CurrentDiary", null);
    const [profile, setProfile] = useLocalStorage("profile", null);

    let calorieGoal = CalculateGoal(profile);

    useEffect(() => {
        const currentDate = getCurrentDate();
        // if (!currentDiary) {
        //     fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
        // } else if (currentDiary && currentDiary.timestamp.split("T")[0] !== currentDate) {
        //     fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
        // }
        fetchDiaryHelper(currentDate, setCurrentDiary, navigate);
    }, []);

    if (!currentDiary) {
        return (
            <div className="page-body" id="diary-page-body">
                <div className="default-background-round round-background-decoration"></div>
                <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
                <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
                <div id="diary-page-content">
                    <div id="diary-calorie-calculation-island">
                        <h3>Calories</h3>
                        <div id="diary-calorie-calculation">
                            <div id="diary-calorie-calculation-goal">
                                <label>Goal</label>
                                <h4> {calorieGoal}</h4>
                            </div>
                            <label>-</label>
                            <div id="diary-calorie-calculation-food">
                                <label>Food</label>
                                <h4>0</h4>
                            </div>
                            <label>+</label>
                            <div id="diary-calorie-calculation-exercise">
                                <label>Exercise</label>
                                <h4>0</h4>
                            </div>
                            <label>=</label>
                            <div id="diary-calorie-calculation-exercise">
                                <label>Remaining</label>
                                <h4>{calorieGoal}</h4>
                            </div>
                        </div>
                    </div>
                    <Diary currentDiary={currentDiary} profile={profile} />
                </div>
            </div>
        );
    }

    let caloriesEaten = Math.round(currentDiary.totalDiaryNutritionalContents.kcal);

    return (
        <div className="page-body" id="diary-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="diary-page-content">
                <div id="diary-calorie-calculation-island">
                    <h3>Calories</h3>
                    <div id="diary-calorie-calculation">
                        <div id="diary-calorie-calculation-goal">
                            <label>Goal</label>
                            <h4> {calorieGoal}</h4>
                        </div>
                        <label>-</label>
                        <div id="diary-calorie-calculation-food">
                            <label>Food</label>
                            <h4>{caloriesEaten}</h4>
                        </div>
                        <label>+</label>
                        <div id="diary-calorie-calculation-exercise">
                            <label>Exercise</label>
                            <h4>0</h4>
                        </div>
                        <label>=</label>
                        <div id="diary-calorie-calculation-exercise">
                            <label>Remaining</label>
                            <h4>{calorieGoal - caloriesEaten}</h4>
                        </div>
                    </div>
                </div>
                <Diary currentDiary={currentDiary} profile={profile} />
            </div>
        </div>
    );
}

function Diary(props) {
    const { currentDiary, profile } = props;

    let mealSections = [];
    for (let i = 0; i < profile.preferences.mealNames.length; i++) {
        let mealKey = "meal" + (i + 1);
        let mealName = profile.preferences.mealNames[i];

        if (mealName && currentDiary && currentDiary[mealKey].totalMealNutritionalContent) {
            let mealCalories = Math.round(currentDiary[mealKey].totalMealNutritionalContent.kcal);
            mealSections.push(
                <MealSection
                    key={"mealSection" + i}
                    mealPosition={mealKey}
                    mealName={mealName}
                    foodLogs={currentDiary[mealKey].foodLogs}
                    calories={mealCalories}
                />
            );
        } else if (mealName && currentDiary) {
            mealSections.push(
                <MealSection
                    key={"mealSection" + i}
                    mealPosition={mealKey}
                    mealName={mealName}
                    foodLogs={currentDiary[mealKey].foodLogs}
                    calories={null}
                />
            );
        } else if (mealName) {
            mealSections.push(<MealSection key={"mealSection" + i} mealPosition={mealKey} mealName={mealName} foodLogs={null} />);
        }
    }

    return <div id="diary">{mealSections}</div>;
}

function MealSection(props) {
    const { mealPosition, mealName, calories, foodLogs } = props;
    const [isAddingFoodLog, setIsAddingFoodLog] = useSessionStorage("isAddingFoodLog", false);
    const [isAddingFoodMealPosition, setIsAddingFoodMealPosition] = useSessionStorage("isAddingFoodMealPosition", null);
    const navigate = useNavigate();

    let foodItems = [];
    if (foodLogs) {
        for (let i = 0; i < foodLogs.length; i++) {
            let foodLog = foodLogs[i];
            let foodObject = foodLog.foodObject;
            let foodName = ProcessFoodName(foodObject.name);
            let brand = foodObject.brandName ? ToTitleCase(foodObject.brandName) : foodObject.brandOwner ? ToTitleCase(foodObject.brandOwner) : null;
            let totalNutritionalContent = foodLog.totalNutritionalContent;
            let calories = Math.round(totalNutritionalContent.kcal);

            let numServingText = CreateServingText(foodLog);

            foodItems.push(
                <div key={`${mealName}-food-item-${i}`} className="diary-meal-section-food-item">
                    <div className="diary-meal-section-food-name">
                        <h4>{foodName}</h4>
                        <p>
                            {brand ? brand + "," : null} {numServingText}
                        </p>
                    </div>
                    <h4>{calories}</h4>
                </div>
            );
        }
    }

    const addFoodOnClick = () => {
        setIsAddingFoodLog(true);
        setIsAddingFoodMealPosition(mealPosition);
        navigate("/food");
    };

    return (
        <div id={"diary-" + mealName + "-section"} className="diary-meal-section">
            <div className="diary-meal-section-header">
                <h3>{mealName}</h3>
                <h4>{calories ? calories : null}</h4>
            </div>
            <div className="diary-meal-section-foods">{foodItems}</div>
            <div className="diary-meal-section-add-food" onClick={addFoodOnClick}>
                <button>
                    <img src={addFoodPlus} />
                </button>
                <label>Add Food</label>
            </div>
        </div>
    );
}

function ExerciseSection(props) {}

/* Utitlity Function for Creating Serving Text */
function CreateServingText(foodLog) {
    let numServings = foodLog.numServings;
    let servingName = foodLog.servingName;
    let quantityMetric = foodLog.quantityMetric;

    let defaultMetricUnit = foodLog.foodObject.servingQuantityUnit;
    let householdServingName = foodLog.foodObject.servingName;

    let builtInUnits = GetBuiltInUnits(defaultMetricUnit);

    let servingWords = servingName.split(" ");
    if (householdServingName && servingName === householdServingName) {
        // Here we need to strip the number from the servingName if there is one and multiply it by numServings
        let householdNumber = Number(servingWords[0]);
        if (Number.isNaN(householdNumber)) {
            // no number
            return `${numServings} ${servingName}`;
        } else {
            // there is a number
            return `${numServings * householdNumber} ${servingWords.splice(1).join(" ")}`;
        }
    } else if (Object.keys(builtInUnits).includes(servingName) || servingName === "g" || servingName === "mL") {
        // Here we simply need to check if it is a metric unit or not
        let servingUnit = servingWords[1];
        if (servingUnit === "g" || servingUnit === "mL" || servingName === "g" || servingName === "mL") {
            return `${numServings * quantityMetric} ${servingUnit || servingName}`;
        } else {
            return `${numServings} ${servingUnit}`;
        }
    } else {
        return `${numServings} servings`;
    }
}
