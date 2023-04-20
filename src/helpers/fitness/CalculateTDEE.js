export default function CalculateTDEE(profile, currentWeightKg) {
    let activityFactor = ActivityLevelMapper(profile.activityLevel);
    let bmr = 0;
    if (profile.percentBodyFat && profile.currentWeightKg) {
        bmr = Katch_McArdle(profile.currentWeightKg, profile.percentBodyFat);
    } else if (profile.currentWeightKg && profile.heightCm && profile.sex) {
        let birthYear = profile.birthdate.substring(0, 4);
        let currYear = new Date().getFullYear();
        let age = Number(currYear) - Number(birthYear);
        bmr = StJeor_Mifflin(profile.currentWeightKg, profile.heightCm, age, profile.sex);
    } else {
        bmr = 2000;
    }

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
        case "manual":
            return 1;
        case "sedentary":
            return 1.15;
        case "light":
            return 1.3;
        case "moderate":
            return 1.5;
        case "heavy":
            return 1.7;
        case "very heavy":
            return 1.9;
        default:
            return 1;
    }
}
