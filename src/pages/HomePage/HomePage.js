
import "./HomePage.css"
import {useRef} from "react";
import emailjs from '@emailjs/browser';
import {useState} from "react";
import {data} from "./data";
import {BsPlus} from "react-icons/bs";
import {BiMinus} from "react-icons/bi";

export default function HomePage() {
    return (
        <div id="Home-page-body">
            <div className="default-background-round round-background-decoration"></div>
            <div className="default-background-top-banner bottom-top-banner-background-decoration"></div>
            <div className="default-background-bottom-banner bottom-bot-banner-background-decoration"></div>
            <div id="Home-island">
                <FAQ props={data}/>
            </div>
            
            <div id="Home-island-2">
                <h1>Give us feedback!</h1>
                <Contact/>
            </div>
        </div>
    );
}
function FAQ() {
    const [questions, setQuestions] = useState(data);

    return (
        <div> 
            <h1>FAQ</h1>
            {questions.map((question) => (
                <SingleQuestion {...question}/>
            ))}
        </div>
    )
}

function SingleQuestion({ question, answer}) {
    const [showAnswer, setShowAnswer] = useState(false);

    return(
        <div>
            <div id="Home-page-buttons"> 
                <h2 onClick={() => setShowAnswer(!showAnswer)}>{question}</h2>
                {showAnswer && <p>{answer}</p>}
                {
                    showAnswer ? (<button><BiMinus onClick={() => setShowAnswer(!showAnswer)}/></button>) : (<button onClick={() => setShowAnswer(!showAnswer)}><BsPlus/></button>)
                }
                
            </div>
            
        </div>
    )
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
        <form id="Home-island-form" ref={form} onSubmit={sendEmail}> 
            
            <input id="HomePage-emailbox"
            type="text"
            placeholder='email address' 
            name='email' 
            required
            ></input>
            
            <textarea id="HomePage-textarea"
            type="text" 
            placeholder='comments' 
            name='message' 
            required
            ></textarea>


            <div id="Home-page-buttons">
            <button type='submit'>
                Submit
            </button>
            </div>
        </form>
    )
}