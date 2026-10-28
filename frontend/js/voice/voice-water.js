// ===== WATER VOICE ASSISTANT (AUTO FLOW FINAL) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let silenceTimer;
let sessionStarted = false;

// -------- FIELDS --------
const fields = [
    { id: "moisture", label: "soil moisture" },
    { id: "rainForecast", label: "rain forecast" },
    { id: "cropType", label: "crop type" }
];

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
    document.getElementById("waterForm").addEventListener("submit", () => {

        if (!voiceActive || stopVoice) return;

        const next = getNext();

        if (next) {
            speak("Please fill all values first");
            setTimeout(askNext, 800);
            return;
        }

        speak("Generating irrigation plan");

        setTimeout(() => {
            readResultAndStop();
        }, 2500);
    });

});

// -------- START --------
function startVoice() {

    stopVoice = false;
    voiceActive = true;

    const resultCard = document.getElementById("resultCard");

    // If result already exists
    if (resultCard.style.display !== "none") {
        readResultAndStop();
        return;
    }

    if (!sessionStarted) {
        sessionStarted = true;
        speak("Welcome to water management", askNext);
    } else {
        askNext();
    }
}

// -------- GET NEXT EMPTY --------
function getNext() {
    return fields.find(f => !document.getElementById(f.id).value);
}

// -------- AUTO SUBMIT --------
function checkAutoSubmit() {

    const next = getNext();

    if (!next) {
        speak("All values filled. Generating irrigation plan");

        setTimeout(() => {
            document.getElementById("waterForm").requestSubmit();
        }, 800);

        return;
    }

    askNext();
}

// -------- ASK --------
function askNext() {

    clearTimeout(silenceTimer);

    const next = getNext();
    const resultCard = document.getElementById("resultCard");

    if (resultCard.style.display !== "none") {
        readResultAndStop();
        return;
    }

    if (!next) {
        checkAutoSubmit(); // 🔥 AUTO RUN
        return;
    }

    speak("Say " + next.label, startMic);

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

    const next = getNext();
    if (!next) {
        checkAutoSubmit();
        return;
    }

    // 🌱 Crop type handling
    if (next.id === "cropType") {

        let val = "";

        if (text.includes("rice")) val = "Rice";
        else if (text.includes("wheat")) val = "Wheat";
        else if (text.includes("maize")) val = "Maize";
        else if (text.includes("sugarcane")) val = "Sugarcane";

        if (!val) {
            speak("Say rice wheat maize or sugarcane", askNext);
            return;
        }

        document.getElementById(next.id).value = val;

        speak(val + " selected");

        setTimeout(checkAutoSubmit, 800);
        return;
    }

    // 🔢 Number input
    const num = text.match(/\d+/);

    if (!num) {
        speak("Say a number", askNext);
        return;
    }

    document.getElementById(next.id).value = num[0];

    speak(next.label + " filled");

    setTimeout(checkAutoSubmit, 800);
}

// -------- READ RESULT --------
function readResultAndStop() {

    const crop = document.getElementById("resCrop")?.innerText || "";
    const status = document.getElementById("resStatus")?.innerText || "";
    const water = document.getElementById("resWater")?.innerText || "";
    const next = document.getElementById("resNext")?.innerText || "";
    const reason = document.getElementById("resReason")?.innerText || "";

    if (!status) {
        speak("Result not available yet");
        return;
    }

    speak("Here is your irrigation recommendation");

    setTimeout(() => {
        speak("Crop " + crop);
        speak("Status " + status);
        speak("Water amount " + water);
        speak("Next irrigation in " + next + " days");
        speak("Reason " + reason, stopAll);
    }, 800);
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
