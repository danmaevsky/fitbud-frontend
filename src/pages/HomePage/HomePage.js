
import "./HomePage.css"
import {useRef} from "react";
import emailjs from '@emailjs/browser';

export default function HomePage() {
    return (
        <div id="Home-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="Home-island">
                <h2>FAQ</h2>
                <label>How do we calculate macros?</label>
                    <textarea id="Home-faq" readOnly> 
                        The average energy/gram values for carbohydrates, proteins, and fats given as 4 kcal/g for carbohydrates, 4 kcal/g for proteins, and 9 kcal/gram for fats
                    </textarea>
                
                <label>What are the specifics behind the Atwater Factors?</label>
                    <textarea id="Home-faq" readOnly> 
                        The corrected Atwater General Factors that are specific to each food, used to take into account the variation in caloric content of different kinds of carbs, proteins, and fats. Can range from 2.5 to 4.5 kcal/g for carbs and proteins for example, depending on the food
                    </textarea>
        
                <label>What are the benefits of joining the fitBud. family?</label>
                    <textarea id="Home-faq" readOnly> 
                        With a fitBud. accout you are able to not only log your workouts and meals, but it gives you the oppertunity to track your fitness and wellness progress over time as you see fit. Another neat feature that comes with an account is the ability to create your own personal meals, workouts, and food entires for ease of use and the ultimate customization options to fit your life style. We use the latest and greatest scince backed formulas to calculate your individual caloric needs.
                    </textarea>
            </div>

            <div id="Home-island">
                <h2>Give us feedback!</h2>
                <Contact> </Contact>
            </div>
        </div>
    );
}

function Contact() {
    const form = useRef()
    const sendEmail = (e) => {
        e.preventDefault();
    
        emailjs.sendForm('service_qqmye07', 'template_dot0k74', form.current, 'W4VMuSxS9LhbFbIMI')
          .then((result) => {
              console.log(result.text);
          }, (error) => {
              console.log(error.text);
          });
          e.target.reset()
      };
    return(
        <form ref={form} onSubmit={sendEmail}> 
            <input id="Home-emailbox"
            type="text"
            placeholder='email address' 
            name='email' 
            required
            ></input>
            
            <textarea id="Home-info"
            type="text" 
            placeholder='comments' 
            name='message' 
            required
            ></textarea>

            <button id="Home-page-buttons button"type='submit'>
                Submit
            </button>
        </form>
    )
}