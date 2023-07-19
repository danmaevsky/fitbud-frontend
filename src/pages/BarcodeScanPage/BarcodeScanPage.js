import "./BarcodeScanPage.css";
import magnifyingGlass from "assets/magnifying-glass.svg";
import backArrow from "assets/back-arrow.svg";
import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect } from "react";
import useWindowDimensions from "hooks/useWindowDimensions";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function BarcodeScanPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showHelp, setShowHelp] = useState(false);
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(true);
    const [showInputField, setShowInputField] = useState(true);
    const [barcodeResponse, setBarcodeResponse] = useState(null);
    const [barcodeStatus, setBarcodeStatus] = useState(200);
    const [isAttemptingFetch, setIsAttemptingFetch] = useState(false); // prevent excessive barcode on-success spam
    const [isMobile, setIsMobile] = useState(true);

    const fetchResults = (decodedText, decodedResult) => {
        if (isAttemptingFetch) {
            return;
        }
        setIsAttemptingFetch(true);
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?barcode=${encodeURIComponent(decodedText)}`)
            .then((res) => {
                setBarcodeStatus(res.status);
                return res.json();
            })
            .then((json) => setBarcodeResponse(json))
            .then(() => setIsAttemptingFetch(false));
    };

    useEffect(() => {
        if (barcodeResponse) {
            if (barcodeStatus !== 200) {
            } else {
                if (location.state && location.state.from === "recipe-builder") {
                    console.log("Redirect to Recipe Builder");
                    navigate("/recipe-builder/", {
                        state: {
                            from: "recipe-builder-barcode",
                            barcodeFoodId: barcodeResponse._id,
                        },
                    });
                } else {
                    console.log("Redirect to Food");
                    navigate("/food/" + barcodeResponse._id, { state: location.state });
                }
            }
        }
    }, [barcodeResponse]);

    useEffect(() => {
        if (barcodeStatus !== 200) {
            setShowBarcodeScanner(false);
            setShowHelp(false);
        }
    }, [barcodeStatus]);

    return (
        <div id="barcode-page-body">
            <div className="food-background-round round-background-decoration"></div>
            <div className="food-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="food-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="barcode-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} />
                    Go Back
                </Link>
                {showBarcodeScanner ? (
                    <BarcodeScanner elementId={"barcode-scanner"} setShowHelp={setShowHelp} setIsMobile={setIsMobile} onSuccess={fetchResults} />
                ) : null}
                {showHelp ? <p>Having trouble? Try aligning the barcode with the left edge of the box!</p> : null}
                {!isMobile ? (
                    <p id="barcode-desktop-not-supported-message">
                        Sorry, barcode scanning is not supported on desktops. You can still manually input the barcode if you'd like!
                    </p>
                ) : null}
                {showInputField ? <ManualBarcodeInput setBarcodeResponse={setBarcodeResponse} setBarcodeStatus={setBarcodeStatus} /> : null}
                {barcodeStatus !== 200
                    ? "Search came back empty! This could mean that a food with the scanned barcode does not exist in our database, or that the code was scanned incorrectly. You can try manually inputting the code if you'd like."
                    : null}
            </div>
        </div>
    );
}

function BarcodeScanner(props) {
    const { elementId, setShowHelp, setIsMobile, onSuccess } = props;
    const windowDims = useWindowDimensions();
    const [devices, setDevices] = useState([]);

    let html5QrCode;
    useEffect(() => {
        // feature detection for checking if mobile device (UA sniffing is not recommended, so that is why I feature detect first)
        let isMobile =
            (window.screen.orientation.angle != 0 && navigator.maxTouchPoints > 0 && window.screen.width <= 800) ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            setIsMobile(false);
        } else {
            html5QrCode = new Html5Qrcode(elementId);
            Html5Qrcode.getCameras()
                .then((devs) => {
                    setDevices(devs);
                })
                .then(() => {
                    let aspectRatio = 0.5;
                    let qrBoxRatio = 0.45;
                    html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            qrbox: (viewfinderWidth, viewfinderHeight) => {
                                return { width: 0.85 * viewfinderWidth, height: qrBoxRatio * 0.85 * viewfinderWidth };
                            },
                            aspectRatio: aspectRatio,
                        },
                        onSuccess,
                        () => "Goodbye World"
                    );
                    setShowHelp(true);
                    setTimeout(() => html5QrCode.applyVideoConstrains({ focusMode: "continuous" }), 2000);
                });

            return () => {
                if (html5QrCode.isScanning) {
                    html5QrCode.stop().then(html5QrCode.clear);
                }
            };
        }
    }, []);

    // useEffect(() => {
    //     if (html5QrCode) {
    //         if (html5QrCode.isScanning) {
    //             html5QrCode.resume();
    //         }
    //     }
    // }, []);

    return (
        <div id="barcode-scanner-container">
            <div id={elementId} />
        </div>
    );
}

function ManualBarcodeInput(props) {
    const { setBarcodeResponse, setBarcodeStatus } = props;
    const [barcode, setBarcode] = useState("");
    const fetchResults = () => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?barcode=${barcode}`)
            .then((res) => {
                setBarcodeStatus(res.status);
                return res.json();
            })
            .then((json) => setBarcodeResponse(json));
    };
    const inputOnKeydown = (e) => {
        if (e.key === "Enter") {
            fetchResults();
            return;
        }
        return;
    };
    return (
        <div id="barcode-page-searchbox">
            <input
                id="barcode-page-searchbox-input"
                type="text"
                placeholder="Search Barcode"
                value={barcode}
                inputMode="numeric"
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={inputOnKeydown}
            ></input>
            <button id="barcode-page-searchbox-button" onClick={fetchResults}>
                <img src={magnifyingGlass} />
            </button>
        </div>
    );
}
