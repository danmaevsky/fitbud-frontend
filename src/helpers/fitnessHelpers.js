// imports
import { authFetch } from "helpers/authHelpers";

/* Goal Calculation Utility Functions */
export function CalculateGoal(profile) {
    // Given a profile, either compute TDEE +/- surplus/deficit, or display the user-set calorie goal
    if (!profile) {
        return 0;
    }

    if (profile.goals.calorieGoal) {
        return profile.goals.calorieGoal;
    } else {
        return RoundToNearestTwenty(CalculateTDEE(profile) + profile.goals.weightDelta * 250);
    }
}

export function CalculateBMR(profile) {
    let bmr = 0;
    if (profile.currentPercentBodyFat.value && profile.currentWeightKg.value) {
        bmr = Katch_McArdle(profile.currentWeightKg.value, profile.currentPercentBodyFat.value);
        // console.log("BMR calculated with Katch-McArdle");
    } else if (profile.currentWeightKg.value && profile.heightCm && profile.sex) {
        let birthYear = profile.birthdate.substring(0, 4);
        let currYear = new Date().getFullYear();
        let age = Number(currYear) - Number(birthYear);
        bmr = StJeor_Mifflin(profile.currentWeightKg.value, profile.heightCm, age, profile.sex);
        // console.log("BMR calculated with St.Jeor-Mifflin");
    } else {
        bmr = 2000;
    }

    return bmr;
}

function CalculateTDEE(profile) {
    let activityFactor = ActivityLevelMapper(profile.activityLevel);
    let bmr = CalculateBMR(profile);

    return activityFactor * bmr;
}

function Katch_McArdle(weightKg, percentBodyFat) {
    return 370 + 21.6 * weightKg * (1 - percentBodyFat);
}

function StJeor_Mifflin(weightKg, heightCm, age, sex) {
    if (sex === "male") {
        return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    } else if (sex === "female") {
        return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    } else {
        return 0;
    }
}

function ActivityLevelMapper(activityLevel) {
    switch (activityLevel) {
        case "sedentary":
            return 1.3;
        case "light":
            return 1.5;
        case "moderate":
            return 1.7;
        case "heavy":
            return 1.9;
        case "very heavy":
            return 2.1;
        default:
            return 1.3;
    }
}

/* Diary Fetching and Processing Helpers */
export async function fetchDiaryHelper(currentDate, setCurrentDiary, navigate) {
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
            if (error.message === "404") {
                setCurrentDiary(null);
                return;
            }
            console.log(error, resStatus);
        });
}

export async function getAllDiaryEntries(diary, navigate) {
    let processedDiary = diary;
    let All_Promises = [];

    // Handling all 6 Meals: Food & Recipes
    for (let m = 1; m <= 6; m++) {
        let meal = "meal" + m;
        for (let i = 0; i < diary[meal].foodLogs.length; i++) {
            let log = diary[meal].foodLogs[i];
            let resStatus;
            let promise = fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/${log.foodId}`, {
                method: "GET",
            })
                .then((res) => {
                    resStatus = res.status;
                    return res.json();
                })
                .then((json) => {
                    // counting calories, macros, and micros right here
                    // Note: quantityMetric is per serving, still need to multiply by numServings
                    processedDiary[meal].foodLogs[i].foodObject = json;
                    let totalNutritionalContent = {};

                    const defaultUnitRounding = log.quantityMetric === Math.round(json.servingQuantity / 0.001) * 0.001;

                    totalNutritionalContent = ProcessNutritionalContents(
                        json.nutritionalContent,
                        log.quantityMetric,
                        log.numServings,
                        defaultUnitRounding
                    );

                    processedDiary[meal].foodLogs[i].totalNutritionalContent = totalNutritionalContent;
                })
                .catch((error) => {
                    console.log(error, resStatus);
                });

            All_Promises.push(promise);
        }
        for (let i = 0; i < diary[meal].recipeLogs.length; i++) {
            let log = diary[meal].recipeLogs[i];
            let resStatus;
            let promise = authFetch(
                `${process.env.REACT_APP_GATEWAY_URI}/recipes/${log.recipeId}`,
                {
                    method: "GET",
                },
                navigate
            )
                .then((res) => {
                    resStatus = res.status;
                    return res.json();
                })
                .then((json) => {
                    processedDiary[meal].recipeLogs[i].recipeObject = json;

                    let totalNutritionalContent = {};

                    totalNutritionalContent = ProcessRecipeNutritionalContents(json, log.numServings);

                    processedDiary[meal].recipeLogs[i].totalNutritionalContent = totalNutritionalContent;
                })
                .catch((error) => {
                    console.log(error, resStatus);
                });

            All_Promises.push(promise);
        }
    }

    // Handling Exercise: Cardio, Strength, & Workouts
    for (let i = 0; i < diary.exercise.strengthLogs.length; i++) {
        let log = diary.exercise.strengthLogs[i];
        let resStatus;
        let promise = authFetch(
            `${process.env.REACT_APP_GATEWAY_URI}/exercise/strength/${log.exerciseId}`,
            {
                method: "GET",
            },
            navigate
        )
            .then((res) => {
                resStatus = res.status;
                return res.json();
            })
            .then((json) => {
                processedDiary.exercise.strengthLogs[i].exerciseObject = json;
            })
            .catch((error) => {
                console.log(error, resStatus);
            });

        All_Promises.push(promise);
    }
    for (let i = 0; i < diary.exercise.cardioLogs.length; i++) {
        let log = diary.exercise.cardioLogs[i];
        let resStatus;
        let promise = authFetch(
            `${process.env.REACT_APP_GATEWAY_URI}/exercise/cardio/${log.exerciseId}`,
            {
                method: "GET",
            },
            navigate
        )
            .then((res) => {
                resStatus = res.status;
                return res.json();
            })
            .then((json) => {
                processedDiary.exercise.cardioLogs[i].exerciseObject = json;
            })
            .catch((error) => {
                console.log(error, resStatus);
            });

        All_Promises.push(promise);
    }
    for (let i = 0; i < diary.exercise.workoutLogs.length; i++) {
        let log = diary.exercise.workoutLogs[i];
        let resStatus;
        let promise = authFetch(
            `${process.env.REACT_APP_GATEWAY_URI}/workouts/${log.workoutId}`,
            {
                method: "GET",
            },
            navigate
        )
            .then((res) => {
                resStatus = res.status;
                return res.json();
            })
            .then((json) => {
                processedDiary.exercise.workoutLogs[i].workoutObject = json;
            })
            .catch((error) => {
                console.log(error, resStatus);
            });

        All_Promises.push(promise);
    }

    return Promise.all(All_Promises).then(() => {
        return CountExerciseCalories(CountNutrientsPerMeal(processedDiary));
    });
}

function CountNutrientsPerMeal(diary) {
    // Handling all 6 Meals: Food & Recipes
    let totalDiaryNutritionalContents = null;
    for (let m = 1; m <= 6; m++) {
        let meal = "meal" + m;
        let totalMealNutrients = null;
        for (let i = 0; i < diary[meal].foodLogs.length; i++) {
            let log = diary[meal].foodLogs[i];
            if (totalMealNutrients) {
                totalMealNutrients = AddNutrients(totalMealNutrients, log.totalNutritionalContent);
            } else {
                totalMealNutrients = log.totalNutritionalContent;
            }
        }

        for (let i = 0; i < diary[meal].recipeLogs.length; i++) {
            let log = diary[meal].recipeLogs[i];
            if (totalMealNutrients) {
                totalMealNutrients = AddNutrients(totalMealNutrients, log.totalNutritionalContent);
            } else {
                totalMealNutrients = log.totalNutritionalContent;
            }
        }

        diary[meal].totalMealNutritionalContent = totalMealNutrients;
        if (totalMealNutrients) {
            if (totalDiaryNutritionalContents) {
                totalDiaryNutritionalContents = AddNutrients(totalDiaryNutritionalContents, totalMealNutrients);
            } else {
                totalDiaryNutritionalContents = totalMealNutrients;
            }
        }
    }

    diary.totalDiaryNutritionalContents = totalDiaryNutritionalContents;

    // Handling Exercise: Cardio, Strength, & Workouts
    // for (let i = 0; i < diary.exercise.strengthLogs.length; i++) {
    //     let log = diary.exercise.strengthLogs[i];
    // }
    // for (let i = 0; i < diary.exercise.cardioLogs.length; i++) {
    //     let log = diary.exercise.cardioLogs[i];
    // }
    // for (let i = 0; i < diary.exercise.workoutLogs.length; i++) {
    //     let log = diary.exercise.workoutLogs[i];
    // }
    return diary;
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

function CountExerciseCalories(diary) {
    let totalBurnedCalories = 0;
    // Handling Exercise: Cardio, Strength, & Workouts
    for (let i = 0; i < diary.exercise.strengthLogs.length; i++) {
        let log = diary.exercise.strengthLogs[i];
        totalBurnedCalories += log.kcal;
    }
    for (let i = 0; i < diary.exercise.cardioLogs.length; i++) {
        let log = diary.exercise.cardioLogs[i];
        totalBurnedCalories += log.kcal;
    }
    for (let i = 0; i < diary.exercise.workoutLogs.length; i++) {
        let log = diary.exercise.workoutLogs[i];
        totalBurnedCalories += log.kcal;
    }
    diary.exercise.totalBurnedCalories = totalBurnedCalories;
    return diary;
}

export function DiaryHasMealEntries(currentDiary) {
    if (!currentDiary) {
        return false;
    }

    if (
        !currentDiary.meal1.totalMealNutritionalContent &&
        !currentDiary.meal2.totalMealNutritionalContent &&
        !currentDiary.meal3.totalMealNutritionalContent &&
        !currentDiary.meal4.totalMealNutritionalContent &&
        !currentDiary.meal5.totalMealNutritionalContent &&
        !currentDiary.meal6.totalMealNutritionalContent
    ) {
        return false;
    }

    return true;
}

export function DiaryHasExerciseEntries(currentDiary) {
    if (!currentDiary) {
        return false;
    }

    if (!currentDiary.exercise.totalBurnedCalories) {
        return false;
    }

    return true;
}

/* The returned processDiary will look like
processedDiary := {}

*/

/* Food Utility Functions */
export function ToTitleCase(x) {
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

export function ProcessFoodName(x) {
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

function GetPhrases(s, ans, offset) {
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

export function ProcessUnit(unit) {
    if (unit === "ml") {
        return "mL";
    }
    return unit;
}

export function ProcessNutritionalContents(nutritionalContents, metricQuantity, numServings, defaultUnitRounding) {
    /*
    This function is used for processing nutrients and rounding them appropriately according the serving size.
    If the serving size is the same as what came from the database i.e. the same as on a nutrition label,
    it would look better if the calories were rounded to the nearest 5 and the macros were rounded to the 
    nearest 1. That is the purpose of passing in "defaultUnitRounding"
    */
    let precision = defaultUnitRounding ? 0 : 1;
    let nutrients = {};
    Object.keys(nutritionalContents).forEach((key) => {
        // console.log(key, ":", nutritionalContents[key]);
        if (key === "kcal") return (nutrients[key] = Number((nutritionalContents[key] / 100) * metricQuantity));
        nutrients[key] = Number(((nutritionalContents[key] / 100) * metricQuantity * numServings).toFixed(precision));
    });
    nutrients.kcal = defaultUnitRounding ? RoundToNearestFive(nutrients.kcal) * numServings : nutrients.kcal * numServings;
    nutrients.kcal = nutrients.kcal > 25_000 ? nutrients.kcal.toExponential(2) : nutrients.kcal.toFixed(0);
    // console.log(nutrients);
    return nutrients;
}

export function TallyRecipeNutrients(nutrients, recipeNumServings, numServings) {
    let totalRecipeNutrients = null;
    for (let i = 0; i < nutrients.length; i++) {
        totalRecipeNutrients = AddNutrients(totalRecipeNutrients, nutrients[i]);
    }

    if (totalRecipeNutrients) {
        Object.keys(totalRecipeNutrients).forEach((nutrient) => {
            let precision = nutrient === "kcal" ? 0 : 1;
            totalRecipeNutrients[nutrient] = ((Number(totalRecipeNutrients[nutrient]) / recipeNumServings) * numServings).toFixed(precision);
        });
    }
    return totalRecipeNutrients;
}

export function ProcessRecipeNutritionalContents(recipeResponse, numServings) {
    let nutrients = recipeResponse.ingredients.map((ingredient) => {
        return ProcessNutritionalContents(ingredient.food.nutritionalContent, ingredient.quantityMetric, ingredient.numServings, false);
    });

    return TallyRecipeNutrients(nutrients, recipeResponse.numServings, numServings);
}

export function GetBuiltInUnits(defaultMetricUnit) {
    if (defaultMetricUnit === "ml") {
        return {
            "1 mL": 1,
            "1 L": 1000,
            "1 tsp": 4.92892,
            "1 tbsp": 14.7868,
            "1 fl oz": 29.5735,
            "1 cup": 236.588,
        };
    } else {
        return {
            "1 g": 1,
            "1 kg": 1000,
            "1 oz": 28,
            "1 lb": 28 * 16,
        };
    }
}

/* Math Helpers */
function RoundToNearestTwenty(x) {
    return Math.round(x / 20) * 20;
}
function RoundToNearestFive(x) {
    return Math.round(x / 5) * 5;
}
export function RoundToNearestN(x, n) {
    return Math.round(x / n) * n;
}
