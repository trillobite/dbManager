


var addProduct = function() {
    $.colorbox({
        html: "<div id='colorboxAddProduct' class='colorboxDisplayImage'></div>",
        title: 'Add object to DB',
    });

    //temporary storage to create an object to add to myDB.
    var tmpDBObj = {};

    var photoDrop = $jConstruct('div', {
        text: 'Drop a photo of your item here',
    }).addFunction(function() {
        $("#" + photoDrop.id).filedrop({
            maxfiles: 1,
            maxfilesize: 5,
            beforeSend: function (f) {
                dbManager.readFile(f).done(function (obj) {
                    console.log('the file', obj);
                    tmpDBObj.productImageValue = obj.result;
                    //get the index of the tile, so we know which div to add the image to.
                    dropImg.src = tmpDBObj.productImageValue; //change the image source.
                    dropImg.refresh(); //refresh the object.
                });
            },
        });
    });

    var dropImg = $jConstruct('img', {
        src: './images/pictures.png',
    }).css({
        'max-width': '400px',
        'max-height': '400px',
        'border-radius': '10px',
        'display': 'block',
        'margin': 'auto',
    });

    photoDrop.addChild(dropImg);
    photoDrop.appendTo('#colorboxAddProduct');

    var description = $jConstruct('textarea', {
        text: 'Enter product description.',
    }).css({
        'height': '80px',
        'width': '90%',
        'float': 'left',
        'clear': 'left',
    });
    description.appendTo('#colorboxAddProduct');

    var modelNumber = $jConstruct('textbox', {
        text: 'Model Number',
    }).css({
        'float': 'left',
        'clear': 'left',
    });
    modelNumber.appendTo('#colorboxAddProduct');

    var brandName = $jConstruct('textbox', {
        text: 'Brand Name',
    }).css({
        'float': 'left',
        'clear': 'left',
    });
    brandName.appendTo('#colorboxAddProduct');

    var btnSubmit = $jConstruct('button', {
        text: 'submit',
        class: 'btn btn-default btn-sm',
    }).event('click', function() {
        tmpDBObj.brand = $('#'+brandName.id).val();
        tmpDBObj.modelNum = $('#'+modelNumber.id).val();
        tmpDBObj.details = $('#'+description.id).val();
        myDB.hash(tmpDBObj);
        $.colorbox.close();
    }).css({
        'float': 'left',
        'clear': 'left',
    });
    btnSubmit.appendTo('#colorboxAddProduct');


};