// ===== STORAGE VOICE (PRODUCTION FIXED) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let silenceTimer;
let sessionStarted = false;

const fields = [
    { id: "crop", label: "crop" },
    { id: "weather", label: "weather" },
    { id: "storage", label: "storage option" }
];

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

    // ✅ HANDLE MANUAL SUBMIT (CRITICAL FIX)
    document.querySelector("form").addEventListener("submit", () => {

        if (!voiceActive || stopVoice) return;

        speak("Getting storage advice");

        setTimeout(() => {
            const result = document.getElementById("result").innerText;

            if (result.trim() !== "") {
                speak("Result is", () => speak(result, stopAll));
            }
        }, 3000);
    });

});

// -------- START --------
function startVoice() {

    stopVoice = false;
    voiceActive = true;

    const result = document.getElementById("result").innerText;

    // If result already exists → read & stop
    if (result.trim()) {
        speak("Here is your storage advice", () =>
            speak(result, stopAll)
        );
        return;
    }

    if (!sessionStarted) {
        sessionStarted = true;
        speak("Welcome to post harvest storage and selling advisor", askNext);
    } else {
        askNext();
    }
}

// -------- GET NEXT --------
function getNext() {
    return fields.find(f => !document.getElementById(f.id).value);
}

// -------- ASK --------
function askNext() {

    clearTimeout(silenceTimer);

    const next = getNext();

    // ✅ AUTO RUN WHEN ALL FILLED
    if (!next) {
        speak("All values filled. Getting storage advice");

        document.querySelector("form").requestSubmit();

        setTimeout(() => {
            const result = document.getElementById("result").innerText;

            if (result.trim() !== "") {
                speak("Result is", () => speak(result, stopAll));
            }
        }, 3000);

        return;
    }

    speak("Say " + next.label, startMic);

    silenceTimer = setTimeout(() => {
        if (!stopVoice && voiceActive) {
            askNext();
        }
    }, 6000);
}

// -------- HANDLE --------
function handleVoice(e) {

    clearTimeout(silenceTimer);

    const text = e.results[0][0].transcript.toLowerCase();
    console.log("Voice:", text);

    const next = getNext();

    if (!next) return;

    // -------- CROP --------
    if (next.id === "crop") {
        let val = "";

        if (text.includes("rice")) val = "Rice";
        else if (text.includes("wheat")) val = "Wheat";
        else if (text.includes("maize")) val = "Maize";
        else if (text.includes("cotton")) val = "Cotton";
        else if (text.includes("sugarcane")) val = "Sugarcane";
        else {
            speak("Say crop again", askNext);
            return;
        }

        document.getElementById(next.id).value = val;
        speak(val + " selected");
        setTimeout(askNext, 800);
        return;
    }

    // -------- WEATHER --------
    if (next.id === "weather") {
        let val = "";

        if (text.includes("clear")) val = "Clear";
        else if (text.includes("rain")) val = "Rain";
        else if (text.includes("humidity")) val = "High Humidity";
        else {
            speak("Say weather again", askNext);
            return;
        }

        document.getElementById(next.id).value = val;
        speak(val + " selected");
        setTimeout(askNext, 800);
        return;
    }

    // -------- STORAGE --------
    if (next.id === "storage") {
        let val = "";

        if (text.includes("yes")) val = "Yes";
        else if (text.includes("no")) val = "No";
        else {
            speak("Say yes or no", askNext);
            return;
        }

        document.getElementById(next.id).value = val;
        speak(val + " selected");
        setTimeout(askNext, 800);
        return;
    }
}

// -------- MIC --------
function startMic() {
    try {
        if (voiceActive && !stopVoice) {
            recognition.start();
        }
    } catch (e) {
        console.log("Mic restart blocked");
    }
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