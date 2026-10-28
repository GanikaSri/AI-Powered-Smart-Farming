// ===== CROP VOICE ASSISTANT (AUTO FLOW FINAL) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let silenceTimer;
let sessionStarted = false;

// -------- FIELDS --------
const fields = [
    { id: "nitrogen", label: "nitrogen" },
    { id: "phosphorous", label: "phosphorous" },
    { id: "potassium", label: "potassium" },
    { id: "ph", label: "p h value" },
    { id: "moisture", label: "moisture" }
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
    document.getElementById("soilForm").addEventListener("submit", () => {

        if (!voiceActive || stopVoice) return;

        const next = getNext();

        if (next) {
            speak("Please fill all values first");
            setTimeout(askNext, 800);
            return;
        }

        speak("Getting recommendation");

        setTimeout(() => {
            const result = document.getElementById("resultText").innerText;

            if (result.trim()) {
                speak("Recommendation is", () => {
                    speak(result, stopAll);
                });
            }
        }, 2500);
    });

});

// -------- START --------
function startVoice() {

    stopVoice = false;
    voiceActive = true;

    const result = document.getElementById("resultText").innerText;

    if (result.trim()) {
        speak("Here is your recommendation", () => {
            speak(result, stopAll);
        });
        return;
    }

    if (!sessionStarted) {
        sessionStarted = true;
        speak("Welcome to crop and fertilizer recommendation", askNext);
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
        speak("All values filled. Getting recommendation");

        setTimeout(() => {
            document.getElementById("soilForm").requestSubmit();
        }, 800);

        return;
    }

    askNext();
}

// -------- ASK FIELD --------
function askNext() {

    clearTimeout(silenceTimer);

    const next = getNext();
    const result = document.getElementById("resultText").innerText;

    if (result.trim()) {
        speak("Recommendation is", () => {
            speak(result, stopAll);
        });
        return;
    }

    if (!next) {
        checkAutoSubmit();
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

    // ✅ Extract decimal or integer
    const num = text.match(/\d+(\.\d+)?/);

    if (!num) {
        speak("Say a numeric value", askNext);
        return;
    }

    fillField(num[0]);
}

// -------- FILL FIELD --------
function fillField(value) {

    const next = getNext();

    if (!next) {
        checkAutoSubmit();
        return;
    }

    document.getElementById(next.id).value = value;

    speak(next.label + " filled");

    setTimeout(() => {
        checkAutoSubmit();
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
