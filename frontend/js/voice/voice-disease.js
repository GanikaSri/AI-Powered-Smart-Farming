// ===== DISEASE VOICE ASSISTANT (AUTO-DETECT VERSION) =====

let recognition;
let stopVoice = false;
let voiceActive = false;
let sessionStarted = false;

document.addEventListener("DOMContentLoaded", () => {

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SR) {
        alert("Use Chrome browser");
        return;
    }

    recognition = new SR();
    recognition.lang = "en-IN";

    recognition.onend = () => {
        if (!stopVoice && voiceActive) startMic();
    };

    document.getElementById("voiceBtn").onclick = startVoice;

    // ✅ AUTO DETECT ON IMAGE UPLOAD
    document.getElementById("leafImage").addEventListener("change", () => {

        if (!voiceActive || stopVoice) return;

        speak("Image uploaded successfully");

        setTimeout(() => {
            runDetection(); // 🔥 AUTO START
        }, 1000);
    });

    // ✅ MANUAL SUBMIT SUPPORT
    document.getElementById("diseaseForm").addEventListener("submit", () => {

        if (!voiceActive || stopVoice) return;

        speak("Analyzing disease");

        setTimeout(readResult, 2500);
    });

});

// -------- START --------
function startVoice() {

    stopVoice = false;
    voiceActive = true;

    const result = document.getElementById("resultText").innerText;
    const img = document.getElementById("leafImage");

    // ✅ If result already exists
    if (result.trim() !== "") {
        speak("Detected disease is", () => {
            speak(result, stopAll);
        });
        return;
    }

    // ✅ Welcome ALWAYS
    if (!sessionStarted) {
        sessionStarted = true;

        speak("Welcome to crop disease detection", () => {

            if (!img.files.length) {
                speak("Please upload leaf image");
            } else {
                // 🔥 AUTO RUN if already uploaded
                runDetection();
            }

        });

    } else {

        if (!img.files.length) {
            speak("Please upload leaf image");
        } else {
            runDetection();
        }
    }
}

// -------- AUTO DETECTION --------
function runDetection() {

    speak("Analyzing disease");

    document.getElementById("diseaseForm").requestSubmit();

    setTimeout(readResult, 2500);
}

// -------- READ RESULT --------
function readResult() {

    const result = document.getElementById("resultText").innerText;

    if (result.trim() !== "") {
        speak("Detected disease is", () => {
            speak(result, stopAll);
        });
    } else {
        speak("No result found");
    }
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
