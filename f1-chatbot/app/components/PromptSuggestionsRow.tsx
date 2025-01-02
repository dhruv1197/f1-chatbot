import PromptSuggestionButton from './PromptSuggestionButton';


const PromptSuggestionsRow = (onPromptClick) => {
    const prompts = [
        "Who is the current Formula 1 world driver's champion?",
        "Who is the current Formula 1 world team's champion?",
        "Who drives for Ferrari Formula 1 team?",
        "Who is the highest paid F1 driver?",
        "Who is the Head of racing for RedBull's F1 academy team?"
    ]
    return (
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => 
            <PromptSuggestionButton key={`suggestion-${index}`} text={prompt} onClick={() => onPromptClick(prompt)}/>)}
        </div>
    )
}

export default PromptSuggestionsRow;