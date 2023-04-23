export default function getCurrentDate() {
    const dateObj = new Date();
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
}

function pad(number) {
    if (String(number).length < 2) {
        return "0" + number;
    } else {
        return number;
    }
}
