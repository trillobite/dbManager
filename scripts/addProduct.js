


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
    
};