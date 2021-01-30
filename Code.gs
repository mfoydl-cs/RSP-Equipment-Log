//To-Do
//Write instructions on how to update

var shifts = ["4AM - 8AM","8AM - 12PM","12PM - 4PM","4PM - 8PM","8PM - 4AM"]; //These are the shift values, if shifts ever change times, edit this to include, and also edit spreadsheet

var dateloc="C3"; //Location of the "date" field on the log
var shiftloc="C4"; //Location of the "shift" field on the log


//List of all 'counted' items from the equipment log formatted ['plainname','FanCy NAme12']
var itemsList2 = [["ipads","iPads"],
                 ["radios","Radios"],
                 ["flashlights","Flashlights"],
                 ["hex","Hex"],
                 ["pliers","Pliers"],
                 ["batons","Batons"],
                 ["com","COM Key"],
                 ["dc","DC Key"],
                 ["cert","CERT Key"],
                 ["rrm", "RRM Key"],
                 ["g009","G009 Key"],
                 ["g010b","G010B Key"],
                 ["a","A Key"],
                 ["b","B Key"],
                 ["cb","CB Key"],
                 ["d","D Key"],
                 ["hq","HQ Key"],
                 ["va","Van Key"],
                 ["ex","EX Key"],
                 ["on","ON Key"],
                 ["be","BE Key"],
                 ["ch","CH Key"],
                 ["tu","TU Key"],
                 ["gk","GK Key"],
                 ["cards","Access Cards"], 
                 ["slickers","Slickers"],
                 ["yjacks","Yellow Jackets"],
                 ["ojacks","Orange Jackets"],
                 ["rain","Raincoats"],
                 ["vests","Vests"],
                 ["bags","Bags"]];

function getColors(){
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings").getRange("J15:J36").getValues();
  //return ["green","#FCCCC","yellow","white","darkred"]
}             
//Passes the item list to the add window 
function getData(){
  return itemsList2;
}
//Passes the shift list to the add window
function getShifts(){
  return shifts;
}

//Gets the current date, adjust for the RSP 4AM time difference, sends it back to window to set as default
function getDate(){
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var date = new Date();
  if(date.getHours() < 4){
    date = new Date(date.getTime() - MILLIS_PER_DAY);
  }
  return Utilities.formatDate(date, 'America/New_York', 'yyyy-MM-dd');
}
  

function ui_submit(){
  var ui = SpreadsheetApp.getUi();
  var html = HtmlService.createTemplateFromFile('response').evaluate()
    .setWidth(670)
    .setHeight(500)
    .setSandboxMode(HtmlService.SandboxMode.NATIVE);
  ui.showModalDialog(html, "New Entry");
}

function processFormResponse(obj){
  try {
    var formObject = obj.formObject;
    var resub = obj.resub;
    
    var ss2 = SpreadsheetApp.getActiveSheet();                   //LOG sheet
    ss2.getRange(dateloc).setValue(formObject[0].value);         
    ss2.getRange(shiftloc).setValue(formObject[1].value);        //Set date&shift on UI to entered values to allow sheet to check for duplicated
    
    var shiftType="-B";
    if(formObject[2].value=="end"){ //Check the shift type
      shiftType="-E";
    }
    
    var ss3 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet3")
    
    //Check if the shift has already been submitted 
    if(shiftType=="-B"&&ss3.getRange("AJ1").getValue()!=""){
      throw "ERROR: Shift has already been submitted.\nPress OK to overwrite previous log.\nPress cancel to go back.";
    }
    else if(ss3.getRange("AK1").getValue()!=""){
      throw "ERROR: Shift has already been submitted.\nPress OK to overwrite previous log.\nPress cancel to go back.";
    }
    
    var ss = SpreadsheetApp.openById("1o1TWwJIUWCmYT4CrB0banJVtnHrtkQC5lkMVZupH6Do").getSheetByName("HQ"); //Log Data Sheet
    
    var row = ss.getRange(ss.getLastRow()+1,1,1,ss.getLastColumn()); //Gets the last row in sheet to write new data to
    
    row.getCell(1,1).setValue(formObject[0].value+"-"+formObject[1].value+shiftType);
    row.getCell(1,2).setValue(formObject[3].value);
    row.getCell(1,3).setValue(formObject[4].value);
    for(var i=5; i-5 <itemsList2.length;i++){
      row.getCell(1,i-1).setValue(formObject[i].value);
    }
    row.getCell(1,ss.getLastColumn()-2).setValue(formObject[formObject.length-1].value);
    row.getCell(1,ss.getLastColumn()-1).setValue(resub);
    row.getCell(1,ss.getLastColumn()).setValue(Session.getEffectiveUser());
    Logger.log(Session.getEffectiveUser());
    return true;
  }
  catch(e){
    //throw "ERROR: If error persists, contact your DC";
    Logger.log(e);
    throw e;
  }
}

function resubmit(obj){
  var formObject = obj.formObject;
  var ss2 = SpreadsheetApp.getActiveSheet();
  ss2.getRange(dateloc).setValue(formObject[0].value);
  ss2.getRange(shiftloc).setValue(formObject[1].value);
  
  var ss = SpreadsheetApp.openById("19GFJ5-hHlpz1I1x_S_6kg7Kv1pB0L1NUC4FaSesDRU0").getSheetByName("HQ");
  
  var shiftType="-B";
  if(formObject[2].value=="end"){
    shiftType="-E";
  }
  var row = [[]];
  row[0].push(formObject[0].value+"-"+formObject[1].value+shiftType,formObject[3].value,formObject[4].value);

  for(var i=5; i-5 <itemsList2.length;i++){
    row[0].push(formObject[i].value);
  }
  row[0].push(formObject[formObject.length-1].value);
  row[0].push("True");
  row[0].push(Session.getEffectiveUser());
  
  var ss3 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet3")
  var rnum = null;
  if(shiftType=="-B"&&ss3.getRange("AJ1").getValue()!=""){
     rnum = ss3.getRange("AJ1").getValue();
  }
  else if(ss3.getRange("AK1").getValue()!=""){
     rnum = ss3.getRange("AK1").getValue();
  }
  
  
  var oRow = ss.getRange(rnum, 1, 1, ss.getLastColumn());
  oRow.copyTo(ss.getRange(ss.getLastRow()+1,1,1,ss.getLastColumn()));
  
  oRow.setValues(row);
  
}
