(function ( $ ) {
 
    $.fn.openAutocomplete = function( options ) {
        
        var plugin = $.extend(this, {
            results: [],
            input: $(this),
            el: $('<ul class="open-autocomplete"></ul>'),
            init: function () {
                plugin.el.on('click', 'li', settings.onSelect);

                plugin.input.on('input focus', function () {
                    if (settings.onEditing) {
                        settings.onEditing();
                    }
                    this.results = []; //Reset results before send
                    settings.dataSource(plugin.input.val(), settings.limit);
                });

                $(document).click(function (event) {
                    if (plugin.el.is(':visible') && event.target != plugin.input.get(0) && plugin.el.has(event.target).length == 0) {
                        settings.hideAutocomplete();
                        if (settings.onCancelInput) {
                            settings.onCancelInput();
                        }
                    }
                });


            },
            onSelect: function () {
                var item = $(this);
                
                if (item.hasClass('add')) {
                    if (settings.onAdd) {
                        settings.onAdd(item.html());
                    }
                } else {
                    plugin.input.val(item.html());
                    if (settings.onExist) {
                        settings.onExist(item.html());
                    }
                }
                
                plugin.hideAutocomplete();
            },
            parseResult: function (res) {
                plugin.results = res.match;
            },
            showAutocomplete: function () {
                if (plugin.input.val() || plugin.results.length > 0) {
                    //Clear previous content
                    var list = plugin.el;
                    var exactMatch = false;

                    list.empty();

                    $.each(plugin.results, function (idx, item) {
                        list.append('<li>' + item + '</li>');
                        
                        if (item == plugin.input.val()) {
                            exactMatch = true;
                        }
                    });

                    if (!exactMatch && plugin.input.val()) {
                        list.append('<li class="add">' + settings.addLabel + ' ' + plugin.input.val() + '</li>');
                    }

                    $('body').append(list);
                    
                    settings.positionPopup();
                } else {
                    settings.hideAutocomplete();
                }
            },
            hideAutocomplete: function () {
                plugin.el.detach();
            },
            onError: function (msg) {
                return false;
            },
            positionPopup: function () {
                plugin.el.css({
                    top: plugin.input.offset().top + plugin.input.outerHeight(),
                    left: plugin.input.offset().left
                }).outerWidth(plugin.input.outerWidth());
            }
        });
        
        var settings = $.extend({
            // Defaults option
            parseResult: plugin.parseResult,
            showAutocomplete: plugin.showAutocomplete,
            hideAutocomplete: plugin.hideAutocomplete,
            positionPopup: plugin.positionPopup,
            onSelect: plugin.onSelect,
            onError: plugin.onError,
            limit: false,
            addLabel: 'Add'
        }, options );
        
        //Check for required option and init settings
        if (!settings.dataSource) {
            return settings.onError('You must defined a data source');
        } else if (!$.isFunction(settings.dataSource)) {
            var url = settings.dataSource;
            settings.dataSource = function (val) {
                $.ajax(url, {
                    success: settings.parseResult,
                    error: settings.onError,
                    complete: settings.showAutocomplete,
                    data: {
                        input: val,
                        limit: settings.limit
                    }
                });
            }
        }

        //Run the plugin
        return plugin.each(plugin.init);
    };
 
}( jQuery ));