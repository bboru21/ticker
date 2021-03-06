(function (s) {

    "use strict";
    
    // wrap the local storage functionality
    var tickerStorage = {
        "getStorageAsObject": function () {
            var str = s.getItem("ticker") || "{}";
            return JSON.parse(str);
        },
        "getDisplayName": function (name) {
            var ticker = tickerStorage.getStorageAsObject();
            return ticker[name].displayName;
        },
        "getDuration": function (name) {
            var ticker = tickerStorage.getStorageAsObject();
            return ticker[name].duration;
        },
        "setDuration": function (name, duration) {
            var ticker = tickerStorage.getStorageAsObject();
            ticker[name].duration = duration;
            return s.setItem("ticker", JSON.stringify(ticker));
        },
        "delete": function (name) {

            var ticker = tickerStorage.getStorageAsObject();            
            delete ticker[name];
             
            return s.setItem("ticker", JSON.stringify(ticker));
        },
        "create": function (name, options) {
            options = options || {};
            var ticker = tickerStorage.getStorageAsObject();
            
            if (!ticker[name]) {
                ticker[name] = {};
                ticker[name].duration = options.duration || 0;
                ticker[name].displayName = options.displayName;
            }
            
            return s.setItem("ticker", JSON.stringify(ticker));
        }
    };
    
    var utils = {
        "toHHMMSS": function(sec_num) {
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours   < 10) {hours   = "0"+hours;}
            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}
            var time    = hours+':'+minutes+':'+seconds;
            return time;
        }
    };
    
    var Ticker = function (element, options) {
        
        this.name = options.name;
        this.displayName = options.displayName;
        this.element = element;
        this.durationContainer = this.element.getElementsByClassName("ticker-duration")[0];
        this.duration = options.duration || 0;
        this.paused = options.paused || true;
        
        // store
        tickerStorage.create(this.name, {"duration": this.duration, "displayName": this.displayName});
        
        // if pause option was passed, don't play the ticker
        if (!options.paused) {
             this.play.call(this);
        }
    };

    Ticker.prototype.tick = function () {
        if (!this.paused) {
            this.duration++;
            this.durationContainer.innerHTML = utils.toHHMMSS( this.duration );
            this.timeout = setTimeout( this.tick.bind(this), 1000);
        }
    };
    
    Ticker.prototype.play = function () {
        if (this.paused) {
            this.paused = false;
            this.tick.call(this);
        }
    };
    
    Ticker.prototype.pause = function () {
        this.paused = true;
    };
    
    Ticker.prototype.clear = function () {
        this.pause.call(this);
        this.element.parentNode.removeChild(this.element);
        
        tickerStorage.delete(this.name);
    };
        
    var instances = [];
    
    window.initTicker = function (options) {
        
        options = options || {};
        options.pauseExisting = typeof options.pauseExisting==="boolean" ? options.pauseExisting : true;
        options.duration = options.duration || null;
        options.displayName = options.displayName || "";
        options.name = options.name || null;
        
        if (!options.name) {
            options.name = options.displayName.length === 0 ? "ticker-"+new Date().getTime() : options.displayName.replace(/\s/g,"-").toLowerCase();
        }
        
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
        var durationContainer = document.createElement("h3");
        durationContainer.className = "ticker-duration";
        if (!!options.duration) { durationContainer.innerHTML = utils.toHHMMSS(options.duration); }
        
        // name
        var nameContainer = document.createElement("h3");
        nameContainer.className = "ticker-name";
        
        if (options.displayName.length > 0) { nameContainer.innerHTML = "&nbsp;-&nbsp;"; }
        
        var displayName = (options.displayName.length > 25) ? options.displayName.substring(0,22) + "..." : options.displayName;
        nameContainer.appendChild( document.createTextNode(displayName));
        nameContainer.setAttribute("title", options.displayName);
        
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
        
        playButton.addEventListener("click", function () {
            item.className = "active";
            ticker.play.call(ticker);
        }, false);
        pauseButton.addEventListener("click", function () {
            item.className = "passive";
            ticker.pause.call(ticker)
        }, false);
        clearButton.addEventListener("click", function () {
            ticker.clear.call(ticker);
            ticker = null;
        }, false);
        
        instances.push(ticker);
    };
    
    // add existing tickers on dom loaded
    document.addEventListener("DOMContentLoaded", function (e) {
        var ticker = tickerStorage.getStorageAsObject();
        var duration;
        var displayName;
        
        for(var name in ticker) {
            
            duration = tickerStorage.getDuration(name);
            displayName = tickerStorage.getDisplayName(name);
            
            initTicker({ "name": name, "duration": duration, "displayName": displayName, "paused": true });
        }
    });
    
    // store tickers on beforeunload
    window.addEventListener("beforeunload", function (e) {
        var name, duration;
        
        for(var i = 0, len = instances.length; i < len; i++) {
            duration = instances[i].duration;
            name = instances[i].name;
            tickerStorage.setDuration(name, duration);
        }
        
        return;
    });

}(window.localStorage));