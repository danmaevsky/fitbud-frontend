import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

export default function AuthWrapper() {
    const location = useLocation(); // since this layout does not have a specific path, this will be the location of the current child it is rendering
    const navigate = useNavigate();

    const userLogged = JSON.parse(Boolean(window.localStorage.refreshToken)); // refreshToken is a proxy for logged in

    useEffect(() => {
        if (!userLogged) {
            navigate("/login", {
                state: {
                    from: location,
                },
                replace: true,
            });
        }
    }, [userLogged]);

    return userLogged ? <Outlet /> : null;
}
