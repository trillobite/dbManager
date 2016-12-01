

var myDB = new micronDB();

var dbManager = {};
dbManager.path = "file:///home/trillobite/Documents/gitProjects/miniDownloader";

dbManager.parseJSONString = function(jsonStr) {
    return JSON.parse(jsonStr);
};

dbManager.jsonToString = function(data) {
    return JSON.stringify(data);
};

//read text file into application.
dbManager.readTextFile = function(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                return rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
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
            modelNum: modelNumber,
        },
    });
};

dbManager.findByBrand = function(brand) {
    return myDB.query({
        where: {
            brand: brand,
        },
    });
};

dbManager.findStamp = function(modelNumber, brand) {
    return myDB.query({
        where: {
            $and: {
                modelNum: modelNumber,
                brand: brand,
            },
        },
    });
};

dbManager.form = {};
dbManager.form.main = $jConstruct('div').css({
    'border': '1px solid black',
    'border-radius': '5px',
    'display': 'inline-block',
});
dbManager.form.render = function() {
    var fileInputField = $jConstruct('input', {
        type: 'file',
    }).event('change', function(event) {

        var file = event.target.files[0];

        var reader = new FileReader();
        reader.onload = function(progressEvent){
            var resultJSON = JSON.parse(this.result);
            console.log(resultJSON);
            for(var i = 0; i < resultJSON.length; ++i) {
                myDB.hash(resultJSON[i]);
            }
        };
        reader.readAsText(file);

        //dbManager.path = event.target.baseURI.replace('index.html', $('#'+fileInputField.id).val());
        //var data = dbManager.readTextFile(dbManager.path);
        //console.log(data);
    }).css({
        'visibility': 'hidden',
    });

    var txtBxModelNum = $jConstruct('textbox', {
        text: 'model number',
    }).css({
        'float': 'left',
        'clear': 'left',  
    }); //where to type in the model number.
    
    var txtBxBrandTyp = $jConstruct('textbox', {
        text: 'brand',
    }).css({
        'float': 'left',
        'clear': 'left',
    }); //where to type in the brand.
    
    var btnSearch = $jConstruct('button', { //for searching for objects.
        text: 'search',
    }).event('click', function() {
        var setText = function(stamps) {
            var dbRes = dbManager.jsonToString(stamps).replace(/,/g , ", \n");
            //dbRes.replace(/}/g, "} \n");
            //dbRes.replace(/{/g, '{ \n');
            var result = 'found: ' + stamps.length + '\n' + dbRes;
            $('#' + txtArea.id).val(result);
        }
        $('#' + txtArea.id).val(' '); //clear the text area.
        var model = $('#'+txtBxModelNum.id).val();
        var brand = $('#'+txtBxBrandTyp.id).val();
        if(model && brand) {
            setText(dbManager.findStamp(model, brand));
        } else if(model) {
            setText(dbManager.findByNumber(model));
        } else if(brand) {
            setText(dbManager.findByBrand(brand));
        }
    }).css({
        'float': 'left',
    });
    
    var btnSave = $jConstruct('button', { //for saving objects.
        text: 'save',
    }).event('click', function() {
        $('#' + txtArea.id).val(' '); //clear the text area.
        var model = $('#'+txtBxModelNum.id).val();
        var brand = $('#'+txtBxBrandTyp.id).val();
        dbManager.addStamp(model, brand);
    }).css({
        'float': 'left',
    });

    var btnRemove = $jConstruct('button', {
        text: 'remove',
    }).event('click', function() {
        $('#' + txtArea.id).val(' '); //clear the text area.
        var model = $('#'+txtBxModelNum.id).val();
        var brand = $('#'+txtBxBrandTyp.id).val();
        var stamp = dbManager.findStamp(model, brand);
        dbManager.removeStamp(stamp[0]);
    }).css({
        'float': 'left',
    });
    
    var txtArea = $jConstruct('textarea', {
        rows: '5',
        cols: '50',
        name: 'outputField',
    }).css({
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
        //'clear': 'left',  
    });

    var btnOpenDB = $jConstruct('button', {
        text: 'openDB',
    }).event('click', function() {
        $('#' + fileInputField.id).click();
    }).css({
        'float': 'left',
        //'clear': 'left',
    });

    var dataFields = $jConstruct('div').css({
        'border': '1px solid black',
        'border-radius': '3px',  
        'clear': 'left',
    });
    dataFields.addChild(fileInputField);
    dataFields.addChild(txtBxModelNum);
    dataFields.addChild(txtBxBrandTyp);

    var dataFieldsButtons = $jConstruct('div').css({
        'border': '1px solid black',
        'border-radius': '3px',
        'float': 'left',
        'clear': 'left',
    });
    dataFieldsButtons.addChild(btnSearch);
    dataFieldsButtons.addChild(btnSave);
    dataFieldsButtons.addChild(btnRemove);

    var dataOutputs = $jConstruct('div').css({
        'border': '1px solid black',
        'border-radius': '3px',
    });
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