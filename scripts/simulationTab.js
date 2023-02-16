/**
 * @ Licence: OwnPlot, the OwnTech data plotter. Copyright (C) 2022. Matthias Riffard & Guillaume Arthaud - OwnTech Foundation.
	Delivered under GNU Lesser General Public License Version 2.1 (https://opensource.org/licenses/LGPL-2.1)
 * @ Website: https://www.owntech.org/
 * @ Mail: owntech@laas.fr
 * @ Create Time: 2022-08-30 09:31:24
 * @ Modified by: Jean Alinei
 * @ Modified time: 2022-09-09 11:20:01
 * @ Description:
 */

const { intersection } = require("lodash");
let iframe;
let vsense, kP, kI, kD, voltageRef;
let integralValue = 0; 
let elmList = [];
let info;
let debug;
let timeCnt = 0;
let sim;
let init = 0;

$(()=>{
    
    const startButton = $("#start");
    const stopButton = $("#stop");
    const voltageField = $("#voltage");
    const kPField = $("#proportional");
    const kIField = $("#integral");
    const kDField = $("#derivative");

    kP = parseFloat(kPField.val());
    kI = parseFloat(kIField.val());
    kD = parseFloat(kDField.val());
    voltageRef = parseFloat(voltageField.val());


    // get iframe the simulator is running in.  Must have same origin as this file!
    iframe = document.getElementById("circuitFrame");
    debug = document.getElementById("debug"); //use native js for using innerHTML method
    info = document.getElementById("info");

    // set up callback on circuitJS
    iframe.contentWindow.oncircuitjsloaded = simLoaded;

    voltageField.on('change', function(e){
        voltageRef = parseFloat(voltageField.val());
    })

    kPField.on('change', function(e){
        kP = parseFloat(kPField.val());
    })

    kIField.on('change', function(e){
        kI = parseFloat(kIField.val());
        console.log(kI);
    })

    kDField.on('change', function(e){
        kD = parseFloat(kDField.val());
        console.log(kI);
    })

    startButton.on('click', function(e){
        sim.setSimRunning(true);
    })

    stopButton.on('click', function(e){
        sim.setSimRunning(false);
    })
}); 


function round(x) {
    return Math.round(x*1000)/1000;
}

// called when simulator updates its display
function didUpdate(sim) {
    // info.innerHTML = "time = " + round(sim.getTime()) + "<br>running = " + sim.isRunning();

    // get voltage of labeled node "vsense"
    vsense = sim.getNodeVoltage("vsense");
    info.innerHTML = "V(vsense) = " + round(vsense);
    var rcount=0;
// go through list of elements
    for (const elm of elmList) {
        if (elm.getType() == "ResistorElm") {
        // show info about each resistor
            rcount++;
            info.innerHTML += "<br>resistor " + rcount + " voltage diff = " + round(elm.getVoltageDiff());
            info.innerHTML += "<br>resistor " + rcount + " current = " + round(elm.getCurrent() * 1000) + " mA";
        } else if (elm.getType() == "LabeledNodeElm") {
        // show voltage of each labeled node
        info.innerHTML += "<br>V(" + elm.getLabelName() + ") = " + round(elm.getVoltage(0));
        }
    }
}
// called every timestep
function didStep(sim) {
    var stepCtrl = 0.000005;
    var timestep2 = parseFloat(sim.getTimeStep());
    timeCnt += timestep2;

    if (timeCnt > stepCtrl){
        var err = voltageRef-vsense;        
        if (integralValue > 2) {
            integralValue = 2;
        }
        else if (integralValue < -2) {
            integralValue = -2;
        }
        else {
            integralValue += stepCtrl*err;
        }
        //var pidOut = kP*err+integral*integralValue;
        var pidOut = kP*err + 1.65 + kI*integralValue;
        if (pidOut < 0.3) {
            pidOut = 0.33; 
            integralValue = (pidOut - 1.65 - kP * err)/kI;
        }
        if (pidOut > 3.3){
            pidOut = 2.97; 
            integralValue = (pidOut - 1.65 - kP * err)/kI;
        }
        
        debug.innerHTML = "Error = " + round(err);
        debug.innerHTML += "<br> timeCnt = " + round(timeCnt);
        debug.innerHTML += "<br> timestep = " + timestep2;
        debug.innerHTML += "<br> Integral Value = " + round(integralValue);
        debug.innerHTML += "<br> Pid Out = " + round(pidOut);
        timeCnt = 0;
        // set voltage of external voltage "pid_out"
        sim.setExtVoltage("pid_out", pidOut);
    }
}

// called when simulator analyzes a circuit (when a circuit is loaded or edited)
function didAnalyze(sim) {
    console.log("analyzed circuit");

// get the list of elements
    elmList = sim.getElements();

// log some info about each one
    for (const elm of elmList) {
        console.log("elm " + elm.getType() + ", " + elm.getPostCount() + " posts");
        console.log("elm info: " + elm.getInfo());
    }

}

// callback called when simulation is done initializing
function simLoaded() {
    // get simulator object
    sim = iframe.contentWindow.CircuitJS1;
    // set up callbacks on update and timestep
    sim.onupdate = didUpdate;
    sim.ontimestep = didStep;
    sim.onanalyze = didAnalyze;
    // Let the simulator start and stops it just after so it does not consume ressources
    sim.isRunning = setTimeout(simulationStop,200);
}

function simulationStop() {
    if (init == 0) {
        sim.setSimRunning(false);
        init += 1;  
    }
}

