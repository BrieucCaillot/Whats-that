var inputContainer = [...document.querySelectorAll('.input-custom')];
var input = document.querySelector('.input__field--hoshi');

inputContainer.map((elem) => {
	document.addEventListener('DOMContentLoaded', () => {
		elem.firstElementChild.value === "" ? elem.classList.remove('input--filled') : elem.classList.add('input--filled');

		elem.firstElementChild.addEventListener('blur', () => {
			elem.firstElementChild.value === "" ? elem.classList.remove('input--filled') : elem.classList.add('input--filled');
		});
	});
});
let inputSearch = document.querySelector('#input-search')
let xmlhttp = new XMLHttpRequest();
let url = "/api/autocomplete";
inputSearch.addEventListener('keyup', () => {
	if (inputSearch.value.length >= 1) {
		xmlhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let myArr = JSON.parse(this.responseText);
				let inputValue = inputSearch.value;
				let autocomplete = () => {
					myArr.map((elem) => {
						if (elem.name.indexOf(inputValue) > -1) {
							document.querySelector("#searchResult").innerHTML = `
							<li class="pd-b1">
                                <a class="text is-white is-capitalized" href="/definition?word=${elem.name}">${elem.name}</a>
							</li>`
						}
					})
				}
				autocomplete();
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	} else {
		document.querySelector("#searchResult").innerHTML = " "
	}

})








