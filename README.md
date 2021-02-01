Advertise Invaders
==============
An "advertise ready" Space Invaders HTML5 porting.
Please, play a demo on: dvertiseInvaders/index.html

Save your score
--------------
The game saves/loads the best score saved on DB.
Simple PHP and MySQL scripts are provided to save best score (unfortunately in the online demo, hosted on github pages, the PHP script is not active).
- /source/DB.sql: create a simple DB with a table on which you can save game scores.
- /assets/php/config.php: configure your DB connection.

Tweet your score
--------------
You can tweet your score on "game over".

Arduino joystick support
--------------
Added support for **joystickIno**. Check: https://github.com/arcadeJHS/joystickIno.

Check and replace the configuration at:
```
JYI.config({
	inputHandler: joystickHandler,
	wsAddress: "ws://localhost:8000"
});
```

Browser support
--------------
Tested on Chrome, Firefox, Opera, IE10 (pretty good on IE9).
The game is quite ready to be played on a tablet (touch controls will appear) - tested on an iPad mini.


Issues
--------------
- No sounds on mobile.
- Better "resizing" support.
