import CalculateTDEE from "./CalculateTDEE";

export default function DisplayGoal(profile, currentDiary) {
    // Given a profile, either compute TDEE +/- surplus/deficit, or display the user-set calorie goal
    if (!profile) {
        return 0;
    }

    if (profile.goals.calorieGoal) {
        return profile.goals.calorieGoal;
    } else {
        return CalculateTDEE(profile, currentDiary) + profile.goals.weightDelta * 250;
    }
}
