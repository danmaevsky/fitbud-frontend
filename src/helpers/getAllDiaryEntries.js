import authFetch from "./authFetch";

export default async function getAllDiaryEntries(diary) {
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
                    processedDiary[meal].foodLogs[i].foodObject = json;
                })
                .catch((error) => {
                    console.log(error, resStatus);
                });

            All_Promises.push(promise);
        }
        for (let i = 0; i < diary[meal].recipeLogs.length; i++) {
            let log = diary[meal].recipeLogs[i];
            let resStatus;
            let promise = authFetch(`${process.env.REACT_APP_GATEWAY_URI}/recipes/${log.recipeId}`, {
                method: "GET",
            })
                .then((res) => {
                    resStatus = res.status;
                    return res.json();
                })
                .then((json) => {
                    processedDiary[meal].recipeLogs[i].recipeObject = json;
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
        let promise = authFetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/strength/${log.exerciseId}`, {
            method: "GET",
        })
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
        let promise = authFetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/cardio/${log.exerciseId}`, {
            method: "GET",
        })
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
        let promise = authFetch(`${process.env.REACT_APP_GATEWAY_URI}/workouts/${log.workoutId}`, {
            method: "GET",
        })
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
        return processedDiary;
    });
}
