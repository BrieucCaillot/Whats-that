var inputContainer = document.querySelector('.input-custom');
var input = document.querySelector('.input__field--hoshi');

input.addEventListener('blur', function() {
    input.value === "" ? inputContainer.classList.remove('input--filled') : inputContainer.classList.add('input--filled');
});

