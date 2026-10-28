// ===== WEATHER VOICE ASSISTANT (AUTO FLOW FINAL) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let silenceTimer;
let sessionStarted = false;

// -------- FIELD CONFIG --------
const fields = [
    { id: "temperature", label: "temperature" },
    { id: "humidity", label: "humidity" },
];

// -------- INIT --------
document.addEventListener("DOMContentLoaded", () => {

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
        alert("Use Chrome browser");
        return;
    }

    recognition = new SR();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = handleVoice;

    recognition.onend = () => {
        if (!stopVoice && voiceActive) startMic();
    };

    document.getElementById("voiceBtn").onclick = startWeatherVoice;


    // 🔘 BUTTON CLICK (manual OR auto)
    document.getElementById("predictWeather").addEventListener("click", () => {

        if (!voiceActive || stopVoice) return;

        const next = getNextEmptyField();

        if (next) {
            speak("Please fill all values first");
            setTimeout(askNextField, 800);
            return;
        }

        speak("Running prediction");

        setTimeout(() => {
            const result = document.getElementById("resultText").innerText;

            if (result.trim() !== "") {
                speak("Prediction result is", () => {
                    speak(result, stopAll);
                });
            }
        }, 2500);
    });

});

// -------- START --------
function startWeatherVoice() {

    stopVoice = false;
    voiceActive = true;

    const resultText = document.getElementById("resultText").innerText;

    if (resultText.trim() !== "") {
        speak("Welcome to weather prediction. Here is your result", () => {
            speak(resultText, stopAll);
        });
        return;
    }

    if (!sessionStarted) {
        sessionStarted = true;
        speak("Welcome to weather prediction", askNextField);
    } else {
        askNextField();
    }
}

// -------- GET EMPTY FIELD --------
function getNextEmptyField() {
    for (let field of fields) {
        const el = document.getElementById(field.id);
        if (!el.value) return field;
    }
    return null;
}

// -------- CHECK + AUTO SUBMIT --------
function checkAndAutoSubmit() {

    const next = getNextEmptyField();

    if (!next) {
        speak("All values filled. Running prediction");

        setTimeout(() => {
            document.getElementById("predictWeather").click();
        }, 800);

        return;
    }

    askNextField();
}

// -------- ASK FIELD --------
function askNextField() {

    clearTimeout(silenceTimer);

    const next = getNextEmptyField();
    const resultText = document.getElementById("resultText").innerText;

    if (resultText.trim() !== "") {
        speak("Prediction result is", () => {
            speak(resultText, stopAll);
        });
        return;
    }

    if (!next) {
        checkAndAutoSubmit(); 
        return;
    }

    speak("Say " + next.label + " value", startMic);

    silenceTimer = setTimeout(() => {
        if (!stopVoice && voiceActive) {
            askNextField();
        }
    }, 6000);
}

function extractNumber(text) {

    text = text.toLowerCase();

    // 1. direct digits (45, 10.5, etc.)
    let num = text.match(/\d+(\.\d+)?/);
    if (num) return num[0];

    // 2. word to number mapping
    const map = {
        zero:0, one:1, two:2, three:3, four:4,
        five:5, six:6, seven:7, eight:8, nine:9,
        ten:10, eleven:11, twelve:12, thirteen:13,
        fourteen:14, fifteen:15, sixteen:16,
        seventeen:17, eighteen:18, nineteen:19,
        twenty:20, thirty:30, forty:40,
        fifty:50, sixty:60, seventy:70,
        eighty:80, ninety:90
    };

    let words = text.split(" ");
    let total = 0;
    let current = 0;

    for (let w of words) {
        if (map[w] !== undefined) {
            if (map[w] < 10) {
                current += map[w]; // five → 5
            } else {
                current += map[w]; // forty → 40
            }
        }
    }

    total += current;

    if (total > 0) return total.toString();

    return null;
}

// -------- HANDLE VOICE --------
function handleVoice(e) {

    clearTimeout(silenceTimer);

    const text = e.results[0][0].transcript.toLowerCase();

    const num = extractNumber(text);

    if (!num) {
        speak("Say a valid number", askNextField);
        return;
    }

    fillNextField(num);
}

// -------- FILL FIELD --------
function fillNextField(value) {

    const next = getNextEmptyField();

    if (!next) {
        checkAndAutoSubmit();
        return;
    }

    if (next.id === "date") {
        speak("Please select date manually");
        return;
    }

    document.getElementById(next.id).value = value;

    speak(next.label + " filled");

    setTimeout(() => {
        checkAndAutoSubmit(); 
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
