import { useState, useEffect } from "react";
import React from "react";
import "./CreateFoodPage.css";
import { authFetch, IsUserLogged } from "helpers/authHelpers";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "hooks/useLocalStorage";
import FormInput from "components/FormInput";
import { getCurrentDate } from "helpers/generalHelpers";

export default function CreateFoodPage() {
  const loggedIn = IsUserLogged();

  if (!loggedIn) {
    return;
  } else {
    let profile = JSON.parse(window.localStorage.profile);
    return (
      <div id="create-food-page-body">
        <div className="food-background-round round-background-decoration"></div>
        <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
        <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
        <div id="create-food-island">
          <div id="create-food-island-header">
            <h2>Add a Food to Our Database</h2>
            <p id="create-food-message-error"></p>
          </div>

          <AddFood profile={profile} />
        </div>
      </div>
    );
  }
}

function AddFood(props) {
  const { profile, setGoals100 } = props;

  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false);

  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [servingQuantity, setServingQuantity] = useState("");
  const [servingQuantityUnit, setServingQuantityUnit] = useState("");
  const [servingName, setServingName] = useState("");
  const [kcal, setKcal] = useState("");
  const [totalCarb, setTotalCarb] = useState("");
  const [totalFat, setTotalFat] = useState("");
  const [protein, setProtein] = useState("");

  const [addedSugar, setAddedSugar] = useState("");
  const [biotin, setBiotin] = useState("");
  const [calcium, setCalcium] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [dietaryFiber, setDietaryFiber] = useState("");
  const [folate, setFolate] = useState("");
  const [iodine, setIodine] = useState("");
  const [iron, setIron] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [monounsaturatedFat, setMonounsaturatedFat] = useState("");
  const [niacin, setNiacin] = useState("");
  const [pantothenicAcid, setPantothenicAcid] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [polyunsaturatedFat, setPolyunsaturatedFat] = useState("");
  const [potassium, setPotassium] = useState("");
  const [riboflavin, setRiboflavin] = useState("");
  const [saturatedFat, setSaturatedFat] = useState("");
  const [selenium, setSelenium] = useState("");
  const [sodium, setSodium] = useState("");
  const [sugarAlcohols, setSugarAlcohols] = useState("");
  const [thiamin, setThiamin] = useState("");
  const [totalSugar, setTotalSugar] = useState("");
  const [transFat, setTransFat] = useState("");
  const [vitaminA, setVitaminA] = useState("");
  const [vitaminB12, setVitaminB12] = useState("");
  const [vitaminB6, setVitaminB6] = useState("");
  const [vitaminC, setVitaminC] = useState("");
  const [vitaminD, setVitaminD] = useState("");
  const [vitaminE, setVitaminE] = useState("");

  const navigate = useNavigate();

  const handleResponse = (res) => {
    if (res.status === 200) {
      return res.json();
    }
    // best way to cancel a Promise chain is to throw an error
    if (res.status === 400) {
      throw new Error(400);
    }
    if (res.status === 500) {
      console.log(res);
      throw new Error(500);
    }
  };

  return (
    <div id="create-food-form-3" className="create-food-island-form">
      <h3>General Information</h3>
      <FormInput
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormInput
        type="text"
        placeholder="Brand Name"
        value={brandName}
        onChange={(e) => setBrandName(e.target.value)}
      />
      <FormInput
        type="text"
        placeholder="Barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <h3>Serving Information</h3>
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Serving Quantity"
        value={servingQuantity}
        onChange={(e) => setServingQuantity(e.target.value)}
      />
      <FormInput
        type="text"
        placeholder="Serving Quantity Unit"
        value={servingQuantityUnit}
        onChange={(e) => setServingQuantityUnit(e.target.value)}
      />
      <FormInput
        type="text"
        placeholder="Serving Name"
        value={servingName}
        onChange={(e) => setServingName(e.target.value)}
      />
      <h3>Major Macros</h3>
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Calories"
        value={kcal}
        onChange={(e) => setKcal(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Carbs"
        value={totalCarb}
        onChange={(e) => setTotalCarb(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Fat"
        value={totalFat}
        onChange={(e) => setTotalFat(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Protein"
        value={protein}
        onChange={(e) => setProtein(e.target.value)}
      />
      <h3>Other Nutrional Content</h3>
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Added Sugars"
        value={addedSugar}
        onChange={(e) => setAddedSugar(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Biotin"
        value={biotin}
        onChange={(e) => setBiotin(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Calcium"
        value={calcium}
        onChange={(e) => setCalcium(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Cholesterol"
        value={cholesterol}
        onChange={(e) => setCholesterol(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Dietary Fiber"
        value={dietaryFiber}
        onChange={(e) => setDietaryFiber(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Folate"
        value={folate}
        onChange={(e) => setFolate(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Iodine"
        value={iodine}
        onChange={(e) => setIodine(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Iron"
        value={iron}
        onChange={(e) => setIron(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Magnesium"
        value={magnesium}
        onChange={(e) => setMagnesium(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Monounsaturated Fat"
        value={monounsaturatedFat}
        onChange={(e) => setMonounsaturatedFat(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Niacin"
        value={niacin}
        onChange={(e) => setNiacin(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Pantothenic Acid"
        value={pantothenicAcid}
        onChange={(e) => setPantothenicAcid(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Phosphorus"
        value={phosphorus}
        onChange={(e) => setPhosphorus(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Polyunsaturated Fat"
        value={polyunsaturatedFat}
        onChange={(e) => setPolyunsaturatedFat(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Potassium"
        value={potassium}
        onChange={(e) => potassium(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Riboflavin"
        value={riboflavin}
        onChange={(e) => setRiboflavin(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Saturated Fat"
        value={saturatedFat}
        onChange={(e) => setSaturatedFat(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Selenium"
        value={selenium}
        onChange={(e) => setSelenium(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Sodium"
        value={sodium}
        onChange={(e) => setSodium(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Sugar Alcohols"
        value={sugarAlcohols}
        onChange={(e) => setSugarAlcohols(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Thiamin"
        value={thiamin}
        onChange={(e) => setThiamin(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Total Sugar"
        value={totalSugar}
        onChange={(e) => setTotalSugar(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Trans Fat"
        value={transFat}
        onChange={(e) => setTransFat(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Vitamin A"
        value={vitaminA}
        onChange={(e) => setVitaminA(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Vitamin B12"
        value={vitaminB12}
        onChange={(e) => setVitaminB12(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Vitamin B6"
        value={vitaminB6}
        onChange={(e) => setVitaminB6(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Vitamin C"
        value={vitaminC}
        onChange={(e) => setVitaminC(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Vitamin D"
        value={vitaminD}
        onChange={(e) => setVitaminD(e.target.value)}
      />
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Vitamin E"
        value={vitaminE}
        onChange={(e) => setVitaminE(e.target.value)}
      />
    </div>
  );
}
