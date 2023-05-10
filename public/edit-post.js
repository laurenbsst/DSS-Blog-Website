let content = document.querySelector(".content");
let editBtn = document.querySelector(".edit-btn");
editBtn.disabled = true;
input.addEventListener("change", stateHandle);

function stateHandle() {
    if(document.querySelector(".content").value === "") {
        button.disabled = true;
    } else {
        button.disabled = false;
    }
}




function editPost () {
    // making content available to edit
    const isDisabled = document.getElementById('content').disabled;
    document.getElementById('content').disabled = isDisabled;
};