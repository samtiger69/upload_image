(function($) {
  jQuery.event.props.push("dataTransfer");

  var default_opts = {
      fallback_id: '',
      url: '',
      refresh: 1000,
      paramname: 'userfile',
      requestType: 'POST',    // just in case you want to use another HTTP verb
      allowedfileextensions:[],
      allowedfiletypes:[],
      maxfiles: 25,           // Ignored if queuefiles is set > 0
      maxfilesize: 1,         // MB file size limit
      queuefiles: 0,          // Max files before queueing (for large volume uploads)
      queuewait: 200,         // Queue wait time if full
      data: {},
      headers: {},
      drop: empty,
      dragStart: empty,
      dragEnter: empty,
      dragOver: empty,
      dragLeave: empty,
      docEnter: empty,
      docOver: empty,
      docLeave: empty,
      beforeEach: empty,
      afterAll: empty,
      rename: empty,
      error: function(err, file, i, status) {
        alert(err);
      },
      uploadStarted: empty,
      uploadFinished: empty,
      progressUpdated: empty,
      globalProgressUpdated: empty,
      speedUpdated: empty
      },
      errors = ["BrowserNotSupported", "TooManyFiles", "FileTooLarge", "FileTypeNotAllowed", "NotFound", "NotReadable", "AbortError", "ReadError", "FileExtensionNotAllowed"];

  $.fn.filedrop = function(options) {
    var opts = $.extend({}, default_opts, options),
        global_progress = [],
        doc_leave_timer, stop_loop = false,
        files_count = 0,
        files;

    $('#' + opts.fallback_id).css({
      display: 'none',
      width: 0,
      height: 0
    });

    this.on('drop', drop).on('dragstart', opts.dragStart).on('dragenter', dragEnter).on('dragover', dragOver).on('dragleave', dragLeave);
    $(document).on('drop', docDrop).on('dragenter', docEnter).on('dragover', docOver).on('dragleave', docLeave);

    this.on('click', function(e){
      $('#' + opts.fallback_id).trigger(e);
    });

    $('#' + opts.fallback_id).change(function(e) {
      opts.drop(e);
      files = e.target.files;
      files_count = files.length;
        //upload();
      beforeUpload();
    });

    function drop(e) {
      if( opts.drop.call(this, e) === false ) return false;
      if(!e.dataTransfer)
        return;
      files = e.dataTransfer.files;
      if (files === null || files === undefined || files.length === 0) {
        opts.error(errors[0]);
        return false;
      }
      files_count = files.length;
      beforeUpload();
      //upload();
      e.preventDefault();
      return false;
    }

    function getBuilder(filename, filedata, mime, boundary) {
      var dashdash = '--',
          crlf = '\r\n',
          builder = '',
          paramname = opts.paramname;

      if (opts.data) {
        var params = $.param(opts.data).replace(/\+/g, '%20').split(/&/);

        $.each(params, function() {
          var pair = this.split("=", 2),
              name = decodeURIComponent(pair[0]),
              val  = decodeURIComponent(pair[1]);

          if (pair.length !== 2) {
              return;
          }

          builder += dashdash;
          builder += boundary;
          builder += crlf;
          builder += 'Content-Disposition: form-data; name="' + name + '"';
          builder += crlf;
          builder += crlf;
          builder += val;
          builder += crlf;
        });
      }

      if (jQuery.isFunction(paramname)){
        paramname = paramname(filename);
      }

      builder += dashdash;
      builder += boundary;
      builder += crlf;
      builder += 'Content-Disposition: form-data; name="' + (paramname||"") + '"';
      builder += '; filename="' + filename + '"';
      builder += crlf;

      builder += 'Content-Type: ' + mime;
      builder += crlf;
      builder += crlf;

      builder += filedata;
      builder += crlf;

      builder += dashdash;
      builder += boundary;
      builder += dashdash;
      builder += crlf;
      return builder;
    }

    function progress(e) {
      if (e.lengthComputable) {
        var percentage = Math.round((e.loaded * 100) / e.total);
        if (this.currentProgress !== percentage) {

          this.currentProgress = percentage;
          opts.progressUpdated(this.index, this.file, this.currentProgress);

          global_progress[this.global_progress_index] = this.currentProgress;
          globalProgress();

          var elapsed = new Date().getTime();
          var diffTime = elapsed - this.currentStart;
          if (diffTime >= opts.refresh) {
            var diffData = e.loaded - this.startData;
            var speed = diffData / diffTime; // KB per second
            opts.speedUpdated(this.index, this.file, speed);
            this.startData = e.loaded;
            this.currentStart = elapsed;
          }
        }
      }
    }

    function globalProgress() {
      if (global_progress.length === 0) {
        return;
      }

      var total = 0, index;
      for (index in global_progress) {
        if(global_progress.hasOwnProperty(index)) {
          total = total + global_progress[index];
        }
      }

      opts.globalProgressUpdated(Math.round(total / global_progress.length));
    }

    function beforeUpload(){
        opts.beforeUploadThings(files);
    }

    function rename(name) {
      return opts.rename(name);
    }

    function beforeEach(file) {
      return opts.beforeEach(file);
    }

    function afterAll() {
      return opts.afterAll();
    }

    function dragEnter(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.dragEnter.call(this, e);
    }

    function dragOver(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.docOver.call(this, e);
      opts.dragOver.call(this, e);
    }

    function dragLeave(e) {
      clearTimeout(doc_leave_timer);
      opts.dragLeave.call(this, e);
      e.stopPropagation();
    }

    function docDrop(e) {
      e.preventDefault();
      opts.docLeave.call(this, e);
      return false;
    }

    function docEnter(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.docEnter.call(this, e);
      return false;
    }

    function docOver(e) {
      clearTimeout(doc_leave_timer);
      e.preventDefault();
      opts.docOver.call(this, e);
      return false;
    }

    function docLeave(e) {
      doc_leave_timer = setTimeout((function(_this) {
        return function() {
          opts.docLeave.call(_this, e);
        };
      })(this), 200);
    }

    return this;
  };

  function empty() {}
})(jQuery);
