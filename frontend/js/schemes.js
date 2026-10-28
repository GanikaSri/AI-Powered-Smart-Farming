function getScheme(){

let crop = document.getElementById("crop").value
let state = document.getElementById("state").value
let land = document.getElementById("land").value
let limit = document.getElementById("limit").value   // ✅ NEW

fetch(`http://127.0.0.1:8000/api/scheme/recommend/?crop=${crop}&state=${state}&land=${land}&limit=${limit}`)
.then(res => res.json())
.then(data => {

console.log("API Response:", data)

let output = ""

if(!data.recommended_schemes || data.recommended_schemes.length === 0){

output = "<p>No schemes found.</p>"

}
else{

data.recommended_schemes.forEach(s => {

output += `
<div class="scheme-box">

<div class="scheme-info">
<h3>${s.scheme}</h3>
<p>${s.benefit}</p>
</div>

<div class="scheme-action">
<a href="${s.link}" target="_blank" class="btn apply-btn">
Apply on Government Website
</a>
</div>

</div>
`

})

}

document.getElementById("result").innerHTML = output
document.getElementById("resultCard").style.display = "block"

})
.catch(error => {

console.error("Fetch error:", error)

document.getElementById("result").innerHTML =
"<p>Server error. Please try again.</p>"

})

}