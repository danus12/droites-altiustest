var canvas = document.querySelector('.myCanvas');
//Parce que width et height font la même longueur
var width = canvas.width
var height = canvas.width
var ctx = canvas.getContext('2d');
const vitesseDefault = 0.005

let requestIdAnimationFrame
let trajectoireCourbe = []
let courbeEvolution = []
var planAxe
var droiteOne
var droiteTwo
var droites = []

const valueConvert = 37.79527559055
const heightLine = valueConvert * 12
const paddingTopForLines = (height - heightLine) / 2
const distanceWidth = valueConvert * 2
const vitesseDifference = 3
const valuePixelContactNumber = valueConvert /10

class AxeCenter {
    color = 'rgb(0,255, 0)'
    constructor(verticalX, verticalfromY, verticaltoY, horizontalY, horizontalfromX, horizontaltoX) {
        this.verticalX = verticalX
        this.verticalfromY = verticalfromY
        this.verticaltoY = verticaltoY
        this.horizontalY = horizontalY
        this.horizontalfromX = horizontalfromX
        this.horizontaltoX = horizontaltoX
        this.centerAxe = {
            x : paddingTopForLines+(heightLine/2),
            y : paddingTopForLines+(heightLine/2)
        }
        
        this.draw()
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.verticalX, this.verticalfromY);
        ctx.lineTo(this.verticalX, this.verticaltoY);
        ctx.stroke();

        //dessiner l'axe horizontal
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.horizontalfromX, this.horizontalY);
        ctx.lineTo(this.horizontaltoX, this.horizontalY);
        ctx.stroke();
    }
}

class TrajectoireCourbe {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}

class Droite {
    color = 'rgb(0,0, 255)'
    constructor(fromX, toX, fromY, toY, vitesse, sens = "trigo") {
        this.fromX = fromX
        this.toX = toX
        this.fromY = fromY
        this.toY = toY
        this.sens = sens
        this.posDebut = {
            x: fromX,
            y: (toY + paddingTopForLines) / 2
        }
        this.angle = 0
        this.vitesse = vitesse
        this.draw()
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.fromX, this.fromY);
        ctx.lineTo(this.toX, this.toY);
        ctx.stroke();
    }

    update() {
        this.draw()
        if (this.sens === "trigo") {
            this.angle -= this.vitesse
        } else {
            this.angle += this.vitesse
        }

        this.fromX = this.posDebut.x + (heightLine / 2) * Math.cos(this.angle)
        this.toX = this.posDebut.x - (heightLine / 2) * Math.cos(this.angle)
        this.fromY = this.posDebut.y + (heightLine / 2) * Math.sin(this.angle)
        this.toY = this.posDebut.y - (heightLine / 2) * Math.sin(this.angle)
    }
}



function animate() {
    requestIdAnimationFrame = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);
    planAxe.draw()
    droites.forEach(droite => {
        droite.update();
    });
    const result = checkDroiteIntersection(droiteOne.fromX, droiteOne.fromY, droiteOne.toX, droiteOne.toY,
        droiteTwo.fromX, droiteTwo.fromY, droiteTwo.toX, droiteTwo.toY)

    if (result.onDroiteOne || result.onDroiteTwo) {
        trajectoireCourbe.push(new TrajectoireCourbe(result.x, result.y))
        //calcul de la distance entre deux points
        var a = planAxe.centerAxe.x - result.x;
        var b = planAxe.centerAxe.y - result.y;
        var c = Math.sqrt(a * a + b * b);
        //(c+(heightLine/2)-paddingTopForLines))
        courbeEvolution.push(new TrajectoireCourbe(paddingTopForLines+(heightLine/2)+((courbeEvolution.length+1)),c))
    } else {
        trajectoireCourbe.push(undefined)
    }
    for (let index = 0; index < trajectoireCourbe.length; index++) {
        if (index == 0) {
            continue;
        } else if (index == trajectoireCourbe.length) {
            break;
        } else {
            const elementPrev = trajectoireCourbe[index - 1];
            const element = trajectoireCourbe[index];
            if (elementPrev == undefined || element == undefined) {
                continue;
            } else {
                const element = trajectoireCourbe[index];
                ctx.strokeStyle = 'rgb(255, 0, 0)';
                ctx.beginPath();
                ctx.moveTo(elementPrev.x, elementPrev.y);
                ctx.lineTo(element.x, element.y);
                ctx.stroke();
            }
        }
    }
    for (let index = 0; index < courbeEvolution.length; index++) {
        
        if (index == 0) {
            continue;
        } else if (index == courbeEvolution.length) {
            break;
        } else {
            const elementPrev = courbeEvolution[index - 1];
            const element = courbeEvolution[index];
            if (elementPrev == undefined || element == undefined) {
                continue;
            } else {
                const element = courbeEvolution[index];
                ctx.strokeStyle = 'rgb(168, 50, 139)';
                ctx.beginPath();
                ctx.moveTo(elementPrev.x, elementPrev.y);
                ctx.lineTo(element.x, element.y);
                ctx.stroke();
            }
        }
    }
}



function checkDroiteIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    var determinant, a, b, compteurOne, compteurTwo, result = {
        x: null,
        y: null,
        onDroiteOne: false,
        onDroiteTwo: false
    };
    determinant = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (determinant == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    compteurOne = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    compteurTwo = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = compteurOne / determinant;
    b = compteurTwo / determinant;
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    if (a > 0 && a < 1) {
        result.onDroiteOne = true;
    }
    if (b > 0 && b < 1) {
        result.onDroiteTwo = true;
    }
    return result;
};

function reset() {
    if (requestIdAnimationFrame != undefined) {
        window.cancelAnimationFrame(requestIdAnimationFrame)
    }

}

document.getElementById("one").onclick = function () {
    init()
    animate()
}

document.getElementById("three").onclick = function () {
    init(true)
    animate()
}

function init(type = false) {
    reset()
    requestIdAnimationFrame = undefined
    trajectoireCourbe = []
    courbeEvolution = []
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    //dessiner les axes
    planAxe = new AxeCenter(width / 2, paddingTopForLines, paddingTopForLines + heightLine, height / 2, paddingTopForLines, paddingTopForLines + heightLine)
    courbeEvolution.push(new TrajectoireCourbe(planAxe.centerAxe.x,planAxe.centerAxe.y))
    droiteOne = new Droite(width / 2 - distanceWidth / 2, width / 2 - distanceWidth / 2, paddingTopForLines, paddingTopForLines + heightLine, vitesseDefault)
    if (!type) {
        droiteTwo = new Droite(width / 2 + distanceWidth / 2, width / 2 + distanceWidth / 2, paddingTopForLines, paddingTopForLines + heightLine, vitesseDefault * vitesseDifference)
    } else {
        droiteTwo = new Droite(width / 2 + distanceWidth / 2, width / 2 + distanceWidth / 2, paddingTopForLines, paddingTopForLines + heightLine, vitesseDefault * vitesseDifference, "horlo")
    }
    droites = []
    droites.push(droiteOne)
    droites.push(droiteTwo)
}

init()