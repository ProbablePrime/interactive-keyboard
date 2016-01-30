
![logo](https://raw.githubusercontent.com/rfox90/beam-segacollection/master/img/logo.png)

# Beam Plays a Keyboard

Do you want to make a Beam Interactive Game? Quickely? This is for you.

## Setup
Video Coming Soon!

1. Pick a keyboard controlled game. Any game that allows configureable controls will work yes *ANY*.
2. Make a Controls layout for that game in the Beam Controls Editor
3. Get yourself [Nodejs](http://Nodejs.org)
4. Download this project as a zip file
5. Unzip it.
6. Open a terminal/cmd in its folder
7. Enter npm install. This will install project dependancies
8. Choose a keyboard handler, I reccomend robotjs.
9. Install your handler with `npm install robotjs`
10. Write a config file in config/ called default.json follow the sample one for a guide. A video is coming soon.
11. Start your chosen game, Open a cmd/terminal in the folder you donwnloaded.
12. Hit Go Interactive and select your game on beam.
12. Do node index.js in the terminal from step 11.
13. If you see "Connected to beam" you should be good to go.
14. Test out your controls.

## Config File Specifications

Comments within the file are **Invalid** But are included below here to provide instructions.
Remove them in your actual config file. Use config/default.sample.json as a base.

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
    //What percentage of people need to be pushing a button for it to count (0.5 = 50%)
    "threshold":0.5,
    //Which keyboard handler are you using, **I STRONGLY RECCOMEND ROBOTJS"
    "handler": "robotjs",
    //Should we remap the keys recieved from beam into other keys, default value is false
    "remap":true,
    //What should the key remaps be, in this example, if your beam controls use W this will actually push 1
    //This is optional remove this block if you don't need it
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

Always test your config file on a site like jsonlint.com to check that it is valid

#Example Game Configs
Sega Collection
