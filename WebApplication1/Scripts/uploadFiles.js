var files = [];

function uploadImages() {
    var formData = new FormData();

    for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
    }
    $.ajax({
        type: "POST",
        url: "UploadFiles",
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {
            alert('worked')
        },
        error: function (error) {
            alert(error);
        }
    });
}

function deleteImage(e) {
    $(e).parent().parent().remove();
    if (files) {
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.name == $(e).prop('id')) {
                files.splice(i, 1);
                break;
            }
        }
    }
}

function defaultImage(e) {
    $('.selected').removeClass('selected');
    $(e).parent().parent().addClass('selected');
}

function readURL(input) {
    if (input) {
        var reader = new FileReader();

        reader.onload = (function (f) {
            return function (e) {
                files.push(f);
                var img = '<div class="cont col-md-4"><img src="' + e.target.result + '" alt="Avatar" class="image" style="width:100%; height:200px;"><div class="middle"><input type="button" id=' + f.name + ' class="btn btn-danger" onclick="deleteImage(this)" value="Delete" /><input type="button" id=' + f.name + ' class="btn btn-primary" onclick="defaultImage(this)" value="Default" /></div></div>';
                $('#images').append(img);
            };
        })(input);
        reader.readAsDataURL(input);
    }
}

$(function () {

    $('#dropArea').on('click', () => {
        $('#files').trigger('click');
    })

    $('#files').on('change', () => {
        var totalFiles = document.getElementById("files").files.length;
        for (var i = 0; i < totalFiles; i++) {
            var file = document.getElementById("files").files[i];
            readURL(file);
        }
    })

    $('#dropArea').filedrop({
        url: _uploadAction,
        paramname: 'files',
        maxfiles: _maxFilesCount,
        maxfilesize: _maxFileSize, // in MB
        dragOver: function () {
            $('#dropArea').addClass('active-drop');
        },
        dragLeave: function () {
            $('#dropArea').removeClass('active-drop');
        },
        drop: function (e) {
            $('#dropArea').removeClass('active-drop');
        },
        afterAll: function (e) {
            $('#dropArea').html('file(s) uploaded successfully');
        },
        beforeUploadThings(file) {
            var length = file.length;
            if (files.length + length > _maxFilesCount) {
                // max files count exceeded
                alert('max count exceeded')
            } else {
                for (var i = 0; i < length; i++) {
                    readURL(file[i]);
                }
            }
        }
    })
});