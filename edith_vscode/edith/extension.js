const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 * 
 */

function base64Process(dat){
	'use strict';
	const fs = require('fs');
	// const data = JSON.parse(dat)
	console.log(dat);
	console.log("മാമനോടൊന്നും തോന്നല്ലേ മക്കളെ !");
	let buff = new Buffer(dat.speech_string, 'base64');
	fs.writeFileSync('edith.mp3', buff);
	vscode.window.showInformationMessage(dat.response);
	// console.log(dat.speech_string)

}




function sentVoice(obj){


	const request = require('request');
	const data = JSON.parse(obj)
	'use strict';
	const fs = require('fs');
	// console.log(data);
	request({
		url: 'https://hello-edith.herokuapp.com/voice-query',
		method: "POST",
		headers: {
			"content-type": "application/json",
			},
		json: data
		}, function (error, resp, body) {
			
			let dat = body;
			base64Process(dat);
			// console.log(dat.speech_string);
			// const body = body;
		});

		// let speech = JSON.parse(body);
		// console.log(speech)
	
}


 function playSound(){

	var fs = require('fs');
	var player = require('play-sound')(opts = {})

 	player.play('edith.mp3', function (err) {
		console.log("Audio finished");
		// fs.unlinkSync('/tmp/welcome.mp3');
	 });


 }

 function micListen(){

	var record = require('node-mic-record')
	var fs = require('fs')
	var request = require('request')

	exports.parseResult = function (err, resp, body) {

		let obj = body
		sentVoice(obj);
		
		setTimeout(function () {
				playSound();
				console.log("play")
			  }, 6000)
	  }
	  console.log("here")
	  
	  record.start(
			  {
			  sampleRate : 44100,
			  verbose : true,
			  recordProgram: 'rec',
		  	silence: '2.0'
			  }
		  ).pipe(request.post({
			  'url'     : 'https://api.wit.ai/speech?client=chromium&lang=en-us&output=json',
			  'headers' : {
				'Accept'        : 'application/vnd.wit.20160202+json',
				'Authorization' : 'Bearer ' + 'N2Y36TQWIDJ52VVFBKDJQOV4VVWZJQKL',
				'Content-Type'  : 'audio/wav'
			  }
			}, exports.parseResult))
	  
		  setTimeout(function () {
			record.stop()
		  }, 5000)
	
	return "ok"
	

 }




function activate(context) {

	const myListen = 'edith.listen';

	vscode.commands.registerCommand(myListen, function () {
		
		vscode.window.showInformationMessage('Edith is listening...');
		// do(1, 1).then(done);

		micListen();
		

		// if(micListen.success()){
		// 	playSound();
		// }
		// micListen().then(playSound);
	// 	setTimeout(function () {
	// 	playSound();
	// 	console.log("play")
	//   }, 8000)
		
		
	});
	

	let myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 300);

	myStatusBarItem.command = myListen;
	myStatusBarItem.text = 'Edith';
	
		
	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
	console.log('Congratulations, your extension "edith" is now active!');
}


exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
