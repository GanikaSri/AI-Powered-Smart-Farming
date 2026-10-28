// ===== MARKET VOICE ASSISTANT (AUTO FLOW FINAL) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let silenceTimer;
let sessionStarted = false;

// Crop mapping
const crops = {
    rice: "Rice",
    wheat: "Wheat",
    maize: "Maize",
    cotton: "Cotton",
    sugarcane: "Sugarcane"
};

// -------- INIT --------
document.addEventListener("DOMContentLoaded", () => {

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Use Chrome");

    recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = handleVoice;

    recognition.onend = () => {
        if (!stopVoice && voiceActive) startMic();
    };

    document.getElementById("voiceBtn").onclick = startVoice;

    // ✅ HANDLE MANUAL SUBMIT
    document.getElementById("marketForm").addEventListener("submit", () => {

        if (!voiceActive || stopVoice) return;

        const crop = document.getElementById("crop").value;

        if (!crop) {
            speak("Please select crop first");
            setTimeout(askNext, 800);
            return;
        }

        speak("Predicting market trend");

        setTimeout(() => {
            speak("Market trend displayed", stopAll);
        }, 2500);
    });

});

// -------- START --------
function startVoice() {

    stopVoice = false;
    voiceActive = true;

    const resultCard = document.getElementById("resultCard");

    // If already shown → read & stop
    if (resultCard.style.display !== "none") {
        speak("Market trend already displayed");
        readResultAndStop();
        return;
    }

    if (!sessionStarted) {
        sessionStarted = true;
        speak("Welcome to market Trend prediction", askNext);
    } else {
        askNext();
    }
}

// -------- CHECK + AUTO SUBMIT --------
function checkAutoSubmit() {

    const crop = document.getElementById("crop").value;

    if (crop) {
        speak("Crop selected. Predicting market trend");

        setTimeout(() => {

            document.getElementById("marketForm").requestSubmit();

            // ✅ WAIT + READ RESULT
            setTimeout(() => {
                readResultAndStop();
            }, 2500);

        }, 800);

        return;
    }

    askNext();
}

// -------- ASK --------
function askNext() {

    clearTimeout(silenceTimer);

    const crop = document.getElementById("crop").value;
    const resultCard = document.getElementById("resultCard");

    // If result exists
    if (resultCard.style.display !== "none") {
        speak("Market trend displayed");
        readResultAndStop();
        return;
    }

    if (!crop) {
        speak("Say crop name", startMic);
    } else {
        checkAutoSubmit(); 
        return;
    }

    silenceTimer = setTimeout(() => {
        if (!stopVoice && voiceActive) {
            askNext();
        }
    }, 6000);
}

// -------- HANDLE VOICE --------
function handleVoice(e) {

    clearTimeout(silenceTimer);

    const text = e.results[0][0].transcript.toLowerCase();
    console.log("Voice:", text);

    for (let key in crops) {
        if (text.includes(key)) {

            document.getElementById("crop").value = crops[key];

            speak(crops[key] + " selected");

            setTimeout(() => {
                checkAutoSubmit(); 
            }, 800);

            return;
        }
    }

    speak("Crop not recognized. Say rice wheat maize cotton or sugarcane", askNext);
}

// -------- MIC --------
function startMic() {
    try {
        if (voiceActive && !stopVoice) {
            recognition.start();
        }
    } catch (e) {}
}

// -------- STOP --------
function stopAll() {
    stopVoice = true;
    voiceActive = false;
    sessionStarted = false;
    recognition.stop();
    speak("Microphone off");
}

// -------- SPEAK --------
function speak(text, cb) {
    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    msg.onend = () => cb && cb();
    speechSynthesis.speak(msg);
}
