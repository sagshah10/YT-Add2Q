function saveOptions(e) {
    e.preventDefault();
    browser.storage.sync.set({
        percentageWatchedToSkip: document.querySelector("#watched_video_perecentage").value
    });
}

function restoreOptions() {

    function setCurrentChoice(result) {
        document.querySelector("#watched_video_perecentage").value = result.percentageWatchedToSkip || 30;
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let percentageWatchedOption = browser.storage.sync.get("percentageWatchedToSkip");
    percentageWatchedOption.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
