const grammarBtn = document.getElementById("grammarBtn");
const postContent = document.getElementById("postContent");

grammarBtn.addEventListener("click", async () => {

    const content = postContent.value.trim();

    if (!content) {
        alert("Please write something first");
        return;
    }

    grammarBtn.disabled = true;
    grammarBtn.textContent = "Checking...";

    try {

        const response = await fetch("/ai/grammar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content: content
            })
        });

        const data = await response.json();

        console.log("LanguageTool response:", data);

        if (!response.ok) {
            alert(data.error || "Something went wrong");
            return;
        }

        let correctedText = content;

        for (let i = data.matches.length - 1; i >= 0; i--) {

            const match = data.matches[i];

            if (match.replacements.length > 0) {

                const replacement = match.replacements[0].value;

                correctedText =
                    correctedText.slice(0, match.offset) +
                    replacement +
                    correctedText.slice(match.offset + match.length);
            }
        }

        postContent.value = correctedText;

    } catch (error) {

        console.log("Grammar error:", error);
        alert("Unable to check grammar");

    } finally {

        grammarBtn.disabled = false;
        grammarBtn.textContent = "✨ Improve Grammar";
    }
});

