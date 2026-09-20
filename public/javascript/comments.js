const commentButtons = document.querySelectorAll(".comment-btn");
commentButtons.forEach((button) => {
    button.addEventListener("click", async() =>{
        const postId = button.dataset.postId;
        const commentSection = document.getElementById(`comments-${postId}`);
        if(commentSection.style.display === "none") {
            const respone = await fetch(`/comments/${postId}`);
            const comments = await respone.json();
              const commentsList =
                commentSection.querySelector(".comments-list");

            commentsList.innerHTML = "";

            comments.forEach((comment) => {

                const div = document.createElement("div");

               const username = document.createElement("strong");
               username.textContent = comment.user.username;

               const content = document.createElement("p");
               content.textContent = comment.content;

               div.appendChild(username);
               div.appendChild(content);

                commentsList.appendChild(div);
            });
            commentSection.style.display = "block";
        } else {
            commentSection.style.display = "none";
        }
    });
});