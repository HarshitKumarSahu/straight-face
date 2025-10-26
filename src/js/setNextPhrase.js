import _shuffle from "lodash/shuffle"
import phrases from "./phrases";

const shuffledPhrases = _shuffle(phrases)

// Pull next phrase from shuffled array and set
export default () => {
    const nextPhrase = shuffledPhrases.pop()
    
    if(!nextPhrase) alert("You WIN! You Completed All the Phrases");

    const phraseEL = document.querySelector(".phrase")
    phraseEL.dataset.activePhrase = nextPhrase
    phraseEL.dataset.pointerWord = 0

    // clear out all phrase
    const phraseArea = document.querySelector(".phrase h1")
    while(phraseArea.firstChild) {
        phraseArea.removeChild(phraseArea.firstChild)
    }

    const spans = nextPhrase.split(' ').filter(Boolean)
    for (let i in spans) {
        const spanWord = spans[i]
        const span = document.createElement("span")
        span.innerText = spanWord
        phraseArea.appendChild(span)
    }


    // console.log(shuffledPhrases);
    
}