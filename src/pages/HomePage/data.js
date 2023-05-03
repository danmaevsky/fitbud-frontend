import{v4 as uuidv4} from "uuid";

export const data = [
    {
        id: uuidv4(),
        question:"How do we calculate macros?",
        answer:"The average energy/gram values for carbohydrates, proteins, and fats given as 4 kcal/g for carbohydrates, 4 kcal/g for proteins, and 9 kcal/gram for fats."
    },
    {
        id: uuidv4(),
        question:"What are the specifics behind the Atwater Factors?",
        answer:"The corrected Atwater General Factors that are specific to each food, used to take into account the variation in caloric content of different kinds of carbs, proteins, and fats. Can range from 2.5 to 4.5 kcal/g for carbs and proteins for example, depending on the food."
    },
    {
        id: uuidv4(),
        question:"What are the benefits of joining the fitBud. family?",
        answer:" With a fitBud. accout you are able to not only log your workouts and meals, but it gives you the oppertunity to track your fitness and wellness progress over time as you see fit. Another neat feature that comes with an account is the ability to create your own personal meals, workouts, and food entires for ease of use and the ultimate customization options to fit your life style. We use the latest and greatest scince backed formulas to calculate your individual caloric needs."
    },
]