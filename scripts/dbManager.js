

var myDB = new micronDB();

var dbManager = {};

dbManager.parseJSONString = function(jsonStr) {
    return JSON.parse(jsonStr);
};

dbManager.jsonToString = function(data) {
    return JSON.stringify(data);
};

// Function to download data to a file
dbManager.saveTextFile = function (data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
};

dbManager.addStamp = function(modelNumber, brand) {
    myDB.hash({
        modelNum: modelNumber,
        brand: brand,
    });
};

dbManager.findAllByProperty = function(input) {
    if(input) {
        if(input == '*') {
            return function(tmp) {
                return tmp ? true : false;
            };
        }
    }
    return input;
};

dbManager.removeStamp = function(stamp) {
    myDB.remove(stamp.id);
};

dbManager.findAll = function() {
    return myDB.query({
        where: {
            modelNum: function(input) {
                return input ? true : false;
            },
        },
    });
};

dbManager.findByNumber = function(modelNumber) {
    return myDB.query({
        where: {
            modelNum: dbManager.findAllByProperty(modelNumber),
        },
    });
};

dbManager.findByBrand = function(brand) {
    return myDB.query({
        where: {
            brand: dbManager.findAllByProperty(brand),
        },
    });
};

dbManager.findStamp = function(modelNumber, brand) {
    return myDB.query({
        where: {
            $and: {
                modelNum: dbManager.findAllByProperty(modelNumber),
                brand: dbManager.findAllByProperty(brand),
            },
        },
    });
};

dbManager.form = {};

dbManager.form.main = $jConstruct('div').css({
    'border': '1px solid black',
    'border-radius': '5px',
    'display': 'inline-block',
    'position':'absolute',
    'top':'50%',
    'left':'50%',
    'margin':'-100px 0 0 -100px',
});

dbManager.form.renderResult = function(queryResult, txtBxModelNum, txtBxBrandTyp) {
    console.log('queryResult:', queryResult);
    var elemW = '250px';

    var mainDiv = new $jConstruct('div', {
        id: 'mainRender'
    }).css({
        'width': '300px',
        'height': '250px',
        'overflow': 'auto',
        'font-family': 'arial',
    });
    
    mainDiv.children = [];

    var tile = function() {
        return $jConstruct('div').event('click', function() {
            var thisObj = arrdb.get(this.id);
            $('#'+txtBxModelNum.id).val(thisObj.modelNumber);
            $('#'+txtBxBrandTyp.id).val(thisObj.brand);
        }).css({
            'width': elemW,
            'height': '50px',
            'border': '1px solid black',
            'border-radius': '3px',
            'cursor': 'pointer',
        });
    };

    var total = $jConstruct('div', {
        text: 'total: ' + queryResult.length,
    }).css({
        'width': elemW,
        'height': '20px',
        //'border': '1px solid black',
        //'border-radius': '3px',
    });

    mainDiv.addChild(total);

    for(var i = 0; i < queryResult.length; ++i) {
        var myDiv = new tile();
        myDiv.modelNumber = queryResult[i].modelNum;
        myDiv.brand = queryResult[i].brand;
        myDiv.addChild($jConstruct('div', {
            text: 'Model number: ' + queryResult[i].modelNum,
        }).css({
            'float': 'left',
            'clear': 'left',
        }));
        myDiv.addChild($jConstruct('div', {
            text: 'Brand: ' + queryResult[i].brand,
        }).css({
            'float': 'left',
            'clear': 'left',
        }));
        mainDiv.addChild(myDiv);
    }

    return mainDiv;

};

dbManager.form.render = function() {

    var fileInputField = $jConstruct('input', {
        type: 'file',
    }).event('change', function(event) {

        var file = event.target.files[0]; //get file location.

        var reader = new FileReader();
        reader.onload = function(progressEvent){
            var resultJSON = JSON.parse(this.result); //parse the file as JSON.
            for(var i = 0; i < resultJSON.length; ++i) {
                var dbObject = resultJSON[i];
                dbObject.id = undefined; //we want to kill the existing id, so there won't be any conflicts.
                myDB.hash(resultJSON[i]); //hasing it will generate a new id, since it's being added to the db.
            }
        };
        reader.readAsText(file);
    }).css({
        'visibility': 'hidden', //this object is hidden, and is triggered remotely.
    });

    var txtBxModelNum = $jConstruct('textbox', {
        text: 'model number',
        title: 'model number',
    }).event('focus', function() {
        $('#'+txtBxModelNum.id).css({
            'color': 'black',
        });
        $('#'+txtBxModelNum.id).val(''); //clear the textbox.
    }).event('blur', function() {
        if(!($('#'+txtBxModelNum.id).val())) { //if user entered nothing.
            $('#'+txtBxModelNum.id).css({ //set back to gray
                'color': 'gray',
            });
            $('#'+txtBxModelNum.id).val('model number'); //set default value.
        }
    }).css({
        'color': 'gray',
        'float': 'left',
        'clear': 'left',  
    }); //where to type in the model number.
    
    var txtBxBrandTyp = $jConstruct('textbox', {
        text: 'brand',
        title: 'brand',
    }).event('focus', function() {
        $('#'+txtBxBrandTyp.id).css({
            'color': 'black',
        });
        $('#'+txtBxBrandTyp.id).val(''); //clear the textbox.
    }).event('blur', function() {
        if(!($('#'+txtBxBrandTyp.id).val())) { //if user entered nothing.
            $('#'+txtBxBrandTyp.id).css({ //set back to gray
                'color': 'gray',
            });
            $('#'+txtBxBrandTyp.id).val('brand'); //set default value.
        }
    }).css({
        'color': 'gray',
        'float': 'left',
        'clear': 'left',
    }); //where to type in the brand.
    
    var btnSearch = $jConstruct('button', { //for searching for objects.
        text: 'search',
    }).event('click', function() {
        (function() { //clears the mainRender div if it exists from a previous search!
            var tmp = arrdb.get('mainRender');
            if(tmp) {
                tmp.remove({
                    db: true, //to remove object from micronDB.
                    all: true, //to remove all child objects contained in the jsonHTML object.
                });
                $('#mainRender').remove();
            }
        })();
        var model = (function() {
            var txt = $('#'+txtBxModelNum.id).val();
            if(txt) {
                if(txt != 'model number' && txt != '') { //if it's not the default value, return the value.
                    return txt;
                }
            }
            return undefined; //was either blank, or set to the default value, so return nothing.
        })();
        var brand = (function() {
            var txt = $('#'+txtBxBrandTyp.id).val();
            if(txt) {
                if(txt != 'brand' && txt != '') { //if it's not the default value, return the value.
                    return txt;
                }
            }
            return undefined; //was either blank, or set to the default value, so return nothing.
        })();
        if(model && brand) {
            txtArea.children = [];
            txtArea.addChild(dbManager.form.renderResult(dbManager.findStamp(model.trim(), brand.trim()), txtBxModelNum, txtBxBrandTyp));
            txtArea.refresh();
        } else if(model) {
            txtArea.children = [];
            txtArea.addChild(dbManager.form.renderResult(dbManager.findByNumber(model.trim()), txtBxModelNum, txtBxBrandTyp));
            txtArea.refresh();
        } else if(brand) {
            txtArea.children = [];
            txtArea.addChild(dbManager.form.renderResult(dbManager.findByBrand(brand.trim()), txtBxModelNum, txtBxBrandTyp));
            txtArea.refresh();
        }
    }).css({
        'float': 'left',
    });
    
    var btnSave = $jConstruct('button', { //for saving objects.
        text: 'save',
    }).event('click', function() {
        (function() {
            var tmp = arrdb.get('mainRender');
            if(tmp) {
                tmp.remove({
                    db: true, //to remove object from micronDB.
                    all: true, //to remove all child objects contained in the jsonHTML object.
                });
                $('#mainRender').remove();
            }
        })();
        var model = (function() {
            var txt = $('#'+txtBxModelNum.id).val();
            if(txt) {
                if(txt != 'model number' && txt != '') { //if it's not the default value, return the value.
                    return txt;
                }
            }
            return undefined; //was either blank, or set to the default value, so return nothing.
        })();
        var brand = (function() {
            var txt = $('#'+txtBxBrandTyp.id).val();
            if(txt) {
                if(txt != 'brand' && txt != '') { //if it's not the default value, return the value.
                    return txt;
                }
            }
            return undefined; //was either blank, or set to the default value, so return nothing.
        })();
        if(model && brand) {
            dbManager.addStamp(model, brand);
        } else {
            alert('Need both model and brand feilds before saving.');  
        }
    }).css({
        'float': 'left',
    });

    var btnRemove = $jConstruct('button', {
        text: 'remove',
    }).event('click', function() {
        (function() {
            var tmp = arrdb.get('mainRender');
            if(tmp) {
                tmp.remove({
                    db: true, //to remove object from micronDB.
                    all: true, //to remove all child objects contained in the jsonHTML object.
                });
                $('#mainRender').remove();
            }
        })();
        var model = (function() {
            var txt = $('#'+txtBxModelNum.id).val();
            if(txt) {
                if(txt != 'model number' && txt != '') { //if it's not the default value, return the value.
                    return txt;
                }
            }
            return undefined; //was either blank, or set to the default value, so return nothing.
        })();
        var brand = (function() {
            var txt = $('#'+txtBxBrandTyp.id).val();
            if(txt) {
                if(txt != 'brand' && txt != '') { //if it's not the default value, return the value.
                    return txt;
                }
            }
            return undefined; //was either blank, or set to the default value, so return nothing.
        })();
        if(model && brand) { //must have both properties to prevent deleting something it shouldn't
            var stamp = dbManager.findStamp(model, brand);
            dbManager.removeStamp(stamp[0]);
        } else {
            alert('Must provide values for model and brand.');
        }
    }).css({
        'float': 'left',
    });
    
    var txtArea = $jConstruct('div').css({
        'float': 'left',
        'clear': 'left',  
    });
    
    var btnSaveDB = $jConstruct('button', {
        text: 'saveDB',
    }).event('click', function() {
        var objs = dbManager.findAll();
        var stringified = dbManager.jsonToString(objs);
        dbManager.saveTextFile(stringified, 'dbOutput', 'txt');
    }).css({
        'float': 'left',
    });

    var btnOpenDB = $jConstruct('button', {
        text: 'openDB',
    }).event('click', function() {
        if(dbManager.findAll().length) { //Usually you don't want to load a db file with db objects already existing in the project.
            var r = window.confirm("You have objects currently in the DB! If you load in a DB file right now, you will have the objects currently in the DB, AND the new objects from the DB file. Are you sure you want to do this?");
            if (r == true) {
                $('#' + fileInputField.id).click();
            } else {
                alert('Please refresh the page if you wish to load in a DB file.');
            } 
        } else {
            $('#' + fileInputField.id).click();
        }
    }).css({
        'float': 'left',
    });

    var dataFields = $jConstruct('div').css({
        'clear': 'left',
    });
    dataFields.addChild(fileInputField);
    dataFields.addChild(txtBxModelNum);
    dataFields.addChild(txtBxBrandTyp);

    var dataFieldsButtons = $jConstruct('div').css({
        'float': 'left',
        'clear': 'left',
    });
    dataFieldsButtons.addChild(btnSearch);
    dataFieldsButtons.addChild(btnSave);
    dataFieldsButtons.addChild(btnRemove);

    var dataOutputs = $jConstruct('div');
    dataOutputs.addChild($jConstruct('div').css({
        'float': 'left',
        'clear': 'left',
    }).addChild(txtArea));
    dataOutputs.addChild($jConstruct('div').css({
        'float': 'left',
        'clear': 'left',
    }).addChild(btnSaveDB).addChild(btnOpenDB));

    dbManager.form.main.addChild(dataFields);
    dbManager.form.main.addChild(dataFieldsButtons);
    dbManager.form.main.addChild(dataOutputs);
    
    return dbManager.form.main;
};