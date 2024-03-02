document.addEventListener("DOMContentLoaded", function() {
    function openForm() {
        document.getElementById("popup-form-container").style.display = "block";
    }

    function closeForm() {
        document.getElementById("popup-form-container").style.display = "none";
    }


    document.querySelector(".btn-contact").addEventListener("click", function(event){
        event.preventDefault(); 
        openForm(); 
    });

    document.querySelector(".close-btn").addEventListener("click", function(event){
        event.preventDefault(); 
        closeForm();
    });

    document.querySelector(".cancel-btn").addEventListener("click", function(event){
        event.preventDefault(); 
        closeForm();
    });

    window.addEventListener("click", function(event) {
        var popup = document.getElementById("popup-form-container");
        if (event.target === popup) {
            closeForm();
        }
    });
});
