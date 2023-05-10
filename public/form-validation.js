function validateForm() {
    var query = new URL(window.location).searchParams.get('search');
    document.getElementById("search").value = query;
    document.getElementById("posts-title").innerText = "You searched for: " + query;
}