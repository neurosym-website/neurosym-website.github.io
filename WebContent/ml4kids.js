

var module = {};

const server = {
    get: function (command, onok, onerror) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    const response = xhttp.responseText;
                    if (response.substring(0, 2) === 'OK') {
                        const jsonData = response.substring(3).trim();
                        var rv = undefined;
                        if (jsonData.length > 0) {
                            rv = JSON.parse(jsonData);
                        }
                        if (onok) {
                            onok(rv);
                        }
                    } else {
                        if (onerror) {
                            onerror(response);
                        } else {
                            errorMsg(response);
                        }
                    }
                } else {
                    var msg = errorCode.badConnection + " status:" + this.status + " state: " + this.readyState + "  " + xhttp.responseText;
                    if (onerror) {
                        onerror(msg);
                    } else {
                        errorMsg(msg);
                    }
                }
            }
        };
        xhttp.open("GET", "https://code.playskript.com" + command, true);
        //xhttp.open("GET", "http://localhost:4000" + command, true);
        xhttp.send();
    },

}



function sanitize(msg) {
    return msg;
}


function errorMsg(msg) {
    //msg = sanitize(msg);
    if (document.getElementById('errMsg')) {
        var msgText = document.getElementById('errMsgText');
        let msgdiv = document.createElement("div");
        msgdiv.innerHTML = msg;
        msgdiv.setAttribute("class", "errmsg-base");
        msgText.appendChild(msgdiv);
        return msgdiv;
    }
}



function readEditor() {
    var program;
    var editor = ace.edit("editor");
    program = editor.getValue();

    js = rapydscript.compile(program, { omit_baselib: true, beautify: true })
    js = rapydToPsk(js)

    console.log(js);
    
    return { code: js, version: 1, minor: 1 };
}






function rapydToPsk(rapyd) {
    class CodeFixer extends PrettyPrinter {
        constructor() {
            super();
            this.hassim = false;
            this.haswhile = false;
            this.timers = [];
        }
        visitNum(expr) {
            if (expr.val >= 0) {
                return '#' + expr.val;
            } else {
                return '-#' + Math.abs(expr.val);
            }
        }

        visitProgram(prog) {
            let rv = super.visitProgram(prog);
            for (let i in this.timers) {
                rv += this.timers[i];
            }
            return rv;
        }

        visitVar(expr) {
            let renames = {
                'track0': 'cars.track0', 
                'track1': 'cars.track1', 
                'track2': 'cars.track2', 
                'track3': 'cars.track3', 
                'track4': 'cars.track4', 
                'track5': 'cars.track5',
                'newCar': 'cars.newCar',
                'displayTrack': 'cars.displayTrack',
                'simulate': 'cars.simulate',
                'displayResult': 'cars.displayResult',
                'displayCar': 'cars.displayCar',
                'random':'Math.random',
            };
            let nf = nameFilter(expr.name);
            if (nf == 'simulate') {
                this.hassim = true;
            }
            if (nf in renames) {
                return renames[nf];
            }
            return nf;
        }

        visitWhile(stmt) {
            let rv = super.visitWhile(stmt);
            if (this.hassim) {
                let body = stmt.body.accept(this);
                let cond = stmt.cond.accept(this);
                rv = `@timer 500 
if(NEXT__==#${this.timers.length}){;
if(${cond}){
${body}
}else{
stopTimer();
NEXT__ = ${this.timers.length + 1}
}
}
`
                this.timers.push(rv);
                return 'NEXT__ = ' + (this.timers.length-1) + ';\n';
            } else {
                return rv;
            }

        }
        visitBlock(stmt) {
            var rv = "{\n";
            for (let x = 0; x < stmt.stmts.length; ++x) {
                let s = stmt.stmts[x];
                let ts = s.accept(this); 
                if (this.timers.length == 0) {
                    rv += ts + ";\n";
                } else {
                    let ttm = `@timer 500
if(NEXT__==#${this.timers.length}){`;
                    for (let y = x+1; y < stmt.stmts.length; ++y) {
                        let s = stmt.stmts[y];
                        let ts = s.accept(this); 
                        ttm += ts + ';\n';    
                    }                    
                    ttm += `stopTimer(); NEXT__ = ${this.timers.length + 1}; }`
                    this.timers.push(ttm + '\n');
                    rv += ts + ';\n';
                    return rv + "}\n";
                }                
            }
            return rv + "}\n";
        }

    }


    
    rapyd =  rapyd.replace(/var[^;]*;/g, "//NO MORE");
    rapyd = rapyd.replace('"use strict";\n', "");
    while ((/^\s*\(function\(\)\{/).test(rapyd) && (/\}\)\(\);\s*$/).test(rapyd)) {
        rapyd = rapyd.replace(/^\s*\(function\(\)\{/g, "");
        rapyd = rapyd.replace(/\}\)\(\);\s*$/g, "");
    }
    rapyd = rapyd.replace(/.._print/g, "alert");  
    rapyd = rapyd.replace(/true_./g, "true");  
    rapyd = rapyd.replace(/false_./g, "false");  
    rapyd = rapyd.replace(/[^a-zA-Z0-9](\.\d+)/g, "0$1");
    rapyd = rapyd.replace(/===/g, "==");
    rapyd = 'function str(v){ return v; }\n' + rapyd;
    console.log(rapyd);
    let ast = Parser().program(rapyd);
    let fixer = new CodeFixer();

    rapyd = ast.accept(fixer);

    return rapyd;
    let code = new CodeText(rapyd).iter();
    if (lookahead('(function()', code)) {


    }

}