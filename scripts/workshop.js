
const ejs = require('ejs');
const e = require('express');

function addApp(type) {
	console.log(ejs);
	// var template = new ejs({url: './template/myTerminal.ejs'});
	// 	$('#chartAndTerminalDiv').html(template.render());
	const chart1 = new App(type);
	list_of_apps.push(chart1);

	if (list_of_apps.length > 1) {
		let sel1 = ("#" + list_of_apps[list_of_apps.length - 2].id);
		let sel2 = ("#" + list_of_apps[list_of_apps.length - 1].id);
		console.log(sel1);
		console.log(sel2);
		
		this.split = Split([sel1, sel2],{
			direction: 'vertical',
			sizes: [75,25],
			gutterSize: 4, 	
		});
		//horSplit.pairs[0].gutter.id = "gutterHoriz";
		//$("#gutterHoriz").hover(gutterHHandlerIn, gutterHHandlerOut);
	
	}
	console.log("app added");
	console.log(list_of_apps);
}

var apps_availables = [{ type:"chart", file:"template/chartApp.ejs"}, { type:"terminal", file:"template/terminal.ejs"}]
var list_of_apps = [];
var idCounter = 1;

//add app in the list of apps
class App {
	constructor(type) {
		if (apps_availables.filter(e => e['type'] == type).length > 0) {
			this.type = type;
			this.app_selected = apps_availables.find(element => element.type === type);
			this.renderApp();
		} else {
			//list the elements availables
			let types_a = "";
			apps_availables.forEach(element => types_a += "\"" + element.type + "\" ");
			console.log(`App type ${type} does not exist. Use types ${types_a}`);
		}
	}

	// set id(id) {
	// 	this.id = id;
	// 	//set id of the div
	// }

	renderApp() {
		this.id = "app_" + idCounter++;
		this.template = fs.readFileSync(this.app_selected.file, 'utf-8');
		this.renderedHtml = ejs.render(this.template, { app_id: this.id });
		$("#chartAndTerminalDiv").append(this.renderedHtml);
	}

	destructApp() {

	}
}


// class Panel {
// 	constructor(side) {
// 		if (apps_availables.filter(e => e['type'] == type).length > 0) {
// 			this.type = type;
// 		} else {
// 			let types_a = "";
// 			apps_availables.forEach(element => types_a += "\"" + element.type + "\" ");
// 			console.log(`App type ${type} does not exist. Use types ${types_a}`);
// 		}
// 	}
// }

// Expression; the class is anonymous but assigned to a variable
// *===========================*
// |         nav bar           |
// *---------------------------*
// |        Workspace          |
// |  *---*  *--------------*  |
// |  * P *  *              *  |
// |  * A *  *     APP      *  |
// |  * N *  *--------------*  |
// |  * E *  *              *  |
// |  * L *  *     APP      *  |
// |  *---*  *--------------*  |
// |                           |
// *===========================*