( function(s) {
	
	"use strict";
	
	// wrap the local storage functionality
	var tickerStorage = {
		"getStorageAsObject": function() {
			
			var str = s.getItem("ticker") || "{}";
			
			return JSON.parse( str );
		},
		"getDisplayName": function(name) {
			var ticker = tickerStorage.getStorageAsObject();
			return ticker[name].displayName;
		},
		"getDuration": function(name) {
			var ticker = tickerStorage.getStorageAsObject();
			return ticker[name].duration;
		},
		"setDuration": function(name, duration) {
			var ticker = tickerStorage.getStorageAsObject();
			ticker[name].duration = duration;
			
			return s.setItem( "ticker", JSON.stringify(ticker) );
			
		},
		"delete": function(name) {
			var ticker = tickerStorage.getStorageAsObject();
			
			delete ticker[name];
			
			return s.setItem( "ticker", JSON.stringify(ticker) );
		},
		"create": function(name, options) {
			options = options || {};
			
			var ticker = tickerStorage.getStorageAsObject();
			
			if (!ticker[name]) {
				ticker[name] = {};
				ticker[name].duration = options.duration || 0;
				ticker[name].displayName = options.displayName;
			}
			
			return s.setItem( "ticker", JSON.stringify(ticker) );
		}
	};
	
	var Ticker = function(element, options) {
		
		this._name = options.name;
		this._displayName = options.displayName;
		this._element = element;
		this._durationContainer = this._element.getElementsByClassName("ticker-duration")[0];
		this._duration = options.duration || 0;
		this._paused = true;
		
		// store
		tickerStorage.create(this._name, {"duration": this._duration, "displayName": this._displayName});
		
		this.init();
	}
	
	Ticker.prototype.init = function() {
		this.play.call(this);
	};
	
	Ticker.prototype.tick = function() {
		if (!this._paused) {
			this._duration++;
			
			//tickerStorage.setDuration(this._name, this._duration);
			
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
		tickerStorage.delete(this._name);
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
	
	window.initTicker = function(options) {
	
		options = options || {};
		options.pauseExisting = options.pauseExisting || true;
		options.duration = options.duration || null;
		//options.paused = options.paused || false;
		options.displayName = options.displayName || "";

		options.name = options.displayName.length === 0 ? "ticker-"+new Date().getTime() : options.displayName.replace(/\s/g,"-").toLowerCase();
		
		var list = document.getElementById("ticker-list");
		if (!list) {
			list = document.createElement("ul");
			list.setAttribute("id", "ticker-list");
			list.className = "list-unstyled";
			document.getElementById("ticker-container").appendChild(list);
		}
		
		if (options.pauseExisting) {
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
		if (!!options.duration) { durationContainer.innerHTML = options.duration; }
		
		// name
		var nameContainer = document.createElement("h2");
		nameContainer.className = "ticker-name";
		
		if (options.displayName.length > 0) { nameContainer.innerHTML = "&nbsp;-&nbsp;"; }
		nameContainer.appendChild( document.createTextNode(options.displayName));
		
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
		
		// need to add options here
		// instantiate Ticker and add event listeners
		var ticker = new Ticker(item, options);
		
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
	
	// add existing tickers on dom loaded
	document.addEventListener("DOMContentLoaded", function(e) {
		var ticker = tickerStorage.getStorageAsObject();
		var duration;
		var displayName;
		
		for(var name in ticker) {
			
			duration = tickerStorage.getDuration(name);
			displayName = tickerStorage.getDisplayName(name);
			
			initTicker({ "name": name, "duration": duration, "displayName": displayName });
		}
	});
	
	// store tickers on beforeunload
	window.addEventListener("beforeunload", function(e) {
		var name, duration;
		
		for(var i = 0, len = instances.length; i < len; i++) {
			duration = instances[i]._duration;
			name = instances[i]._name;
			tickerStorage.setDuration(name, duration);
		}
		
		return;
	});

}(window.localStorage));