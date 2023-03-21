import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
    return (
        <nav id="navbar">
            <a>
                <h1>fitBud.</h1>
            </a>
            <ul>
                <li>
                    <Link to="/food">Food</Link>
                </li>
                <li>
                    <Link to="/exercise">Exercise</Link>
                </li>
                <li>
                    <Link to="/demo">Demo</Link>
                </li>
                <li>
                    <Link to="/login">Login</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
