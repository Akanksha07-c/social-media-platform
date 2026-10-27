const commentButtons = document.querySelectorAll(".comment-btn");
commentButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        const postId = button.dataset.postId;
        const commentSection = document.getElementById(`comments-${postId}`);

        if (commentSection.style.display === "none") {
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

                if (comment.user._id.toString() === currentUserId) {
                    const deleteForm = document.createElement("form");
                    deleteForm.action = `/delete-comment/${comment._id}`;
                    deleteForm.method = "POST";

                    const pageInput = document.createElement("input");
                    pageInput.type = "hidden";
                    pageInput.name = "page";
                    pageInput.value = currentPage;

                    deleteForm.appendChild(pageInput);

                    const deleteButton = document.createElement("button");
                    deleteButton.type = "submit";
                    deleteButton.textContent = "Delete";
                    deleteButton.className =
                        "text-red-500 text-sm hover:text-red-700 hover:underline ml-2";

                    deleteForm.appendChild(deleteButton);
                    div.appendChild(deleteForm);
                }

                commentsList.appendChild(div);
            });

            commentSection.style.display = "block";
        } else {
            commentSection.style.display = "none";
        }
    });
});