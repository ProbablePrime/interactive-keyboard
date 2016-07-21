# Beam Keyboard

[Beam.pro](https://beam.pro) is a live streaming site that lets viewers interract through onscreen controls with the streamer's game. This project binds beam interactive controls to keyboard/mouse events on the system. This allows viewers to control aspects of/the whole game through beam. 

This project is currently a work in progress and in a **Pre-Release** state. I would strongly suggest that **only developers** use it. I'm working on a more user friendly version but from the issue tracker you can see this is a long way off. 

A few 24/7 automated streams make heavy use of this.
* https://beam.pro/Youplay 
* https://beam.pro/merlin

## Requirements
Before Attempting to install this:

You **MUST**:
* Have knowledge of command line operations in your operating system
* Know NodeJs Well.
* Understand JSON files and how they should be structured
* Have a beam account
* Understand that this might not work for your game
* Understand that this whole project is in flux. Until it is 1.0.0 stuff will change.

## Setup

1. Make a Controls layout for that game in the Beam Controls Editor ensuring that both holding and frequency are checked for each key and that each key has something in `Keyboard Trigger`
2. Get yourself [Nodejs](http://Nodejs.org) version 5.x and above.
3. Clone this project with git
5. Open a terminal/cmd to its folder
6. Run `npm install`
7. In `config/` copy auth.sample.json to auth.json and fill it in with your beam details. I strongly suggest OAuth, use the Implicit flow to generate a `tetris:robot:self` & `channel:update:self` key, they last a year.
8. Choose a keyboard handler see the [Handlers](README.md#handlers) section, I reccomend `robot-js` or `robotjs`. Depending on your requirements you may need to use an alternative handler. Please read the section if you are unsure
9. Install your **Selected** handler with `npm install <handler>`
10. Write a config file in config/ called <YOUR GAME>.json example `config/pokemon.json` follow the sample one below for a guide
11. Start your chosen game, Open a cmd/terminal in the folder you downloaded.
12. Enter `node index.js ./config/<YOUR GAME>.json` in the terminal from step 11.
13. If you see "Connected to beam" you should be good to go.
14. Test out your controls.
15. If they do not work, see the [troubleshooting section ](README.md#troubleshooting)

## Config File Specifications

Comments within the file are **Invalid** But are included below here to provide instructions. You can see an example one at
Remove them in your actual config file. Use [config/default.sample.json](config/default.sample.json) as a base/example. always check the file at [jsonlint.com](jsonlint.com) for validity.

### Placeholders
`<>`'s indicate that you should replace the value and the `<>`'s with an apropriate value suitable to your situtation.
E.G. `<username>` would become `ProbablePrime` in my case.

```
{
    //Which keyboard handler are you using?
    "handler": "<handler>",

    //Use these two properties to configure the version id and share code. Finding these
    // is detailed in the Sharing your game section
    "version":<versionid>,
    "code":"<sharecode>"
}
```

# Sharing your game

If your game is private or not published. You can use the version id and share code to enable other people (Including yourself to play it). To obtain these visit your controls and click the share button.

![share](https://raw.githubusercontent.com/ProbablePrime/beam-keyboard/master/img/share.png)

Select the second radio button in the popup. Your version id is a number displayed at the **top of the popup**. The share code is in the text box in the middle of the popup:

![share_code](https://raw.githubusercontent.com/ProbablePrime/beam-keyboard/master/img/share_code.png)

Place these in your config file ensuring that the file is still valid json:
```
    "version":<versionid>,
    "code":"<sharecode>"
```

# Handlers

Handlers are provided to do the actual keypressing when keys are recieved from Beam. We currently support:

* robot-js - A new alternative to robotjs
* robotjs - Robust, Linux/Windows/Mac (Robotjs is now easier to install go play, yay!)

## Deprecated Handlers
These handlers have undocumented compatibility issues.
* keyboardz - Easy to install, Windows only
* kbm-robot - Easy to install, Flakey/Unpredictable. Supports DirectInput/XInput games


To use a handler for your game install it in the same folder as this project with `npm install` so if you chose `kbm-robot` that would be `npm install kbm-robot`. Then in your config file change the `"handler":"robot-js",` to `"handler":"kbm-robot",`.

# Consensus / Metric / Maths
With potentially 100s of people pushing the buttons we need some way to decide if a button should be pushed.

Beam currently provides in each report:
* the number of people who've used the controls at various intervals(now, 10s,20s,30s..etc)
* the number of people watching the stream
* For each button:
   * The number of people holding a button down
   * the number of button pushes
   * the number of button releases

We support multiple Consensus algorithms but for now the default is called "Democracy" it works as follows:

* Calculate a percentage value for holding, releasing, pushing for this report
* For Each Button:
    * If the percent of people holding the button down this report is greater or equal to the threshold value(defaults to 50%)
    * Push the button.
    * Else Release the button.

If you can think of a better Metric. Please feel free to PR.

# Advanced Configuration

## Blocks
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

# Troubleshooting

## Errors on startup.

Try reading the first line of the error, Some of them will be in plain english and should tell you exactly whats wrong. If you can't understand the error then contact me :).

## Controls Do not work
* Check your keybindings for the game they should match the keys you are pressing. Press the actual keys on your keyboard to check.
* Try refreshing the beam page.
* Are you focused on/in your game. You must have your mouse inside the game for the keys to register.
* Try `kbm-robot` as your handler some require this to interface with DirectInput/XInput.
* Try from another device. As this pushes your physical keys, its often impossible to test on the same machine as an infinite loop of key presses occurs. Summon a friend into your channel to help test :).
* Try The key without a spark cost or cooldown.
* Set your threshold to `0.1` in the config file
