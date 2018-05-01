// Write
let input = document.querySelector('.input__field--hoshi'),
	searchHidden = document.querySelector('.searchHidden'),
	wordSearchFirst = document.querySelector('.wordSearchFirst'),
	wordSearchRest = document.querySelector('.wordSearchRest'),
	word = [];

let wordName = () => {
	searchHidden.value = input.value
	word.push(input.value)
	wordSearchFirst.innerHTML = word[word.length - 1].split('', 1)
	wordSearchRest.innerHTML = word[word.length - 1].slice(1)
}
wordName()

input.addEventListener('keyup', wordName)
input.addEventListener('focusout', wordName)
document.addEventListener('DOMContentLoaded', wordName)