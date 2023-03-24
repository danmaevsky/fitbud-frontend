import "./BarcodeScanPage.css";
import magnifyingGlass from "assets/magnifying-glass.svg";
import backArrow from "assets/back-arrow.svg";
import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect } from "react";
import useWindowDimensions from "hooks/useWindowDimensions";
import { Link, useNavigate } from "react-router-dom";

export default function BarcodeScanPage() {
    const navigate = useNavigate();
    const [showHelp, setShowHelp] = useState(false);
    const [showBarcodeScanner, setShowBarcodeScanner] = useState(true);
    const [showInputField, setShowInputField] = useState(false);
    const [barcodeResponse, setBarcodeResponse] = useState(null);
    const [barcodeStatus, setBarcodeStatus] = useState(200);

    const fetchResults = (decodedText, decodedResult) => {
        fetch(`${process.env.REACT_APP_GATEWAY_URI}/food/?barcode=${decodedText}`)
            .then((res) => {
                setBarcodeStatus(res.status);
                return res.json();
            })
            .then((json) => setBarcodeResponse(json));
    };

    useEffect(() => {
        if (barcodeResponse) {
            if (barcodeStatus !== 200) {
            } else {
                console.log("Redirect");
                navigate("/food/" + barcodeResponse._id);
            }
        }
    }, [barcodeResponse]);

    useEffect(() => {
        if (barcodeStatus !== 200) {
            setShowBarcodeScanner(false);
            setShowInputField(false);
            setShowHelp(false);
        }
    }, [barcodeStatus]);

    return (
        <div id="barcode-page-body">
            <div id="barcode-page-round-background-decoration"></div>
            <div id="barcode-page-bottom-top-banner-background-decoration"></div>
            <div id="barcode-page-bottom-bot-banner-background-decoration"></div>
            <div id="barcode-island">
                <Link to={-1} id="food-island-back-arrow">
                    <img src={backArrow} />
                    Go Back
                </Link>
                {showBarcodeScanner ? (
                    <BarcodeScanner
                        elementId={"barcode-scanner"}
                        setShowHelp={setShowHelp}
                        setShowInputField={setShowInputField}
                        onSuccess={fetchResults}
                    />
                ) : null}
                {showHelp ? <p>Having trouble? Try aligning the barcode with the left edge of the box!</p> : null}
                {showInputField ? <ManualBarcodeInput setBarcodeResponse={setBarcodeResponse} setBarcodeStatus={setBarcodeStatus} /> : null}
                {barcodeStatus !== 200 ? "404 Not Found. Search came back empty!" : null}
            </div>
        </div>
    );
}

function BarcodeScanner(props) {
    const { elementId, setShowHelp, setShowInputField, onSuccess } = props;
    const windowDims = useWindowDimensions();
    const [devices, setDevices] = useState([]);
    let html5QrCode;
    useEffect(() => {
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
                setTimeout(() => setShowHelp(true), 5000);
                setTimeout(() => {
                    setShowInputField(true);
                }, 15000);
                setTimeout(() => html5QrCode.applyVideoConstrains({ focusMode: "continuous" }), 2000);
            });

        return () => {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(html5QrCode.clear);
            }
        };
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
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={inputOnKeydown}
            ></input>
            <button id="barcode-page-searchbox-button" onClick={fetchResults}>
                <img src={magnifyingGlass} />
            </button>
        </div>
    );
}
