// ===== SCHEMES VOICE (PRODUCTION LEVEL - FIXED) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let silenceTimer;
let sessionStarted = false;

const fields = [
    { id: "crop", label: "crop name" },
    { id: "state", label: "state name" },
    { id: "land", label: "land size" },
    { id: "limit", label: "number of schemes" }
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

    // ✅ AUTO HANDLE MANUAL SUBMIT
    document.getElementById("schemeForm")?.addEventListener("submit", () => {

        if (!voiceActive || stopVoice) return;

        speak("Fetching schemes");

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
        speak("Here are the recommended schemes", () =>
            speak(result, stopAll)
        );
        return;
    }

    if (!sessionStarted) {
        sessionStarted = true;
        speak("Welcome to government schemes recommendation", askNext);
    } else {
        askNext();
    }
}

// -------- GET NEXT EMPTY --------
function getNext() {
    return fields.find(f => !document.getElementById(f.id).value);
}

// -------- ASK --------
function askNext() {

    clearTimeout(silenceTimer);

    const next = getNext();

    // ✅ AUTO RUN WHEN ALL FILLED
    if (!next) {
        speak("All values filled. Fetching schemes");

        // 🔥 AUTO SUBMIT
        if (typeof getScheme === "function") {
            getScheme();
        }

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
    console.log("Voice:", text);

    const next = getNext();

    if (!next) return;

    // -------- TEXT FIELDS --------
    if (next.id === "crop" || next.id === "state") {

        document.getElementById(next.id).value =
            text.charAt(0).toUpperCase() + text.slice(1);

        speak(next.label + " filled");
        setTimeout(askNext, 800);
        return;
    }

    // -------- NUMBER FIX (IMPORTANT) --------
    const num = extractNumber(text);

    if (!num) {
        speak("Please say a valid number", askNext);
        return;
    }

    document.getElementById(next.id).value = num[0];

    speak(next.label + " filled");

    setTimeout(askNext, 800);
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