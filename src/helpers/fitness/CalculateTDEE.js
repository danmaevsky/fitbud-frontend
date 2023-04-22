export default function CalculateTDEE(profile) {
    let activityFactor = ActivityLevelMapper(profile.activityLevel);
    let bmr = 0;
    if (profile.currentPercentBodyFat.value && profile.currentWeightKg.value) {
        bmr = Katch_McArdle(profile.currentWeightKg.value, profile.currentPercentBodyFat.value);
    } else if (profile.currentWeightKg.value && profile.heightCm && profile.sex) {
        let birthYear = profile.birthdate.substring(0, 4);
        let currYear = new Date().getFullYear();
        let age = Number(currYear) - Number(birthYear);
        console.log(age);
        bmr = StJeor_Mifflin(profile.currentWeightKg.value, profile.heightCm, age, profile.sex);
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
