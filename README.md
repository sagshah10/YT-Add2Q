# YT-Add2Q
 Firefox Extension to automate clicking of the `Add To Queue` button on YouTube. 

> ## Note:
- This addon is currently not published and requires to be manually imported via the Firefox 'Load Temporary Add-on' option found withing the 'about-debugging' page.
- This addon uses DOM manipulation to add videos to queue and therefore will break if/ when youtube make changes to their website html/ code.

# How It Works
After loading the addon as a temporary addon, on your Firefox browser, visit the YouTube website and sign in, then navigate to Subscriptions page and from that page you will have multiple ways to add addons to queue:

### Option 1 - Click the YT Add to Queue option within the browser toolbar section:
This option will navigate through all the videos that have been loaded on your subscription page and automatically add them to the queue. It always queue the oldest videos first.

### Option 2 - Click the injected red button with the name 'Add all `Period` to queue':
`Period` is replaced with `Today`, `Yesterday`, `Week`, `This Week`, `This month` and any other section period. 

Clicking the red button will add all videos uploaded within that section period to queue.

### Ignoring already watched videos:
Within this **YT Add to Queue** addon options page there is an option called **Percentage watched to ignore** to configure where as the name suggests define a percentage number to define how much of a video has been watched in order to skip it from being automatically added to the queue. The default value is 30. 

This option is there to ensure it will skip videos that you may have already watched. 

The reason why I have set it to 30% by default is because for my preference some videos that I watch from my subscribers, if I dont like the video I may have watched it a little and skipped it, and therefore to this 30% watched mark is a perfect number for me to automatically skip the videos.

