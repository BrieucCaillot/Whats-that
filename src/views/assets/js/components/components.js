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






