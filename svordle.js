// Inställningar
const tillåtna_bokstäver = "abcdefghijklmnopqrstuvwxyzåäö"
const tangentbords_layout = ["qwertyuiopå", "asdfghjklöä", "zxcvbnm"]

// Tillstånd
let meddelandeelement
const rutnät = []
const tangentbord = {}

let nuvarande_rad = 0
let nuvarande_kolumn = 0
let hemligt_ord = ordlista[Math.floor(Math.random() * ordlista.length)]

// Funktioner för att uppdatera rutnätet
function sätt_bokstav(rad, kolumn, bokstav) {
	rutnät[rad][kolumn].innerHTML = `<span>${bokstav}</span>`
	animera(rutnät[rad][kolumn], "blop", 100)
}

function sätt_status(rad, kolumn, status) {
	rutnät[rad][kolumn].classList.add(status)
	animera(rutnät[rad][kolumn], "blop", 100)
}

function animera(element, animation, längd_i_ms) {
	element.style.animation = `${animation} ${längd_i_ms}ms ease-in-out forwards`
	setTimeout(() => {
		element.style.animation = ""
	}, längd_i_ms)
}

// Funktioner för att rätta
function visa_meddelande(text, ta_bort_efter_ms = 5000) {
	var meddelande = skapa_div(meddelandeelement, "meddelande")
	meddelande.className = "meddelande"
	meddelande.innerText = text

	if (meddelandeelement.childElementCount > 1) {
		meddelandeelement.firstElementChild.remove()
	}

	if (ta_bort_efter_ms > 0)
		setTimeout(() => {
			meddelande.remove()
		}, 5000)
}

function gissa() {
	if (nuvarande_kolumn != 5) {
		visa_meddelande("Skriv helt ord")
		return
	}

	var gissning = ""
	for (let b = 0; b < 5; b++) {
		let bokstav = rutnät[nuvarande_rad][b].innerText.toLowerCase().trim()
		gissning += bokstav
	}

	if (!ordlista.includes(gissning)) {
		visa_meddelande(`'${gissning}' finns inte i ordlistan`)
		return
	}

	// Rätta bokstäverna
	for (let b = 0; b < 5; b++) {
		let bokstav = gissning[b]
		let rätt = hemligt_ord[b] == bokstav
		let finns = hemligt_ord.includes(bokstav)
		let status = rätt ? "rätt" : "fel"
		if (finns && !rätt) status = "finns"

		sätt_status(nuvarande_rad, b, status)
		var tangent = tangentbord[bokstav]
		if (tangent.status != "rätt") tangent.status = status

		tangent.element.className = "tangent"
		tangent.element.classList.add(tangent.status)
	}

	if (gissning == hemligt_ord) {
		visa_meddelande("Hurra, det va rätt!", 0)
	} else {
		nuvarande_rad++
		nuvarande_kolumn = 0
		if (nuvarande_rad == rutnät.length)
			visa_meddelande(`Åh, nej. Du hittade inte ordet: ${hemligt_ord}`, 0)
	}
}

// Funktioner för att redigera DOM
function skapa_div(förälder, klass, inreHTML) {
	var div = document.createElement("div")
	div.className = klass
	if (inreHTML) {
		div.innerHTML = inreHTML
	}

	if (förälder != null) {
		förälder.appendChild(div)
	}

	return div
}

function tryck_tangent(tangent) {
	if (tangent == "Backspace" && nuvarande_kolumn > 0) {
		nuvarande_kolumn--
		sätt_bokstav(nuvarande_rad, nuvarande_kolumn, "")
	} else if (tangent == "Enter") {
		gissa()
	} else if (nuvarande_kolumn <= 4 && tillåtna_bokstäver.includes(tangent)) {
		sätt_bokstav(nuvarande_rad, nuvarande_kolumn, tangent)
		nuvarande_kolumn++
	}

	if (tangentbord[tangent]) {
		animera(tangentbord[tangent].element, "blop", 150)
	}
}

function starta() {
	console.log("Spelet startar...")

	const kontainerelement = document.querySelector(".kontainer")
	meddelandeelement = skapa_div(kontainerelement, "meddelanden")
	const rutnätselement = skapa_div(kontainerelement, "rutnät")

	// Skapa rutnät
	for (let g = 0; g < 6; g++) {
		const radelement = skapa_div(rutnätselement, "rad")
		const rad = []

		for (let b = 0; b < 5; b++) {
			const rutelement = skapa_div(radelement, "ruta")
			rad[b] = rutelement
		}
		rutnät.push(rad)
	}

	// Skapa Tangentbord
	const tangentbordselement = skapa_div(kontainerelement, "tangentbord")
	for (let r of tangentbords_layout) {
		const bokstäver_i_rad = r.split("")
		const tangentbordsradelement = skapa_div(
			tangentbordselement,
			"tangentbordsrad",
		)

		if (r == tangentbords_layout[2]) {
			tangentbord.Enter = {
				element: skapa_div(tangentbordsradelement, "bred-tangent", "gissa"),
			}
			tangentbord.Enter.element.onclick = () => tryck_tangent("Enter")
		}

		for (let b of bokstäver_i_rad) {
			const tangentelement = skapa_div(tangentbordsradelement, "tangent", b)
			tangentelement.onclick = () => {
				tryck_tangent(b)
			}
			tangentbord[b] = {
				element: tangentelement,
				status: "okänd",
			}
		}

		if (r == tangentbords_layout[2]) {
			tangentbord.Backspace = {
				element: skapa_div(tangentbordsradelement, "bred-tangent", "sudda"),
			}
			tangentbord.Backspace.element.onclick = () => tryck_tangent("Backspace")
		}
	}

	window.addEventListener("keydown", (ev) => {
		tryck_tangent(ev.key)
	})
}

starta()
