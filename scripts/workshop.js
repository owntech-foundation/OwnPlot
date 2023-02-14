
const ejs = require('ejs');
const e = require('express');

function addApp(type) {
	console.log(ejs);
	// var template = new ejs({url: './template/myTerminal.ejs'});
	// 	$('#chartAndTerminalDiv').html(template.render());
	const chart1 = new App(type);
	list_of_apps.push(chart1);
	console.log("app added");
	console.log(list_of_apps);
}

var apps_availables = [{ type:"chart", file:"template/chartApp.ejs"}, { type:"terminal", file:"template/terminal.ejs"}]
var list_of_apps = [];

//add app in the list of apps
class App {
	constructor(type) {
		if (apps_availables.filter(e => e['type'] == type).length > 0) {
			this.type = type;
			let app_to_add = apps_availables.find(element => element.type === type);
			this.template = fs.readFileSync(app_to_add.file, 'utf-8');
			this.renderedHtml = ejs.render(this.template, { app_id: "app_" + 1 });
			$("#appZone").append(this.renderedHtml);
		} else {
			let types_a = "";
			apps_availables.forEach(element => types_a += "\"" + element.type + "\" ");
			console.log(`App type ${type} does not exist. Use types ${types_a}`);
		}
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