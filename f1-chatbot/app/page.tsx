"use client"
import Image from "next/image"
import f1GPTLogo from "./assets/formula 1 logo.png"
import { useChat } from "ai/react"
import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {

    const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();


    const noMessages = !messages || messages.length === 0

    const handlePrompt = (promptText) => {
        const msg : Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)
    }


    return (
        <main>
            <Image src={f1GPTLogo} width="250" alt="F1 chatbot logo"/>
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            The Ultimate place for FORMULA 1 fans!
                            Ask F1 ChatBot anything about this fantastic sport
                            of F1 racing and it will come back with the most up-to date 
                            information.
                            We hope you like it!
                        </p>
                        <br />
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                        {isLoading && <LoadingBubble />}
                    </>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me Something ..., Would You?"/>
                <input type="submit" />
            </form>
        </main>
    )
}


export default Home;