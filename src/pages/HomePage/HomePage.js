import "./HomePage.css";
import { useRef } from "react";
import emailjs from "@emailjs/browser";

export default function HomePage() {
    return (
        <div id="Home-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="Home-island">
                <h2>FAQ</h2>
            </div>

            <div id="Home-island">
                <h2>Give us feedback!</h2>
                <Contact> </Contact>
            </div>
        </div>
    );
}

function Contact() {
    const form = useRef();
    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm("service_qqmye07", "template_dot0k74", form.current, "W4VMuSxS9LhbFbIMI").then(
            (result) => {
                console.log(result.text);
            },
            (error) => {
                console.log(error.text);
            }
        );
        e.target.reset();
    };
    return (
        <form ref={form} onSubmit={sendEmail}>
            <input id="Home-emailbox" type="text" placeholder="email address" name="email" required></input>

            <textarea id="Home-info" type="text" placeholder="comments" name="message" required></textarea>

            <button id="Home-page-buttons button" type="submit">
                Submit
            </button>
        </form>
    );
}
