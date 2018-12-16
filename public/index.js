var socket;

var roomNumber = 0;
var textR = 0;
var textG = 0;
var textB = 0;
var textShake = 0;

var drawColorHEXstroke;
var drawColorHEXfill;
var drawLineWeight = 5;
var drawMode = 0;
var points = [];
var pointsReg = 0;
var tool = "0";

var showINVERR = false;
var showSUCCESS = false;
var showFLTRERR = false;

var setup = function() {
    createCanvas(windowWidth, windowHeight);

    socket = io("http://66.244.110.106:82");

    socket.on('FLTRERR', function (msg) {
        showFLTRERR = true;
    });

    socket.on('roomChange', function (msg) {
        applyChanges(msg);
    });

    $("#joinRoom").click(function() {
        switchRooms();
    });

    $("#leaveRoom").click(function() {
        leaveRoom();
    });

    $(document).on('change','#tool',function(){
        tool = document.getElementById("tool").value;
        
        if (tool == "0") {
            drawMode = 0;
        } else if (tool == "1") {
            drawMode = 1;
        } else if (tool == "2") {
            drawMode = 2;
        } else if (tool == "3") {
            drawMode = 3;
        } else if (tool == "4") {
            drawMode = 4;
        } else if (tool == "5") {
            drawMode = 5;
        } else {
            showINVERR = false;
            showSUCCESS = false;
            showFLTRERR = true;
        }

        points = [];
        pointsReg = 0;
    });
}

var draw = function() {
    $("#roomNum").html("Room " + roomNumber);
    drawColorHEXstroke = document.getElementById("color1").value;
    drawColorHEXfill = document.getElementById("color2").value;
    drawLineWeight = document.getElementById("weight").value;

    if (textR == 0 && textG == 0 && textB == 0) {
        while (textR < 144) {
            textR = Math.floor(Math.random() * 256);
        }
        while (textG < 144) {
            textG = Math.floor(Math.random() * 256);
        }
        while (textB < 144) {
            textB = Math.floor(Math.random() * 256);
        }
        textShake = 10;
    } else {
        if (textR > 0) {
            textR -= 5;
        } else {
            textR = 0;
        }
        if (textG > 0) {
            textG -= 5;
        } else {
            textG = 0;
        }
        if (textB > 0) {
            textB -= 5;
        } else {
            textB = 0;
        }
        textShake = -textShake;
        if (textShake < 0) {
            textShake += 1;
        }
    }

    if (roomNumber == 0) {
        //background(255);
        
        fill(textR, textG, textB);
        noStroke();

        textAlign(CENTER,CENTER);
        textSize(72);
        textFont('Helvetica');

        text("ComCanvas", width/2+textShake, height/2+textShake);

        textAlign(LEFT,TOP);
        textSize(24);
        text("Type in a RoomID and click \"Join Room\" to join the room", 2+textShake, 30+textShake);
    } else {
        fill(textR, textG, textB);
        noStroke();

        textFont('Helvetica');
        textAlign(LEFT,BOTTOM);
        textSize(24);
        text("ComCanvas", 2+textShake, height-10+textShake);

        //DRAW CODE

        if (drawMode == 0 && mouseIsPressed) {
            socket.emit('editRoom', roomNumber, ["line", mouseX, mouseY, pmouseX, pmouseY, drawLineWeight, drawColorHEXstroke, drawColorHEXfill]);
        }
    }

    if (showSUCCESS) {
        fill(textR, textG, textB);
        noStroke();
        
        textAlign(CENTER,CENTER);
        textSize(24);
        textFont('Helvetica');
        text("Success! We are connecting you to that room...", width/2+textShake, height/3*2+textShake);
    }

    if (showINVERR) {
        fill(textR, textG, textB);
        noStroke();

        textAlign(CENTER,CENTER);
        textSize(24);
        textFont('Helvetica');
        text("Hey! That's not a valid RoomID!", width/2+textShake, height/3*2+textShake);
    }

    if (showFLTRERR) {
        fill(textR, textG, textB);
        noStroke();

        textAlign(CENTER,CENTER);
        textSize(24);
        textFont('Helvetica');
        text("Nice try, we filter our inputs.", width/2+textShake, height/3*2+textShake);
    }
}

var switchRooms = function() {
    var newRoom = document.getElementById("roomID").value;

    stroke(255);
    fill(255);
    rect(0, height/3*2-50, width, 100);

    if(/^[0-9]+$/.test(newRoom)) {
        showSUCCESS = true;
        showINVERR = false;
        showFLTRERR = false;
        socket.emit('connectToRoom', newRoom, function (data) {
            if (data) {
                background(255);
                roomNumber = newRoom;
                showSUCCESS = false;
                showINVERR = false;
            } else {
                showSUCCESS = false;
                showINVERR = false;
            }
        });
        
    } else {
        showINVERR = true;
        showSUCCESS = false;
        showFLTRERR = false;
    }
}

var leaveRoom = function() {
    background(255);
    socket.emit('disconnectFromRoom', roomNumber);
    roomNumber = 0;
}

var applyChanges = function(data) {
    if (data[0] == "line") {
        strokeWeight(data[5]);
        fill(data[7]);
        stroke(data[6]);

        line(data[1], data[2], data[3], data[4]);
    } else if (data[0] == "rectangle") {
        strokeWeight(data[5]);
        fill(data[7]);
        stroke(data[6]);

        rect(data[1], data[2], data[3], data[4]);
    } else if (data[0] == "circle") {
        strokeWeight(data[4]);
        fill(data[6]);
        stroke(data[5]);

        ellipse(data[1], data[2], data[3]);
    } else if (data[0] == "triangle") {
        strokeWeight(data[7]);
        fill(data[9]);
        stroke(data[8]);

        triangle(data[1], data[2], data[3], data[4], data[5], data[6]);
    } else if (data[0] == "fill") {
        background(data[1]);
    }

    stroke(255);
    fill(255);
    rect(0, 0, width, 23);
}

var windowResized = function() {
    resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
    if (drawMode == 1) {
        if (pointsReg < 2 && mouseY > 23) {
            pointsReg++;
            points.push([mouseX,mouseY]);
        }
        if (pointsReg == 2) {
            socket.emit('editRoom', roomNumber, ["line", points[0][0], points[0][1], points[1][0], points[1][1], drawLineWeight, drawColorHEXstroke, drawColorHEXfill]);
            pointsReg = 0;
            points = [];
        }
    } else if (drawMode == 2) {
        if (pointsReg < 2 && mouseY > 23) {
            pointsReg++;
            points.push([mouseX,mouseY]);
        }
        if (pointsReg == 2) {
            socket.emit('editRoom', roomNumber, ["rectangle", points[0][0], points[0][1], points[1][0] - points[0][0], points[1][1] - points[0][1], drawLineWeight, drawColorHEXstroke, drawColorHEXfill]);
            pointsReg = 0;
            points = [];
        }
    } else if (drawMode == 3) {
        if (pointsReg < 2 && mouseY > 23) {
            pointsReg++;
            points.push([mouseX,mouseY]);
        }
        if (pointsReg == 2) {
            socket.emit('editRoom', roomNumber, ["circle", points[0][0], points[0][1], Math.sqrt(Math.pow(Math.abs(points[0][0] - points[1][0]), 2) + Math.pow(Math.abs(points[0][1] - points[1][1]), 2))*2, drawLineWeight, drawColorHEXstroke, drawColorHEXfill]);
            pointsReg = 0;
            points = [];
        }
    } else if (drawMode == 4) {
        if (pointsReg < 3 && mouseY > 23) {
            pointsReg++;
            points.push([mouseX,mouseY]);
        }
        if (pointsReg == 3) {
            socket.emit('editRoom', roomNumber, ["triangle", points[0][0], points[0][1], points[1][0], points[1][1], points[2][0], points[2][1], drawLineWeight, drawColorHEXstroke, drawColorHEXfill]);
            pointsReg = 0;
            points = [];
        }
    } else if (drawMode == 5) {
        socket.emit('editRoom', roomNumber, ["fill", drawColorHEXfill]);
    }
}