import { useState, useEffect } from "react";
import React from "react";
import "./ProfilePage.css";
import { authFetch, IsUserLogged } from "helpers/authHelpers";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "hooks/useLocalStorage";
import UpdateFormInput from "components/UpdateFormInput";
import { getCurrentDate } from "helpers/generalHelpers";

export default function ProfilePage() {
  const [goals100, setGoals100] = useState(true);
  const loggedIn = IsUserLogged();

  if (!loggedIn) {
    return;
  } else {
    let profile = JSON.parse(window.localStorage.profile);
    return (
      <div id="signup-page-body">
        <div className="profile-background-round round-background-decoration"></div>
        <div className="profile-background-top-banner bottom-top-banner-background-decoration"></div>
        <div className="profile-background-bottom-banner bottom-bot-banner-background-decoration"></div>
        <div id="signup-island">
          <div id="signup-island-header">
            <h2>Profile</h2>
            <p id="signup-message-error">
              {goals100 ? null : "Macro Percentages must add to 100%"}
            </p>
          </div>

          <Settings profile={profile} setGoals100={setGoals100} />
        </div>
      </div>
    );
  }
}

function Settings(props) {
  const { profile, setGoals100 } = props;
  const [unitPreference, setUnitPreference] = useState(
    profile.preferences.unitPreference
  );

  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false);
  const navigate = useNavigate();

  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [percentBodyFat, setPercentBodyFat] = useState("");
  const [activityLevel, setActivityLevel] = useState(profile.activityLevel);

  const [meal0, setMeal0] = useState(profile.preferences.mealNames[0]);
  const [meal1, setMeal1] = useState(profile.preferences.mealNames[1]);
  const [meal2, setMeal2] = useState(profile.preferences.mealNames[2]);
  const [meal3, setMeal3] = useState(profile.preferences.mealNames[3]);
  const [meal4, setMeal4] = useState(profile.preferences.mealNames[4]);
  const [meal5, setMeal5] = useState(profile.preferences.mealNames[5]);

  const [carbGoalPercent, setCarbGoalPercent] = useState("");
  const [fatGoalPercent, setFatGoalPercent] = useState("");
  const [proteinGoalPercent, setProteinGoalPercent] = useState("");

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

  const updateProfileOnClick = () => {
    if (isAttemptingFetch) {
      return;
    }
    setIsAttemptingFetch(true);

    const updatedProfile = {
      _id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      hasProfilePicture: profile.hasProfilePicture,
      date: getCurrentDate(),
      birthdate: profile.birthdate,
      sex: profile.sex,
      heightCm:
        height !== ""
          ? unitPreference === "imperial"
            ? height * 2.54
            : height
          : profile.heightCm,
      startWeightKg: profile.startWeightKg,
      startingPercentBodyFat: profile.startingPercentBodyFat,
      currentWeightKg: {
        value:
          currentWeight !== ""
            ? unitPreference === "imperial"
              ? currentWeight / 2.2
              : currentWeight
            : profile.currentWeightKg.value,
        date: currentWeight ? getCurrentDate() : profile.currentWeightKg.date,
      },
      currentPercentBodyFat: {
        value:
          percentBodyFat !== ""
            ? percentBodyFat / 100
            : profile.currentPercentBodyFat.value,
        date: percentBodyFat
          ? getCurrentDate()
          : profile.currentPercentBodyFat.date,
      },
      activityLevel: activityLevel,
      goals: {
        weightGoal: profile.goals.weightGoal,
        calorieGoal: profile.goals.calorieGoal,
        weightDelta: profile.goals.weightDelta,
        macroBreakdown: {
          carbs:
            carbGoalPercent === ""
              ? profile.goals.macroBreakdown.carbs
              : carbGoalPercent / 100,
          fat:
            fatGoalPercent === ""
              ? profile.goals.macroBreakdown.fat
              : fatGoalPercent / 100,
          protein:
            proteinGoalPercent === ""
              ? profile.goals.macroBreakdown.protein
              : proteinGoalPercent / 100,
        },
      },
      preferences: {
        Location: profile.preferences.Location,
        unitPreference: unitPreference,
        mealNames: [meal0, meal1, meal2, meal3, meal4, meal5],
      },
    };

    if (
      updatedProfile.goals.macroBreakdown.carbs +
        updatedProfile.goals.macroBreakdown.fat +
        updatedProfile.goals.macroBreakdown.protein !==
      1
    ) {
      setGoals100(false);
      setIsAttemptingFetch(false);
      return;
    }

    authFetch(
      `${process.env.REACT_APP_GATEWAY_URI}/profile/users`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      },
      navigate
    )
      .then(handleResponse)
      .then(() => {
        return authFetch(
          `${process.env.REACT_APP_GATEWAY_URI}/profile/users`,
          {
            method: "GET",
          },
          navigate
        );
      })
      .then((res) => res.json())
      .then((json) => {
        window.localStorage.profile = JSON.stringify(json);
        setIsAttemptingFetch(false);
        window.location.reload();
      });
  };

  const inputCarbOnChange = (e) => {
    let n = Number(e.target.value);
    if (n === "") {
      setCarbGoalPercent("");
    } else if (n >= 0 && n <= 100) {
      setCarbGoalPercent(e.target.value);
    }
  };

  const inputCarbOnBlur = () => {
    if (carbGoalPercent === "") {
      setCarbGoalPercent("");
      return;
    } else if (carbGoalPercent <= 0) {
      setCarbGoalPercent(0);
      return;
    } else if (carbGoalPercent >= 100) {
      setCarbGoalPercent(100);
      return;
    }
    return;
  };

  const inputFatOnChange = (e) => {
    let n = Number(e.target.value);
    if (n === "") {
      setFatGoalPercent("");
    } else if (n >= 0 && n <= 100) {
      setFatGoalPercent(e.target.value);
    }
  };

  const inputFatOnBlur = () => {
    if (fatGoalPercent === "") {
      setFatGoalPercent("");
      return;
    } else if (fatGoalPercent <= 0) {
      setFatGoalPercent(0);
      return;
    } else if (fatGoalPercent >= 100) {
      setFatGoalPercent(100);
      return;
    }
    return;
  };

  const inputProteinOnChange = (e) => {
    let n = Number(e.target.value);
    if (n === "") {
      setProteinGoalPercent("");
    } else if (n >= 0 && n <= 100) {
      setProteinGoalPercent(e.target.value);
    }
  };

  const inputProteinOnBlur = () => {
    if (proteinGoalPercent === "") {
      setProteinGoalPercent("");
      return;
    } else if (proteinGoalPercent <= 0) {
      setProteinGoalPercent(0);
      return;
    } else if (proteinGoalPercent >= 100) {
      setProteinGoalPercent(100);
      return;
    }
    return;
  };

  const inputBodyFatPercentOnChange = (e) => {
    let n = Number(e.target.value);
    if (n === "") {
      setPercentBodyFat("");
    } else if (n >= 0 && n <= 100) {
      setPercentBodyFat(e.target.value);
    }
  };

  const inputBodyFatPercentOnBlur = () => {
    if (percentBodyFat === "") {
      setPercentBodyFat("");
      return;
    } else if (percentBodyFat <= 0) {
      setPercentBodyFat(0);
      return;
    } else if (percentBodyFat >= 100) {
      setPercentBodyFat(100);
      return;
    }
    return;
  };

  const inputHeightOnChange = (e) => {
    let n = Number(e.target.value);
    if (n === "") {
      setHeight("");
    } else if (n >= 0) {
      setHeight(e.target.value);
    }
  };

  const inputHeightOnBlur = () => {
    if (height === "") {
      setHeight("");
      return;
    } else if (height <= 0) {
      setHeight(0);
      return;
    }
  };

  const inputWeightOnChange = (e) => {
    let n = Number(e.target.value);
    if (n === "") {
      setCurrentWeight("");
    } else if (n >= 0) {
      setCurrentWeight(e.target.value);
    }
  };

  const inputWeightOnBlur = () => {
    if (currentWeight === "") {
      setCurrentWeight("");
      return;
    } else if (currentWeight <= 0) {
      setCurrentWeight(0);
      return;
    }
  };

  return (
    <div id="signup-form-3" className="signup-island-form">
      <ProfilePic profile={profile} />
      <h2> Metrics </h2>
      <label id="signup-form-sex-label">Unit Preference</label>
      <div className="signup-form-choices">
        <button
          id="signup-form-unit-choice-imperial"
          className={`signup-form-choice-left signup-form-choice-button${
            unitPreference === "imperial" ? "-active" : ""
          }`}
          onClick={() => {
            setUnitPreference("imperial");
            if (height === "") {
              setHeight("");
            } else {
              setHeight(Math.round((height / 2.54) * 10) / 10);
            }
            if (currentWeight === "") {
              setCurrentWeight("");
            } else {
              setCurrentWeight(Math.round(currentWeight * 2.2 * 10) / 10);
            }
          }}
        >
          Imperial
        </button>
        <button
          id="signup-form-unit-choice-metric"
          className={`signup-form-choice-right signup-form-choice-button${
            unitPreference === "metric" ? "-active" : ""
          }`}
          onClick={() => {
            setUnitPreference("metric");
            if (height === "") {
              setHeight("");
            } else {
              setHeight(Math.round(height * 2.54 * 10) / 10);
            }
            if (currentWeight === "") {
              setCurrentWeight("");
            } else {
              setCurrentWeight(Math.round((currentWeight / 2.2) * 10) / 10);
            }
          }}
        >
          Metric
        </button>
      </div>
      <UpdateFormInput
        type="number"
        inputMode="decimal"
        label={
          unitPreference === "imperial" ? "Height (inches)" : "Height (cm)"
        }
        placeholder={
          (unitPreference === "imperial"
            ? profile.heightCm / 2.54
            : profile.heightCm) +
          (unitPreference === "imperial" ? " inches" : " cm")
        }
        value={height}
        onClick={(e) => e.target.select()}
        onChange={inputHeightOnChange}
        onBlur={inputHeightOnBlur}
      />
      <UpdateFormInput
        type="number"
        inputMode="decimal"
        label={unitPreference === "imperial" ? "Weight (lbs)" : "Weight (kg)"}
        placeholder={
          (unitPreference === "imperial"
            ? Math.round(profile.currentWeightKg.value * 2.2 * 10) / 10
            : Math.round(profile.currentWeightKg.value * 10) / 10) +
          (unitPreference === "imperial" ? " lbs" : " kg")
        }
        value={currentWeight}
        onClick={(e) => e.target.select()}
        onChange={inputWeightOnChange}
        onBlur={inputWeightOnBlur}
      />
      <p>
        If you know it, giving us your % Body Fat allows us to use a more
        accurate formula to calculate your{" "}
        <a href="https://en.wikipedia.org/wiki/Basal_metabolic_rate">BMR</a>. If
        not, we can still provide a pretty good estimate for you!
      </p>
      <p>
        If you don't know or don't want to provide your % Body Fat, then just
        leave this field blank.
      </p>
      <UpdateFormInput
        type="number"
        inputMode="decimal"
        label="% Body Fat (Optional)"
        placeholder={
          profile.currentPercentBodyFat.value
            ? `${
                Math.round(profile.currentPercentBodyFat.value * 100 * 10) / 10
              }%`
            : "Ex: 15%"
        }
        value={percentBodyFat}
        onClick={(e) => e.target.select()}
        onChange={inputBodyFatPercentOnChange}
        onBlur={inputBodyFatPercentOnBlur}
      />
      <h2> Activity Levels </h2>
      <p>
        Your{" "}
        <a
          href="https://www.fao.org/3/y5686e/y5686e07.htm"
          target="_blank"
          rel="noreferrer noopener"
        >
          Physical Activity Level
        </a>{" "}
        describes the level of activity that you do on a day-to-day basis,
        particularly at work. Each level takes into account some baseline amount
        of exercise and is used to multiply your BMR by a corresponding factor,
        yielding your Total Daily Energy Expenditure (TDEE). For best accuracy
        and to avoid "double dipping" on exercise calories, we recommend
        selecting <b>Sedentary</b> and simply logging any meaningful exercises
        you do manually, since these descriptions tend to get pretty subjective.
      </p>
      <p>With that being said, feel free to select any of the following:</p>
      <ul id="signup-activity-levels-list">
        <li onClick={() => setActivityLevel("sedentary")}>
          <button
            className={
              "signup-activity-button" +
              (activityLevel === "sedentary" ? " active" : "")
            }
          ></button>
          <div className="signup-activity-level">
            <h5>Sedentary</h5>
            <p>
              Little to no exercise, office job or desk work. When computing
              your TDEE, this translates to multiplying your BMR by 1.3.
            </p>
          </div>
        </li>
        <li onClick={() => setActivityLevel("light")}>
          <button
            className={
              "signup-activity-button" +
              (activityLevel === "light" ? " active" : "")
            }
          ></button>
          <div className="signup-activity-level">
            <h5>Lightly Active</h5>
            <p>
              Lightly active work environment and light exercise 1-3 days per
              week. This translates to multiplying your BMR by 1.5.
            </p>
          </div>
        </li>
        <li onClick={() => setActivityLevel("moderate")}>
          <button
            className={
              "signup-activity-button" +
              (activityLevel === "moderate" ? " active" : "")
            }
          ></button>
          <div className="signup-activity-level">
            <h5>Moderately Active</h5>
            <p>
              Moderately active work environment and moderate intensity exercise
              3-5 days per week. This translates to a BMR multiplier of 1.7.
            </p>
          </div>
        </li>
        <li onClick={() => setActivityLevel("heavy")}>
          <button
            className={
              "signup-activity-button" +
              (activityLevel === "heavy" ? " active" : "")
            }
          ></button>
          <div className="signup-activity-level">
            <h5>Heavily Active</h5>
            <p>
              Heavily active work environment and exercise 6-7 days per week.
              This maps to a BMR multiplier of 1.9.
            </p>
          </div>
        </li>
        <li onClick={() => setActivityLevel("very heavy")}>
          <button
            className={
              "signup-activity-button" +
              (activityLevel === "very heavy" ? " active" : "")
            }
          ></button>
          <div className="signup-activity-level">
            <h5>Very Heavily Active</h5>
            <p>
              Very heavily active work environment, with intense exercise more
              than once per day on average. Your TDEE will be computed using a
              multiplier of 2.1.
            </p>
          </div>
        </li>
      </ul>
      <h2> Meal Names </h2>
      <p>
        If you would like to rename your meals, please enter them below. Add names 
        for meals 5 and 6 if you like to add more meals to your diaries. Remove the names to
        remove meals from your diary.
      </p>
      <UpdateFormInput
        type="text"
        label="Meal 1"
        value={meal0}
        onChange={(e) => setMeal0(e.target.value)}
        onClick={(e) => e.target.select()}
      />
      <UpdateFormInput
        type="text"
        label="Meal 2"
        value={meal1}
        onChange={(e) => setMeal1(e.target.value)}
        onClick={(e) => e.target.select()}
      />
      <UpdateFormInput
        type="text"
        label="Meal 3"
        value={meal2}
        onChange={(e) => setMeal2(e.target.value)}
        onClick={(e) => e.target.select()}
      />
      <UpdateFormInput
        type="text"
        label="Meal 4"
        value={meal3}
        onChange={(e) => setMeal3(e.target.value)}
        onClick={(e) => e.target.select()}
      />
      <UpdateFormInput
        type="text"
        label="Meal 5"
        value={meal4}
        onChange={(e) => setMeal4(e.target.value)}
        onClick={(e) => e.target.select()}
      />
      <UpdateFormInput
        type="text"
        label="Meal 6"
        value={meal5}
        onChange={(e) => setMeal5(e.target.value)}
        onClick={(e) => e.target.select()}
      />
      <h2> Macro Goals </h2>
      <p>
        Here you can set the percent breakdown of macros you would like to
        achieve. The percent total must add up to 100%
      </p>
      <UpdateFormInput
        type="number"
        inputMode="decimal"
        label="Carbs"
        placeholder={
          Math.round(profile.goals.macroBreakdown.carbs * 100 * 10) / 10 + "%"
        }
        value={carbGoalPercent}
        onClick={(e) => e.target.select()}
        onChange={inputCarbOnChange}
        onBlur={inputCarbOnBlur}
      />
      <UpdateFormInput
        type="number"
        inputMode="decimal"
        label="Fat"
        placeholder={
          Math.round(profile.goals.macroBreakdown.fat * 100 * 10) / 10 + "%"
        }
        value={fatGoalPercent}
        onClick={(e) => e.target.select()}
        onChange={inputFatOnChange}
        onBlur={inputFatOnBlur}
      />
      <UpdateFormInput
        type="number"
        inputMode="decimal"
        label="Protein"
        placeholder={
          Math.round(profile.goals.macroBreakdown.protein * 100 * 10) / 10 + "%"
        }
        value={proteinGoalPercent}
        onClick={(e) => e.target.select()}
        onChange={inputProteinOnChange}
        onBlur={inputProteinOnBlur}
      />
      <button id="create-account-button" onClick={updateProfileOnClick}>
        Save Changes
      </button>
      <Link id="create-account-button" to="/profile/changePassword">
        Change Password
      </Link>
    </div>
  );
}

function ProfilePic(props) {
  const { profile } = props;
  const [isAttemptingFetch, setIsAttemptingFetch] = useState(false);
  const [isAttemptingPost, setIsAttemptingPost] = useState(false);
  const [hasProfilePicture, setHasProfilePicture] = useState(
    profile.hasProfilePicture
  );
  const [imageURL, setImageURL] = useState("");
  const [editButton, toggleEditButton] = useState(true);
  const [file, setFile] = useState(null);
  const formData = new FormData();

  const hiddenFileInput = React.useRef(null);
  const navigate = useNavigate();

  const handleResponse = (res) => {
    if (res.status === 200) {
      return res.json();
    }
    // best way to cancel a Promise chain is to throw an error
    if (res.status === 400) {
      setHasProfilePicture(false);
      throw new Error(400);
    }
    if (res.status === 500) {
      setHasProfilePicture(false);
      console.log(res);
      throw new Error(500);
    }
  };
  const fileSelected = (event) => {
    let profilePicNew = event.target.files[0];
    setFile(profilePicNew);
  };

  const postProfilePic = async () => {
    if (isAttemptingPost) {
      return;
    }
    console.log("POSTING Profile Pic");
    console.log(file);
    setIsAttemptingPost(true);
    formData.append("image", file);

    fetch(
      `${process.env.REACT_APP_PROFILE_PIC_URI}/profilePicture/${profile._id}`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then(handleProfilePicUploadResponse)
      .then((res) => res.json())
      .catch((err) => {
        console.log(err);
        setIsAttemptingFetch(false);
      });

    toggleEditButton(true);
  };

  const handleClick = (event) => {
    hiddenFileInput.current.click();
  };

  const handleProfilePicUploadResponse = (res) => {
    if (res.status === 201) {
      setHasProfilePicture(true);
      window.location.reload();
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

  const getProfilePic = async () => {
    if (isAttemptingFetch) {
      return;
    }
    setIsAttemptingFetch(true);

    authFetch(
      `${process.env.REACT_APP_GATEWAY_URI}/profile/users/profilePicture`,
      {
        method: "GET",
      },
      navigate
    )
      .then(handleResponse)
      .then((imageLink) => setImageURL(imageLink.url))
      .catch((err) => {
        console.log(err);
        setIsAttemptingFetch(false);
      });
  };
  useEffect(() => {
    getProfilePic();
  }, []);
  if (hasProfilePicture) {
    return (
      <div id="profile-container">
        <div id="profile-icon">
          <img src={imageURL} />
        </div>
        {editButton ? (
          <button onClick={() => toggleEditButton(false)}>Edit</button>
        ) : (
          <div>
            <button onClick={handleClick}>Upload</button>
            <input
              id="upload-button"
              type="file"
              accept="image/*"
              ref={hiddenFileInput}
              onChange={fileSelected}
              style={{ display: "none" }}
            />
            <button onClick={postProfilePic}>Submit</button>
          </div>
        )}
      </div>
    );
  } else
    return (
      <div id="profile-container">
        <div id="default-profile-icon">
          {profile.firstName[0].toUpperCase()}
        </div>
        {editButton ? (
          <button onClick={() => toggleEditButton(false)}>Edit</button>
        ) : (
          <div>
            <button onClick={handleClick}>Upload</button>
            <input
              id="upload-button"
              type="file"
              accept="image/*"
              ref={hiddenFileInput}
              onChange={fileSelected}
              style={{ display: "none" }}
            />
            <button onClick={postProfilePic}>Submit</button>
          </div>
        )}
      </div>
    );
}
