( function() {
		
	var Ticker = function(element) {
		
		this._element = element;
		this._durationContainer = this._element.getElementsByClassName("ticker-duration")[0];
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
			
			this._durationContainer.innerHTML = this.toHHMMSS( this._duration );
			this._timeout = setTimeout( this.tick.bind(this), 1000);
		}
	};
	
	Ticker.prototype.play = function() {
		if (this._paused) {
			this._paused = false;
			this.tick.call(this);
		}
	};
	
	Ticker.prototype.pause = function() {
		this._paused = true;
	};
	
	Ticker.prototype.clear = function() {
		this.pause.call(this);
		this._element.parentNode.removeChild(this._element);
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
	
	var instances = [];
	
	window.initTicker = function(tickerName, pauseExisting) {
		
		var list = document.getElementById("ticker-list");
		if (!list) {
			list = document.createElement("ul");
			list.setAttribute("id", "ticker-list");
			list.className = "list-unstyled";
			document.getElementById("ticker-container").appendChild(list);
		}
		
		if (pauseExisting) {
			for(var i = 0, len = instances.length; i < len; i++) {
				instances[i].pause.call(instances[i]);
			}
			
			for(var i = 0, len = list.childNodes.length; i < len; i++) {
				list.childNodes[i].className = "passive";
			}
		}
		
		var item = document.createElement("li");
		item.className = "active";
		
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
		tickerName = tickerName.length===0 ? "" : " - " + tickerName;
		var nameContainer = document.createElement("h2");
		nameContainer.className = "ticker-name";
		nameContainer.appendChild( document.createTextNode(tickerName));
		
		// clear button
		var clearButton = document.createElement("button");
		clearButton.innerHTML = "&times;";
		clearButton.className = "ticker-clear close";
		clearButton.setAttribute("aria-hidden", "true");
		clearButton.setAttribute("title", "clear");
		
		item.appendChild(playButton);
		item.appendChild(pauseButton);
		item.appendChild(durationContainer);
		item.appendChild(nameContainer);
		item.appendChild(clearButton);
		
		list.insertBefore(item, list.firstChild);
		
		// instantiate Ticker and add event listeners
		var ticker = new Ticker(item);
		playButton.addEventListener("click", function() {
			item.className = "active";
			ticker.play.call(ticker);
		}, false);
		pauseButton.addEventListener("click", function() {
			item.className = "passive";
			ticker.pause.call(ticker)
		}, false);
		clearButton.addEventListener("click", function() {
			ticker.clear.call(ticker);
			ticker = null;
		}, false);
		
		instances.push(ticker);
	};

}());