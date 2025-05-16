let prompt = document.querySelector("#prompt")
let chatContainer = document.querySelector(".chat-container")
let imagebtn = document.querySelector("#image")
let image = document.querySelector("#image img")
let imageinput = document.querySelector("#image input")
const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCixJamWVwPv99K821GAoVCl2KnV0Jdrfg"
let user = {
    message: null,
    file: {
        mimme_type: null,
        data: null
    }
}

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area")

    
    const medicalPrompt = `
    You are MediBot, a strictly medical-only AI assistant. Your rules:
    1. ONLY answer questions related to:
       - Mental health and medicine
       - Symptoms and diagnoses
       - Treatments and medications
       - Medical procedures
       - Healthcare advice
    2. For non-medical questions, respond EXACTLY:
       "I specialize only in medical questions. Please ask about health symptoms, conditions, or treatments."
    3. Respond in the same language the question was asked
    4. Be professional, accurate, and compassionate
    
    User question: ${user.message}
    ${user.file.data ? '[User included a medical image]' : ''}
    `;

    let RequestOption = {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ 
            "contents": [
                {
                    "parts": [
                        {"text": medicalPrompt},
                        ...(user.file.data ? [{"inline_data": user.file}] : [])
                    ]
                }
            ]
        })
    }

    try {
        let response = await fetch(Api_Url, RequestOption)
        let data = await response.json()
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\\(.?)\\*/g, "$1").trim()
        text.innerHTML = apiResponse
    } catch (error) {
        console.log(error)
        text.innerHTML = "Sorry, I encountered an error processing your medical query. Please try again."
    }
    finally {
        chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"})
        image.src = img.svg 
        image.classList.remove("choose")
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div")
    div.innerHTML = html
    div.classList.add(classes)
    return div
}

function handlechatResponse(userMessage) {
    // Trim and check for empty message
    userMessage = userMessage.trim()
    if (!userMessage) return
    
    user.message = userMessage
    let html = `<img src="user.png" alt="" id="userImage" width="10%">
    <div class="user-chat-area">
    ${user.message}
    ${user.file.data ? `<img src="data:${user.file.mimme_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>`
    prompt.value = ""

    let userChatBox = createChatBox(html, "user-chat-box")
    chatContainer.appendChild(userChatBox)

    chatContainer.scrollTo({top: chatContainer.scrollHeight, behavior: "smooth"})

    setTimeout(() => {
        let html = `<div class="ai-chat-box">
            <img src="ai.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area">
            <img src="loading.webp" alt="" class="load" width="50px">
            </div>`
        let aiChatBox = createChatBox(html, "ai-chat-box")
        chatContainer.appendChild(aiChatBox)
        generateResponse(aiChatBox)
    }, 600)
}

// Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value)
    }
})

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0]
    if (!file) return
    
    // Check if image is medical (basic check for common medical image types)
    const medicalImageTypes = ['image/x-ray', 'image/dicom', 'image/ultrasound', 'image/mri']
    if (!medicalImageTypes.includes(file.type) && !file.name.match(/medical|scan|xray|mri/i)) {
        alert("Please upload only medical-related images (X-rays, scans, etc.)")
        return
    }
    
    let reader = new FileReader()
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1]
        user.file = {
            mimme_type: file.type,
            data: base64string
        }
        image.src = `data:${user.file.mimme_type};base64,${user.file.data}` 
        image.classList.add("choose")
    }
    reader.readAsDataURL(file)
})

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click()
})