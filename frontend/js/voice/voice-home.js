// ===== HOME VOICE (CLEAN + SMART) =====

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Speech recognition not supported");
}

const recognition = new SpeechRecognition();
recognition.lang = "en-IN";
recognition.continuous = false;

let listening = false;

// -------- COMMAND MAP --------
const routes = [
    { keywords: ["weather", "rain", "temperature"], page: "weather.html" },
    { keywords: ["disease", "plant disease", "leaf"], page: "disease.html" },
    { keywords: ["crop", "fertilizer", "soil"], page: "crop.html" },
    { keywords: ["market", "price", "trend"], page: "market.html" },
    { keywords: ["water", "irrigation"], page: "water.html" },
    { keywords: ["scheme", "government"], page: "scheme.html" },
    { keywords: ["storage", "store", "warehouse"], page: "storage.html" }
];

// -------- SPEAK --------
function speak(text, cb) {
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    msg.onend = () => cb && cb();
    speechSynthesis.speak(msg);
}

// -------- MIC CONTROL --------
function startMic() {
    try {
        listening = true;
        recognition.start();
    } catch (e) {
        console.log("Mic already running");
    }
}

function stopMic() {
    listening = false;
    recognition.stop();
}

// -------- START BUTTON --------
document.getElementById("voiceBtn").onclick = () => {
    speak(
        "Microphone on. Say weather, disease, crop, market, water, schemes, or storage",
        startMic
    );
};

// -------- HANDLE VOICE --------
recognition.onresult = (e) => {

    stopMic();

    const cmd = e.results[0][0].transcript.toLowerCase();
    console.log("User said:", cmd);

    for (let route of routes) {
        for (let key of route.keywords) {

            if (cmd.includes(key)) {
                speak("Opening " + key + " module", () => {
                    window.location.href = route.page;
                });
                return;
            }
        }
    }

    // ❌ Not matched
    speak("Command not recognized. Try again");
};

// -------- EVENTS --------
recognition.onend = () => {
    if (!listening) {
        // Silent stop (no annoying repeat)
        console.log("Mic stopped");
    }
};

recognition.onerror = () => {
    stopMic();
    speak("Voice error. Please try again");
};
