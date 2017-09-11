

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

dbManager.readFile = function(file, startByte, endByte) {
    var dfd = new $.Deferred();
    var reader = new FileReader();
    reader.onload = function(evt) {
        if(evt.target.readyState == FileReader.DONE) {
            dfd.resolve(evt.target); //resulting object is put into the resolve.
        }
    }
    var blob = file.slice((parseInt(startByte) || 0), (parseInt(endByte) || file.size + 1) + 1);
    reader.readAsDataURL(blob);
    return dfd.promise();
};

dbManager.addImageToTile = function(obj) {
    var thisObj = obj;
};

dbManager.attachDroppable = function(obj) {
    obj.addFunction(function() {
        var thisObj = obj;
        console.log('thisObj:', thisObj);
        $("#" + thisObj.id).filedrop({
            maxfiles: 1,
            maxfilesize: 5,
            beforeSend: function(f) {
                //console.log(f);
                dbManager.readFile(f).done(function(obj) {
                    console.log('the file', obj);
                    thisObj.productImageValue = obj.result;
                    //find the persisting db object.
                    var dbObj = myDB.get(thisObj.dbid);
                    //set the image value to this also, so it can be saved later.
                    dbObj.productImageValue = obj.result;
                    //get the index of the tile, so we know which div to add the image to.
                    var indx = arrdb.get(thisObj.id).indx;
                    var img = arrdb.get('projImg'+indx); //get the image object to change.
                    img.src = thisObj.productImageValue; //change the image source.
                    img.refresh(); //refresh the object.
                });
            },
        });
    });
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

dbManager.form.main = $jConstruct('div', {
    class: 'container',
}).css({
    'border': '1px solid black',
    'border-radius': '5px',
    'display': 'inline-block',
    //'position':'absolute',
    //'top':'50%',
    //'left':'50%',
    //'margin':'-100px 0 0 -100px',
});

//where everything is rendered after there is a query into the db.
dbManager.form.renderResult = function(queryResult, txtBxModelNum, txtBxBrandTyp) {
    console.log('queryResult:', queryResult);
    var elemW = '250px';

    var mainDiv = new $jConstruct('div', {
        id: 'mainRender',
        class: 'row', //bootstrap css call.
    }).css({
        //'width': '100%',
        //'height': '800px',
        'overflow': 'auto',
        'font-family': 'arial',
    });
    
    mainDiv.children = [];


    /*
        TILE
        This is the main object, that appears as a tile
        in the db results.
    */
    var tile = function() {
        var tmp = $jConstruct('div', {
            class: 'dbObjHover col-lg-2 col-md-3 col-xs-4', //bootstrap grid, and proper sizing.
        }).event('click', function() {
            var thisObj = arrdb.get(this.id);
            $('#'+txtBxModelNum.id).val(thisObj.modelNumber);
            $('#'+txtBxBrandTyp.id).val(thisObj.brand);
        }).css({
            //'width': elemW,
            'height': '200px',
            'border': '1px solid black',
            'border-radius': '3px',
            'cursor': 'pointer',
            'font-size': '60%',
        });
        dbManager.attachDroppable(tmp);
        return tmp;
    };

    var total = $jConstruct('div', {
        text: 'total: ' + queryResult.length,
        class: 'container',
    }).css({
        //'width': elemW,
        'height': '20px',
        'float': 'left',
        'clear': 'left',
        //'border': '1px solid black',
        //'border-radius': '3px',
    });

    mainDiv.addChild(total);
    /*
        This loop adds all the divs into the tile, which
        will be displayed to the user.
    */
    for(var i = 0; i < queryResult.length; ++i) {
        var myDiv = new tile();
        myDiv.indx = i; //set the index of the object tile.
        myDiv.dbid = queryResult[i].id; //set the id to this object equal to what is in the db.
        myDiv.modelNumber = queryResult[i].modelNum; //get the model number.
        myDiv.brand = queryResult[i].brand; //get the brand.

        //add the div to describe the model number of the product.
        myDiv.addChild($jConstruct('div', {
            text: 'Number: ' + queryResult[i].modelNum,
        }).css({
            'overflow': 'hidden',
            'float': 'left',
            'clear': 'left',
        }));

        //add the div to describe the brand of the product.
        myDiv.addChild($jConstruct('div', {
            text: 'Brand: ' + queryResult[i].brand,
        }).css({
            'overflow': 'hidden',
            'float': 'left',
            'clear': 'left',
        }));

        //add the area for the product image.
        var imgDiv = $jConstruct('div').css({
            'float': 'left',
            'clear': 'left',
            'width': '80%', //48px for the two 1px border.
            'height': '60%', //48px for the two 1px borders.
            //'border': '1px solid black',
        });

        var tmpSrc = undefined;
        //check if there is an image already defined for this object.
        if(myDB.get(myDiv.dbid).hasOwnProperty('productImageValue')) {
            tmpSrc = myDB.get(myDiv.dbid).productImageValue;
        } else {
            tmpSrc = './images/pictures.png';
        }

        //the default image to show in the box.
        var prodImg = $jConstruct('img', {
            id: 'projImg' + myDiv.indx,
            src: tmpSrc,
        }).css({
            'max-width': '100%', //make sure that the image won't overflow.
            'max-height': '100%', //make sure that the image won't overflow.
        });

        imgDiv.addChild(prodImg); //add the image to the imgDiv.
        myDiv.addChild(imgDiv); //add the image div.


        mainDiv.addChild(myDiv);
    }

    return mainDiv;

};

dbManager.form.render = function() {
    //where data is actually read, and hashed into myDB.
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

    //where to type in the model number.
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
    });
    
    //where to type in the brand.
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
    });
    
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
    
    var txtArea = $jConstruct('div', {
        class: 'container', //bootstrap css container style.
    }).css({
        'float': 'left',
        'clear': 'left',
        //'width': '100%',
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

    //manages the opening of a db file.
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

    var dataOutputs = $jConstruct('div', {
        class: 'container', //bootstrap css call.
    });
    dataOutputs.addChild($jConstruct('div',{
        class: 'container',
    }).css({
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