(function() {
		
	var Ticker = function(element, pauseExisting) {
		
		if (pauseExisting) {
			this.each(function() {
				console.log("looping");
			});
		}
		
		this._element = element;
		this._duration = 0;
		this._paused = true;
		
		this.init();
	}
	
	Ticker.prototype.init = function() {
		this.play.call(this);
	};
	
	Ticker.prototype.tick = function() {
		if (!this._paused) {
			this._duration++;
			
			this._element.innerHTML = this.toHHMMSS( this._duration );
			this._timeout = setTimeout( this.tick.bind(this), 1000);
		}
	};
	
	Ticker.prototype.play = function() {
		this._paused = false;
		this.tick.call(this);
	};
	
	Ticker.prototype.pause = function() {
		this._paused = true;
	};
	
	Ticker.prototype.toHHMMSS = function (sec_num) {
		var hours   = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		var time    = hours+':'+minutes+':'+seconds;
		return time;
	};
	
	window.newTicker = function(tickerName) {
		
		var list = document.getElementById("ticker-list");
		if (!list) {
			list = document.createElement("ul");
			list.setAttribute("id", "ticker-list");
			list.className = "list-unstyled";
			document.getElementById("ticker-container").appendChild(list);
		}

		var item = document.createElement("li");
		
		// play button
		var playButton = document.createElement("button");
		playButton.appendChild( document.createTextNode("start") );
		playButton.className = "ticker-play btn btn-success";
		
		// pause button
		var pauseButton = document.createElement("button");
		pauseButton.appendChild( document.createTextNode("stop") );
		pauseButton.className = "ticker-pause btn btn-danger";
		
		// duration
		var durationContainer = document.createElement("h2");
		durationContainer.className = "ticker-duration";
		
		// name
		var nameContainer = document.createElement("h2");
		nameContainer.className = "ticker-name";
		nameContainer.appendChild( document.createTextNode(" - " + tickerName));
		
		item.appendChild(playButton);
		item.appendChild(pauseButton);
		item.appendChild(durationContainer);
		item.appendChild(nameContainer);
		
		list.insertBefore(item, list.firstChild);
		
		// instantiate Ticker and add event listeners
		var ticker = new Ticker(durationContainer);
		playButton.addEventListener("click", ticker.play.bind(ticker), false);
		pauseButton.addEventListener("click", ticker.pause.bind(ticker), false);
	};

}());