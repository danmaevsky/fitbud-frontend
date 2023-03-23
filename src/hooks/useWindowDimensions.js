import { useState, useEffect } from "react";

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height,
    };
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        /*
        This trick is so that the event handler waits 200ms after the user stops resizing the screen instead of firing
        on every single resize event (which can be a lot if the user jsut wobbles the screen around) 
        */
        let prevTimeout;
        function handleResize() {
            clearTimeout(prevTimeout);
            prevTimeout = setTimeout(() => {
                setWindowDimensions(getWindowDimensions());
            }, 200);
        }
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
}
