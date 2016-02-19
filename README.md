
![logo](https://raw.githubusercontent.com/rfox90/beam-segacollection/master/img/logo.png)

# Beam Plays a Keyboard

Do you want to make a Beam Interactive Game? Quickely? This is for you.

## Setup
Video Coming Soon!

1. Pick a keyboard controlled game. Any game that allows configureable controls will work yes *ANY*.
2. Make a Controls layout for that game in the Beam Controls Editor
3. Get yourself [Nodejs](http://Nodejs.org) version 4.x and above is **required** check with `node -v`
4. Download this project as a zip file
5. Unzip it.
6. Open a terminal/cmd in its folder
7. Enter npm install. This will install project dependancies
8. Choose a keyboard handler see the [Handlers](README.md#handlers) section, I reccomend robotjs. There are other easier to install handlers described in the Handlers section below.
9. Install your handler with `npm install robotjs`
10. Write a config file in config/ called <YOUR GAME>.json example `config/pokemon.json` follow the sample one for a guide. A video is coming soon.
11. Start your chosen game, Open a cmd/terminal in the folder you downloaded.
12. Enter `node index.js config/<YOUR GAME>.json` in the terminal from step 11.
13. If you see "Connected to beam" you should be good to go.
14. Test out your controls.

## Config File Specifications

Comments within the file are **Invalid** But are included below here to provide instructions.
Remove them in your actual config file. Use [config/default.sample.json](config/default.sample.json) as a base/example.

`<>`'s indicate that you should replace the value and the `<>`'s with an apropriate value suitable to you.
E.G. `<username>` would become `ProbablePrime` in my case.

```
{
    "beam": {
	//Your Beam username
        "username": "<username>",
        //Your Beam Password
        "password": "<password>",
        //Your Beam channel
        "channel": "<channel name>"
    },
    //Which keyboard handler are you using, **I STRONGLY RECCOMEND LEAVING THIS AS ROBOTJS"
    "handler": "robotjs",
    
    //If your game is private. use these two properties to configure the version id and share code. Finding these
    // is detailed in the Sharing your game section
    "version":<versionid>,
    "code":"<sharecode>",
   
    //THE FOLLOWING ARE OPTIONAL, and should only be included if you want to remap controls
    
    //Should we remap the keys recieved from beam into other keys, default value is false
    "remap":true,
    //What should the key remaps be, in this example, if your beam controls use W this will actually push 1
    //This is optional remove this block if you don't need it. Both sides of this remap table should refer to the keys
    //In their string form. W not 87, 1 not 49. 
    "remapTable": {
        "W":"1",
        "S":"2",
        "A":"3",
        "D":"4",
        "J":"5",
        "K":"6",
        "L":"7",
        "I":"8"
    }
}
```

Always test your config file on a site like jsonlint.com to check that it is valid.

# Sharing your game

If your game is private or not published. You can use the version id and share code to enable other people (Including yourself to play it). To obtain these visit your controls and click the share button.

![share](https://raw.githubusercontent.com/ProbablePrime/beam-keyboard/master/img/share.png)

Select the second radio button in the popup. Your version code is a number displayed at the top of the popup. The share code is in the text box in the middle of the popup:
![share_code](https://raw.githubusercontent.com/ProbablePrime/beam-keyboard/master/img/share_code.png)

Place these in your config file:
```
    "version":<versionid>,
    "code":"<sharecode>",
```

# Handlers

3 Handlers are provided to do the actual keypressing when keys are recieved from Beam. They are in order of most reccomended to least:

* robotjs
* keyboardz
* kbm-robot

Installing robotjs on windows might be a bit problematic as it requires a valid node-gyp setup. see [this github issues](https://github.com/nodejs/node-gyp/issues/629). Alternatively you can use other supported handlers.

To use a handler for your game install it in the same folder as this project with `npm install` so if you chose keyboardz that would be `npm install keyboardz`. Then in your config file change the `"handler":"robotjs",` to `"handler":"keyboardz",`.

## A Warning about kbm-robot

kbm-robot was the intial handler for this project but keys would become stuck after 30 minutes of play. I've attempted to rectify this with a timer that restarts some kbm-robot internals. Please **DO NOT** use kbm-robot on an un-supervised stream. Unfourtunately kbm-robot is also the only handler capable of emitting `DirectX/XInput` compatible events. If your target game uses them robotjs and keyboardz might not work. 

# Metric / Maths
With potentially 100s of people pushing the buttons we need some way to decide if a button should be pushed. 

Beam currently provides in each report:
* the number of people who've used the controls at various intervals(now, 10s,20s,30s..etc)
* the number of people watching the stream
* For each button:
   * The number of people holding a button down
   * the number of button pushes
   * the number of button releases

Based on that we have to make a decision. This code's current decision process is.

* Calculate a percentage value for holding, releasing, pushing for this report
* For Each Button:
    * If the percent of people holding the button down this report is greater or equal to the threshold value(defaults to 50%)
    * Push the button.
    * Else Release the button.
   
If you can think of a better Metric. Please feel free to PR.

# Blocks
You can specify an optional configuration attribute called "blocks" which will block certain keys from being held down at the same time.

For example:
```
"blocks": {
  "start":"select",
  "select":"start"
}
```
Will prevent people from being able to push both select and start at the same time. This is helpful as it prevents soft resets.
In older games.

#Example Game Setups
* [Sega Collection](docs/SegaCollection.MD)
* [Visual Boy Advance](docs/VBA.MD)
