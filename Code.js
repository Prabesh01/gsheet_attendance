function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Attendance')
        .addItem('Mark me as present', 'markPresent')
        .addToUi();
  }

  // important: col:0 is protected and hidden. so that users cant add rows.

  function markPresent() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();

    var userEmail = Session.getActiveUser().getEmail();

    var now = new Date();
    var nepalTimeZone = "Asia/Kathmandu";
    var dayOfWeek = Utilities.formatDate(now, nepalTimeZone, "u");
    var hour = parseInt(Utilities.formatDate(now, nepalTimeZone, "HH"));

    if (dayOfWeek !== '7') {
      SpreadsheetApp.getUi().alert("Today's not Sunday!");
      return;
    }

    if (hour < 15 ) {
      SpreadsheetApp.getUi().alert("Session starts at 3:00 PM");
      return;
    }  else if (hour > 15 ) {
      SpreadsheetApp.getUi().alert("Today's Session has ended. See you next Sunday :)");
      return;
    }


    var data = sheet.getDataRange().getValues();

    var headers = data[0];

    var emailColIndex = headers.indexOf("Email");
    if (emailColIndex === -1) {
      SpreadsheetApp.getUi().alert("Error: Could not find 'email' column.");
      return;
    }

    var today = new Date();
    var todayFormatted = Utilities.formatDate(today, Session.getScriptTimeZone(), "MM/dd/yyyy");

    // get today's date column
    var todayColIndex = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i] instanceof Date) {
        var headerDate = Utilities.formatDate(headers[i], Session.getScriptTimeZone(), "MM/dd/yyyy");
        if (headerDate === todayFormatted) {
          todayColIndex = i;
          break;
        }
      }
    }

  // add today's date column if not exist
    if (todayColIndex === -1) {
      SpreadsheetApp.getUi().alert("No session today. I wonder why :(");
      return;
      todayColIndex = headers.length;
      sheet.getRange(1, todayColIndex + 1).setValue(today);
    }

    var userRowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (data[i][emailColIndex] === userEmail) {
        userRowIndex = i;
        break;
      }
    }

    sn_index=1+1 // cuz col:0 is protected and hidden. so that users cant add rows.

    var data=[];
    if (userRowIndex !== -1) {
      sheet.getRange(userRowIndex + 1, todayColIndex + 1).insertCheckboxes().check();

      data.push([userRowIndex + 1,todayColIndex + 1, 'chcked'])

    } else {
      // User doesn't exist, add new row
      var lastRow = sheet.getLastRow() + 1;
      sheet.getRange(lastRow, sn_index).setValue(lastRow - 1); // S.No
      data.push([lastRow,sn_index, lastRow - 1])

      sheet.getRange(lastRow, emailColIndex + 1).setValue(userEmail); // Email
      data.push([lastRow,emailColIndex + 1, userEmail])

      sheet.getRange(lastRow, todayColIndex + 1).insertCheckboxes().check();
      data.push([lastRow,todayColIndex + 1, 'chcked'])

    }
      var dbAPIklink = "http://ip:port/"
      for (var x of data) {
        var url = dbAPIklink+x[0]+"/"+x[1]
        var message = { "data": x[2] };
        var payload = JSON.stringify(message);
        var options = {
          method: 'POST',
          contentType: 'application/json',
          payload: payload
        };
      UrlFetchApp.fetch(url, options);
      }
    if (userRowIndex !== -1) {
      SpreadsheetApp.getUi().alert("You've been marked as present for today!");
    }  else{
      SpreadsheetApp.getUi().alert("You've been added to the attendance sheet and marked as present for today!");
    }
  }

  function onEdit(e) {
    // var changes = e.range.getValues();
    // console.log(changes);
    // console.log(e.oldValue);
    var range = e.range;
      const startRow = range.getRow();
      if(startRow==1){
        return; // ignore header
      }
      const startCol = range.getColumn();

    for (let i = 0; i < range.getNumRows(); i++) {
      for (let j = 0; j < range.getNumColumns(); j++) {
        const row = startRow + i;
        const col = startCol + j;
        var row_col = e.range.getSheet().getRange(row,col);

      var WebWhooklink = "http://ip:port/"+row+"/"+col
        var options = {
          method: 'GET',
        };
      var response = UrlFetchApp.fetch(WebWhooklink, options).getContentText();

        // undo the change.
        if (response == 'chcked'){
          row_col.insertCheckboxes().check();
        }else{
          row_col.setValue(response);
        }
      }
    }

    SpreadsheetApp.getUi().alert("Oi! kei chalaune hoina tya");

    // var WebWhooklink = ""
    // var message = { content: "- Edited ("+row.toString()+","+col.toString()+") to + '"+row_col.getValues()+"'" };
    // var payload = JSON.stringify(message);
    // var options = {
    //   method: 'POST',
    //   contentType: 'application/json',
    //   payload: payload
    // };

    // UrlFetchApp.fetch(WebWhooklink, options);

  }
