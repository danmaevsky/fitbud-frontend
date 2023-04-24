import { useState, useEffect } from "react";
import "./DemoPage.css";
import Html5QrcodePlugin from "components/Html5QrcodePlugin";

function DemoPage(props) {
    return (
        <div id="demo-page">
            <div id="demo-page-searches">
                <SearchDemo type="food" message="Search for a Food!" />
                <SearchDemo type="exercise" message="Search for an Exercise!" radioChoices={["Cardio", "Strength"]} />
            </div>
            <div id="demo-page-row2">
                <LoginDemo />
                <CreateAccountDemo />
            </div>
            <div id="demo-page-row3">
                <BarcodeDemo />
            </div>
        </div>
    );
}

function CreateAccountDemo(props) {
    // required
    // email
    // password
    // firstName
    // lastName
    // sex
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [sex, setSex] = useState("");

    const createCallback = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/createAccount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
                firstName: firstName,
                lastName: lastName,
                sex: sex,
            }),
        })
            .then((res) => res.json)
            .then((json) => console.log("Account with userId " + json.userId + " created"));
    };

    return (
        <div>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input list="sex-options" type="text" placeholder="Sex" value={sex} onChange={(e) => setSex(e.target.value)} />
            <datalist id="sex-options">
                <option value="Male" />
                <option value="Female" />
            </datalist>
            <button onClick={createCallback}>Create Account</button>
        </div>
    );
}

function LoginDemo(props) {
    const [accessToken, setAccessToken] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const loginCallback = () => {
        let temp;
        let tempToken;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((res) => {
                temp = res.status;
                return res.json();
            })
            .then((json) => {
                if (temp !== 200) {
                    setErrorMessage(json.message);
                    throw new Error("issue");
                }
                tempToken = json.accessToken;
                return fetch(`${process.env.REACT_APP_GATEWAY_URI}/profile/users`, {
                    method: "GET",
                    headers: { Authorization: "Bearer " + json.accessToken },
                });
            })
            .then((res) => res.json())
            .then((json) => {
                setName(json.firstName);
                setAccessToken(tempToken);
            })
            .catch((err) => {
                console.log(err);
                setName(null);
            });
    };

    const logoutCallback = () => {
        let temp;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/account/logout`, {
            method: "POST",
            headers: { Authorization: "Bearer " + accessToken },
        }).then((res) => {
            if (res.status !== 200) {
                setErrorMessage("Fucky wucky");
                throw Error("ugh");
            }
            setName(null);
            setAccessToken(null);
            setErrorMessage(null);
            setEmail("");
            setPassword("");
        });
    };

    return (
        <div>
            {!name && <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />}
            {!name && <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
            {!name && <button onClick={loginCallback}>Login</button>}
            {name && <p>Hello {name}!</p>}
            {name && <button onClick={logoutCallback}>Logout</button>}
            {errorMessage && !name && <p>Error! {errorMessage}</p>}
        </div>
    );
}

function BarcodeDemo(props) {
    const [barcodeText, setBarcodeText] = useState("");
    const [barcodeResponse, setBarcodeResponse] = useState(null);
    const [barcodeResponseStatus, setBarcodeResponseStatus] = useState(null);
    const onBarcodeScan = (decodedText, decodedResult) => {
        let temp;
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?barcode=${decodedText}`)
            .then((res) => {
                temp = res.status;
                return res.json();
            })
            .then((json) => {
                setBarcodeText(decodedText);
                setBarcodeResponseStatus(temp);
                setBarcodeResponse(json);
            });
    };
    return (
        <div id="barcode-demo">
            {barcodeResponse && barcodeResponseStatus === 200 && <SearchResult type="food" result={barcodeResponse} />}
            <p>Scanned Code: {barcodeText}</p>
            <Html5QrcodePlugin
                qrCodeSuccessCallback={onBarcodeScan}
                qrbox={{ height: 150, width: 300 }}
                disableFlip={false}
                fps={10}
                showZoomSliderIfSupported={true}
            />
        </div>
    );
}

function SearchResult(props) {
    const type = props.type;
    const result = props.result;
    const [additionalInfo, setAdditionalInfo] = useState(null);

    const onBlur = () => {
        setAdditionalInfo(null);
    };

    if (type === "food") {
        const onClick = (e) => {
            e.target.focus();
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/${result._id}`)
                .then((res) => res.json())
                .then((json) => setAdditionalInfo(json));
        };
        return (
            <li className="demo-page-search-result" onClick={onClick} onBlur={onBlur} tabIndex="1">
                <div>
                    <h5>{ProcessFoodName(result.name)}</h5>
                    {/* <p>Original Text: {result.name} </p> */}
                    {result.brandName ? <p>{ToTitleCase(result.brandName)}</p> : null}
                </div>
                {additionalInfo ? (
                    <ul className="demo-page-search-result-additional-info">
                        <li>Serving Size: {additionalInfo.servingQuantity + " " + additionalInfo.servingQuantityUnit}</li>
                        <li>Calories: {((additionalInfo.nutritionalContent.kcal / 100) * additionalInfo.servingQuantity).toFixed(0)}</li>
                        <li>Total Fat: {((additionalInfo.nutritionalContent.totalFat / 100) * additionalInfo.servingQuantity).toFixed(1)}</li>
                        <li>
                            Total Carbohydrates: {((additionalInfo.nutritionalContent.totalCarb / 100) * additionalInfo.servingQuantity).toFixed(1)}
                        </li>
                        <li>Protein: {((additionalInfo.nutritionalContent.protein / 100) * additionalInfo.servingQuantity).toFixed(1)}</li>
                    </ul>
                ) : null}
            </li>
        );
    }

    if (type === "exercise") {
        const onClick = (e) => {
            e.target.focus();
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/strength/${result._id}`)
                .then((res) => res.json())
                .then((json) => setAdditionalInfo(json));
        };
        return (
            <li className="demo-page-search-result" onClick={onClick} onBlur={onBlur}>
                <div>
                    <h5>{result.name}</h5>
                </div>
                {additionalInfo ? (
                    <ul className="demo-page-search-result-additional-info">
                        <li>MET Value: {additionalInfo.MET}</li>
                    </ul>
                ) : null}
            </li>
        );
    }
}

function SearchDemo(props) {
    const type = props.type;
    const message = props.message;
    const radioChoices = props.radioChoices;

    const numResults = 50;

    const [results, setResults] = useState(null);
    const [resultPage, setResultPage] = useState(0);
    const [responseStatus, setResponseStatus] = useState(200);
    const [radio, setRadio] = useState("Strength");
    const onRadioChange = (e) => {
        setRadio(e.target.value);
    };

    useEffect(() => {
        console.log(results);
    }, [results]);

    let onSubmit;
    if (type === "food") {
        onSubmit = (query) => {
            let temp;
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?search=${query}`)
                .then((res) => {
                    temp = res.status;
                    return res.json();
                })
                .then((json) => {
                    setResponseStatus(temp);
                    setResults(json);
                });
        };
    } else if (type === "exercise") {
        onSubmit = (query) => {
            let temp;
            console.log(query);
            fetch(`${process.env.REACT_APP_GATEWAY_URI}/exercise/${radio}/?search=${query}`)
                .then((res) => {
                    temp = res.status;
                    return res.json();
                })
                .then((json) => {
                    setResponseStatus(temp);
                    setResults(json);
                });
        };
    }

    let incrementPage = () => {
        if (resultPage >= 10) {
            return;
        }
        setResultPage(resultPage + 1);
    };

    let decrementPage = () => {
        if (resultPage <= 0) {
            return;
        }
        setResultPage(resultPage - 1);
    };

    return (
        <div className={`search-demo search-demo-${type}`}>
            <h2>{message}</h2>
            <SearchBox onSubmit={onSubmit} />
            {radioChoices ? (
                <form>
                    {radioChoices.map((s) => (
                        <label>
                            <input className="search-demo-radio" type="radio" name="radio-group" value={s} onChange={onRadioChange} />
                            {s}
                        </label>
                    ))}
                </form>
            ) : null}
            {results && responseStatus === 200 ? (
                <ul className="search-demo-results">
                    {results.slice(numResults * resultPage, numResults * (1 + resultPage)).map((r) => {
                        return <SearchResult type={type} result={r} />;
                    })}
                </ul>
            ) : null}
            {responseStatus !== 200 ? "404 Not Found" : null}
            {/* <div className="search-demo-page-buttons">
                <button onClick={decrementPage}>Prev</button>
                <button onClick={incrementPage}>Next</button>
            </div> */}
        </div>
    );
}

function SearchBox(props) {
    const onSubmit = props.onSubmit;
    const [textValue, setTextValue] = useState("");

    return (
        <div className="demo-page-search-box">
            <input
                className="demo-page-search-box-input"
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        onSubmit(textValue);
                        return;
                    }
                }}
            ></input>
            <button className="demo-page-search-box-submit" onClick={() => onSubmit(textValue)}>
                Search!
            </button>
        </div>
    );
}

/* Utility Functions */
// Food Search Utilities
function ToTitleCase(x) {
    x = x
        .toLowerCase()
        .split(" ")
        .map((s) => {
            if (s === "bbq") {
                return "BBQ";
            }
            return s.charAt(0).toUpperCase() + s.substring(1);
        })
        .join(" ");
    // extra capitalization
    for (let i = 0; i < x.length - 1; i++) {
        if (x[i] === "(" || x[i] === "[" || x[i] === "{" || x[i] === "-") {
            x = x.substring(0, i + 1) + x[i + 1].toUpperCase() + x.substring(i + 2);
        }
    }
    return x;
}
function GetPhrases(s, ans, offset) {
    ans = ans ? ans : {};
    let j = offset ? offset : 0;
    let k = offset ? offset : 0;
    let builder = "";
    for (let i = offset ? offset : 0; i < s.length; i++) {
        // !offset ? console.log(builder) : null;
        if (builder === "") {
            j = i;
            k = i;
        }
        if (s[i] === " ") {
            // console.log("space", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
                GetPhrases(s, ans, i + 1);
            }
            builder = builder === "" ? "" : builder + s[i];
            k++;
        } else if (s[i] === ",") {
            // console.log("comma", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
                GetPhrases(s, ans, i + 1);
            }
            builder = "";
        } else if (i === s.length - 1) {
            builder += s[i];
            k++;
            // console.log("end", builder);
            if (ans[builder]) {
                if (!MultiDimIncludes(ans[builder], [j, k])) {
                    ans[builder].push([j, k]);
                }
            } else {
                ans[builder] = [[j, k]];
            }
        } else {
            builder += s[i];
            k++;
        }
    }
    return ans;
}

function MultiDimIncludes(arr, val) {
    for (let i = 0; i < arr.length; i++) {
        let temp = true;
        for (let j = 0; j < arr[i].length; j++) {
            temp = arr[i][j] === val[j];
        }
        if (temp) {
            return temp;
        }
    }
    return false;
}

function ProcessFoodName(x) {
    let phrases = GetPhrases(x);
    // console.log(phrases);
    let maxKey = "";
    let keys = Object.keys(phrases);
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key.length > maxKey.length && phrases[key].length > 1) {
            maxKey = key;
        }
    }

    if (maxKey !== "") {
        // console.log(maxKey);
        phrases[maxKey].sort((a, b) => {
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }
            return 0;
        });
        x = x.substring(0, phrases[maxKey][phrases[maxKey].length - 1][0]) + x.substring(phrases[maxKey][phrases[maxKey].length - 1][1]);
        x = x.replace("  ", " ");
        if (x.substring(x.length - 2) === ", ") {
            x = x.substring(0, x.length - 2);
        }
    }
    // to Title Case
    x = ToTitleCase(x);
    return x;
}

export default DemoPage;
