let save_btn = document.getElementById('save');
let content_box = document.getElementById('content');
save_btn.style.visibility = 'hidden';

let visibleToggle = false;

function editPost() {
    content_box.disabled = !content_box.disabled;
    if(content_box.disabled == true){
        save_btn.style.visibility = 'hidden';
    }
    else {
        save_btn.style.visibility = 'visible';
    }
}