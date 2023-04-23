import CalculateTDEE from "./CalculateTDEE";

export default function CalculateGoal(profile) {
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

function RoundToNearestTwenty(x) {
    return Math.round(x / 20) * 20;
}
