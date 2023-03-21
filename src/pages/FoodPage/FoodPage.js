import "./FoodPage.css";
import { useParams } from "react-router-dom";

export default function FoodPage() {
    const { foodId } = useParams();
    console.log(foodId);
    return <div>Food Page</div>;
}
