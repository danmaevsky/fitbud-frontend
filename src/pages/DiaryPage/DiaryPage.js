import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import "./DiaryPage.css";
import addLogPlus from "assets/add-food-plus.svg";
import useLocalStorage from "hooks/useLocalStorage";
import { getCurrentDate } from "helpers/generalHelpers";
import { RoundToNearestN } from "helpers/fitnessHelpers";
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
    DiaryHasExerciseEntries,
} from "helpers/fitnessHelpers";
import useSessionStorage from "hooks/useSessionStorage";
import FormInput from "components/FormInput";
import { authFetch } from "helpers/authHelpers";

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

    let caloriesEaten = DiaryHasMealEntries(diary) ? Math.round(diary.totalDiaryNutritionalContents.kcal) : 0;
    let caloriesBurned = DiaryHasExerciseEntries(diary) ? Math.round(diary.exercise.totalBurnedCalories) : 0;

    return (
        <div className="page-body" id="diary-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration" id="diary-page-bottom-banner">
                <FormInput
                    id="diary-date-input"
                    type="date"
                    value={date}
                    placeholder="Date:"
                    onChange={(e) => navigate("/diary?date=" + e.target.value)}
                />
            </div>
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
                            <h4>{caloriesBurned}</h4>
                        </div>
                        <label>=</label>
                        <div id="diary-calorie-calculation-exercise">
                            <label>Remaining</label>
                            <h4>{calorieGoal - caloriesEaten + caloriesBurned}</h4>
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
                    recipeLogs={diary[mealKey].recipeLogs}
                    calories={mealCalories}
                    date={date}
                    diaryId={diary._id}
                />
            );
        } else if (mealName && diary) {
            diarySections.push(
                <MealSection
                    key={"mealSection" + i}
                    mealPosition={mealKey}
                    mealName={mealName}
                    foodLogs={diary[mealKey].foodLogs}
                    recipeLogs={diary[mealKey].recipeLogs}
                    calories={null}
                    date={date}
                    diaryId={diary._id}
                />
            );
        } else if (mealName) {
            diarySections.push(
                <MealSection
                    key={"mealSection" + i}
                    mealPosition={mealKey}
                    mealName={mealName}
                    foodLogs={null}
                    recipeLogs={null}
                    date={date}
                    diaryId={null}
                />
            );
        }
    }

    if (diary) {
        let modifiedStrengthLogs = diary.exercise.strengthLogs.map((strengthLog, idx) => {
            return {
                ...strengthLog,
                logType: "strength",
                logPosition: idx,
            };
        });
        let modifiedCardioLogs = diary.exercise.cardioLogs.map((strengthLog, idx) => {
            return {
                ...strengthLog,
                logType: "cardio",
                logPosition: idx,
            };
        });
        let modifiedWorkoutLogs = diary.exercise.workoutLogs.map((strengthLog, idx) => {
            return {
                ...strengthLog,
                logType: "workout",
                logPosition: idx,
            };
        });
        let allExercises = modifiedCardioLogs.concat(modifiedStrengthLogs).concat(modifiedWorkoutLogs);
        let caloriesBurned = diary.exercise.totalBurnedCalories ? Math.round(diary.exercise.totalBurnedCalories) : 0;
        diarySections.push(<ExerciseSection exerciseLogs={allExercises} date={date} calories={caloriesBurned} />);
    } else {
        diarySections.push(<ExerciseSection exerciseLogs={null} date={date} calories={null} />);
    }

    return <div id="diary">{diarySections}</div>;
}

function MealSection(props) {
    const { mealPosition, mealName, calories, foodLogs, recipeLogs, date, diaryId } = props;
    const navigate = useNavigate();

    let foodItems = [];
    if (foodLogs) {
        for (let i = 0; i < foodLogs.length; i++) {
            const foodLogOnClick = () => {
                const currentDate = getCurrentDate();
                if (date === currentDate) {
                    navigate("/edit-logs/food", {
                        state: {
                            mealPosition: mealPosition,
                            logPosition: i,
                            date: date,
                        },
                        replace: false,
                    });
                } else {
                    navigate(`/edit-logs/food`, {
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

    if (recipeLogs) {
        console.log("recipeLogs", recipeLogs);
        for (let i = 0; i < recipeLogs.length; i++) {
            const recipeLogOnClick = () => {
                const currentDate = getCurrentDate();
                if (date === currentDate) {
                    navigate("/edit-logs/recipe", {
                        state: {
                            mealPosition: mealPosition,
                            logPosition: i,
                            date: date,
                        },
                        replace: false,
                    });
                } else {
                    navigate(`/edit-logs/recipe`, {
                        state: {
                            mealPosition: mealPosition,
                            logPosition: i,
                            date: date,
                        },
                        replace: false,
                    });
                }
            };

            let recipeLog = recipeLogs[i];
            let recipeObject = recipeLog.recipeObject;
            let recipeName = recipeObject.name;
            let totalNutritionalContent = recipeLog.totalNutritionalContent;
            if (!totalNutritionalContent && diaryId) {
                // since this is undefined or null, then you must have deleted the recipe. Send a request to delete this log
                let patchBody = {
                    type: "recipe",
                    action: "deleteLog",
                    contents: {
                        mealPosition: mealPosition,
                        logPosition: i,
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
                        if (res.status !== 200) {
                            throw Error(res.status);
                        }
                    })
                    .catch((err) => console.log("Error in Diary Page: failed to delete logs of now-deleted Recipe"));
                continue;
            }
            let calories = Math.round(totalNutritionalContent.kcal);

            foodItems.push(
                <div key={`${mealName}-recipe-item-${i}`} className="diary-section-item" onClick={recipeLogOnClick}>
                    <div className="diary-section-item-name">
                        <h4>{recipeName}</h4>
                        <p>Created {ConvertTimestampToDate(recipeObject.timestamp)} </p>
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
    const { exerciseLogs, date, calories } = props;
    const navigate = useNavigate();

    let exerciseItems = [];
    if (exerciseLogs) {
        for (let i = 0; i < exerciseLogs.length; i++) {
            let exerciseLog = exerciseLogs[i];

            const exerciseLogOnClick = () => {
                const currentDate = getCurrentDate();
                if (exerciseLog.logType === "strength") {
                    navigate("/edit-logs/strength", {
                        state: {
                            logPosition: exerciseLog.logPosition,
                            date: date,
                        },
                        replace: false,
                    });
                } else if (exerciseLog.logType === "cardio") {
                    navigate(`/edit-logs/cardio`, {
                        state: {
                            logPosition: exerciseLog.logPosition,
                            date: date,
                        },
                        replace: false,
                    });
                } else if (exerciseLog.logType === "workout") {
                    navigate(`/edit-logs/workout`, {
                        state: {
                            logPosition: exerciseLog.logPosition,
                            date: date,
                        },
                        replace: false,
                    });
                }
            };

            let exerciseObject = exerciseLog.exerciseObject;
            let exerciseName = exerciseObject.name;
            let MET_value = exerciseObject.MET;
            let exerciseCalories = exerciseLog.kcal;
            exerciseItems.push(
                <div key={`exercise-item-${i}`} className="diary-section-item" onClick={exerciseLogOnClick}>
                    <div className="diary-section-item-name">
                        <h4>{exerciseName}</h4>
                        <p>MET: {MET_value}</p>
                    </div>
                    <h4>{exerciseCalories}</h4>
                </div>
            );
        }
    }

    const addExerciseOnClick = (e) => {
        e.stopPropagation();
        navigate("/exercise", { state: { date: date } });
    };

    return (
        <div id={"diary-exercise-section"} className="diary-section">
            <div className="diary-section-header">
                <h3>Exercise</h3>
                <h4>{calories ? calories : null}</h4>
            </div>
            <div className="diary-section-items">{exerciseItems}</div>
            <div className="diary-section-add-item" onClick={addExerciseOnClick}>
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
            return `${RoundToNearestN(numServings, 0.1)} ${ToTitleCase(servingName)}`;
        } else {
            // there is a number
            return `${RoundToNearestN(numServings * householdNumber, 0.1)} ${ToTitleCase(servingWords.splice(1).join(" "))}`;
        }
    } else if (Object.keys(builtInUnits).includes(servingName) || servingName === "g" || servingName === "mL") {
        // Here we simply need to check if it is a metric unit or not
        let servingUnit = servingWords[1];
        if (servingUnit === "g" || servingUnit === "mL" || servingName === "g" || servingName === "mL") {
            return `${RoundToNearestN(numServings * quantityMetric, 0.1)} ${servingUnit || servingName}`;
        } else {
            return `${RoundToNearestN(numServings, 0.1)} ${servingUnit}`;
        }
    } else {
        return `${RoundToNearestN(numServings, 0.1)} servings`;
    }
}

function ConvertTimestampToDate(timestamp) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dateObj = new Date(timestamp);
    return `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
}
