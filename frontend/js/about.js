document.getElementById("contactForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Clear the form and show thank you message
    document.getElementById("contactForm").reset();
    document.getElementById("thankYou").style.display = "block";

    // Hide message after a few seconds
    setTimeout(() => {
        document.getElementById("thankYou").style.display = "none";
    }, 4000);
});
