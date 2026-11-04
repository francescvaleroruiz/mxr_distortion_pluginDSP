'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = mxrDistortion;
function mxrDistortion(context) {
	var self = this;

	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;

}



mxrDistortion.prototype.onVolumioStart = function()
{
	var self = this;
	var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
	this.config = new (require('v-conf'))();
	this.config.loadFile(configFile);

    return libQ.resolve();
}

mxrDistortion.prototype.onStart = function() {
    var self = this;
	var defer=libQ.defer();


	// Once the Plugin has successfull started resolve the promise
	defer.resolve();

    return defer.promise;
};

mxrDistortion.prototype.onStop = function() {
    var self = this;
    var defer=libQ.defer();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

mxrDistortion.prototype.onRestart = function() {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

mxrDistortion.prototype.getUIConfig = function() {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
        __dirname+'/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function(uiconf)
        {


            defer.resolve(uiconf);
        })
        .fail(function()
        {
            defer.reject(new Error());
        });

    return defer.promise;
};

mxrDistortion.prototype.getConfigurationFiles = function() {
	return ['config.json'];
};

mxrDistortion.prototype.setUIConfig = function(data) {
	var self = this;
	console.log('MXR ▶ setUIConfig data:', data);
  
	// Ruta al config.json instalado
	var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
	console.log('MXR ▶ Writing to:', configFile);
  
	try {
	  // Leemos el config.json actual
	  var cfg = fs.readJsonSync(configFile);
  
	  // Aseguramos que exista el objeto mxrDist
	  cfg.mxrDist = cfg.mxrDist || {};
  
	  // Actualizamos los dos parámetros
	  cfg.mxrDist.drive = data.drive;
	  cfg.mxrDist.output_level = data.output_level;
  
	  // Escribimos de vuelta en disco, conservando formato
	  fs.writeJsonSync(configFile, cfg, { spaces: 2 });
	  console.log('MXR ▶ config.json updated:', cfg.mxrDist);
	}
	catch (e) {
	  console.error('MXR ▶ Error en setUIConfig:', e);
	}
  
	return libQ.resolve();
  };
  
  

mxrDistortion.prototype.getConf = function(varName) {
	var self = this;
	//Perform your installation tasks here
};

mxrDistortion.prototype.setConf = function(varName, varValue) {
	var self = this;
	//Perform your installation tasks here
};



// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it


mxrDistortion.prototype.addToBrowseSources = function () {

	// Use this function to add your music service plugin to music sources
    //var data = {name: 'Spotify', uri: 'spotify',plugin_type:'music_service',plugin_name:'spop'};
    this.commandRouter.volumioAddToBrowseSources(data);
};

mxrDistortion.prototype.handleBrowseUri = function (curUri) {
    var self = this;

    //self.commandRouter.logger.info(curUri);
    var response;


    return response;
};



// Define a method to clear, add, and play an array of tracks
mxrDistortion.prototype.clearAddPlayTrack = function(track) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::clearAddPlayTrack');

	self.commandRouter.logger.info(JSON.stringify(track));

	return self.sendSpopCommand('uplay', [track.uri]);
};

mxrDistortion.prototype.seek = function (timepos) {
    this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::seek to ' + timepos);

    return this.sendSpopCommand('seek '+timepos, []);
};

// Stop
mxrDistortion.prototype.stop = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::stop');


};

// Spop pause
mxrDistortion.prototype.pause = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::pause');


};

// Get state
mxrDistortion.prototype.getState = function() {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::getState');


};

//Parse state
mxrDistortion.prototype.parseState = function(sState) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::parseState');

	//Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
mxrDistortion.prototype.pushState = function(state) {
	var self = this;
	self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'mxrDistortion::pushState');

	return self.commandRouter.servicePushState(state, self.servicename);
};


mxrDistortion.prototype.explodeUri = function(uri) {
	var self = this;
	var defer=libQ.defer();

	// Mandatory: retrieve all info for a given URI

	return defer.promise;
};

mxrDistortion.prototype.getAlbumArt = function (data, path) {

	var artist, album;

	if (data != undefined && data.path != undefined) {
		path = data.path;
	}

	var web;

	if (data != undefined && data.artist != undefined) {
		artist = data.artist;
		if (data.album != undefined)
			album = data.album;
		else album = data.artist;

		web = '?web=' + nodetools.urlEncode(artist) + '/' + nodetools.urlEncode(album) + '/large'
	}

	var url = '/albumart';

	if (web != undefined)
		url = url + web;

	if (web != undefined && path != undefined)
		url = url + '&';
	else if (path != undefined)
		url = url + '?';

	if (path != undefined)
		url = url + 'path=' + nodetools.urlEncode(path);

	return url;
};





mxrDistortion.prototype.search = function (query) {
	var self=this;
	var defer=libQ.defer();

	// Mandatory, search. You can divide the search in sections using following functions

	return defer.promise;
};

mxrDistortion.prototype._searchArtists = function (results) {

};

mxrDistortion.prototype._searchAlbums = function (results) {

};

mxrDistortion.prototype._searchPlaylists = function (results) {


};

mxrDistortion.prototype._searchTracks = function (results) {

};

mxrDistortion.prototype.goto=function(data){
    var self=this
    var defer=libQ.defer()

// Handle go to artist and go to album function

     return defer.promise;
};
