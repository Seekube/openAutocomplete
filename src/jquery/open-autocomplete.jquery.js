(function ( $ ) {
 
    $.fn.openAutocomplete = function( options ) {
        
        var plugin = $.extend(this, {
            results: [],
            input: $(this),
            el: $('<ul class="open-autocomplete"></ul>'),
            resultContainer: $('<span class="open-autocomplete oa-result-container"><span class="oa-result"></span> <button class="oa-edit"></button></span>'),
            init: function () {
                plugin.el.on('click', 'li', settings.onSelect);

                plugin.resultContainer.find('.oa-edit').html(settings.editLabel).on('click', function () {
                    plugin.input.removeAttr('readonly').focus();
                    return false;
                });

                plugin.input.on('input focus', function () {
                    if (settings.onEditing) {
                        settings.onEditing();
                    }
                    this.results = []; //Reset results before send
                    settings.dataSource(plugin.input.val(), settings.limit);
                }).addClass('open-autocomplete').after(plugin.resultContainer);

                $(document).click(function (event) {
                    if (plugin.el.is(':visible') && event.target != plugin.input.get(0) && plugin.el.has(event.target).length == 0) {
                        settings.hideAutocomplete();
                        if (settings.onCancelInput) {
                            settings.onCancelInput();
                        }
                    }
                });

                //If input is already filled, set it as readonly
                if (plugin.input.val() && plugin.input.val().length > 0) {
                    plugin.resultContainer.find('.oa-result').html(plugin.input.val());
                    plugin.input.attr('readonly', 'readonly');
                }
            },
            onSelect: function () {
                var item = $(this);
                
                if (item.hasClass('oa-add')) {
                    if (settings.onAdd) {
                        settings.onAdd(item.html());
                    }
                } else {
                    plugin.input.val(item.html());
                    if (settings.onExist) {
                        settings.onExist(item.html());
                    }
                }

                //Set the input readonly
                plugin.resultContainer.find('.oa-result').html(plugin.input.val());
                plugin.input.attr('readonly', 'readonly');

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
                        list.append('<li class="oa-add">' + settings.addLabel + ' ' + plugin.input.val() + '</li>');
                    }

                    settings.parent.append(list);
                    
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
                    top: plugin.input.position().top + plugin.input.outerHeight(),
                    left: plugin.input.position().left
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
            addLabel: 'Add',
            editLabel: 'Edit',
            parent: $('body')
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