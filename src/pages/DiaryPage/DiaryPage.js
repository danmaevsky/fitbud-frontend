import { useNavigate } from "react-router-dom";
import "./DiaryPage.css";
import addFoodPlus from "assets/add-food-plus.svg";
import useLocalStorage from "hooks/useLocalStorage";
import { getCurrentDate } from "helpers/generalHelpers";
import { useEffect } from "react";
import { CalculateGoal, ToTitleCase, ProcessFoodName, ProcessNutritionalContents, ProcessUnit, fetchDiaryHelper } from "helpers/fitnessHelpers";

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

function Diary(props) {
    const { currentDiary, profile } = props;

    let mealSections = [];
    for (let i = 0; i < profile.preferences.mealNames.length; i++) {
        let mealName = profile.preferences.mealNames[i];
        if (mealName && currentDiary) {
            mealSections.push(<MealSection key={"mealSection" + i} mealName={mealName} />);
        } else if (mealName) {
            mealSections.push(<MealSection key={"mealSection" + i} mealName={mealName} />);
        }
    }

    return <div id="diary">{mealSections}</div>;
}

function MealSection(props) {
    const { mealName, calories, foodLogs } = props;
    let foodItems = [];
    if (foodLogs) {
        for (let i = 0; i < foodLogs.length; i++) {
            let foodObject = foodLogs[i].foodObject;
            let foodName = ProcessFoodName(foodObject.name);
            let brand = foodObject.brandName ? ToTitleCase(foodObject.brandName) : foodObject.brandOwner ? ToTitleCase(foodObject.brandOwner) : null;

            foodItems.push(<div className="diary-meal-section-food-item"></div>);
        }
    }

    return (
        <div id={"diary-" + mealName + "-section"} className="diary-meal-section">
            <div className="diary-meal-section-header">
                <h3>{mealName}</h3>
                <h3>{calories ? calories : null}</h3>
            </div>
            <div className="diary-meal-section-foods"></div>
            <div className="diary-meal-section-add-food">
                <button>
                    <img src={addFoodPlus} />
                </button>
                <label>Add Food</label>
            </div>
        </div>
    );
}

function ExerciseSection(props) {}
