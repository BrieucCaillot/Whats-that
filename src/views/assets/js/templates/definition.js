let wordDefinition = document.querySelector('.word-definiton').innerHTML,
	wordFirst = document.querySelector('#wordFirst'),
	wordSecond = document.querySelector('#wordSecond'),
	wordName = [];

let pushWord = () => {
	wordName.push(wordDefinition)
	wordFirst.innerHTML = wordName[0].split('', 1)
	wordSecond.innerHTML = wordName[0].slice(1)
}
pushWord()
