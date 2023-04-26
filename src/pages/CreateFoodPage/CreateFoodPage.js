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
  const [message, setMessage] = useState("");

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
            <p id="create-food-message-error">{message ? message : ""}</p>
          </div>
          <AddFood profile={profile} setMessage={setMessage} />
        </div>
      </div>
    );
  }
}

function AddFood(props) {
  const { profile, setMessage, setSuccessMessage } = props;

  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false);

  const [name, setName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [servingQuantity, setServingQuantity] = useState("");
  const [servingQuantityUnit, setServingQuantityUnit] = useState("g");
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
    if (res.status === 201) {
      return res.json();
    }
    // best way to cancel a Promise chain is to throw an error
    if (res.status === 400) {
      setMessage("Bad Request");
      throw new Error(400);
    }
    if (res.status === 500) {
      console.log(res);
      setMessage("Something went wrong. Try again later!");
      throw new Error(500);
    }
  };

  const createFoodOnClick = () => {
    if (isAttemptingFetch) {
      return;
    }
    setIsAttemptingFetch(true);

    if (name === "" || brandName === "") {
      setMessage("Name and Brand can not be blank!");
      setIsAttemptingFetch(false);
      return;
    } else if (
      kcal === "" ||
      totalCarb === "" ||
      totalFat === "" ||
      protein === ""
    ) {
      setMessage("Major Macro Fields can not be blank!");
      setIsAttemptingFetch(false);
      return;
    } else if (
      servingQuantity === "" ||
      servingQuantityUnit === "" ||
      servingName === ""
    ) {
      setMessage("Serving Information can not be blank!");
      setIsAttemptingFetch(false);
      return;
    }

    const newFood = {
      name: name,
      brandName: brandName,
      brandOwner: null,
      barcode: barcode !== "" ? barcode : null,
      userId: profile._id,
      servingQuantity: servingQuantity,
      servingQuantityUnit: servingQuantityUnit,
      servingName: servingName,
      nutritionalContent: {
        kcal:
          kcal !== "" ? (kcal >= 0 ? (kcal / servingQuantity) * 100 : 0) : null,
        totalFat:
          totalFat !== ""
            ? totalFat >= 0
              ? (totalFat / servingQuantity) * 100
              : 0
            : null,
        saturatedFat:
          saturatedFat !== ""
            ? saturatedFat >= 0
              ? (saturatedFat / servingQuantity) * 100
              : 0
            : null,
        transFat:
          transFat !== ""
            ? transFat >= 0
              ? (transFat / servingQuantity) * 100
              : 0
            : null,
        polyunsaturatedFat:
          polyunsaturatedFat !== ""
            ? polyunsaturatedFat >= 0
              ? (polyunsaturatedFat / servingQuantity) * 100
              : 0
            : null,
        monounsaturatedFat:
          monounsaturatedFat !== ""
            ? monounsaturatedFat >= 0
              ? (monounsaturatedFat / servingQuantity) * 100
              : 0
            : null,
        cholesterol:
          cholesterol !== ""
            ? cholesterol >= 0
              ? (cholesterol / servingQuantity) * 100
              : 0
            : null,
        sodium:
          sodium !== ""
            ? sodium >= 0
              ? (sodium / servingQuantity) * 100
              : 0
            : null,
        totalCarb:
          totalCarb !== ""
            ? totalCarb >= 0
              ? (totalCarb / servingQuantity) * 100
              : 0
            : null,
        dietaryFiber:
          dietaryFiber !== ""
            ? dietaryFiber >= 0
              ? (dietaryFiber / servingQuantity) * 100
              : 0
            : null,
        totalSugar:
          totalSugar !== ""
            ? totalSugar >= 0
              ? (totalSugar / servingQuantity) * 100
              : 0
            : null,
        addedSugar:
          addedSugar !== ""
            ? addedSugar >= 0
              ? (addedSugar / servingQuantity) * 100
              : 0
            : null,
        sugarAlcohols:
          sugarAlcohols !== ""
            ? sugarAlcohols >= 0
              ? (sugarAlcohols / servingQuantity) * 100
              : 0
            : null,
        protein:
          protein !== ""
            ? protein >= 0
              ? (protein / servingQuantity) * 100
              : 0
            : null,
        vitaminD:
          vitaminD !== ""
            ? vitaminD >= 0
              ? (vitaminD / servingQuantity) * 100
              : 0
            : null,
        calcium:
          calcium !== ""
            ? calcium >= 0
              ? (calcium / servingQuantity) * 100
              : 0
            : null,
        iron: iron !== "" ? (iron >= 0 ? iron : 0) : null,
        potassium:
          potassium !== ""
            ? potassium >= 0
              ? (potassium / servingQuantity) * 100
              : 0
            : null,
        vitaminA:
          vitaminA !== ""
            ? vitaminA >= 0
              ? (vitaminA / servingQuantity) * 100
              : 0
            : null,
        vitaminC:
          vitaminC !== ""
            ? vitaminC >= 0
              ? (vitaminC / servingQuantity) * 100
              : 0
            : null,
        vitaminE:
          vitaminE !== ""
            ? vitaminE >= 0
              ? (vitaminE / servingQuantity) * 100
              : 0
            : null,
        thiamin:
          thiamin !== ""
            ? thiamin >= 0
              ? (thiamin / servingQuantity) * 100
              : 0
            : null,
        riboflavin:
          riboflavin !== ""
            ? riboflavin >= 0
              ? (riboflavin / servingQuantity) * 100
              : 0
            : null,
        niacin:
          niacin !== ""
            ? niacin >= 0
              ? (niacin / servingQuantity) * 100
              : 0
            : null,
        vitaminB6:
          vitaminB6 !== ""
            ? vitaminB6 >= 0
              ? (vitaminB6 / servingQuantity) * 100
              : 0
            : null,
        folate:
          folate !== ""
            ? folate >= 0
              ? (folate / servingQuantity) * 100
              : 0
            : null,
        vitaminB12:
          vitaminB12 !== ""
            ? vitaminB12 >= 0
              ? (vitaminB12 / servingQuantity) * 100
              : 0
            : null,
        biotin:
          biotin !== ""
            ? biotin >= 0
              ? (biotin / servingQuantity) * 100
              : 0
            : null,
        pantothenicAcid:
          pantothenicAcid !== ""
            ? pantothenicAcid >= 0
              ? (pantothenicAcid / servingQuantity) * 100
              : 0
            : null,
        phosphorus:
          phosphorus !== ""
            ? phosphorus >= 0
              ? (phosphorus / servingQuantity) * 100
              : 0
            : null,
        iodine:
          iodine !== ""
            ? iodine >= 0
              ? (iodine / servingQuantity) * 100
              : 0
            : null,
        magnesium:
          magnesium !== ""
            ? magnesium >= 0
              ? (magnesium / servingQuantity) * 100
              : 0
            : null,
        selenium:
          selenium !== ""
            ? selenium >= 0
              ? (selenium / servingQuantity) * 100
              : 0
            : null,
      },
      isVerified: false,
    };

    console.log(newFood);

    authFetch(
      `${process.env.REACT_APP_GATEWAY_URI}/food`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newFood),
      },
      navigate
    )
      .then(handleResponse)
      .then((json) => {
        setIsAttemptingFetch(false);
        navigate(`/food/${json._id}`);
      })
      .catch((err) => {
        console.log(err);
        setIsAttemptingFetch(false);
      });
  };

  return (
    <div id="create-food-form-3" className="create-food-island-form">
      <h3>General Information</h3>
      <p>
        Please enter the Name and Brand Information of the food item. The
        Barcode is optional
      </p>
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
      <p>
        These fields are to enter the serving size information. These fields are
        required.
      </p>
      <FormInput
        type="Number"
        inputMode="decimal"
        placeholder="Serving Quantity (Metric)"
        value={servingQuantity}
        onChange={(e) => setServingQuantity(e.target.value)}
      />
      <label id="create-food-form-sex-label">Serving Quantity Unit (Metric)</label>
      <div className="create-food-form-choices">
        <button
          id="create-food-form-unit-choice-imperial"
          className={`create-food-form-choice-left create-food-form-choice-button${
            servingQuantityUnit === "g" ? "-active" : ""
          }`}
          onClick={() => {
            setServingQuantityUnit("g");
          }}
        >
          g
        </button>
        <button
          id="create-food-form-unit-choice-metric"
          className={`create-food-form-choice-right create-food-form-choice-button${
            servingQuantityUnit === "ml" ? "-active" : ""
          }`}
          onClick={() => {
            setServingQuantityUnit("ml");
          }}
        >
          mL
        </button>
      </div>
      <FormInput
        type="text"
        placeholder="Serving Name"
        value={servingName}
        onChange={(e) => setServingName(e.target.value)}
      />
      <h3>Major Macros</h3>
      <p>
        These fields are to enter the major macro information. These fields are
        required.
      </p>
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
      <p>
        These fields are to enter the additonal nutrional content. They are
        optional.
      </p>
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
        onChange={(e) => setPotassium(e.target.value)}
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
      <button id="create-food-button" onClick={createFoodOnClick}>
        Create Food
      </button>
    </div>
  );
}
