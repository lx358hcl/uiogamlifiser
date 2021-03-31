//UiO Gamlifiser utviklet av Luka Momcilovic
//Whitelisted websites
var whitelistaSider = {
	"tp.uio.no": true,
	"mail.uio.no": true,
	"for-ansatte.uio.no": true,
	"ezproxy.uio.no": true,
	"mattermost.uio.no": true,
	"github.uio.no": true,
	"webid.uio.no": true,
	"weblogin.uio.no": true,
	"weblogin-test.uio.no": true,
	"minestudier.uio.no": true,
	"studentweb.uio.no": true,
	"devilry.ifi.uio.no": true,
	"trix.ifi.uio.no": true,
	"titan.uio.no": true,
	"hr-portalen.uio.no": true,
	"jupyterhub.uio.no": true,
	"www-adm.uio.no": true,
	"data.tsd.usit.no": true,
	"selfservice.tsd.usit.no": true,
	"periodesystemet.no": false,
}

//Local url for the stylesheet to be injected
var stylesURL = chrome.runtime.getURL("style.css");

//Things needed for the webrequest
var filter = { urls: ["*://*.uio.no/*"], types: ["stylesheet"]};
var extra = ["blocking"];

//Listening for stylesheet-requests from uio.no
var callback = (details) => {
	try{
		var currentURL = new URL(details.url);
		var splittaURL = currentURL.hostname.slice(currentURL.hostname.indexOf(".") + 1);
		return sjekkOmOK(details.tabId, currentURL, splittaURL);
	}
	catch{  };
}

//Function sjekkOmOK
function sjekkOmOK(tabId, currentURL, splittaURL){
	if(currentURL.href.endsWith("style2.css")){
		if(!(currentURL.hostname in whitelistaSider || splittaURL in whitelistaSider)){
			chrome.tabs.executeScript(tabId, {file: "fjernTrash.js"});
			return {
				redirectUrl: stylesURL
			}	
		}
	}
}

//Brukernavigering kontrollør
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	chrome.tabs.get(tabId, function (results) {
		try{
			var currentURL = new URL(results.url);
			var splittaURL = currentURL.hostname.slice(currentURL.hostname.indexOf(".") + 1);
			chrome.storage.sync.get(function (result) {
				if (result.onOff == true) {
					if(!(currentURL.hostname in whitelistaSider || splittaURL in whitelistaSider)){
						chrome.tabs.executeScript(tabId, {file: "fjernTrash.js"});
					}
				}
			});
		}
		catch{  };
	})
});

//Upon first-installation populate the storage
chrome.runtime.onInstalled.addListener(function (details) {
	try{
		if (details.reason == "install") {
			chrome.storage.sync.set({
				"onOff": true	
			});
			chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
		}
	}
	catch{  }
});

//When Chrome is opened, turn gamlifiser on/off depending on storage
chrome.storage.sync.get(function (result) {
	if (result.onOff == true) chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
	else if (result.onOff == false) chrome.webRequest.onBeforeRequest.removeListener(callback);
});

//Message listener, listen for messages from popup.html
chrome.runtime.onMessage.addListener(function (message, sender, response) {
	if(message == false) {
		chrome.webRequest.onBeforeRequest.removeListener(callback);
	}
	else if(message == true) {
		chrome.webRequest.onBeforeRequest.addListener(callback, filter, extra);
	}
});