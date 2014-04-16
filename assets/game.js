/*
Licensed under a Creative Commons Attribution - Share Alike 3.0 - Unported license (CC BY-SA 3.0). 
The text of the license is available at http://creativecommons.org/licenses/by-sa/3.0/

https://github.com/arcadeJHS/AvertiseInvaders 
*/

(function() {

	var microSpaceInvaders = function(container_IN, bestScore) {
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// helpers 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		// element selector
		var $$$ = function(selector, el) {  
			if (!el) {el = document;}  
			return el.querySelector(selector);  
		};

		var microtime = function() {
			var now = new Date().getTime() / 1000;
			var s = parseInt(now, 10);
			return (Math.round((now - s) * 1000) / 1000) + s;
		};

		(function() {
			var lastTime = 0;
			var vendors = ['ms', 'moz', 'webkit', 'o'];
			for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				window.requestAnimationFrame = window[vendors[x]+'requestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelrequestAnimationFrame'];
			}
		 
			if (!window.requestAnimationFrame)
				window.requestAnimationFrame = function(callback, element) {
					var currTime = new Date().getTime();
					var timeToCall = Math.max(0, 16 - (currTime - lastTime));
					var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
					lastTime = currTime + timeToCall;
					return id;
				};
		 
			if (!window.cancelAnimationFrame)
				window.cancelAnimationFrame = function(id) {
					clearTimeout(id);
				};
		})();
		
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// game objects 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!												
		var container = $$$("#" + container_IN); 
		var gameBestScore = bestScore;
		var img, canvas, context, frameCounter, isGameOver, runningAnimation, playerDead, playerDeadTime;
		var updateAliensFrameCounter = 33;

		// audio
		var	alienSoundTrack = 0,
			alienSounds = [
				new Audio("assets/audio/1.wav"),
				new Audio("assets/audio/2.wav"),
				new Audio("assets/audio/3.wav"),
				new Audio("assets/audio/4.wav")
			],
			ufoSound = new Audio("assets/audio/ufo.wav"),		
			playerDeathSound = new Audio("assets/audio/crash.wav"),
			fireSound = new Audio("assets/audio/fire.wav"),
			bangSound = new Audio("assets/audio/bang.wav");

		//var spriteSheet = "si_sprite_sheet_bw.png";
		var spriteSheet = "data:image/png;base64,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";
		
		var sprites = {
			alien_1: 			{	id: "alien_1",										
									width: 32,
									height: 32,
									tiles: [{x: 4, y: 4}, {x: 40, y: 4}]
			},
			alien_2: 			{	id: "alien_2",										
									width: 44,
									height: 32,
									tiles: [{x: 4, y: 40}, {x: 56, y: 40}]
			},
			alien_3:			{	id: "alien_3",										
									width: 48,
									height: 32,
									tiles: [{x: 4, y: 76}, {x: 60, y: 76}]
			},
			flyingSaucer:		{	id: "flyingSaucer",										
									width: 48,
									height: 28,
									tiles: [{x: 4, y: 128}]
			},
			cannon:				{	id: "cannon",
									width: 52,
									height: 32,
									tiles: [{x: 4, y: 160}, {x: 60, y: 160}]
			},
			cannonBullet:		{	id: "cannonBullet",
									width: 4,
									height: 28,
									tiles: [{x: 4, y: 200}]								
			},
			alienBullet:		{	id: "alienBullet",
									width: 12,
									height: 28,
									tiles: [{x: 12, y: 200}]								
			},
			alienExplosion:		{	id: "alienExplosion",
									width: 52,
									height: 28,
									tiles: [{x: 32, y: 200}]								
			},
			saucerExplosion:	{	id: "saucerExplosion",
									width: 52,
									height: 28,
									tiles: [{x: 88, y: 200}]								
			},
			bunkerFull:			{	id: "bunkerFull",
									width: 24,
									height: 24,
									tiles: [{x: 4, y: 232}, {x: 32, y: 232}, {x: 60, y: 232}, {x: 88, y: 232}]								
			},
			bunkerTopLeft:		{	id: "bunkerTopLeft",
									width: 24,
									height: 24,
									tiles: [{x: 4, y: 260}, {x: 32, y: 260}, {x: 60, y: 260}, {x: 88, y: 260}]								
			},
			bunkerTopRight:		{	id: "bunkerTopRight",
									width: 24,
									height: 24,
									tiles: [{x: 4, y: 288}, {x: 32, y: 288}, {x: 60, y: 288}, {x: 88, y: 288}]								
			},
			bunkerBottomLeft:	{	id: "bunkerBottomLeft",
									width: 24,
									height: 24,
									tiles: [{x: 4, y: 316}, {x: 32, y: 316}, {x: 60, y: 316}, {x: 88, y: 316}]								
			},
			bunkerBottomRight:	{	id: "bunkerBottomRight",
									width: 24,
									height: 24,
									tiles: [{x: 4, y: 344}, {x: 32, y: 344}, {x: 60, y: 344}, {x: 88, y: 344}]								
			},
			bunkerFullSmall:	{	id: "bunkerFullSmall",
									width: 18,
									height: 18,
									tiles: [{x: 4, y: 372}, {x: 22, y: 372}, {x: 44, y: 372}, {x: 66, y: 372}]								
			},
			scoreAdv:			{	id: "scoreAdv",
									width: 140,
									height: 28,
									tiles: [{x: 4, y: 400}]								
			}
		};					
		
		var sprite = function(e) {
			this.typeOf = "sprite";
			this.sprite = e.sprite;
			this.tileId = 0;
			this.x = e.x;
			this.y = e.y;
			this.scale = e.scale || 1;
		};
		
		var ship = function(e) {
			this.base = new sprite(e);
			for (var i in this.base) {this[i] = this.base[i];}
			
			this.typeOf = "ship";
			this.points = e.points;
			this.state = "alive";							
			
			this.collide = function(o) {
				return (this.state == "alive" && o.y >= this.y && o.y <= this.y+this.sprite.height && o.x >= this.x && o.x <= this.x+this.sprite.width);
			};
			
			this.touchBorder = function() {
				if(aliens.alienSpeedX > 0) {
					var rightX = this.x+aliens.alienSquareWidth+5;
					return ( rightX >= canvas.width );
				} else {
					var leftX = this.x-(aliens.alienSquareWidth-this.sprite.width)/2;
					return ( leftX <= 0 );
				}
			};
			
			this.setSprite = function(sprite) {
				this.sprite = sprite;
			};
			
			this.setState = function(state) {
				this.state = state;
			};
		};
		
		var flyingSaucerShip = function(e) {
			this.base = new ship(e);
			for (var i in this.base) 
			{
				if (i == "base") continue;								
				this[i] = this.base[i];
			}
			
			this.typeOf = "flyingSaucerShip";
		};
		
		var bullet = function(e) {
			this.base = new sprite(e);
			for (var i in this.base) {this[i] = this.base[i];}
			
			this.typeOf = "bullet";
			
			this.collide = function(o) {
				return ( 
					// aliens
					(this.y+this.sprite.height >= o.y && this.y <= o.y && this.x+this.sprite.width >= o.x && this.x <= o.x+o.sprite.width)
					||
					// human
					(o.state == "alive" && this.y <= o.y+o.sprite.height && this.y >= o.y && this.x+this.sprite.width >= o.x && this.x <= o.x+o.sprite.width)
				);
			};
		};
		
		var bunker = function(e) {
			this.typeOf = "bunker";
			this.x = e.x;
			this.y = e.y;
			this.blocks = [	
				new sprite({sprite: sprites.bunkerTopLeft, x: this.x, y: this.y}),
				new sprite({sprite: sprites.bunkerFull, x: this.x + sprites.bunkerFull.width, y: this.y}),
				new sprite({sprite: sprites.bunkerFull, x: this.x + 2*sprites.bunkerFull.width, y: this.y}),
				new sprite({sprite: sprites.bunkerTopRight, x: this.x + 3*sprites.bunkerFull.width, y: this.y}),
				new sprite({sprite: sprites.bunkerFull, x: this.x, y: this.y + sprites.bunkerFull.height}),
				new sprite({sprite: sprites.bunkerBottomRight, x: this.x + sprites.bunkerFull.width, y: this.y + sprites.bunkerFull.height}),
				new sprite({sprite: sprites.bunkerBottomLeft, x: this.x + 2*sprites.bunkerFull.width, y: this.y + sprites.bunkerFull.height}),
				new sprite({sprite: sprites.bunkerFull, x: this.x + 3*sprites.bunkerFull.width, y: this.y + sprites.bunkerFull.height}),
				new sprite({sprite: sprites.bunkerFull, x: this.x, y: this.y + 2*sprites.bunkerFull.height}),
				new sprite({sprite: sprites.bunkerFull, x: this.x + 3*sprites.bunkerFull.width, y: this.y + 2*sprites.bunkerFull.height}) 
			];
		};

		var ADV_LETTER = function(e) {			
			this.typeOf = "ADV";
			this.x = e.x;
			this.y = e.y;
			this.scale = 1;

			this.letter = e.letter;

			this.blocks = [];

			var row = 0, r = 0, c = 0;

			for (r=0, l=this.letter.length; r<l; r++) {
				row = this.letter[r]; 
				for (c=0, n=row.length; c<n; c++) {
					if (parseInt(row[c]) == 0) {
						this.blocks.push( new sprite({sprite: sprites.bunkerFullSmall, x: this.x + c*sprites.bunkerFullSmall.width, y: this.y + r*sprites.bunkerFullSmall.height}) );
					}
				}
			}		
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// sky background 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!						
		var sky = {
			stars: [],
			starsLayer: 2,
			k_star_number: 10,
			
			init: function() {
				if ("ontouchstart" in window) { return; }
				this.stars = [];
				var n, i;
				for (n = 0; n < this.starsLayer; n++) {
					this.stars.push([]);

					// star params: [0]: x, [1]: y, [2]: random starRadius, [3]: random star transparency, [4]: max star radius, [5]: speed 
					for (i = 0; i < this.k_star_number; i++) {
						this.stars[n].push([Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * (n*2+3), Math.random()/2, (n*2+3), (n*2+3)-2]);
					}
				}
			},
			
			drawStars: function() {
				var star, x, y, radius, alpha, maxRadius, speed, n, i;
				for (n = 0, nl = this.stars.length; n < nl; n++) {
					for (i = 0, il = this.stars[n].length; i < il; i++) {
						star = this.stars[n][i];
						x = star[0];
						y = star[1];
						radius = star[2];
						alpha = star[3];
						maxRadius = star[4];
						speed = star[5];
						
						// draw
						context.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
						context.beginPath();
						context.arc(x, y, radius, 0, Math.PI * 2, true);
						context.closePath();
						context.fill();
						
						// draw 8 bit
						// square style stars
						/*
						context.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
						context.fillRect(x, y, radius, radius);
						*/
						/*
						// plus style stars
						context.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
						context.lineWidth = 1;
						context.beginPath();
						context.moveTo(x, 				y);
						context.lineTo(x+radius, 		y);				
						context.lineTo(x+radius, 		y+radius);
						context.lineTo(x+(2*radius),	y+radius);
						context.lineTo(x+(2*radius), 	y+(2*radius));
						context.lineTo(x+radius, 		y+(2*radius));
						context.lineTo(x+radius, 		y+(3*radius));				
						context.lineTo(x, 				y+(3*radius));
						context.lineTo(x, 				y+(2*radius));
						context.lineTo(x-radius, 		y+(2*radius));
						context.lineTo(x-radius, 		y+radius);
						context.lineTo(x, 				y+radius);				
						context.lineTo(x, 				y);
						context.fill();	
						*/									
						
						// recreate if out of screen
						if (x - radius < 0) {
							star[0] = canvas.width - radius;
							star[2] = Math.random() * maxRadius;
							star[1] = Math.random() * canvas.height;
							star[3] = Math.random() / 2;
						} 
						// move
						else {
							star[0] -= speed;
						}
					}
				}
			}
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// aliens 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var aliens = {
			flyingSaucer: null, 
			alienBullet: null, 
			flyingSaucerTimer: null, 
			arrAliens: null, 
			alienBorderCollision: null,
			alienBulletSpeed: 10,
			nAlienRows: 5,
			nAliensByRow: 11,
			alienSquareWidth: 60,
			alienSquareHeight: 40,
			alienSpeedX: 10,
			alienSpeedY: 40,
			alienInitialY: 180,
			flyingSaucerInitialY: 120,
			flyingSaucerSpeed: 4,
		
			init: function() {
				this.alienBorderCollision = true;
				this.flyingSaucer = null;
				this.flyingSaucerTimer = new Date().getTime();
				this.alienBullet = null;	
				this.arrAliens = [];
				this.alienSpeedX = 10;
				
				var sprite, points;
				for (var r = 0; r < this.nAlienRows; r++)
				{
					if (r == 0)
					{
						sprite = sprites.alien_1;
						points = 30;
					}
					if (r > 0 && r < 3)
					{
						sprite = sprites.alien_2;
						points = 20;
					}
					if (r > 2 && r < 5)
					{
						sprite = sprites.alien_3;
						points = 10;
					}
					
					for (var a = 0; a < this.nAliensByRow; a++)
					{
						this.arrAliens.push(new ship({	sprite: sprite, 
														x: (a*this.alienSquareWidth)+(this.alienSquareWidth-sprite.width)/2, 
														y: r*this.alienSquareHeight+this.alienInitialY, 
														points: points	}));
					}							
				}
			},
			
			updateAliens: function() {
				alienSoundTrack++;
				if(alienSoundTrack > 3) {
					alienSoundTrack = 0;
				}
				alienSounds[alienSoundTrack].play();

				var a;
				var upd = {x: 0, y: 0, tile: 1};

				var moveX = this.alienSpeedX;
				var moveY = 0;
				for (var i = 0; i < this.arrAliens.length; i++)
				{								
					a = this.arrAliens[i];
					
					if (a.state == "striked")
					{
						this.arrAliens.splice(i, 1);
						i = 0;
						continue;
					}
					
					// check alien collision with canvas borders
					if (a.touchBorder() && !this.alienBorderCollision)
					{			
						this.alienBorderCollision = !this.alienBorderCollision;

						moveX = 0;
						moveY = this.alienSpeedY;
						this.alienSpeedX *= -1;									
						break;
					}
					
					// check alien collision with player
					if (a.y+a.sprite.height >= human.cannon.y)
						isGameOver = true;
				}
				
				if (moveX != 0)
					this.alienBorderCollision = !this.alienBorderCollision;
				
				upd.x = moveX;
				upd.y = moveY;
				
				return upd;
			},
			
			drawAlienShips: function(upd) {
				var a;
				for (var i = 0; i < this.arrAliens.length; i++)
				{								
					a = this.arrAliens[i];

					if (a.state == "striked")
						a.setSprite(sprites.alienExplosion);

					a.x += upd.x;
					a.y += upd.y;								
					a.tileId += upd.tile; 
					if (a.tileId >= a.sprite.tiles.length)
						a.tileId = 0;
					
					context.drawImage(img, a.sprite.tiles[a.tileId].x, a.sprite.tiles[a.tileId].y, a.sprite.width, a.sprite.height, a.x, a.y, a.sprite.width, a.sprite.height);
				}	

				if (this.arrAliens.length == 0) {
					updateAliensFrameCounter = Math.floor(updateAliensFrameCounter*0.8);
					aliens.init();
				}
			},
			
			updateFlyingSaucer: function() {
				return (this.flyingSaucer && this.flyingSaucer.state == "striked");
			},
			
			drawFlyingSaucer: function(fs) {
				var time = new Date().getTime();														
				if (!this.flyingSaucer)
				{
					if (time - this.flyingSaucerTimer >= 10000)
					{
						this.flyingSaucer = new flyingSaucerShip({	sprite: sprites.flyingSaucer, 
																	x: canvas.width, 
																	y: this.flyingSaucerInitialY, 
																	points: 100	});
					}
				}
				else
				{
					if (this.flyingSaucer.state == "striked")
						this.flyingSaucer.sprite = sprites.saucerExplosion;
					
					if (this.flyingSaucer.x <= -sprites.flyingSaucer.width || fs)
					{
						this.flyingSaucer = null;
						this.flyingSaucerTimer = time;
					}
					else
					{
						ufoSound.play();
						this.flyingSaucer.x -= this.flyingSaucerSpeed;
						context.drawImage(img, this.flyingSaucer.sprite.tiles[0].x, this.flyingSaucer.sprite.tiles[0].y, this.flyingSaucer.sprite.width, this.flyingSaucer.sprite.height, this.flyingSaucer.x, this.flyingSaucer.y, this.flyingSaucer.sprite.width, this.flyingSaucer.sprite.height);
					}
				}
			},

			drawAliens: function() {
				var fs;
				var al = {x: 0, y: 0, tile: 0};

				if (frameCounter == updateAliensFrameCounter)
				{					
					al = this.updateAliens();
					fs = this.updateFlyingSaucer(); 
					frameCounter = 0;
				}
				else
				{
					frameCounter++;
				}
				
				this.drawAlienShips(al);							
				this.drawFlyingSaucer(fs);
			},
			
			drawAlienBullet: function() {
				if (this.alienBullet) {
					var bulletOnScreen = true;
					this.alienBullet.y += this.alienBulletSpeed;
					
					// alienBullet outside borders
					if (this.alienBullet.y >= canvas.height)
						bulletOnScreen = false;
					
					// alienBullet hits cannon
					if (bulletOnScreen) {
						if (!playerDead && this.alienBullet.collide(human.cannon))
						{									
							playerDead = true;
							playerDeadTime = microtime();
							playerDeathSound.play();
							lives.nLives--;
							if (lives.nLives == 0) human.cannon.tileId++;
							bulletOnScreen = false;
						}
					}
					
					// alienBullet hits bunker
					if (bulletOnScreen) {								
						var bk, block;
						for (var i = 0, j = bunkers.arrBunker.length; i < j; i++)
						{
							bk = bunkers.arrBunker[i];
							for (var k = 0, x = bk.blocks.length; k < x; k++)
							{
								block = bk.blocks[k]; 
								if (this.alienBullet.collide(block))
								{									
									block.tileId++;												
									if (block.tileId >= block.sprite.tiles.length)
									{
										bk.blocks.splice(k, 1);
									}												
									bulletOnScreen = false;												
									break;	
								}
							}
						}
					}
					
					// alienBullet on bottom line
					if (bulletOnScreen && this.alienBullet.y+this.alienBullet.sprite.height >= lives.lineY) {
						var strInterrupts = lives.lineInterrupts.join();

						if (strInterrupts.indexOf(this.alienBullet.x.toString()) < 0)
							lives.lineInterrupts.push(this.alienBullet.x);
					}

					// draw or remove bullet
					if (bulletOnScreen)
						context.drawImage(img, this.alienBullet.sprite.tiles[0].x, this.alienBullet.sprite.tiles[0].y, this.alienBullet.sprite.width, this.alienBullet.sprite.height, this.alienBullet.x, this.alienBullet.y, this.alienBullet.sprite.width, this.alienBullet.sprite.height);
					else
						this.alienBullet = null;
				}
				else {
					var alienIdx = Math.floor((this.arrAliens.length+1)*Math.random());
					if (this.arrAliens[alienIdx]) {
						this.alienBullet = new bullet({	sprite: sprites.alienBullet, 
														x: this.arrAliens[alienIdx].x+this.arrAliens[alienIdx].sprite.width/2, 
														y: this.arrAliens[alienIdx].y	});
					}
				}
			}
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// cannon 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var human = {
			cannon: null, 
			cannonBullet: null, 
			moveCannon: null, 
			cannonFire: null,						
			cannonSpeed: 8,						
			cannonBulletSpeed: 10,
			score: 0,
			
			init: function() {
				this.moveCannon = "N";
				this.cannonFire = false;
				this.cannonBullet = null;
				this.score = 0;
				
				this.cannon = new ship({	sprite: sprites.cannon, 
											x: (canvas.width/2) - (sprites.cannon.width/2), 
											y: (canvas.height-55) - sprites.cannon.height });
			},

			updateScore: function(points) {
				this.score += points;				
			},
			
			drawCannon: function() {
				if (!isGameOver) {
					switch (this.moveCannon)
					{
						case "L":
							if (this.cannon.x >= 0)
								this.cannon.x += -this.cannonSpeed;
							break;
						case "R":
							if (this.cannon.x <= canvas.width-this.cannon.sprite.width)
								this.cannon.x += this.cannonSpeed;
							break;
						default:
							this.cannon.x += 0;
							break;
					}
				}

				// update for window resizing
				this.cannon.y = (canvas.height-55) - sprites.cannon.height;
				if (isGameOver || playerDead) {
					context.drawImage(img, this.cannon.sprite.tiles[1].x, this.cannon.sprite.tiles[1].y, this.cannon.sprite.width, this.cannon.sprite.height, this.cannon.x, this.cannon.y, this.cannon.sprite.width, this.cannon.sprite.height);
					if (playerDead && !isGameOver) {
						if (microtime() - playerDeadTime > 1) {
							playerDead = false;
						}
					}
				} else {
					context.drawImage(img, this.cannon.sprite.tiles[0].x, this.cannon.sprite.tiles[0].y, this.cannon.sprite.width, this.cannon.sprite.height, this.cannon.x, this.cannon.y, this.cannon.sprite.width, this.cannon.sprite.height);
				}
			},
			
			drawCannonBullet: function() {		
				// cannonBullet exists
				if (this.cannonBullet) {
					var bulletOnScreen = true;							
					this.cannonBullet.y -= this.cannonBulletSpeed;
					
					// collision with canvas upper border
					if (this.cannonBullet.y <= 0)
						bulletOnScreen = false;

					// collision with alien bullet
					if (bulletOnScreen) {
						if (aliens.alienBullet && this.cannonBullet.collide(aliens.alienBullet)) {
							aliens.alienBullet = null;
							bulletOnScreen = false;
						}
					}
					
					// collision with flyingSaucer
					if (bulletOnScreen) {
						if (aliens.flyingSaucer && this.cannonBullet.collide(aliens.flyingSaucer))
						{									
							bangSound.play();
							aliens.flyingSaucer.setState("striked");
							this.updateScore(aliens.flyingSaucer.points);
							bulletOnScreen = false;									
						}
					}
					
					// collision with alien
					if (bulletOnScreen) {								
						var a;
						for (var i = 0; i < aliens.arrAliens.length; i++)
						{
							a = aliens.arrAliens[i];
							if (this.cannonBullet.collide(a))
							{						
								bangSound.play();
								a.setState("striked");
								this.updateScore(a.points);
								bulletOnScreen = false;
								break;
							}
						}
					}
					
					// collision with bunker
					if (bulletOnScreen) {								
						var bk, block;
						for (var i = 0, j = bunkers.arrBunker.length; i < j; i++)
						{
							bk = bunkers.arrBunker[i];
							for (var k = 0, x = bk.blocks.length; k < x; k++)
							{
								block = bk.blocks[k]; 
								if (this.cannonBullet.collide(block))
								{									
									block.tileId++;												
									if (block.tileId >= block.sprite.tiles.length)
									{
										bk.blocks.splice(k, 1);
									}												
									bulletOnScreen = false;
									break;	
								}
							}
						}
					}

					// collision with ADV
					if (bulletOnScreen) {								
						var bk, block;
						for (var i = 0, j = adv.arrAdv.length; i < j; i++)
						{
							bk = adv.arrAdv[i];
							for (var k = 0, x = bk.blocks.length; k < x; k++)
							{
								block = bk.blocks[k]; 
								if (this.cannonBullet.collide(block))
								{									
									block.tileId++;												
									if (block.tileId >= block.sprite.tiles.length)
									{
										bk.blocks.splice(k, 1);
									}												
									bulletOnScreen = false;
									break;	
								}
							}
						}
					}
					
					// draw or remove bullet
					if (bulletOnScreen)
						context.drawImage(img, this.cannonBullet.sprite.tiles[0].x, this.cannonBullet.sprite.tiles[0].y, this.cannonBullet.sprite.width, this.cannonBullet.sprite.height, this.cannonBullet.x, this.cannonBullet.y, this.cannonBullet.sprite.width, this.cannonBullet.sprite.height);
					else
						this.cannonBullet = null;
				}
				// create bullet
				else if (this.cannonFire)
				{
					if (!isGameOver && !playerDead) {
						fireSound.play();
						this.cannonBullet = new bullet({	sprite: sprites.cannonBullet, 
															x: this.cannon.x+(this.cannon.sprite.width/2)-sprites.cannonBullet.width/2, 
															y: this.cannon.y	});
					}
				}
			}
		};


		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// ADV
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!		
		var adv = {
			arrAdv: [],	
			distance: 0,
			advFrameCounter: 0,

			adv_letters: [
				[
					[0,0,0,0,0,0,0],
					[0,0,1,1,1,0,0],
					[0,1,0,0,0,1,0],
					[0,1,0,0,0,1,0],
					[0,1,1,1,1,1,0],
					[0,1,0,0,0,1,0],
					[0,0,0,0,0,0,0]
				],
				[
					[1,1,1,1,1,1,1],
					[1,0,0,0,1,1,1],
					[1,1,0,1,1,1,1],
					[1,1,0,1,1,1,1],
					[1,1,0,1,1,0,1],
					[1,0,0,0,0,0,1],
					[1,1,1,1,1,1,1]
				],
				[
					[0,0,0,0,0,0,0],
					[0,0,1,1,1,0,0],
					[0,0,0,1,0,0,0],
					[0,0,0,1,0,0,0],
					[0,0,0,1,0,0,0],
					[0,0,1,1,1,0,0],
					[0,0,0,0,0,0,0]
				],
				[
					[1,1,1,1,1,1,1],
					[1,0,0,0,0,0,1],
					[1,0,1,1,1,1,1],
					[1,0,0,0,0,1,1],
					[1,0,1,1,1,1,1],
					[1,0,0,0,0,0,1],
					[1,1,1,1,1,1,1]
				],
				[
					[0,0,0,0,0,0,0],
					[0,1,0,0,0,1,0],
					[0,1,1,0,0,1,0],
					[0,1,0,1,0,1,0],
					[0,1,0,0,1,1,0],
					[0,1,0,0,0,1,0],
					[0,0,0,0,0,0,0]
				]
			],

			moveX: 15,
			moveY: 5,
			marginTop: -126,
			updateAdvFrameCounter: 21,
			shakeAdv: 150,
			init: function() {
				var x, y, nLetters = this.adv_letters.length;
				this.arrAdv = [];
				this.moveX = 15;
				this.moveY = 5;
				this.advFrameCounter = 0;
				this.updateAdvFrameCounter = 21;
				adv.shakeAdv = 150;
				for (var i = 0; i < nLetters; i++)
				{
					x = (canvas.width / 2) - ( ( (((sprites.bunkerFullSmall.width*1)*7) * nLetters) + this.distance * nLetters ) / 2) + ( i * (((sprites.bunkerFullSmall.width*1)*7) + this.distance) ); 
					y = (adv.marginTop);
					this.arrAdv.push(new ADV_LETTER({x: x, y: y, letter: this.adv_letters[i]}));
				}
			},						
			
			updateAdv: function() {
				var bk, block, j, t;
				for (var i = 0; i < this.arrAdv.length; i++) {								
					bk = this.arrAdv[i];
					
					if (bk.y < 40) { 
						bk.y += adv.moveY;						
					}
					else {
						adv.moveY = 0;
						adv.updateAdvFrameCounter = 5;
						
						if (adv.shakeAdv-- == 0) { 
							adv.moveX = 0;
							adv.updateAdvFrameCounter = 33;
							playerDeathSound.play();
						}
					}

					for (j = 0, t = bk.blocks.length; j < t; j++) {
						block = bk.blocks[j];
						block.x += adv.moveX;
						block.y += adv.moveY;
					}

				}
				adv.moveX *= -1;
			},

			drawAdv: function() {
				var bk, block, t, i, j;
				for (i = 0, b = this.arrAdv.length; i < b; i++)
				{
					bk = this.arrAdv[i];
					for (j = 0, t = bk.blocks.length; j < t; j++)
					{
						block = bk.blocks[j];
						context.drawImage(img, block.sprite.tiles[block.tileId].x, block.sprite.tiles[block.tileId].y, block.sprite.width, block.sprite.height, block.x, block.y, block.sprite.width*bk.scale, block.sprite.height*bk.scale);
					}
				}							
			},
			
			advLoop: function() {
				if (adv.advFrameCounter == adv.updateAdvFrameCounter) {
					adv.updateAdv();
					adv.advFrameCounter = 0;
				}
				else {
					adv.advFrameCounter++;
				}
				
				this.drawAdv();							
			},
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// bunkers 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var bunkers = {
			arrBunker: [],
			nBunkers: 4,					
			
			init: function() {
				var x, y;
				this.arrBunker = [];
				for (var i = 0; i < this.nBunkers; i++)
				{
					x = (canvas.width / (this.nBunkers*2)) - ((sprites.bunkerFull.width*4) / 2) + (i * (canvas.width / this.nBunkers)); 
					y = (canvas.height-180);
					this.arrBunker.push(new bunker({x: x, y: y}));
				}
			},
			
			drawBunkers: function() {
				var bk, block;
				for (var i = 0, b = this.arrBunker.length; i < b; i++)
				{
					bk = this.arrBunker[i];
					for (var j = 0, t = bk.blocks.length; j < t; j++)
					{
						block = bk.blocks[j];
						context.drawImage(img, block.sprite.tiles[block.tileId].x, block.sprite.tiles[block.tileId].y, block.sprite.width, block.sprite.height, block.x, block.y, block.sprite.width, block.sprite.height);
					}
				}						
			}
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// lives 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var lives = {
			nLives: 3,
			lineY: 0,
			lineHeight: 5,
			lineInterrupts: [],
			lineImageData: null,
			
			init: function() {
				this.nLives = 3;
				this.lineInterrupts = [];
				this.lineImageData = null;
				this.lineY = canvas.height-50;

				var txtArea = new textHelper.textArea({	cls: "field livesField", 
														childs: [textHelper.writeText({cls: "text livesText", id: "livesPlayer1", text: this.nLives})],
														appendTo: container,
														left: "0px",
														bottom: "0px" });
			},
			
			sortInterrupts: function(a, b) {
				return a - b;
			},

			drawLine: function() {
				// draw a line (with interrupts due to alienBullet fall)
				context.fillStyle = "rgba(0,255,0,255)";
				var	rectX = 0,
					rectWidth = canvas.width;
					
				lives.lineInterrupts.sort(this.sortInterrupts);

				for(var i = 0; i < this.lineInterrupts.length; i++) {		
					rectWidth = this.lineInterrupts[i] - rectX;
					context.fillRect(rectX, this.lineY, rectWidth, this.lineHeight);
					rectX = this.lineInterrupts[i]+sprites.alienBullet.width;									
				}
				
				rectWidth = canvas.width - rectX;
				context.fillRect(rectX, this.lineY, rectWidth, this.lineHeight);							
			},
			
			drawLives: function() {
				this.drawLine();
				
				var x, y;
				for (var i = 0; i < this.nLives; i++) {
					y = (canvas.height-sprites.cannon.height-7);
					x = (sprites.cannon.width+i*(sprites.cannon.width*1.5));
					
					c = new ship({	sprite: sprites.cannon, 
									x: (canvas.width/2)-(sprites.cannon.width/2), 
									y: (canvas.height-sprites.cannon.height) });
					
					context.drawImage(img, sprites.cannon.tiles[0].x, sprites.cannon.tiles[0].y, sprites.cannon.width, sprites.cannon.height, x, y, sprites.cannon.width, sprites.cannon.height);
				}
				
				if (!isGameOver)
					textHelper.updateText("#livesPlayer1", this.nLives);
			}
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// text on screen 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var textHelper = {					
			textArea: function(o) {
				this.div = document.createElement("div");
				if (o.id) this.div.id = o.id;
				this.div.className = o.cls;
				this.childs = o.childs;
				this.appendTo = o.appendTo;
				if (o.width) this.div.style.width = o.width + "px";
				
				this.appendTo.appendChild(this.div);
				
				if (this.childs) {
					for (var i=0, j=this.childs.length; i < j; i++)
						this.div.appendChild(this.childs[i]);
				}	

				this.set = function(o) {
					var left, top, right, bottom;		
					if (o.position)
					{
						switch(o.position)
						{
							case "centerBottom":
								left = ( (canvas.width/2) - this.div.offsetWidth/2 ) + "px";
								bottom = 0 + "px";
								break;
							case "centerHV":
								left = ( (canvas.width/2) - this.div.offsetWidth/2 ) + "px";
								top = ( canvas.height/2 - this.div.offsetHeight/2 ) + "px"; 
								break;
							case "centerH":
								left = ( (canvas.width/2) - this.div.offsetWidth/2 ) + "px";
								break;
						}
					}

					if (o.left) left = o.left;
					if (o.top) top = o.top;
					if (o.bottom) bottom = o.bottom;
					if (o.right) right = o.right;

					this.div.style.left = left;
					this.div.style.top = top;
					this.div.style.bottom = bottom;
					this.div.style.right = right;
				};
				
				this.set(o);

				return this;
			},
			
			removeTextArea: function(id) {
				container.removeChild(document.querySelector("#" + id));
			},
			
			writeText: function(o) {
				var p = document.createElement("p");
				p.className = o.cls;
				
				if (o.id) p.id = o.id;
				if (o.text) p.appendChild(document.createTextNode(o.text));						
				if (o.innerhtml) p.innerHTML = o.innerhtml;						
				if (o.onclick) {p.onclick = o.onclick;}		
				
				return p;
			},

			writeAnything: function(o) {
				if (o.type) var x = document.createElement(o.type);
				else return false;

				if (o.cls) x.className = o.cls;
				if (o.attributes && o.attributes.length) {
					for(var i=0; i < o.attributes.length; i++) {
						x.setAttribute(o.attributes[i][0], o.attributes[i][1]);
					}
				}
				//if (o.inputType) x.setAttribute('type', o.inputType);
				//if (o.src) x.setAttribute('src', o.src);
				if (o.id) x.id = o.id;
				if (o.text) x.appendChild(document.createTextNode(o.text));
				if (o.innerhtml) x.innerHTML = o.innerhtml;
				if (o.onclick) {x.onclick = o.onclick;}

				return x;
			},
			
			// instruction sequence is important in Firefox				
			typewrite: function(str) {
				var p, nChar, d = 2;
				var arrP = document.querySelectorAll(str);
				for (var i = 0; i < arrP.length; i++)
				{					
					p = arrP[i];
					
					p.className += " typewrite ";
					
					nChar = p.textContent.length;
					
					// set @keyframes using CSSOM: "from" and "to" are derived from <p> offsetWidth
					var style = document.documentElement.appendChild(document.createElement("style"));
					var rule =	p.id + "_typing {from {width: 0} to {width: " + nChar + "em}}";	// setting width this way avoids problems due to @fontface loading delay							 
					// WebKit
					if (CSSRule.WEBKIT_KEYFRAMES_RULE) { 
						style.sheet.insertRule("@-webkit-keyframes " + rule, 0);
					}
					// Mozilla
					else if (CSSRule.MOZ_KEYFRAMES_RULE) { 
						style.sheet.insertRule("@-moz-keyframes " + rule, 0);
					}
					// W3C
					else if (CSSRule.KEYFRAMES_RULE) { 
						style.sheet.insertRule("@keyframes " + rule, 0);
					}
					///
					
					// set .end class for animation end
					//rule = "{width: " + nChar + "em;}";
					rule = "{width: auto;}";
					style.sheet.insertRule("#" + p.id + ".end" + rule, 0);
					///
					
					// set animation: steps # is derived from text length inside <p>							
					p.style["animation"] = p.id + "_typing " + d + "s steps(" + nChar + ", end) " + i * d + "s";
					p.style["-webkit-animation"] = p.id + "_typing " + d + "s steps(" + nChar + ", end) " + i * d + "s";
					p.style["MozAnimation"] = p.id + "_typing " + d + "s steps(" + nChar + ", end) " + i * d + "s";
					p.style["-ms-animation"] = p.id + "_typing " + d + "s steps(" + nChar + ", end) " + i * d + "s";
					///
					
					p.className += " startTypewrite ";

					p.removeEventListener("animationend", this.typewrite_cb, false);
					p.removeEventListener("webkitAnimationEnd", this.typewrite_cb, false);

					p.addEventListener("animationend", this.typewrite_cb, false);
					p.addEventListener("webkitAnimationEnd", this.typewrite_cb, false);
				}		

				return d*arrP.length;
			},
			
			typewrite_cb: function(e) {
				e.target.className += " end ";
			},
			
			changeTextColor: function(id, color) {
				var p = $$$(id), i;
				if (!color) {
					var blocks = "0123456789ABCDEF";
					color = "#";
					for (i = 0; i < 3; i++) {
						color += blocks.substr(Math.random()*blocks.length, 1);
					}
				}							
				if (p) p.style.color = color;							
			},
			
			updateText: function(id, val, pad) {
				var txt = $$$(id);
				txt.innerHTML = (pad == null) ? val : textHelper.pad(val, 5, '0', 'L');
			},
			
			removeText: function(id) {
				var txt = $$$('#'+id);
				console.debug(txt);
				if (txt) txt.parentNode.removeChild(txt);
			},
			
			pad: function(str, len, chr, side) {
				var add = '';
				str = str.toString();						
				while (add.length < (len-str.length)) {
					add += chr;
				}
				switch (side)
				{
					case "L":
						str = add + str;
						break;
					case "R":
						str = str + add;
						break;
				}
				return str;
			}
		};
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// game 
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		var keyPressed = function(e) {
			if(!e) e = window.event;
			inputHandler(e.keyCode, e.type);
		};
		
		function inputHandler(code, type) {
			switch (code)
			{
				case 37:	// left arrow
					human.moveCannon = (type == "keyup") ? "N" : "L"; 
					break;
				case 39:	// right arrow
					human.moveCannon = (type == "keyup") ? "N" : "R"; 
					break;
				case 32:	// spacebar									
					human.cannonFire = (type == "keyup") ? false : true;
					break;
			}
		}
		
		var gameLoop = function() {
			context.clearRect(0, 0, canvas.width, canvas.height);

			sky.drawStars();
			human.drawCannon();
			adv.advLoop();
			aliens.drawAliens();
			bunkers.drawBunkers();										
			human.drawCannonBullet();
			aliens.drawAlienBullet();
			
			textHelper.updateText("#scorePlayer1", human.score, true);						
			lives.drawLives();
			
			if (isGameOver) {
				screens.gameOver();
			}
			
			if (lives.nLives == 0) 
				isGameOver = true;
		};

		var setCanvas = function() {
			canvas = document.createElement("canvas");
			canvas.tabIndex = 0;			
			context = canvas.getContext('2d');

  			container.appendChild(canvas);
		};
		
		var resizeCanvas = function() {						
			canvas.width = container.offsetWidth;
			canvas.height = container.offsetHeight;
			context.fillRect(0, 0, canvas.width, canvas.height);
		};
		
		var startGame = function(e) {
			// stop event propagation on "play" button
			if (!e) var e = window.event;
			e.cancelBubble = true;
			if (e.stopPropagation) e.stopPropagation();
			
			screens.game();
		};

		var submitScore = function(e) {
			// stop event propagation on "play" button
			if (!e) var e = window.event;
			e.cancelBubble = true;
			if (e.stopPropagation) e.stopPropagation();
			
			// call server
			var	name = $$$("#nameInput").value,
				email = '',
				score = human.score;

			qwest.post(
				'assets/php/si_call.php',
				{action: "saveScore", name: name, email: email, score: score}
			)
			.success(function(response) {
				//alert(response.text);
				screens.scoreSubmitted();
			})
			.error(function(message) {
				alert("Error: " + message);
			});
		};

		var mobile = {
			init: function() {
				var	mobile_left = document.createElement("div"),
					mobile_left_txt = document.createElement("div"),
					mobile_right = document.createElement("div"),
					mobile_right_txt = document.createElement("div"),
					mobile_shot_left =  document.createElement("div"),
					mobile_shot_left_txt = document.createElement("div");
					mobile_shot_right =  document.createElement("div"),
					mobile_shot_right_txt = document.createElement("div");
  				container.appendChild(mobile_left);
  				container.appendChild(mobile_left_txt);
  				container.appendChild(mobile_right);
  				container.appendChild(mobile_right_txt);
  				container.appendChild(mobile_shot_left);
  				container.appendChild(mobile_shot_left_txt);
  				container.appendChild(mobile_shot_right);
  				container.appendChild(mobile_shot_right_txt);  				
  				mobile_left.className = "mobile-button mobile-left";
  				mobile_left_txt.className = "mobile-button mobile-left mobile-text";
  				mobile_left_txt.id = "move-left";
  				mobile_left_txt.appendChild(document.createTextNode('<'));
  				mobile_right.className = "mobile-button mobile-right";
  				mobile_right_txt.className = "mobile-button mobile-right mobile-text";
  				mobile_right_txt.id = "move-right";
  				mobile_right_txt.appendChild(document.createTextNode('>'));
  				mobile_shot_left.className = "mobile-button mobile-shot-left";
  				mobile_shot_left_txt.className = "mobile-button mobile-text mobile-shot-text-left";
  				mobile_shot_left_txt.id = "shot-L";
  				mobile_shot_left_txt.appendChild(document.createTextNode('shot'));
  				mobile_shot_right.className = "mobile-button mobile-shot-right";
  				mobile_shot_right_txt.className = "mobile-button mobile-text mobile-shot-text-right";
  				mobile_shot_right_txt.id = "shot-R";
  				mobile_shot_right_txt.appendChild(document.createTextNode('shot'));

  				window.removeEventListener("touchstart", mobile.startTouch, true);
  				window.removeEventListener("touchend", mobile.stopTouch, true);

  				window.addEventListener("touchstart", mobile.startTouch, true);
				window.addEventListener("touchend", mobile.stopTouch, true);
			},

			startTouch: function(e) {
				if(!e) e = window.event;
				var id = e.target.id;				

				if (id == 'right' || id == 'move-right') {
					human.moveCannon = "R";
				}
				else if (id == 'left' || id == 'move-left') {
					human.moveCannon = "L";
				}
				else if (id == 'fire' || id == 'shot-L' || id == 'shot-R') {
					human.cannonFire = true;
				}
			},

			stopTouch: function(e) {
				human.moveCannon = "N";
				human.cannonFire = false;
			}
		};
		
		var _game = function() {
			clearScreen();						
			
			img = new Image();
			img.onload = function() {					
				// init game objects
				setCanvas();
				resizeCanvas();
				frameCounter = 0;
				isGameOver = false;
				sky.init();
				lives.init();
				human.init();
				aliens.init();
				bunkers.init();
				adv.init();

				// score
				var txtArea = new textHelper.textArea({	cls: "field scoreField", 
														childs: [	
															textHelper.writeText({innerhtml: '<span class="text scoreText">score</span> <span class="text scoreText" id="scorePlayer1">00000</span>'}) 
														],
														appendTo: container,
														left: "0px",
														top: "0px" });								
				
				// animation loop
				var gameWrapper = container;
				//var startTime = window.performance.now() ||  window.mozAnimationStartTime || +new Date;
				//startTime = (window.performance && window.performance.now) ? performance.now() : (window.mozAnimationStartTime ? window.mozAnimationStartTime : +new Date());
				
				// MOBILE
				if ("ontouchstart" in window) { mobile.init(); }

				//requestAnimationFrame(loop, gameWrapper);
				(function loop(timestamp) {
					// time since last draw
					//var drawStart = (timestamp || +new Date);
					//var diff = drawStart - startTime;

					// update frame rate
					//if (diff > 1000/33) 
					//{
						// animation
						gameLoop();
						
						// reset startTime
						//startTime = drawStart;
					//}
					
					runningAnimation = requestAnimationFrame(loop, gameWrapper);
				})();
			}
			
			img.src = spriteSheet;
		}
		
		var _intro = function() {
			clearScreen();
			setCanvas();
			resizeCanvas();
			sky.init();	

			var bestScoreText = gameBestScore ? ("best score: " + gameBestScore.name + " - " + gameBestScore.score) : '';			
			
			// game menu
			var txtArea = new textHelper.textArea({	
				cls: "field", 
				childs: [	
					textHelper.writeText({
						id: "play", 
						cls: "text clickText menuText", 
						innerhtml: "play", 
						onclick: startGame
					}),
					textHelper.writeText({
						id: "AdvInvadersText", 
						cls: "text", 
						text: "space invaders"
					}),
					textHelper.writeText({
						id: "bestScore", 
						cls: "text clickText bestScore", 
						text: bestScoreText
					})
				],
				appendTo: container,
				width: canvas.width,
				position: "centerH",
				top: "20%" 
			});
													
			// score advance
			txtArea = new textHelper.textArea({	
				cls: "field scoreAdvanceTableField", 
				childs: [	
					textHelper.writeText({cls: "text scoreAdvanceText", text: "*score advance table*"}),
					textHelper.writeText({
						innerhtml:	"<ul id='scoreAdvanceTable'>" +
									"<li><span><span id='span_score_adv'></span></span><p id='score_adv' class='text scoreAdvanceText'>= ? mystery</p></li>" +
									"<li class='li-right'><span><span id='span_score_mystery'></span></span><p id='score_mystery' class='text scoreAdvanceText'>= ? mystery</p></li>" +
									"<li class='li-right'><span><span id='span_score_30'></span></span><p id='score_30' class='text scoreAdvanceText'>= 30 points</p></li>" +
									"<li class='li-right'><span><span id='span_score_20'></span></span><p id='score_20' class='text scoreAdvanceText'>= 20 points</p></li>" +
									"<li class='li-right'><span><span id='span_score_10'></span></span><p id='score_10' class='text scoreAdvanceText'>= 10 points</p></li>" +
									"</ul>"
						})	
				],
				appendTo: container,
				width: 450,
				position: "centerH",
				top: "50%" 
			});
													
			// instructions
			txtArea = new textHelper.textArea({	
				cls: "field", 
				childs: [	
					textHelper.writeText({id: "instructionsLink", cls: "text clickText smallText", text: "instructions", onclick: screens.instructions})
				],
				appendTo: container,
				width: 400,
				position: "centerBottom"
			});			
			
			// typewriting animation
			// set score advance table background images
			$$$("#span_score_adv").style["background"] = "url('" + spriteSheet + "') -4px -396px no-repeat";
			$$$("#span_score_mystery").style["background"] = "url('" + spriteSheet + "') -4px -122px no-repeat";
			$$$("#span_score_30").style["background"] = "url('" + spriteSheet + "') -4px -4px no-repeat";
			$$$("#span_score_20").style["background"] = "url('" + spriteSheet + "') -4px -40px no-repeat";
			$$$("#span_score_10").style["background"] = "url('" + spriteSheet + "') -4px -76px no-repeat";
			// start typewriting
			var t = textHelper.typewrite("#score_adv, #score_10, #score_20, #score_30, #score_mystery");
			
			/// "play" and alien intro animation						
			var setEventListener = function(id, ev, cb) {
				var el = $$$(id); 

				el.removeEventListener("transitionend", cb, false);
				el.removeEventListener("webkitTransitionEnd", cb, false);
				el.removeEventListener("oTransitionEnd", cb, false);
				el.removeEventListener("MSTransitionEnd", cb, false);	

				switch (ev)
				{
					case "transitionend":
						el.addEventListener("transitionend", cb, false);		// firefox
						el.addEventListener("webkitTransitionEnd", cb, false);	// chrome/safari
						el.addEventListener("oTransitionEnd", cb, false);		// opera
						el.addEventListener("MSTransitionEnd", cb, false);		// IE
						break;
				}
			};									
			///
			
			// animation loop
			var gameWrapper = container;
			//var startTime = window.performance.now() ||  window.mozAnimationStartTime || +new Date;
			//startTime = (window.performance && window.performance.now) ? performance.now() : (window.mozAnimationStartTime ? window.mozAnimationStartTime : +new Date());
			
			//requestAnimationFrame(loop, gameWrapper);
			(function loop(timestamp) {
				
				// time since last draw
				//var drawStart = (timestamp || +new Date);
				//var diff = drawStart - startTime;

				// update frame rate
				//if (diff > 1000/30) 
				//{
					// animation
					context.clearRect(0, 0, canvas.width, canvas.height);							
					sky.drawStars();
					textHelper.changeTextColor("#play"); 
					
					// reset startTime
					//startTime = drawStart;
				//}
				runningAnimation = requestAnimationFrame(loop, gameWrapper);
			})();
		};
		
		var _instructions = function() {
			// instructions splash screen
			var txtArea = new textHelper.textArea({	
				id: "divInstructions",
				cls: "field instructionsFieldFrame", 
				childs: [	
					textHelper.writeText({
						cls: "text instructionsText", 
						innerhtml: 	"<ol>" +
									"<li>press 'play' to start</li>" +
									"<li>left/right keys to move</li>" +
									"<li>'spacebar' to shot</li>" +
									"</ol>"
					}),							
					textHelper.writeText({cls: "text clickText menuText", text: "close", onclick: function(){textHelper.removeTextArea("divInstructions");}}) ],
				appendTo: container,
				position: "centerHV" 
			});
		};

		var _scoreSubmitted = function() {
			// instructions splash screen
			var txtArea = new textHelper.textArea({	
				id: "divScoreSubmitted",
				cls: "field submittedFieldFrame", 
				childs: [	
					textHelper.writeText({
						cls: "text submittedText", 
						text: "Score saved!",
					}),							
					textHelper.writeText({cls: "text clickText menuText", text: "close", onclick: function(){ textHelper.removeTextArea("divScoreSubmitted"); textHelper.removeText("nameLabel"); textHelper.removeText("nameInput"); textHelper.removeText("scoreSubmitButton"); }}) ],
				appendTo: container,
				position: "centerHV" 
			});
		};
		
		var _gameOver = function() {
			// game over splash screen
			if (!$$$("#divGameOver")) {
				var gameOverContent = [	
					textHelper.writeText({id: "gameOver", cls: "text menuHeaderText", text: "game over"}),
					textHelper.writeText({id: "playAgain", cls: "text clickText menuText", text: "play again", onclick: startGame})					
				];

				if (gameBestScore && human.score > gameBestScore.score) {
					gameOverContent.push(textHelper.writeAnything({type: "span", id:"nameLabel", cls:"labelSpan", innerhtml:"Name: "}));
					gameOverContent.push(textHelper.writeAnything({type: "input", id:"nameInput", cls:"inputBox", attributes:[["type", "text"]]}));
					gameOverContent.push(textHelper.writeText({id: "scoreSubmitButton", cls: "text clickText menuText", text: "save your score", onclick: submitScore}));
				}

				gameOverContent.push(textHelper.writeText({id: "tweetScore", cls: "text clickText", innerhtml: "<a target='blank' href='https://twitter.com/intent/tweet?original_referer=http://matteopiazza.org&text=Play%20Advertise%20Invaders%20on%20matteopiazza.org!%20My%20score:%20" + human.score + "!&tw_p=tweetbutton'>tweet your score</a>"}));

				var txtArea = new textHelper.textArea({	
					id: "divGameOver",
					cls: "field menuFieldFrame", 
					childs: gameOverContent,
					appendTo: container,
					position: "centerHV" 
				});
			}
		};
		
		var clearScreen = function() {
			while (container.hasChildNodes())
				container.removeChild(container.lastChild);
		};
		
		var screens = {
			intro: function() {
				cancelAnimationFrame(runningAnimation);
				_intro();
			},
			instructions: function() {
				_instructions();
			},
			game: function() {
				cancelAnimationFrame(runningAnimation);
				_game();
			},
			gameOver: function() {
				cancelAnimationFrame(runningAnimation);
				_gameOver();
			},
			scoreSubmitted: function() {
				_scoreSubmitted();
			}
		};
		
		var initGame = function() {
			screens.intro();
		};
		
		
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		// start game
		//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		window.addEventListener("keydown", function(e) {
			if(!e) e = window.event;
			// space and arrow keys
			if([32].indexOf(e.keyCode) > -1) {
				e.preventDefault();
			}
		}, false);

		// event handlers
		window.removeEventListener("keydown", keyPressed, true);
		window.removeEventListener("keyup", keyPressed, true);
		window.removeEventListener("resize", resizeCanvas, true);

		window.addEventListener("keydown", keyPressed, true);
		window.addEventListener("keyup", keyPressed, true);
		window.addEventListener("resize", resizeCanvas, true);
		
		
		/*
			Control the game with your Arduino joystick.
			Check: https://github.com/arcadeJHS/joystickIno
		*/
		var ws = new WebSocket("ws://localhost:8000");	// modify ws address to connect to the right websocket server
		ws.addEventListener('open', function() {
			ws.addEventListener('message', function(e) {
				var data = JSON.parse(e.data);
				inputHandler(data.code, data.type)
			});
		});
		
		initGame();
		
	};

	//document.onreadystatechange = function() {
		//if (document.readyState === "complete") {
	window.WIinit = function() {		
			var bestScore = null;

			// retrieve score
			qwest.post(
				'assets/php/si_call.php',
				{action: "getScore"}
			)
			.success(function(response) {
				if (response.data && response.data.length > 0) {
					bestScore = response.data[0];
				}
			})
			.error(function(message) {
				alert("Error retrieving best score: " + message);
			})
			.complete(function(){
		        // start game
				microSpaceInvaders("game", bestScore);
		    });
	}

		//}
	//};

})();