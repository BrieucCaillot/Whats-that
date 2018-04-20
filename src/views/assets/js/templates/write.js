let input = document.querySelector('.input__field--hoshi'),
    searchHidden = document.querySelector('.searchHidden'),
    wordSearchFirst = document.querySelector('.wordSearchFirst'),
    wordSearchRest = document.querySelector('.wordSearchRest'),
    word = [];

input.addEventListener('keyup', () => {
    searchHidden.value = input.value
});

input.addEventListener('focusout', () => {
    word.push(input.value)
    wordSearchFirst.innerHTML = word[word.length - 1].split('', 1)
    wordSearchRest.innerHTML = word[word.length - 1].slice(1)
});