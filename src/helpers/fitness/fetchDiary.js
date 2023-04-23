import authFetch from "helpers/auth/authFetch";
import getAllDiaryEntries from "./getAllDiaryEntries";

export default async function fetchDiaryHelper(currentDate, setCurrentDiary, navigate) {
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
