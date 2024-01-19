// main.js

document.addEventListener('DOMContentLoaded', function () {
    document
        .querySelector("#dark-mode-toggle")
        .addEventListener('click', function () {
            document.body.classList.toggle("latex-dark");
            if (document.body.classList.contains("latex-dark")) {
                document.getElementsByClassName("menu")[0].style.backgroundColor = "#1e1e1e";
            }
            else {
                document.getElementsByClassName("menu")[0].style.backgroundColor = "#f5f5f5";
            }
        });
});
