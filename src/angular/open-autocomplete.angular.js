angular.module('open-autocomplete', [])

    .factory('openAutocompleteSettings', ['$http', function ($http) {
        return function (settings) {
            if (!settings.dataSource) {
                return settings.onError('You must defined a data source');
            } else if (!angular.isFunction(settings.dataSource)) {
                var url = settings.dataSource;
                settings.dataSource = function (val, limit) {
                    $http.get(url, {
                        params: {
                            input: val,
                            limit: this.limit
                        }
                    }).then(this.parseResult, this.onError).finally(this.showAutocomplete);
                }
            }
            return settings;
        };
    }])

    .directive('openAutocomplete', ['openAutocompleteSettings', '$compile', function (openAutocompleteSettings, $compile) {
        return {
            scope: {
                oaOptions: '='
            },
            link: function (scope, element, attrs) {
                scope.list = angular.element('<ul class="open-autocomplete"></ul>');
                scope.results = [];
                scope.visible = false;
                scope.settings = openAutocompleteSettings(angular.extend({
                    limit: false,
                    addLabel: 'Add',
                    editLabel: 'Edit',
                    onSelect: function ($event) {
                        var item = angular.element($event.target);

                        if (item.hasClass('add')) {
                            if (scope.settings.onAdd) {
                                scope.settings.onAdd(item.html());
                            }
                        } else {
                            element.val(item.html()).trigger('change');

                            if (scope.settings.onExist) {
                                scope.settings.onExist(item.html());
                            }
                        }

                        //Set the input as readonly
                        element.attr('readonly', 'readonly');
                        scope.result.html(element.val());

                        scope.settings.hideAutocomplete();
                    },
                    parseResult: function (res) {
                        scope.results = res.data.match;
                    },
                    showAutocomplete: function () {
                        if (element.val() || scope.results.length > 0) {
                            //Clear previous content
                            var exactMatch = false;

                            scope.list.empty();

                            angular.forEach(scope.results, function (item, idx) {
                                var listItem = angular.element('<li ng-click="settings.onSelect($event)">' + item + '</li>')
                                scope.list.append(listItem);

                                if (listItem.html() == element.val()) {
                                    exactMatch = true;
                                }
                            });

                            if (!exactMatch && element.val()) {
                                scope.list.append('<li ng-click="settings.onSelect($event)" class="add">' + scope.settings.addLabel + ' ' + element.val() + '</li>');
                            }

                            angular.element(document.body).append($compile(scope.list)(scope));
                            scope.visible = true;

                            scope.settings.positionPopup();
                        } else {
                            scope.settings.hideAutocomplete();
                        }
                    },
                    hideAutocomplete: function () {
                        scope.list.detach();
                        scope.visible = false;
                    },
                    onError: function (msg) {
                        return false;
                    },
                    positionPopup: function () {
                        var de = document.documentElement;
                        var box = element[0].getBoundingClientRect();
                        var top = box.top + window.pageYOffset - de.clientTop;
                        var left = box.left + window.pageXOffset - de.clientLeft;
                        var offset = { top: top, left: left };

                        scope.list.css({
                            top: offset.top + element[0].offsetHeight + 'px',
                            left: offset.left + 'px',
                            width: element[0].offsetWidth - (scope.list[0].offsetWidth - scope.list[0].clientWidth) + 'px'
                        });
                    }
                }, scope.oaOptions));

                scope.result = angular.element('<span class="oa-result"></span>');
                scope.resultEditButton = angular.element('<button class="oa-edit">'+ scope.settings.editLabel +'</button>');
                scope.resultContainer = angular.element('<span class="open-autocomplete oa-result-container"> </span>');

                scope.resultContainer.prepend(scope.result).append(scope.resultEditButton);

                element.after(scope.resultContainer).addClass('open-autocomplete');

                element.on('input focus', function () {
                    if (!element.attr('readonly')) {
                        scope.results = []; //Reset results before send
                        scope.settings.dataSource(element.val());
                    }
                });

                scope.resultEditButton.on('click', function () {
                    element.removeAttr('readonly')[0].focus();
                    return false;
                });

                angular.element(document).on('click', function (event) {
                    if (scope.visible && event.target != element[0]) {
                        scope.settings.hideAutocomplete();
                        if (scope.settings.onCancelInput) {
                            scope.$apply(scope.settings.onCancelInput);
                        }
                    }
                });

                scope.$watch(function () {
                    return element.val();
                }, function () {
                    if (!element.is(':focus')) {
                        if (element.val().length > 0) {
                            element.attr('readonly', 'readonly');
                        } else {
                            element.removeAttr('readonly');
                        }
                    }
                    if (scope.settings.onEditing) {
                        scope.settings.onEditing();
                    }
                });
            }
        };
    }]);