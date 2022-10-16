browser.browserAction.onClicked.addListener((tab) => {

    var isYTSubscriptionPage = tab.url.indexOf('youtube.com/feed/subscriptions') > -1;
    //console.log("isYTSubscriptionPage = " + isYTSubscriptionPage);

    function onError(error) {
        console.error(`Error: ${error}`);
    }

    if (isYTSubscriptionPage) {
        browser.tabs.sendMessage(tab.id,{ elm: null }).catch(onError);
    }
});