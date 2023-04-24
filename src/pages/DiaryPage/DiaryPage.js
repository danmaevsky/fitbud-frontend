import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./DiaryPage.css";
import addLogPlus from "assets/add-food-plus.svg";
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
    DiaryHasMealEntries,
} from "helpers/fitnessHelpers";
import useSessionStorage from "hooks/useSessionStorage";

export default function DiaryPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    let dateSearchParam = searchParams.get("date");

    const [currentDiary, setCurrentDiary] = useLocalStorage("CurrentDiary", null);
    const [prevDiary, setPrevDiary] = useLocalStorage("PrevDiary", null);
    const [profile, setProfile] = useLocalStorage("profile", null);

    let calorieGoal = CalculateGoal(profile);

    const currentDate = getCurrentDate();
    const date = dateSearchParam ? dateSearchParam : currentDate;
    let diary = date === currentDate ? currentDiary : prevDiary;

    // fetch the diary to display
    useEffect(() => {
        if (date === currentDate) {
            fetchDiaryHelper(date, setCurrentDiary, navigate);
        } else {
            fetchDiaryHelper(date, setPrevDiary, navigate);
        }
    }, [dateSearchParam]);

    if (!DiaryHasMealEntries(diary)) {
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
                    <Diary diary={diary} profile={profile} date={date} />
                </div>
            </div>
        );
    }

    let caloriesEaten = Math.round(diary.totalDiaryNutritionalContents.kcal);

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
                <Diary diary={diary} profile={profile} date={date} />
            </div>
        </div>
    );
}

function Diary(props) {
    const { diary, profile, date } = props;

    let diarySections = [];
    for (let i = 0; i < profile.preferences.mealNames.length; i++) {
        let mealKey = "meal" + (i + 1);
        let mealName = profile.preferences.mealNames[i];

        if (mealName && diary && diary[mealKey].totalMealNutritionalContent) {
            let mealCalories = Math.round(diary[mealKey].totalMealNutritionalContent.kcal);
            diarySections.push(
                <MealSection
                    key={"mealSection" + i}
                    mealPosition={mealKey}
                    mealName={mealName}
                    foodLogs={diary[mealKey].foodLogs}
                    calories={mealCalories}
                    date={date}
                />
            );
        } else if (mealName && diary) {
            diarySections.push(
                <MealSection
                    key={"mealSection" + i}
                    mealPosition={mealKey}
                    mealName={mealName}
                    foodLogs={diary[mealKey].foodLogs}
                    calories={null}
                    date={date}
                />
            );
        } else if (mealName) {
            diarySections.push(<MealSection key={"mealSection" + i} mealPosition={mealKey} mealName={mealName} foodLogs={null} date={date} />);
        }
    }

    if (diary) {
        let allExercises = diary.exercise.strengthLogs.concat(diary.exercise.cardioLogs).concat(diary.exercise.workoutLogs);
        diarySections.push(<ExerciseSection exerciseLogs={allExercises} date={date} />);
    }

    return <div id="diary">{diarySections}</div>;
}

function MealSection(props) {
    const { mealPosition, mealName, calories, foodLogs, date } = props;
    const navigate = useNavigate();

    let foodItems = [];
    if (foodLogs) {
        for (let i = 0; i < foodLogs.length; i++) {
            const foodLogOnClick = () => {
                const currentDate = getCurrentDate();
                if (date === currentDate) {
                    navigate("/editLogs/food", {
                        state: {
                            mealPosition: mealPosition,
                            logPosition: i,
                            date: date,
                        },
                        replace: false,
                    });
                } else {
                    navigate(`/editLogs/food`, {
                        state: {
                            mealPosition: mealPosition,
                            logPosition: i,
                            date: date,
                        },
                        replace: false,
                    });
                }
            };

            let foodLog = foodLogs[i];
            let foodObject = foodLog.foodObject;
            let foodName = ProcessFoodName(foodObject.name);
            let brand = foodObject.brandName ? ToTitleCase(foodObject.brandName) : foodObject.brandOwner ? ToTitleCase(foodObject.brandOwner) : null;
            let totalNutritionalContent = foodLog.totalNutritionalContent;
            let calories = Math.round(totalNutritionalContent.kcal);

            let numServingText = CreateServingText(foodLog);

            foodItems.push(
                <div key={`${mealName}-food-item-${i}`} className="diary-section-item" onClick={foodLogOnClick}>
                    <div className="diary-section-item-name">
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

    const addFoodOnClick = (e) => {
        e.stopPropagation();
        navigate("/food", {
            state: {
                mealPosition: mealPosition,
                date: date,
            },
        });
    };

    return (
        <div id={"diary-" + mealName + "-section"} className="diary-section">
            <div className="diary-section-header">
                <h3>{mealName}</h3>
                <h4>{calories ? calories : null}</h4>
            </div>
            <div className="diary-section-items">{foodItems}</div>
            <div className="diary-section-add-item" onClick={addFoodOnClick}>
                <button>
                    <img src={addLogPlus} />
                </button>
                <label>Add Food</label>
            </div>
        </div>
    );
}

function ExerciseSection(props) {
    const { exerciseLogs, date } = props;
    const [addingExerciseLogState, setAddingExerciseLogState] = useSessionStorage("addingExerciseLogState", null);
    const navigate = useNavigate();

    let exerciseItems = [];
    if (exerciseLogs) {
        for (let i = 0; i < exerciseLogs.length; i++) {
            let exerciseLog = exerciseLogs[i];
            let exerciseObject = exerciseLog.exerciseObject;
            let exerciseName = exerciseObject.name;
            let MET_value = exerciseObject.MET;
            exerciseItems.push(
                <div key={`exercise-item-${i}`} className="diary-exercise-section-exercise-item" onClick={() => {}}>
                    <div className="diary-meal-section-food-name">
                        <h4>{exerciseName}</h4>
                        <p>MET: {MET_value}</p>
                    </div>
                    <h4>{calories}</h4>
                </div>
            );
        }
    }

    const addFoodOnClick = (e) => {
        // e.stopPropagation();
        // setAddingExerciseLogState({
        //     date: date,
        // });
        // navigate("/exercise");
    };

    let calories = 100;

    return (
        <div id={"diary-exercise-section"} className="diary-section">
            <div className="diary-section-header">
                <h3>Exercise</h3>
                <h4>{calories ? calories : null}</h4>
            </div>
            <div className="diary-section-foods">{exerciseItems}</div>
            <div className="diary-section-add-item" onClick={addFoodOnClick}>
                <button>
                    <img src={addLogPlus} />
                </button>
                <label>Add Exercise</label>
            </div>
        </div>
    );
}

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
            return `${numServings} ${ToTitleCase(servingName)}`;
        } else {
            // there is a number
            return `${numServings * householdNumber} ${ToTitleCase(servingWords.splice(1).join(" "))}`;
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
