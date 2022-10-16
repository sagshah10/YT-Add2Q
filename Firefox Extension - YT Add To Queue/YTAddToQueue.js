console.warn("YT Add to Queue Addon Running!!");

const mouseEnterEvent = new Event('mouseenter');
const mouseOverEvent = new Event('mouseover');
const mouseLeaveEvent = new Event('mouseleave');
const clickEvent = new Event('click');
const YTSubscriptionPageURL = 'https://www.youtube.com/feed/subscriptions';

var maxWatchedPercentage = 30;
getMaxWatchedPercentageToSkip();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/* 
Inject custom CSS to page for Styling Add to queue buttons.
*/
var style = document.createElement('style');
style.classList.add("add_to_queue_styles");
style.innerHTML = `
    .add_to_queue {
        background-color: #ff0000b5;
        border-radius: 2rem;
        color: #fff; 
        padding: 5px;
        cursor: pointer;
    }`
document.head.appendChild(style);


// Get Element by tag name call shortened. (Used before I knew about '.querySelector()')
function getElmTags(obj, name) {
    if (typeof (obj) === "object" && typeof (obj.getElementsByTagName) === 'function') {
        return obj.getElementsByTagName(name);
    }
}

// Get Element by ID call shortened. (Used before I knew about '.querySelector()')
function getElmID(obj, name) {
    if (typeof (obj) === "object" && typeof (obj.getElementById) === 'function') {
        return obj.getElementById(name);
    }
}

async function addToQueue(vidItems) {

    // Show add to queue buttons on thumbnail
    vidItems.element.dispatchEvent(mouseEnterEvent);
    await sleep(30);

    try {
        // console.log("vidItems.thumbnail = ", vidItems.thumbnail.element);
        const thumbnailElms = getElmTags(vidItems.thumbnail.element, 'ytd-thumbnail-overlay-toggle-button-renderer')

        if (!thumbnailElms) {
            return;
        }

        const add2QBlock = thumbnailElms[1];

        const triggerElement = add2QBlock.childNodes[3];
        // console.log(triggerElement);

        //Show expanded Add to queue button inside add to queue icon.
        triggerElement.dispatchEvent(mouseEnterEvent);

        //simulate mouse left click to add video to queue
        await sleep(50);
        triggerElement.dispatchEvent(clickEvent);

        // Leave mosue video to stop any acting events.
        await sleep(30);
        triggerElement.dispatchEvent(mouseLeaveEvent);
    } catch (e) {
        console.log("ERROR = ", e);
    }

    vidItems.element.dispatchEvent(mouseLeaveEvent);
}

function getWatchedProgress(videoBlock) {
    //Get Watched Progress
    let watchedPercentage = 0;
    let progressContainer = getElmTags(videoBlock, 'ytd-thumbnail-overlay-resume-playback-renderer');
    //console.log("progressContainer = ", progressContainer);

    if (progressContainer.length) {
        progressContainer = progressContainer[0];

        let progressWatchedDiv = getElmTags(progressContainer, 'div');
        //console.log("progressWatchedDiv = ", progressWatchedDiv);

        if (progressWatchedDiv.length) {
            watchedPercentage = progressWatchedDiv[0].style.width || 0;
        }
    }

    return parseInt(watchedPercentage);
}

async function getVideosToQueue(videoBlocksCoreElm) {
    // var browse = getElmTags(document, 'ytd-browse')[0];
    var videoBlocks = getElmTags(videoBlocksCoreElm, 'ytd-grid-video-renderer');
    var subscriptionVideos = [];
    var block, aTags, vidItems;
    var indexToStart = videoBlocks.length - 1

    
    for (var i = indexToStart; i > -1; i--) { // Add older videos first
    
    //for (var i = 0; i < 10; i++) { // Add latest videos first
    
        block = videoBlocks[i];

        vidItems = {};

        try {

            //Get Watched progress of a video
            let watched = getWatchedProgress(block);

            //Check how much of the video has been watched and if greater then the defined max percentage ignore this video. If watched = 0, then it will not skip any video.
            if (watched != 0 && watched >= maxWatchedPercentage) {
                continue;
            }

            // Process A Tags
            aTags = getElmTags(block, 'a');
            vidItems = {
                element: block,
                watched: watched,
                thumbnail: {
                    element: aTags[0],
                    url: aTags[0].href
                },
                videoTitle: {
                    element: aTags[1],
                    title: aTags[1].text
                },
                channel: {
                    element: aTags[2],
                    channelUrl: aTags[2].href,
                    channelName: aTags[2].text
                }
            }

            subscriptionVideos.push(vidItems);

            await addToQueue(vidItems);

        } catch (err) {
            console.error("Index ", i, " had an ERROR. \n\nBlock = ", block, "\n\nError = ", err);
        }
    };
}

function getMaxWatchedPercentageToSkip() {
    function onGot(item) {
        // console.log("item = ", item);
        if (item.percentageWatchedToSkip) {
            maxWatchedPercentage = item.percentageWatchedToSkip;
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    let getting = browser.storage.sync.get("percentageWatchedToSkip");
    getting.then(onGot, onError);//.then(() => {  });
}


/* 
* Add Option Each Youtube Subscription Shelf (e.g. Today, Yesterday, .. sections) to add only that section to queue.
*/
const getParentElmt = (elmt, nodeName) => {
    let currentParent = elmt.parentNode;

    while (currentParent) {
        if (currentParent.nodeName == nodeName) {
            return currentParent;
        }
        currentParent = currentParent.parentNode;
    }
};

const createA2QButton = (elm, title) => {
    let button = document.createElement('button');
    button.innerHTML = `Add all ${title} to queue`;
    button.classList.add('add_to_queue');

    // Following Styling no longer required as this CSS is now being injected as a style directly onto the page from the piece of code at the top of this document.
    // button.style.backgroundColor = "#ff0000b5"; //"red";
    // button.style.borderRadius = "2rem";
    // button.style.color = "#fff"; //"white";
    // button.style.padding = "10px";
    // button.style.cursor = "pointer";
    // button.style.fontWeight = "bold";

    button.onclick = (event) => {
        var parentShelfNode = getParentElmt(event.target, 'YTD-SHELF-RENDERER');

        if (parentShelfNode) {
            getVideosToQueue(parentShelfNode);
        }
    }

    elm.appendChild(button);
};



const processShelfNode = (elm) => {

    if (elm.querySelector('.add_to_queue')) {
        return;
    }

    let titleContainer = elm.querySelector('#title-container');
    let h2tag = titleContainer.querySelector('h2');
    let title = h2tag.querySelector('#title');

    createA2QButton(h2tag, title.textContent);
}


/*
This function is used to check for any existing Shelf that are already pre-loaded in the page and therefore will not be detected by MutationObservation, and process them appropriately. 
*/
const processCachedShelves = () => {
    document.querySelectorAll('YTD-SHELF-RENDERER').forEach((shelfNode) => {
        processShelfNode(shelfNode);
    });
}


/* 
Function used to setup MutationObserver and scan document body for specific changes.
*/
let oldHref;
let nodeObserver = new MutationObserver((mutations) => {
    let currentHref = document.location.href;

    // Checks if YouTube page URL changes.
    // Detect YT Redirect URL Solution found from: https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
    if (oldHref != currentHref) {
        oldHref = currentHref;

        if (currentHref == YTSubscriptionPageURL) {
            processCachedShelves();
        }
    }

    if (currentHref != YTSubscriptionPageURL) {
        return;
    }

    // If in YT Subscription page then watch for YTD-SHELF-RENDERER node to be created.
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeName == "YTD-SHELF-RENDERER") {
                processShelfNode(node);
            }
        })
    });
});

/*
Start observation of changes within YT document body. This triggers as soon as YouTube page is visited, 
as the addon is unable to detect internal redirects once the YT page is loaded.
*/
function observeDocumentBody() {
    nodeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
};


/**
 * Listen for messages from the background script.
 * Trigger all videos on the subscription page to be added to temporary Queue.
*/
browser.runtime.onMessage.addListener((message) => {
    console.log("AddToQue Addon adding subscription videos to temporary playlist");
    if (!message.elm) {
        getVideosToQueue(document)
    }
});

window.addEventListener("load", observeDocumentBody);