import getStream from "./getStream.js"




// init phase 03
export default async () => {

    // Get user media
    const stream = await getStream()
    
    // hide phase 02 and show phase 03
    document.body.classList.remove("phase-02-active")
    document.body.classList.add("phase-03-active")
}